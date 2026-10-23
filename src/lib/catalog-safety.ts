/** Build-time contracts. This module contains no private source records. */
export interface SourceModelIdentity {
  modelName: string;
  sourceSlugs: readonly string[];
  aliases: readonly string[];
}

export interface CatalogLeak {
  term: string;
  line: number;
  context: string;
}

function normalized(value: string): string {
  let text = value.replace(/\\u([\da-f]{4})/gi, (_, code: string) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&#(?:x([\da-f]+)|(\d+));/gi, (_, hex: string | undefined, decimal: string | undefined) => {
      const code = Number.parseInt(hex ?? decimal ?? "0", hex ? 16 : 10);
      return code <= 0x10ffff ? String.fromCodePoint(code) : "";
    }).replace(/&(?:ndash|mdash);/gi, "-").replace(/&sol;/gi, "/").replaceAll("\\/", "/");
  for (let pass = 0; pass < 2; pass++) {
    text = text.replace(/(?:%[\da-f]{2})+/gi, (encoded) => {
      try { return decodeURIComponent(encoded); } catch { return encoded; }
    });
  }
  return text.normalize("NFKC").replace(/[‐‑‒–—−]/g, "-").toLowerCase();
}

/** The denylist comes from the private registry, never a second hand-maintained list. */
export function sourceModelTerms(models: readonly SourceModelIdentity[]): string[] {
  return [...new Set(models.flatMap((model) => [model.modelName, ...model.sourceSlugs, ...model.aliases]).map(normalized).filter(Boolean))]
    .sort((left, right) => right.length - left.length);
}

export function findSourceModelLeaks(value: string, models: readonly SourceModelIdentity[]): CatalogLeak[] {
  const text = normalized(value);
  const leaks: CatalogLeak[] = [];
  for (const term of sourceModelTerms(models)) {
    let from = 0;
    while (from < text.length) {
      const index = text.indexOf(term, from);
      if (index < 0) break;
      const before = text[index - 1];
      const after = text[index + term.length];
      if ((!before || !/[a-z0-9]/.test(before)) && (!after || !/[a-z0-9]/.test(after))) {
        leaks.push({ term, line: text.slice(0, index).split("\n").length, context: text.slice(Math.max(0, index - 45), index + term.length + 65).replace(/\s+/g, " ") });
      }
      from = index + term.length;
    }
  }
  return leaks;
}

export function publicObjectLeaks(value: unknown, models: readonly SourceModelIdentity[], path = "public"): { path: string; leak: CatalogLeak }[] {
  if (typeof value === "string") return findSourceModelLeaks(value, models).map((leak) => ({ path, leak }));
  if (Array.isArray(value)) return value.flatMap((entry, index) => publicObjectLeaks(entry, models, `${path}[${index}]`));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([key, entry]) => publicObjectLeaks(entry, models, `${path}.${key}`));
  return [];
}

/** Public runtime modules must not import the private registry or migration data. */
export function hasInternalContentImport(source: string): boolean {
  return /(?:from\s*|import\s*\(\s*|require\s*\(\s*)["'][^"']*(?:^|\/)internal\//m.test(source)
    || /import\s*["'][^"']*\/internal\//m.test(source);
}

/** Equipment directions describe a category, not an approved purchasable model. */
export function equipmentProductSchemaTypes(html: string): string[] {
  const found = new Set<string>();
  function inspect(value: unknown): void {
    if (Array.isArray(value)) { value.forEach(inspect); return; }
    if (!value || typeof value !== "object") return;
    for (const [key, entry] of Object.entries(value)) {
      if (key === "@type") for (const type of Array.isArray(entry) ? entry : [entry]) {
        if (typeof type !== "string") continue;
        const name = type.replace(/^https?:\/\/schema\.org\//, "");
        if (name === "Product" || name === "ProductGroup") found.add(name);
      }
      inspect(entry);
    }
  }
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    inspect(JSON.parse(match[1]) as unknown);
  }
  return [...found];
}
