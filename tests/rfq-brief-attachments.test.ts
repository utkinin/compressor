import { mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/rfq/route";
import { ATTACHMENT_MAX_BYTES, ATTACHMENT_MAX_FILES, ATTACHMENT_MAX_TOTAL_BYTES } from "../src/lib/rfq/attachment-policy";
import { validateAttachments } from "../src/lib/rfq/attachments";
import { briefRfqSchema, type BriefRfqInput } from "../src/lib/rfq/brief-schema";
import { CONSENT_VERSION } from "../src/lib/rfq/schema";
import { digest, retryOutbox } from "../src/lib/rfq/storage";
import { sendRfqToCrm, type RfqEnvelope } from "../src/lib/rfq/transport";

const validBrief = (): BriefRfqInput => ({
  intake: "brief", description: "Не хватает давления для оборудования, параметры уточняются.", attachmentCount: 0,
  contact: { name: "Тестовый инженер", company: "Тестовая организация", email: "engineer@example.test" },
  consent: { accepted: true, version: CONSENT_VERSION },
  attribution: { sourcePage: "/rfq/", landingPage: "/" }, honeypot: "",
});
const textFile = (text = "Тестовые технические требования без персональных данных.", name = "requirements.txt") => new File([text], name, { type: "text/plain" });
const pdfFile = (body = "1 0 obj << /Type /Catalog >> endobj") => new File([`%PDF-1.7\n${body}\n%%EOF\n`], "requirements.pdf", { type: "application/pdf" });
function submission(body: unknown, files: File[] = [], key = "test-brief-idempotency-0001", origin = "http://localhost:3000"): Request {
  const headers = { "Idempotency-Key": key, Origin: origin };
  if (files.length) {
    const form = new FormData(); form.set("payload", JSON.stringify(body));
    files.forEach((file) => form.append("files", file));
    return new Request("http://localhost:3000/api/rfq", { method: "POST", headers, body: form });
  }
  return new Request("http://localhost:3000/api/rfq", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
let directory: string;
beforeEach(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "lanfor-brief-"));
  vi.stubEnv("RFQ_STORE_DIR", directory); vi.stubEnv("RFQ_STAGING_MODE", "true"); vi.stubEnv("SITE_URL", "http://localhost:3000");
});
afterEach(async () => { await rm(directory, { recursive: true, force: true }); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("brief enquiries without fabricated technical parameters", () => {
  it("accepts a description without gas, pressure, flow or duty", async () => {
    expect(briefRfqSchema.safeParse(validBrief()).success).toBe(true);
    const result = await POST(submission(validBrief()));
    expect(result.status).toBe(201);
    const record = JSON.parse(await readFile(path.join(directory, `${digest("test-brief-idempotency-0001")}.json`), "utf8")) as { envelope: RfqEnvelope };
    expect(record.envelope.rfq).toMatchObject({ intake: "brief", description: validBrief().description });
    for (const key of ["inlet", "outlet", "flow", "duty"]) expect(Object.hasOwn(record.envelope.rfq, key)).toBe(false);
  });
  it("requires separate current consent on the alternate path", async () => {
    expect((await POST(submission({ ...validBrief(), consent: { accepted: false, version: CONSENT_VERSION } }))).status).toBe(422);
    expect((await readdir(directory)).filter((file) => /^[a-f0-9]{64}\.json$/.test(file))).toEqual([]);
  });
  it("can start with a known installation model but rejects an empty enquiry", async () => {
    expect((await POST(submission({ ...validBrief(), description: "", model: "Тестовая установка" }))).status).toBe(201);
    expect((await POST(submission({ ...validBrief(), description: "", model: " " }, [], "empty-brief-idempotency-0001"))).status).toBe(422);
  });
  it("never trusts a JSON claim that attachments were supplied", async () => {
    expect((await POST(submission({ ...validBrief(), description: "", attachmentCount: 3 }))).status).toBe(422);
  });
  it("rejects undeclared fields and unpublished context identifiers", async () => {
    expect((await POST(submission({ ...validBrief(), inlet: { value: 0, unit: "bar(g)" } }))).status).toBe(422);
    expect((await POST(submission({ ...validBrief(), requestContext: { equipment: "sf6-compressors" } }))).status).toBe(422);
  });
  it("keeps file-only enquiries and bytes in a private atomic record", async () => {
    const file = textFile();
    const response = await POST(submission({ ...validBrief(), description: "", attachmentCount: 99 }, [file]));
    expect(response.status).toBe(201);
    const receipt = await response.json() as Record<string, unknown>;
    expect(Object.keys(receipt).sort()).toEqual(["delivery", "duplicate", "id", "ok"]);
    const location = path.join(directory, `${digest("test-brief-idempotency-0001")}.json`);
    const record = JSON.parse(await readFile(location, "utf8")) as { envelope: RfqEnvelope };
    expect(record.envelope.rfq).toMatchObject({ attachmentCount: 1, description: "" });
    expect(record.envelope.attachments?.[0]).toMatchObject({ name: file.name, mediaType: "text/plain", size: file.size });
    expect(Buffer.from(record.envelope.attachments![0].contentBase64, "base64").toString("utf8")).toContain("Тестовые технические требования");
    expect((await stat(location)).mode & 0o777).toBe(0o600);
    expect((await stat(directory)).mode & 0o077).toBe(0);
  });
  it("deduplicates the same files but rejects changed bytes on the same key", async () => {
    const first = await POST(submission(validBrief(), [textFile("first technical requirements")]));
    expect(first.status).toBe(201);
    const second = await POST(submission(validBrief(), [textFile("first technical requirements")]));
    expect(second.status).toBe(200);
    const changed = await POST(submission(validBrief(), [textFile("changed technical requirements")]));
    expect(changed.status).toBe(409);
  });
  it("does not read or persist multipart data before origin and idempotency checks", async () => {
    expect((await POST(submission(validBrief(), [textFile()], "test-brief-idempotency-0001", "https://attacker.example"))).status).toBe(403);
    expect((await POST(submission(validBrief(), [textFile()], ""))).status).toBe(400);
    expect(await readdir(directory)).toEqual([]);
  });
});

describe("bounded document formats", () => {
  it("accepts allowed file formats with matching declared media and signatures", async () => {
    const png = new File([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1f8AAAAASUVORK5CYII=", "base64")], "diagram.png", { type: "image/png" });
    const jpeg = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 2, 0xff, 0xd9])], "nameplate.jpg", { type: "image/jpeg" });
    for (const file of [textFile(), pdfFile(), png, jpeg]) expect((await validateAttachments([file]))[0].size).toBe(file.size);
  });
  it("rejects executable, archive, SVG and HTML extensions", async () => {
    for (const name of ["request.exe", "request.zip", "request.svg", "request.html", "request.pdf.exe"]) {
      await expect(validateAttachments([new File(["data"], name)])).rejects.toMatchObject({ status: 415 });
    }
  });
  it("rejects spoofed MIME and signatures", async () => {
    await expect(validateAttachments([new File(["not a PDF"], "request.pdf", { type: "application/pdf" })])).rejects.toMatchObject({ status: 415 });
    await expect(validateAttachments([new File(["text"], "request.txt", { type: "image/png" })])).rejects.toMatchObject({ status: 415 });
    await expect(validateAttachments([new File(["not an image"], "image.png", { type: "image/png" })])).rejects.toMatchObject({ status: 415 });
  });
  it("rejects active PDF actions and text that conceals executable markup", async () => {
    for (const action of ["/JavaScript", "/JS", "/OpenAction", "/Launch", "/EmbeddedFile"]) await expect(validateAttachments([pdfFile(`<< ${action} (test) >>`)])).rejects.toMatchObject({ status: 415 });
    for (const text of ["<svg onload='test'></svg>", "<!DOCTYPE html><html></html>", "<script>test</script>", "bad\u0000text"]) await expect(validateAttachments([textFile(text)])).rejects.toMatchObject({ status: 415 });
  });
  it("bounds count, individual bytes, aggregate bytes and empty files", async () => {
    await expect(validateAttachments(Array.from({ length: ATTACHMENT_MAX_FILES + 1 }, () => textFile()))).rejects.toMatchObject({ status: 413 });
    await expect(validateAttachments([new File([new Uint8Array(ATTACHMENT_MAX_BYTES + 1)], "large.txt")])).rejects.toMatchObject({ status: 413 });
    const large = new File([new Uint8Array(ATTACHMENT_MAX_TOTAL_BYTES / 3 + 1)], "large.txt");
    await expect(validateAttachments([large, large, large])).rejects.toMatchObject({ status: 413 });
    await expect(validateAttachments([textFile("")])).rejects.toMatchObject({ status: 422 });
  });
  it("removes path and control characters from private attachment names", async () => {
    const [file] = await validateAttachments([textFile("technical requirements", "../../secret\u0000.txt")]);
    expect(file.name).toBe("secret_.txt");
    expect(file.sha256).toMatch(/^[a-f0-9]{64}$/);
  });
  it("rejects oversized streamed multipart bodies independently of Content-Length", async () => {
    const response = await POST(submission(validBrief(), [new File([new Uint8Array(ATTACHMENT_MAX_TOTAL_BYTES + 100_000)], "too-large.txt")]));
    expect(response.status).toBe(413);
  });
  it("rejects malformed parts and meters invalid uploads before reading their bytes", async () => {
    for (let index = 0; index < 20; index += 1) expect((await POST(submission(validBrief(), [textFile("<html>bad</html>")]))).status).toBe(415);
    expect((await POST(submission(validBrief(), [textFile()]))).status).toBe(429);
    const form = new FormData(); form.set("payload", JSON.stringify(validBrief())); form.set("files", "not a file");
    const invalid = new Request("http://localhost:3000/api/rfq", { method: "POST", headers: { Origin: "http://localhost:3000", "Idempotency-Key": "test-brief-malformed-0001" }, body: form });
    // The exhausted limiter still takes precedence over parsing attacker-controlled parts.
    expect((await POST(invalid)).status).toBe(429);
  });
});

describe("attachment delivery and durable retry", () => {
  it("delivers actual verified bytes to the configured HTTPS receiver", async () => {
    const response = await POST(submission(validBrief(), [textFile()]));
    expect(response.status).toBe(201);
    const record = JSON.parse(await readFile(path.join(directory, `${digest("test-brief-idempotency-0001")}.json`), "utf8")) as { envelope: RfqEnvelope };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("", { status: 200 }));
    await sendRfqToCrm(record.envelope, { endpoint: "https://receiver.example.test/rfq", fetcher });
    const outgoing = JSON.parse(String(fetcher.mock.calls[0][1]?.body)) as RfqEnvelope;
    expect(outgoing.attachments).toEqual(record.envelope.attachments);
    expect(outgoing.id).toBe(record.envelope.id);
    const maintenance = await retryOutbox(directory, async () => undefined);
    expect(maintenance).toEqual({ delivered: 0, failed: 0 });
  });
});
