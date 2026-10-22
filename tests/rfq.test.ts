import { mkdtemp, readFile, readdir, rm, stat, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/rfq/route";
import { getRfqConfiguration } from "../src/lib/rfq/config";
import { consumeRateLimit } from "../src/lib/rfq/rate-limit";
import { CONSENT_VERSION, GAS_FIELDS, pressureToAbsoluteBar, rfqSchema, validateRfqStep, type Gas, type RfqInput } from "../src/lib/rfq/schema";
import { digest, purgeExpiredRfq, retryOutbox, StorageConflict, withIdempotency } from "../src/lib/rfq/storage";
import { DeliveryError, sendRfqToCrm, type RfqEnvelope } from "../src/lib/rfq/transport";

function valid(gas: Gas = "n2"): RfqInput {
  return {
    gas,
    inlet: { value: 6, unit: "bar(g)" },
    outlet: { value: 20, unit: "bar(g)" },
    flow: { value: 30, unit: "Nm3/h", reference: "0 °C, 1.01325 bar(a), сухой газ" },
    duty: "continuous",
    details: Object.fromEntries(GAS_FIELDS[gas].map((field) => [field.key, "Требует уточнения инженером"])),
    contact: { name: "Инженер тест", company: "Тестовая организация", email: "engineer@example.test" },
    consent: { accepted: true, version: CONSENT_VERSION },
    attribution: { sourcePage: "/rfq", landingPage: "/solutions/nitrogen-booster-after-generator", utm: { source: "test" } },
    honeypot: "",
  };
}

function request(body: unknown = valid(), key = "test-idempotency-00000001", extraHeaders: Record<string, string> = {}): Request {
  return new Request("http://localhost:3000/api/rfq", {
    method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": key, Origin: "http://localhost:3000", ...extraHeaders }, body: JSON.stringify(body),
  });
}

let directory: string;
beforeEach(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "lanfor-rfq-"));
  vi.stubEnv("RFQ_STORE_DIR", directory);
  vi.stubEnv("RFQ_STAGING_MODE", "true");
  vi.stubEnv("SITE_URL", "http://localhost:3000");
});
afterEach(async () => { await rm(directory, { recursive: true, force: true }); vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("working point server schema", () => {
  it.each(["n2", "he", "h2", "o2", "co2", "mixtures"] as const)("accepts a complete %s enquiry", (gas) => {
    expect(rfqSchema.safeParse(valid(gas)).success).toBe(true);
  });
  it("rejects an unsupported gas", () => { expect(rfqSchema.safeParse({ ...valid(), gas: "sf6" }).success).toBe(false); });
  it("rejects negative, nonfinite and zero absolute pressure", () => {
    for (const value of [-1, Infinity, NaN]) expect(rfqSchema.safeParse({ ...valid(), inlet: { value, unit: "bar(g)" } }).success).toBe(false);
    expect(rfqSchema.safeParse({ ...valid(), inlet: { value: 0, unit: "bar(a)" } }).success).toBe(false);
  });
  it("compares gauge and absolute pressures using the same reference", () => {
    expect(pressureToAbsoluteBar({ value: 6, unit: "bar(g)" })).toBeCloseTo(7.01325);
    expect(rfqSchema.safeParse({ ...valid(), outlet: { value: 7, unit: "bar(a)" } }).success).toBe(false);
    expect(rfqSchema.safeParse({ ...valid(), outlet: { value: 6, unit: "bar(g)" } }).success).toBe(false);
  });
  it("requires a pressure reference for MPa and rejects contradictory bases", () => {
    expect(rfqSchema.safeParse({ ...valid(), inlet: { value: 0.6, unit: "MPa" } }).success).toBe(false);
    expect(rfqSchema.safeParse({ ...valid(), inlet: { value: 0.6, unit: "MPa", reference: "gauge" } }).success).toBe(true);
    expect(rfqSchema.safeParse({ ...valid(), inlet: { value: 6, unit: "bar(g)", reference: "absolute" } }).success).toBe(false);
  });
  it("rejects unsupported flow units and missing volumetric reference conditions", () => {
    expect(rfqSchema.safeParse({ ...valid(), flow: { value: 10, unit: "cfm" } }).success).toBe(false);
    expect(rfqSchema.safeParse({ ...valid(), flow: { value: 10, unit: "m3/h" } }).success).toBe(false);
    expect(rfqSchema.safeParse({ ...valid(), flow: { value: 10, unit: "kg/h" } }).success).toBe(true);
  });
  it.each(["n2", "he", "h2", "o2", "co2", "mixtures"] as const)("requires all dynamic %s questions", (gas) => {
    const value = valid(gas);
    delete value.details[GAS_FIELDS[gas][0].key];
    const result = rfqSchema.safeParse(value);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === "details")).toBe(true);
  });
  it("rejects another gas's dynamic data instead of mixing operating assumptions", () => {
    expect(rfqSchema.safeParse({ ...valid("he"), details: { ...valid("he").details, purity: "99%" } }).success).toBe(false);
  });
  it("requires explicit current-version consent", () => {
    expect(rfqSchema.safeParse({ ...valid(), consent: { accepted: false, version: CONSENT_VERSION } }).success).toBe(false);
    expect(rfqSchema.safeParse({ ...valid(), consent: { accepted: true, version: "old" } }).success).toBe(false);
    const { consent: omitted, ...withoutConsent } = valid();
    expect(omitted.accepted).toBe(true);
    expect(rfqSchema.safeParse(withoutConsent).success).toBe(false);
  });
  it("requires duty-cycle explanation and rejects bots", () => {
    expect(rfqSchema.safeParse({ ...valid(), duty: "cycle" }).success).toBe(false);
    expect(rfqSchema.safeParse({ ...valid(), honeypot: "bot text" }).success).toBe(false);
  });
  it("validates an active step without future blank fields hiding its refinements", () => {
    const futureFields = { ...valid(), flow: { value: NaN, unit: "Nm3/h" }, consent: { accepted: false, version: CONSENT_VERSION } };
    expect(validateRfqStep(0, { ...futureFields, details: {} })).toContainEqual(expect.objectContaining({ path: "details.source" }));
    expect(validateRfqStep(2, { ...futureFields, outlet: { value: 5, unit: "bar(g)" } })).toContainEqual(expect.objectContaining({ path: "outlet.value" }));
    expect(validateRfqStep(0, futureFields)).toEqual([]);
  });
});

