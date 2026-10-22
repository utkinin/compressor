export const analyticsEvents = [
  "hero_rfq_click", "rfq_start", "rfq_step_complete", "rfq_validation_error", "rfq_submit", "rfq_success", "rfq_fail",
  "solution_view", "gas_view", "equipment_view", "document_view", "document_download", "cad_request", "contact_click", "email_click", "phone_click",
] as const;

export type AnalyticsProps = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    lanforAnalyticsConsent?: boolean;
    lanforAnalyticsSender?: (name: string, properties: AnalyticsProps) => void;
  }
}

const allowedKeys = new Set(["step", "gas", "field", "entity_id", "path", "solution", "equipment", "document", "unit", "delivery", "code", "mode"]);

export function safeAnalyticsProps(props: AnalyticsProps): AnalyticsProps {
  const clean: AnalyticsProps = {};
  for (const [key, value] of Object.entries(props)) {
    if (!allowedKeys.has(key) || value === undefined) continue;
    if (typeof value === "string") {
      const sanitized = key === "path" ? value.split(/[?#]/)[0] : value;
      // Only controlled identifiers. Contact values and free text never cross the adapter.
      if (/^[a-zA-Z0-9_./:\-]{1,160}$/.test(sanitized)) clean[key] = sanitized;
    } else clean[key] = value;
  }
  return clean;
}

export function track(name: string, props: AnalyticsProps = {}) {
  if (typeof window === "undefined" || !window.lanforAnalyticsConsent) return;
  if (!(analyticsEvents as readonly string[]).includes(name)) return;
  const safe = safeAnalyticsProps(props);
  window.lanforAnalyticsSender?.(name, safe);
}
