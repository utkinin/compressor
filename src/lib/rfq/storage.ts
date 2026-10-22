import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, stat, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { RfqInput } from "./schema";
import type { Delivery, RfqEnvelope } from "./transport";

export interface StoredRfq {
  envelope: RfqEnvelope;
  payloadHash: string;
  state: "pending" | "complete" | "failed";
  delivery?: Delivery;
  updatedAt: string;
}

export class StorageConflict extends Error {
  constructor(public readonly kind: "payload" | "processing") { super(`Idempotency ${kind}`); }
}

export const digest = (value: string): string => createHash("sha256").update(value).digest("hex");

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().filter((key) => record[key] !== undefined).map((key) => `${JSON.stringify(key)}:${stable(record[key])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

async function privateDirectory(directory: string): Promise<void> {
  await mkdir(directory, { recursive: true, mode: 0o700 });
}

export async function atomicJson(file: string, data: unknown): Promise<void> {
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, JSON.stringify(data), { mode: 0o600, flag: "wx", flush: true });
    await rename(temporary, file);
  } finally {
    await rm(temporary, { force: true });
  }
}

async function acquireLock(lock: string): Promise<void> {
  try { await mkdir(lock, { mode: 0o700 }); } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "EEXIST") throw error;
    const information = await stat(lock).catch(() => null);
    if (information && Date.now() - information.mtimeMs > 120_000) {
      await rm(lock, { recursive: true, force: true });
      try { await mkdir(lock, { mode: 0o700 }); return; } catch { throw new StorageConflict("processing"); }
    }
    throw new StorageConflict("processing");
  }
}

export interface SubmissionResult {
  envelope: RfqEnvelope;
  duplicate: boolean;
  delivery: Delivery;
}

/**
 * Single persistent volume implementation. Stable delivery IDs must also be deduplicated
 * by the receiving CRM; that covers a process interruption after remote acceptance.
 */
export async function withIdempotency(
  directory: string,
  key: string,
  input: RfqInput,
  deliver: (envelope: RfqEnvelope) => Promise<Delivery>,
): Promise<SubmissionResult> {
  await privateDirectory(directory);
  const file = path.join(directory, `${digest(key)}.json`);
  const lock = `${file}.lock`;
  await acquireLock(lock);
  try {
    let existing: StoredRfq | undefined;
    try { existing = JSON.parse(await readFile(file, "utf8")) as StoredRfq; } catch (error) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error;
    }
    const payloadHash = digest(stable(input));
    if (existing && existing.payloadHash !== payloadHash) throw new StorageConflict("payload");
    if (existing?.state === "complete" && existing.delivery) {
      return { envelope: existing.envelope, duplicate: true, delivery: existing.delivery };
    }
    const timestamp = new Date().toISOString();
    const envelope = existing?.envelope ?? { id: randomUUID(), receivedAt: timestamp, consentRecordedAt: timestamp, consentVersion: input.consent.version, rfq: input };
    const record: StoredRfq = { envelope, payloadHash, state: "pending", updatedAt: timestamp };
    await atomicJson(file, record);
    try {
      const delivery = await deliver(envelope);
      await atomicJson(file, { ...record, state: "complete", delivery, updatedAt: new Date().toISOString() });
      return { envelope, duplicate: Boolean(existing), delivery };
    } catch (error) {
      await atomicJson(file, { ...record, state: "failed", updatedAt: new Date().toISOString() });
      throw error;
    }
  } finally {
    await rm(lock, { force: true, recursive: true });
  }
}

/** Explicitly retry durable queued/failed records. Never emits RFQ contents to logs. */
export async function retryOutbox(directory: string, deliver: (envelope: RfqEnvelope) => Promise<void>): Promise<{ delivered: number; failed: number }> {
  await privateDirectory(directory);
  const result = { delivered: 0, failed: 0 };
  for (const name of await readdir(directory)) {
    if (!/^[a-f0-9]{64}\.json$/.test(name)) continue;
    const file = path.join(directory, name);
    const lock = `${file}.lock`;
    try { await acquireLock(lock); } catch { continue; }
    try {
      const record = JSON.parse(await readFile(file, "utf8")) as StoredRfq;
      if (record.delivery !== "outbox" && record.state !== "failed" && record.state !== "pending") continue;
      try {
        await deliver(record.envelope);
        await atomicJson(file, { ...record, state: "complete", delivery: "webhook", updatedAt: new Date().toISOString() });
        result.delivered += 1;
      } catch { result.failed += 1; }
    } finally { await rm(lock, { force: true, recursive: true }); }
  }
  return result;
}

export async function purgeExpiredRfq(directory: string, retentionDays: number, now = Date.now()): Promise<number> {
  await privateDirectory(directory);
  let removed = 0;
  for (const name of await readdir(directory)) {
    if (!/^[a-f0-9]{64}\.json$/.test(name)) continue;
    const file = path.join(directory, name);
    const lock = `${file}.lock`;
    try { await acquireLock(lock); } catch { continue; }
    try {
      const information = await stat(file);
      if (now - information.mtimeMs <= retentionDays * 86_400_000) continue;
      const record = JSON.parse(await readFile(file, "utf8")) as StoredRfq;
      // Never destroy an undelivered RFQ merely because its retry queue is old.
      if (record.state !== "complete" || !["webhook", "local-staging"].includes(record.delivery || "")) continue;
      await rm(file, { force: true });
      removed += 1;
    } finally { await rm(lock, { recursive: true, force: true }); }
  }
  return removed;
}
