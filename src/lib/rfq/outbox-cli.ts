import { getRfqConfiguration } from "./config";
import { purgeExpiredRfq, retryOutbox } from "./storage";
import { sendRfqToCrm } from "./transport";
import { purgeExpiredRateBuckets } from "./rate-limit";

async function main(): Promise<void> {
  // Match the local Next.js setup without committing or logging credentials.
  // Injected process environment remains authoritative over values in this file.
  try { process.loadEnvFile(".env.local"); } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error;
  }
  const configuration = getRfqConfiguration();
  const removed = await purgeExpiredRfq(configuration.storeDir, configuration.retentionDays);
  const removedRateBuckets = await purgeExpiredRateBuckets(configuration.storeDir);
  if (configuration.staging || !configuration.enabled) {
    console.info(JSON.stringify({ mode: configuration.staging ? "staging" : "disabled", removed, removedRateBuckets, delivered: 0, failed: 0 }));
    return;
  }
  const result = await retryOutbox(configuration.storeDir, (envelope) => sendRfqToCrm(envelope));
  console.info(JSON.stringify({ mode: "live", removed, removedRateBuckets, ...result }));
  if (result.failed) process.exitCode = 1;
}

main().catch(() => {
  console.error("RFQ outbox maintenance failed; no personal data were logged.");
  process.exitCode = 1;
});
