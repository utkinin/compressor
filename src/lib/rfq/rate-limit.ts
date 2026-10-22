import { mkdir, readFile, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { atomicJson, digest } from "./storage";

const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 20;

/** Fixed-window limiter shared by processes on the configured persistent volume. */
export async function consumeRateLimit(directory: string, subject: string, now = Date.now()): Promise<boolean> {
  const rateDirectory = path.join(directory, "rate");
  await mkdir(rateDirectory, { recursive: true, mode: 0o700 });
  const file = path.join(rateDirectory, `${digest(subject)}.json`);
  const lock = `${file}.lock`;
  try { await mkdir(lock, { mode: 0o700 }); } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "EEXIST") {
      const information = await stat(lock).catch(() => null);
      if (!information || now - information.mtimeMs <= 60_000) return false;
      await rm(lock, { recursive: true, force: true });
      try { await mkdir(lock, { mode: 0o700 }); } catch { return false; }
    } else {
      throw error;
    }
  }
  try {
    let state: { start: number; count: number } = { start: now, count: 0 };
    try { state = JSON.parse(await readFile(file, "utf8")) as typeof state; } catch (error) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error;
    }
    if (now - state.start >= WINDOW_MS) state = { start: now, count: 0 };
    if (state.count >= LIMIT) return false;
    await atomicJson(file, { start: state.start, count: state.count + 1 });
    return true;
  } finally { await rm(lock, { recursive: true, force: true }); }
}

/** Minimise retention of pseudonymous network buckets after their useful window. */
export async function purgeExpiredRateBuckets(directory: string, now = Date.now()): Promise<number> {
  const rateDirectory = path.join(directory, "rate");
  await mkdir(rateDirectory, { recursive: true, mode: 0o700 });
  let removed = 0;
  for (const name of await readdir(rateDirectory)) {
    if (!/^[a-f0-9]{64}\.json$/.test(name)) continue;
    const file = path.join(rateDirectory, name);
    const information = await stat(file).catch(() => null);
    if (!information || now - information.mtimeMs <= 2 * WINDOW_MS) continue;
    const lock = `${file}.lock`;
    try { await mkdir(lock, { mode: 0o700 }); } catch { continue; }
    try {
      const latest = await stat(file).catch(() => null);
      if (latest && now - latest.mtimeMs > 2 * WINDOW_MS) { await rm(file, { force: true }); removed += 1; }
    } finally { await rm(lock, { recursive: true, force: true }); }
  }
  return removed;
}
