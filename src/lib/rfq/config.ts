import path from "node:path";

export interface RfqConfiguration {
  staging: boolean;
  enabled: boolean;
  storeDir: string;
  allowLocalFallback: boolean;
  trustProxy: boolean;
  retentionDays: number;
}

export function isLoopbackHost(hostname: string): boolean {
  return ["localhost", "127.0.0.1", "[::1]", "::1", "0.0.0.0"].includes(hostname);
}

export function getConfiguredRfqOrigin(environment: NodeJS.ProcessEnv = process.env, allowLocalHttp = false): string | undefined {
  if (!environment.SITE_URL) return undefined;
  try {
    const site = new URL(environment.SITE_URL);
    const trustedLocalHttp = allowLocalHttp && site.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]", "::1"].includes(site.hostname);
    if ((site.protocol !== "https:" && !trustedLocalHttp) || site.username || site.password) return undefined;
    return site.origin;
  } catch { return undefined; }
}

export function getRfqConfiguration(environment: NodeJS.ProcessEnv = process.env): RfqConfiguration {
  const staging = environment.RFQ_STAGING_MODE === "true" || environment.NODE_ENV !== "production";
  const legalReady = environment.RFQ_LEGAL_APPROVED === "true" && Boolean(environment.LEGAL_OPERATOR_NAME?.trim()) && Boolean(environment.LEGAL_OPERATOR_CONTACT?.trim());
  const deliveryReady = Boolean(environment.RFQ_CRM_ENDPOINT || environment.RFQ_FALLBACK_ENDPOINT || environment.RFQ_ALLOW_LOCAL_FALLBACK === "true");
  const storeDir = path.resolve(environment.RFQ_STORE_DIR || path.join(process.cwd(), ".local", "rfq"));
  const publicDir = path.resolve(process.cwd(), "public");
  if (storeDir === publicDir || storeDir.startsWith(`${publicDir}${path.sep}`)) throw new Error("RFQ storage cannot be public");
  const requestedRetention = Number(environment.RFQ_RETENTION_DAYS || "30");
  return {
    staging,
    enabled: staging || (environment.RFQ_ENABLED === "true" && legalReady && deliveryReady && Boolean(getConfiguredRfqOrigin(environment))),
    storeDir,
    allowLocalFallback: environment.RFQ_ALLOW_LOCAL_FALLBACK === "true",
    trustProxy: environment.RFQ_TRUST_PROXY === "true",
    retentionDays: Number.isFinite(requestedRetention) ? Math.min(90, Math.max(1, Math.floor(requestedRetention))) : 30,
  };
}
