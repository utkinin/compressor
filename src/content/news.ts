import type { News } from "./news-types";

/** No event records are supplied until a real Lanfor event is confirmed. */
export const news: News[] = [];

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

/** Public routes and the About section share the same evidence and editorial gate. */
export function publicNews(records: readonly News[] = news): News[] {
  const today = new Date().toISOString().slice(0, 10);
  return records.filter((record) => {
    if (record.kind !== "lanfor-event" || record.organization !== "Lanfor Gas Systems") return false;
    if (record.editorialState !== "approved" && record.editorialState !== "published") return false;
    if (record.verification.status !== "confirmed") return false;
    const { source, approvedBy } = record.verification;
    if (!approvedBy.trim() || !source.title.trim() || !source.locator.trim()) return false;
    try {
      const url = new URL(source.url);
      if (url.protocol !== "https:" || !url.hostname || url.username || url.password) return false;
    } catch {
      return false;
    }
    return Boolean(record.title.trim() && record.summary.trim())
      && [record.eventDate, record.published, record.updated].every(validDate)
      && record.updated >= record.published
      && record.published <= today && record.updated <= today
      && record.sections.length > 0
      && record.sections.every((section) => section.title.trim() && section.paragraphs.length > 0 && section.paragraphs.every((paragraph) => paragraph.trim()));
  }).toSorted((left, right) => right.published.localeCompare(left.published));
}
