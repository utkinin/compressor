import { isIP } from "node:net";
import { getConfiguredRfqOrigin, getRfqConfiguration, isLoopbackHost } from "../../../lib/rfq/config";
import { consumeRateLimit, purgeExpiredRateBuckets } from "../../../lib/rfq/rate-limit";
import { rfqSchema } from "../../../lib/rfq/schema";
import { purgeExpiredRfq, StorageConflict, withIdempotency } from "../../../lib/rfq/storage";
import { sendRfqToCrm } from "../../../lib/rfq/transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BODY = 32_768;
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const failure = (status: number, error: string, additional: Record<string, unknown> = {}, extraHeaders: Record<string, string> = {}) => Response.json({ ok: false, error, ...additional }, { status, headers: { ...headers, ...extraHeaders } });

async function readBoundedBody(request: Request): Promise<string> {
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY) { await reader.cancel(); throw new RangeError("Body too large"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export async function POST(request: Request): Promise<Response> {
  try {
    const configuration = getRfqConfiguration();
    if (!configuration.enabled) return failure(503, "Приём заявок ещё не подключён. Персональные данные не приняты.");
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") || "")) return failure(415, "Ожидается application/json");
    if (Number(request.headers.get("content-length") || 0) > MAX_BODY) return failure(413, "Слишком большой запрос");
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
    let body: unknown;
    try { body = JSON.parse(await readBoundedBody(request)); } catch (error) {
      return failure(error instanceof RangeError ? 413 : 400, error instanceof RangeError ? "Слишком большой запрос" : "Некорректный JSON");
    }
    const parsed = rfqSchema.safeParse(body);
    if (!parsed.success) {
      return failure(422, "Проверьте рабочую точку и обязательные поля", { issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) });
    }
    // The forwarding header is authoritative only when the deployment proxy overwrites it.
    const forwarded = configuration.trustProxy ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() : undefined;
    const subject = forwarded && isIP(forwarded) ? forwarded : "shared-untrusted-network";
    if (!await consumeRateLimit(configuration.storeDir, subject)) return failure(429, "Слишком много запросов. Повторите через 10 минут.", {}, { "Retry-After": "600" });
    await purgeExpiredRfq(configuration.storeDir, configuration.retentionDays);
    await purgeExpiredRateBuckets(configuration.storeDir);
    const result = await withIdempotency(configuration.storeDir, key, parsed.data, async (envelope) => {
      if (configuration.staging) return "local-staging";
      try { await sendRfqToCrm(envelope); return "webhook"; } catch (error) {
        if (configuration.allowLocalFallback) return "outbox";
        throw error;
      }
    });
    return Response.json({ ok: true, id: result.envelope.id, delivery: result.delivery, duplicate: result.duplicate }, { status: result.duplicate ? 200 : result.delivery === "outbox" ? 202 : 201, headers });
  } catch (error) {
    if (error instanceof StorageConflict) {
      return failure(409, error.kind === "payload" ? "Ключ уже использован для другой заявки. Начните новую отправку." : "Заявка обрабатывается. Повторите с тем же ключом.", { code: error.kind === "payload" ? "IDEMPOTENCY_CONFLICT" : "PROCESSING" }, error.kind === "processing" ? { "Retry-After": "1" } : {});
    }
    // Do not log payloads, headers, CRM responses, or contact details.
    return failure(503, "Не удалось подтвердить доставку. Повторите отправку с тем же ключом.");
  }
}