describe("durable idempotency and outbox", () => {
  it("accepts once and returns the original ID on duplicates", async () => {
    const deliver = vi.fn(async () => "local-staging" as const);
    const first = await withIdempotency(directory, "key", valid(), deliver);
    const second = await withIdempotency(directory, "key", valid(), deliver);
    expect(second.envelope.id).toBe(first.envelope.id);
    expect(second.duplicate).toBe(true);
    expect(deliver).toHaveBeenCalledTimes(1);
    expect(first.envelope.consentRecordedAt).toBe(first.envelope.receivedAt);
    const stored = await stat(path.join(directory, `${digest("key")}.json`));
    expect(stored.mode & 0o777).toBe(0o600);
  });
  it("rejects different content reusing the same key", async () => {
    await withIdempotency(directory, "key", valid(), async () => "local-staging");
    await expect(withIdempotency(directory, "key", { ...valid(), duty: "unknown" }, async () => "local-staging")).rejects.toMatchObject({ kind: "payload" });
  });
  it("does not send a simultaneous duplicate twice", async () => {
    let finish: (() => void) | undefined;
    let entered: (() => void) | undefined;
    const started = new Promise<void>((resolve) => { entered = resolve; });
    const wait = new Promise<void>((resolve) => { finish = resolve; });
    const deliver = vi.fn(async () => { entered?.(); await wait; return "webhook" as const; });
    const first = withIdempotency(directory, "key", valid(), deliver);
    await started;
    await expect(withIdempotency(directory, "key", valid(), deliver)).rejects.toBeInstanceOf(StorageConflict);
    finish?.();
    await first;
    expect(deliver).toHaveBeenCalledTimes(1);
  });
  it("retries a failed delivery with the same stable remote ID", async () => {
    let originalId = "";
    await expect(withIdempotency(directory, "key", valid(), async (envelope) => { originalId = envelope.id; throw new DeliveryError("unavailable"); })).rejects.toBeInstanceOf(DeliveryError);
    const retried = await withIdempotency(directory, "key", valid(), async () => "webhook");
    expect(retried.envelope.id).toBe(originalId);
    expect(retried.delivery).toBe("webhook");
  });
  it("keeps a queued RFQ until an explicit worker delivers it", async () => {
    await withIdempotency(directory, "key", valid(), async () => "outbox");
    const failed = await retryOutbox(directory, async () => { throw new DeliveryError("unavailable"); });
    expect(failed).toEqual({ delivered: 0, failed: 1 });
    const delivered = await retryOutbox(directory, async () => undefined);
    expect(delivered).toEqual({ delivered: 1, failed: 0 });
    const record = JSON.parse(await readFile(path.join(directory, `${digest("key")}.json`), "utf8")) as { delivery: string };
    expect(record.delivery).toBe("webhook");
  });
  it("prunes expired delivered copies while preserving unsent outbox records", async () => {
    await withIdempotency(directory, "delivered", valid(), async () => "local-staging");
    await withIdempotency(directory, "queued", valid(), async () => "outbox");
    const old = new Date(Date.now() - 31 * 86_400_000);
    await utimes(path.join(directory, `${digest("delivered")}.json`), old, old);
    await utimes(path.join(directory, `${digest("queued")}.json`), old, old);
    expect(await purgeExpiredRfq(directory, 30)).toBe(1);
    expect(await readdir(directory)).toContain(`${digest("queued")}.json`);
  });
});

