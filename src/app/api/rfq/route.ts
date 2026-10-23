import { isIP } from "node:net";
import { getConfiguredRfqOrigin, getRfqConfiguration, isLoopbackHost } from "../../../lib/rfq/config";
import { consumeRateLimit, purgeExpiredRateBuckets } from "../../../lib/rfq/rate-limit";
import { briefRfqSchema } from "../../../lib/rfq/brief-schema";
import { rfqSchema } from "../../../lib/rfq/schema";
import { AttachmentError, validateAttachments, type RfqAttachment } from "../../../lib/rfq/attachments";
import { ATTACHMENT_MAX_TOTAL_BYTES } from "../../../lib/rfq/attachment-policy";
import { ensurePrivateRfqStorage, purgeExpiredRfq, StorageConflict, withIdempotency } from "../../../lib/rfq/storage";
import { sendRfqToCrm } from "../../../lib/rfq/transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BODY = 32_768;
const MAX_MULTIPART_BODY = ATTACHMENT_MAX_TOTAL_BYTES + MAX_BODY + 65_536;
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const failure = (status: number, error: string, additional: Record<string, unknown> = {}, extraHeaders: Record<string, string> = {}) => Response.json({ ok: false, error, ...additional }, { status, headers: { ...headers, ...extraHeaders } });

async function readBoundedBody(request: Request, maximum: number): Promise<Uint8Array<ArrayBuffer>> {
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array(0);
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maximum) { await reader.cancel(); throw new RangeError("Body too large"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

function withActualAttachmentCount(body: unknown, count: number): unknown {
  if (body && typeof body === "object" && !Array.isArray(body) && "intake" in body && body.intake === "brief") {
    return { ...body, attachmentCount: count };
  }
  return body;
}

async function readSubmission(request: Request, contentType: string, multipart: boolean): Promise<{ body: unknown; attachments: RfqAttachment[] }> {
  const bytes = await readBoundedBody(request, multipart ? MAX_MULTIPART_BODY : MAX_BODY);
  if (!multipart) {
    const body: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    return { body: withActualAttachmentCount(body, 0), attachments: [] };
  }
  let form: FormData;
  try { form = await new Response(bytes.buffer, { headers: { "Content-Type": contentType } }).formData(); } catch { throw new AttachmentError(422, "Не удалось прочитать файлы запроса"); }
  const payloads = form.getAll("payload");
  if (payloads.length !== 1 || typeof payloads[0] !== "string" || new TextEncoder().encode(payloads[0]).byteLength > MAX_BODY) {
    throw new AttachmentError(422, "Нужен один корректный набор параметров запроса");
  }
  if ([...form.keys()].some((key) => key !== "payload" && key !== "files")) throw new AttachmentError(422, "Неизвестное поле запроса");
  const files = form.getAll("files");
  if (files.some((file) => typeof file === "string")) throw new AttachmentError(422, "Вложение должно быть файлом");
  const attachments = await validateAttachments(files.filter((file): file is File => typeof file !== "string"));
  const body: unknown = JSON.parse(payloads[0]);
  return { body: withActualAttachmentCount(body, attachments.length), attachments };
}

export async function POST(request: Request): Promise<Response> {
  try {
    const configuration = getRfqConfiguration();
    if (!configuration.enabled) return failure(503, "Приём заявок ещё не подключён. Персональные данные не приняты.");
    const contentType = request.headers.get("content-type") || "";
    const multipart = /^multipart\/form-data\s*;/i.test(contentType);
    if (!multipart && !/^application\/json(?:\s*;|$)/i.test(contentType)) return failure(415, "Ожидается JSON или форма с файлами");
    if (Number(request.headers.get("content-length") || 0) > (multipart ? MAX_MULTIPART_BODY : MAX_BODY)) return failure(413, "Слишком большой запрос");
    const origin = request.headers.get("origin");
    const configuredOrigin = getConfiguredRfqOrigin(process.env, configuration.staging);
    const requestUrl = new URL(request.url);
    const allowedOrigins = new Set([
      ...(configuredOrigin ? [configuredOrigin] : []),
      ...(configuration.staging ? [requestUrl.origin] : []),
    ]);
    if (configuration.staging && origin && isLoopbackHost(requestUrl.hostname)) {
      try {
        const browserOrigin = new URL(origin);
        if (browserOrigin.protocol === requestUrl.protocol && browserOrigin.port === requestUrl.port && isLoopbackHost(browserOrigin.hostname) && !browserOrigin.username && !browserOrigin.password && browserOrigin.origin === origin) allowedOrigins.add(origin);
      } catch { /* Malformed origins remain disallowed. */ }
    }
    if ((origin && !allowedOrigins.has(origin)) || (!origin && !configuration.staging)) return failure(403, "Недопустимый источник запроса");
    const key = request.headers.get("idempotency-key");
    if (!key || !/^[A-Za-z0-9_-]{16,128}$/.test(key)) return failure(400, "Нужен корректный Idempotency-Key");
    await ensurePrivateRfqStorage(configuration.storeDir);
    // Rate-limit before reading multipart bytes or running document validation.
    const forwarded = configuration.trustProxy ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() : undefined;
    const subject = forwarded && isIP(forwarded) ? forwarded : "shared-untrusted-network";
    if (!await consumeRateLimit(configuration.storeDir, subject)) return failure(429, "Слишком много запросов. Повторите через 10 минут.", {}, { "Retry-After": "600" });
    let submission: { body: unknown; attachments: RfqAttachment[] };
    try { submission = await readSubmission(request, contentType, multipart); } catch (error) {
      if (error instanceof AttachmentError) return failure(error.status, error.message);
      return failure(error instanceof RangeError ? 413 : 400, error instanceof RangeError ? "Слишком большой запрос" : "Некорректный JSON");
    }
    const brief = submission.body !== null && typeof submission.body === "object" && "intake" in submission.body && submission.body.intake === "brief";
    const parsed = brief ? briefRfqSchema.safeParse(submission.body) : rfqSchema.safeParse(submission.body);
    if (!parsed.success) {
      return failure(422, "Проверьте параметры запроса и обязательные поля", { issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) });
    }
    await purgeExpiredRfq(configuration.storeDir, configuration.retentionDays);
    await purgeExpiredRateBuckets(configuration.storeDir);
    const result = await withIdempotency(configuration.storeDir, key, parsed.data, async (envelope) => {
      if (configuration.staging) return "local-staging";
      try { await sendRfqToCrm(envelope); return "webhook"; } catch (error) {
        if (configuration.allowLocalFallback) return "outbox";
        throw error;
      }
    }, submission.attachments);
    return Response.json({ ok: true, id: result.envelope.id, delivery: result.delivery, duplicate: result.duplicate }, { status: result.duplicate ? 200 : result.delivery === "outbox" ? 202 : 201, headers });
  } catch (error) {
    if (error instanceof StorageConflict) {
      return failure(409, error.kind === "payload" ? "Ключ уже использован для другой заявки. Начните новую отправку." : "Заявка обрабатывается. Повторите с тем же ключом.", { code: error.kind === "payload" ? "IDEMPOTENCY_CONFLICT" : "PROCESSING" }, error.kind === "processing" ? { "Retry-After": "1" } : {});
    }
    // Do not log payloads, headers, CRM responses, or contact details.
    return failure(503, "Не удалось подтвердить доставку. Повторите отправку с тем же ключом.");
  }
}
