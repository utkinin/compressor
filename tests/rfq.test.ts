import { mkdtemp, readFile, readdir, rm, stat, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/rfq/route";
import { documents } from "../src/content/documents";
import { equipment } from "../src/content/equipment";
import { sourceModels } from "../src/content/internal/source-model-registry";
import { solutions } from "../src/content/solutions";
import { getRfqConfiguration } from "../src/lib/rfq/config";
import { consumeRateLimit } from "../src/lib/rfq/rate-limit";
import { formatRfqQuestionnaire } from "../src/lib/rfq/questionnaire";
import {
  CONSENT_VERSION, GAS_FIELDS, PROJECT_FIELDS, RFQ_DOCUMENT_CONTEXTS, RFQ_EQUIPMENT_CONTEXTS, RFQ_SOLUTION_CONTEXTS,
  initialRfqSelection, preliminaryEquipment, pressureToAbsoluteBar, publicRfqContextLabel,
  rfqSchema, sanitizeRfqContext, validateRfqStep, type Gas, type RfqContextKind, type RfqInput,
} from "../src/lib/rfq/schema";
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

describe("public RFQ catalogue context", () => {
  it("keeps all six equipment contexts aligned with public directions and their RFQ gas", () => {
    expect(Object.keys(RFQ_EQUIPMENT_CONTEXTS)).toHaveLength(6);
    expect(Object.keys(RFQ_EQUIPMENT_CONTEXTS).sort()).toEqual(equipment.map((item) => item.id).sort());
    for (const item of equipment) {
      expect(initialRfqSelection(undefined, item.id).gas).toBe(item.rfqGas);
      expect(publicRfqContextLabel("equipment", item.id)).toBeTruthy();
    }
  });

  it("accepts the fourteen public solutions and only public or requestable documents", () => {
    expect(Object.keys(RFQ_SOLUTION_CONTEXTS)).toHaveLength(14);
    expect(Object.keys(RFQ_SOLUTION_CONTEXTS).sort()).toEqual(solutions.map((item) => item.id).sort());
    for (const solution of solutions) expect(publicRfqContextLabel("solution", solution.id)).toBe(solution.title);
    const publicDocumentIds = documents.filter((item) => item.access !== "internal").map((item) => item.id);
    expect(publicDocumentIds).toHaveLength(1);
    expect(Object.keys(RFQ_DOCUMENT_CONTEXTS).sort()).toEqual([...publicDocumentIds, "technical-documentation"].sort());
    for (const item of documents.filter((document) => document.access === "internal")) {
      expect(publicRfqContextLabel("document", item.id)).toBeUndefined();
      expect(sanitizeRfqContext({ document: item.id })).toEqual({});
    }
  });

  it("preserves valid public context through sanitization and server validation", () => {
    const contexts = {
      equipment: Object.keys(RFQ_EQUIPMENT_CONTEXTS),
      solution: Object.keys(RFQ_SOLUTION_CONTEXTS),
      document: Object.keys(RFQ_DOCUMENT_CONTEXTS),
    };
    for (const kind of ["solution", "equipment", "document"] as const) {
      for (const id of contexts[kind]) {
        const context = { [kind]: id };
        expect(sanitizeRfqContext(context)).toEqual(context);
        expect(rfqSchema.safeParse({ ...valid(), requestContext: context }).success).toBe(true);
      }
    }
    const context = { equipment: "nitrogen-boosters", solution: "nitrogen-for-laser-cutting", document: "technical-documentation" };
    expect(sanitizeRfqContext(context)).toEqual(context);
    expect(rfqSchema.safeParse({ ...valid(), requestContext: context }).success).toBe(true);
  });

  it("rejects unknown and private identifiers in every context field", () => {
    const rejectedIds = new Set([
      "unknown-public-context", "constructor", "toString", "__proto__",
      ...sourceModels.flatMap((model) => [model.id, model.modelName, ...model.sourceSlugs, ...model.aliases]),
      ...documents.filter((document) => document.access === "internal").map((document) => document.id),
    ]);
    for (const kind of ["solution", "equipment", "document"] as const) {
      for (const id of rejectedIds) {
        expect(publicRfqContextLabel(kind, id)).toBeUndefined();
        expect(sanitizeRfqContext({ [kind]: id })).toEqual({});
        const parsed = rfqSchema.safeParse({ ...valid(), requestContext: { [kind]: id } });
        expect(parsed.success).toBe(false);
        if (!parsed.success) expect(parsed.error.issues.some((issue) => issue.path.join(".") === `requestContext.${kind}`)).toBe(true);
      }
    }
  });

  it("does not accept a valid identifier through another context namespace", () => {
    const wrongContexts: [RfqContextKind, string][] = [
      ["solution", "nitrogen-boosters"],
      ["document", "nitrogen-boosters"],
      ["equipment", "nitrogen-for-laser-cutting"],
      ["solution", "technical-documentation"],
    ];
    for (const [kind, id] of wrongContexts) {
      expect(sanitizeRfqContext({ [kind]: id })).toEqual({});
      expect(rfqSchema.safeParse({ ...valid(), requestContext: { [kind]: id } }).success).toBe(false);
    }
  });

  it("drops repeated and non-string query values without dropping valid fields", () => {
    expect(sanitizeRfqContext({ solution: ["helium-recovery"], equipment: 42, document: null })).toEqual({});
    expect(sanitizeRfqContext({ equipment: "nitrogen-boosters", solution: {}, document: undefined })).toEqual({ equipment: "nitrogen-boosters" });
  });

  it("prefills SF₆ as an editable composition without adding an unsupported gas branch", () => {
    const selection = initialRfqSelection(undefined, "sf6-compressors");
    expect(selection).toEqual({ gas: "mixtures", details: { composition: "SF₆; чистота и примеси требуют уточнения" } });
    expect(rfqSchema.safeParse({ ...valid("mixtures"), ...selection, requestContext: { equipment: "sf6-compressors" } }).success).toBe(true);
    expect(initialRfqSelection("he", "sf6-compressors")).toEqual({ gas: "he", details: {} });
    expect(initialRfqSelection(undefined, "unknown-public-context")).toEqual({ gas: "n2", details: {} });
  });

  it("returns a descriptive preliminary option with mandatory engineering confirmation", () => {
    expect(preliminaryEquipment({
      ...valid(),
      requestContext: { equipment: "nitrogen-boosters", solution: "nitrogen-for-laser-cutting" },
    })).toEqual({
      type: "Бустер азота высокого давления",
      purpose: "Система подачи азота для лазерной резки",
      configuration: "Уточняется после инженерного расчёта",
      status: "Требуется инженерное подтверждение",
    });
  });

  it("updates the preliminary description when the SF₆ composition or selected gas changes", () => {
    const sf6Context = { equipment: "sf6-compressors" };
    const selection = initialRfqSelection(undefined, sf6Context.equipment);
    expect(preliminaryEquipment({ ...selection, requestContext: sf6Context }).type).toBe("Компрессор для SF₆");
    const changedComposition = preliminaryEquipment({ gas: "mixtures", details: { composition: "Другой состав требует уточнения" }, requestContext: sf6Context });
    expect(changedComposition.type).toBe("Компрессор для заданного состава газа");
    expect(changedComposition.purpose).toBe("Сжатие технологического газа после анализа состава");
    const changedGas = initialRfqSelection("he", sf6Context.equipment);
    expect(changedGas.details).toEqual({});
    expect(preliminaryEquipment({ ...changedGas, requestContext: sf6Context }).type).toBe("Компрессор для гелия");
  });

  it("does not carry nitrogen equipment or purpose into a helium request", () => {
    const preliminary = preliminaryEquipment({ gas: "he", details: {}, requestContext: { equipment: "nitrogen-boosters", solution: "nitrogen-for-laser-cutting" } });
    expect(preliminary.type).toBe("Компрессор для гелия");
    expect(preliminary.purpose).toBe("Сжатие и перекачка гелия");
    expect(preliminary.status).toBe("Требуется инженерное подтверждение");
  });
});

describe("completed compressor questionnaire", () => {
  it("preserves optional project requirements in the validated RFQ and bounds their keys and length", () => {
    const project = Object.fromEntries(PROJECT_FIELDS.map((field) => [field.key, `  Требует уточнения: ${field.label}  `]));
    const parsed = rfqSchema.safeParse({ ...valid(), project });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.project?.temperature).toBe("Требует уточнения: Температура газа и окружающей среды");
    expect(rfqSchema.safeParse({ ...valid(), project: { unrelated: "Не относится к требованиям" } }).success).toBe(false);
    expect(rfqSchema.safeParse({ ...valid(), project: { other: "x".repeat(2001) } }).success).toBe(false);
  });

  it("exports entered technical data and additional requirements without contact details", () => {
    const input = {
      ...valid(),
      inlet: { value: 0.6, unit: "MPa" as const, reference: "absolute" as const },
      project: { temperature: "20 °C", placement: "Внутри помещения", other: "Необходима проверка герметичности" },
    };
    const text = formatRfqQuestionnaire(input);
    expect(text).toContain("Опросный лист на подбор газового компрессора");
    expect(text).toContain("P₁ — давление на входе: 0.6 MPa (абс.)");
    expect(text).toContain("P₂ — требуемое давление: 20 bar(g)");
    expect(text).toContain("Q — расход: 30 Nm³/h");
    expect(text).toContain(`Условия расхода: ${input.flow.reference}`);
    expect(text).toContain("Температура газа и окружающей среды: 20 °C");
    expect(text).toContain("Условия размещения: Внутри помещения");
    expect(text).toContain("Прочие требования: Необходима проверка герметичности");
    expect(text).toContain("Охлаждение: Не указано");
    for (const value of Object.values(input.contact)) expect(text).not.toContain(value);
    expect(text).not.toContain(CONSENT_VERSION);
  });

  it("keeps former document placeholders outside RFQ context", () => {
    for (const id of ["configuration-datasheet", "manufacturer-family-catalogue", "operating-manual", "pid-interface-drawing", "cad-layout", "step-model", "conformity-document-list", "working-point-calculation"]) {
      expect(documents.some((document) => document.id === id && document.access !== "internal")).toBe(false);
      expect(sanitizeRfqContext({ document: id })).toEqual({});
      expect(rfqSchema.safeParse({ ...valid(), requestContext: { document: id } }).success).toBe(false);
    }
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