describe("CRM adapter", () => {
  const envelope = (): RfqEnvelope => ({ id: "stable-id", receivedAt: new Date().toISOString(), consentRecordedAt: new Date().toISOString(), consentVersion: CONSENT_VERSION, rfq: valid() });
  it("retries transient errors and passes stable idempotency and auth headers", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response("", { status: 503 })).mockResolvedValueOnce(new Response("", { status: 200 }));
    await sendRfqToCrm(envelope(), { endpoint: "https://crm.example.test/rfq", secret: "test-only", fetcher, pause: async () => undefined });
    expect(fetcher).toHaveBeenCalledTimes(2);
    const options = fetcher.mock.calls[0][1];
    expect(options?.headers).toMatchObject({ "Idempotency-Key": "stable-id", Authorization: "Bearer test-only" });
    expect(options?.redirect).toBe("error");
  });
  it("uses the configured fallback after primary failure", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response("", { status: 400 })).mockResolvedValueOnce(new Response("", { status: 200 }));
    await sendRfqToCrm(envelope(), { endpoint: "https://primary.example.test/rfq", fallbackEndpoint: "https://fallback.example.test/rfq", fetcher, pause: async () => undefined });
    expect(fetcher.mock.calls[1][0]).toBe("https://fallback.example.test/rfq");
  });
  it("rejects insecure transport before contacting an endpoint", async () => {
    const fetcher = vi.fn<typeof fetch>();
    await expect(sendRfqToCrm(envelope(), { endpoint: "http://crm.example.test/rfq", fetcher })).rejects.toMatchObject({ reason: "configuration" });
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe("API boundary", () => {
  it("submits valid RFQ and gives an idempotent duplicate response", async () => {
    const response = await POST(request());
    expect(response.status).toBe(201);
    const first = await response.json() as { ok: boolean; id: string; delivery: string };
    expect(first).toMatchObject({ ok: true, delivery: "local-staging" });
    const duplicate = await POST(request());
    expect(duplicate.status).toBe(200);
    expect(await duplicate.json()).toMatchObject({ id: first.id, duplicate: true });
  });
  it("validates the payload again on the server", async () => { expect((await POST(request({ ...valid(), gas: "other-unsupported" }))).status).toBe(422); });
  it("rejects a key reused with a different working point", async () => {
    await POST(request());
    expect((await POST(request({ ...valid(), duty: "unknown" }))).status).toBe(409);
  });
  it("rejects cross-origin requests, missing keys, and wrong content type", async () => {
    expect((await POST(request(valid(), "test-idempotency-00000001", { Origin: "https://attacker.example" }))).status).toBe(403);
    expect((await POST(request(valid(), ""))).status).toBe(400);
    expect((await POST(request(valid(), "test-idempotency-00000001", { "Content-Type": "text/plain" }))).status).toBe(415);
  });
  it("allows the actual same-origin staging request when canonical uses a reserved example host", async () => {
    vi.stubEnv("SITE_URL", "https://staging.lanfor.example");
    expect((await POST(request())).status).toBe(201);
    expect((await POST(request(valid(), "another-idempotency-00001", { Origin: "https://attacker.example" }))).status).toBe(403);
  });
  it("accepts the explicitly configured loopback staging browser when Next binds to 0.0.0.0", async () => {
    vi.stubEnv("SITE_URL", "http://127.0.0.1:3000");
    const browserRequest = new Request("http://0.0.0.0:3000/api/rfq", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": "staging-loopback-0000001", Origin: "http://127.0.0.1:3000" }, body: JSON.stringify(valid()) });
    expect((await POST(browserRequest)).status).toBe(201);
  });
  it("accepts matching loopback ports with the example canonical but never foreign origins or ports", async () => {
    vi.stubEnv("SITE_URL", "https://staging.lanfor.example");
    const boundRequest = (origin: string) => new Request("http://0.0.0.0:3000/api/rfq", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": "staging-loopback-0000002", Origin: origin }, body: JSON.stringify(valid()) });
    expect((await POST(boundRequest("http://127.0.0.1:3000"))).status).toBe(201);
    expect((await POST(boundRequest("http://127.0.0.1:4000"))).status).toBe(403);
    expect((await POST(boundRequest("http://attacker.example:3000"))).status).toBe(403);
  });
  it("does not enable live reception with an HTTP loopback canonical", () => {
    const live = getRfqConfiguration({ NODE_ENV: "production", RFQ_STAGING_MODE: "false", RFQ_ENABLED: "true", RFQ_LEGAL_APPROVED: "true", LEGAL_OPERATOR_NAME: "Test", LEGAL_OPERATOR_CONTACT: "privacy@example.test", RFQ_ALLOW_LOCAL_FALLBACK: "true", SITE_URL: "http://127.0.0.1:3000" });
    expect(live.enabled).toBe(false);
  });
  it("bounds the streamed body independently of Content-Length", async () => {
    expect((await POST(request({ padding: "x".repeat(40_000) }))).status).toBe(413);
  });
  it("fails closed in production without live delivery and approved operator details", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RFQ_STAGING_MODE", "false");
    expect(getRfqConfiguration().enabled).toBe(false);
    expect((await POST(request())).status).toBe(503);
    expect(await readdir(directory)).toHaveLength(0);
  });
  it("queues a live delivery failure only when the durable fallback is explicitly enabled", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RFQ_STAGING_MODE", "false");
    vi.stubEnv("RFQ_ENABLED", "true");
    vi.stubEnv("RFQ_LEGAL_APPROVED", "true");
    vi.stubEnv("LEGAL_OPERATOR_NAME", "Test operator");
    vi.stubEnv("LEGAL_OPERATOR_CONTACT", "privacy@example.test");
    vi.stubEnv("RFQ_ALLOW_LOCAL_FALLBACK", "true");
    vi.stubEnv("SITE_URL", "https://lanfor.example");
    const response = await POST(request(valid(), "test-idempotency-00000001", { Origin: "https://lanfor.example" }));
    expect(response.status).toBe(202);
    expect(await response.json()).toMatchObject({ delivery: "outbox" });
    const names = (await readdir(directory)).filter((name) => /^[a-f0-9]{64}\.json$/.test(name));
    expect(names).toHaveLength(1);
  });
  it("does not allow personal data storage under public", () => {
    expect(() => getRfqConfiguration({ NODE_ENV: "production", RFQ_STORE_DIR: "public/rfq" })).toThrow("cannot be public");
  });
  it("enforces the persistent rate window", async () => {
    for (let index = 0; index < 20; index += 1) expect(await consumeRateLimit(directory, "subject", 1000)).toBe(true);
    expect(await consumeRateLimit(directory, "subject", 1001)).toBe(false);
    expect(await consumeRateLimit(directory, "subject", 601_001)).toBe(true);
  });
});
