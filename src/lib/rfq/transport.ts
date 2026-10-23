import type { RfqSubmission } from "./brief-schema";
import type { RfqAttachment } from "./attachments";

export interface RfqEnvelope {
  id: string;
  receivedAt: string;
  consentRecordedAt: string;
  consentVersion: string;
  rfq: RfqSubmission;
  /** Private receiver contract: validated file bytes are included, never public URLs. */
  attachments?: RfqAttachment[];
}

export type Delivery = "webhook" | "local-staging" | "outbox";
export interface DeliveryConfiguration {
  endpoint?: string;
  secret?: string;
  fallbackEndpoint?: string;
  fallbackSecret?: string;
  fetcher?: typeof fetch;
  pause?: (milliseconds: number) => Promise<void>;
}

export class DeliveryError extends Error {
  constructor(public readonly reason: "configuration" | "unavailable" | "rejected") {
    super(`RFQ delivery ${reason}`);
  }
}

function secureEndpoint(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.hash) throw new Error("invalid endpoint");
    return url.toString();
  } catch {
    throw new DeliveryError("configuration");
  }
}

async function deliver(endpoint: string, secret: string | undefined, envelope: RfqEnvelope, configuration: DeliveryConfiguration): Promise<void> {
  const target = secureEndpoint(endpoint);
  const fetcher = configuration.fetcher ?? fetch;
  const pause = configuration.pause ?? ((milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds)));
  for (let attempt = 0; attempt < 3; attempt += 1) {
    let response: Response;
    try {
      response = await fetcher(target, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": envelope.id,
          ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
        },
        body: JSON.stringify(envelope),
        signal: AbortSignal.timeout(5000),
        redirect: "error",
      });
    } catch {
      if (attempt === 2) throw new DeliveryError("unavailable");
      await pause(200 * 2 ** attempt);
      continue;
    }
    if (response.ok) return;
    if (response.status !== 429 && response.status < 500) throw new DeliveryError("rejected");
    if (attempt === 2) throw new DeliveryError("unavailable");
    await pause(200 * 2 ** attempt);
  }
}

/** CRM-neutral HTTPS webhook. Destinations and credentials are server configuration only. */
export async function sendRfqToCrm(envelope: RfqEnvelope, configuration: DeliveryConfiguration = {}): Promise<void> {
  const primary = configuration.endpoint ?? process.env.RFQ_CRM_ENDPOINT;
  const fallback = configuration.fallbackEndpoint ?? process.env.RFQ_FALLBACK_ENDPOINT;
  if (!primary && !fallback) throw new DeliveryError("configuration");
  if (primary) {
    try {
      await deliver(primary, configuration.secret ?? process.env.RFQ_CRM_SECRET, envelope, configuration);
      return;
    } catch (error) {
      if (!fallback) throw error;
    }
  }
  if (fallback) await deliver(fallback, configuration.fallbackSecret ?? process.env.RFQ_FALLBACK_SECRET, envelope, configuration);
}
