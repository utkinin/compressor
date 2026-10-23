import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { sourceModels } from "../src/content/internal/source-model-registry";
import {
  equipmentProductSchemaTypes,
  findSourceModelLeaks,
  hasInternalContentImport,
  publicObjectLeaks,
  sourceModelTerms,
} from "../src/lib/catalog-safety";
import { checkPublicCatalogOutput } from "../scripts/check-public-catalog";

const temporaryDirectories: string[] = [];

async function outputFixture(files: Record<string, string>): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), "catalog-safety-"));
  temporaryDirectories.push(directory);
  for (const [relative, content] of Object.entries(files)) {
    const file = path.join(directory, relative);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, content, "utf8");
  }
  return directory;
}

function percentEncode(value: string): string {
  return [...Buffer.from(value, "utf8")].map((byte) => `%${byte.toString(16).padStart(2, "0")}`).join("");
}

function jsonUnicodeEncode(value: string): string {
  return value.split("").map((character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`).join("");
}

function jsonLd(value: unknown): string {
  return `<script type="application/ld+json">${JSON.stringify(value)}</script>`;
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("registry-derived public model leak detection", () => {
  it("derives a deduplicated denylist from the actual private registry", () => {
    expect(sourceModels.length).toBeGreaterThan(0);
    const terms = sourceModelTerms(sourceModels);
    expect(terms.length).toBeGreaterThan(sourceModels.length);
    expect(new Set(terms).size).toBe(terms.length);
    expect(sourceModelTerms([...sourceModels, ...sourceModels])).toEqual(terms);
    for (const model of sourceModels) {
      expect(terms).toContain(model.modelName.replaceAll("–", "-").toLowerCase());
    }
  });

  it.each(sourceModels)("rejects names, aliases and old URLs for $id", (model) => {
    for (const identity of [model.modelName, ...model.aliases, ...model.sourceSlugs]) {
      expect(findSourceModelLeaks(`Visible reference: ${identity}`, sourceModels).length).toBeGreaterThan(0);
    }
    for (const slug of model.sourceSlugs) {
      expect(findSourceModelLeaks(`https://preview.example.test/equipment/${slug}/`, sourceModels).length).toBeGreaterThan(0);
    }
  });

  it.each([
    ["nonbreaking dash", (value: string) => value.replaceAll("–", "‑")],
    ["em dash", (value: string) => value.replaceAll("–", "—")],
    ["Unicode minus", (value: string) => value.replaceAll("–", "−")],
    ["JSON Unicode escapes", (value: string) => `{"name":"${jsonUnicodeEncode(value)}"}`],
    ["JSON escaped slash", (value: string) => value.replaceAll("/", "\\/")],
    ["numeric HTML entities", (value: string) => [...value].map((character) => `&#${character.codePointAt(0)};`).join("")],
    ["hexadecimal HTML entities", (value: string) => [...value].map((character) => `&#x${character.codePointAt(0)?.toString(16)};`).join("")],
    ["named HTML entities", (value: string) => value.replaceAll("–", "&ndash;").replaceAll("/", "&sol;")],
    ["percent encoding with an unrelated invalid percent", (value: string) => `Progress 40% and %ZZ; model=${percentEncode(value)}`],
    ["double percent encoding", (value: string) => percentEncode(percentEncode(value))],
  ])("rejects %s", (_label, encode) => {
    for (const model of sourceModels) {
      expect(findSourceModelLeaks(encode(model.modelName), sourceModels).length).toBeGreaterThan(0);
    }
  });

  it("reports repeated leaks with their line and readable context", () => {
    const model = sourceModels[0];
    const text = `Public heading\n${model.modelName}\nPublic paragraph\n${model.modelName}`;
    const term = sourceModelTerms([model]).find((entry) => entry.includes("/"))!;
    const leaks = findSourceModelLeaks(text, [model]).filter((leak) => leak.term === term);
    expect(leaks.map((leak) => leak.line)).toEqual([2, 4]);
    expect(leaks.every((leak) => leak.context.includes(term) && !leak.context.includes("\n"))).toBe(true);
  });

  it("finds nested object and array values and identifies their public field paths", () => {
    const model = sourceModels[0];
    const leaks = publicObjectLeaks({
      title: "Компрессоры для азота",
      metadata: { alternates: [{ canonical: `/equipment/${model.sourceSlugs[0]}/` }] },
      cards: [{ details: { caption: model.modelName } }],
      nullable: null,
      number: 42,
    }, sourceModels);
    expect([...new Set(leaks.map((entry) => entry.path))]).toEqual([
      "public.metadata.alternates[0].canonical",
      "public.cards[0].details.caption",
    ]);
  });

  it("permits ordinary public text and tokens inside longer alphanumeric identifiers", () => {
    const token = sourceModels.flatMap((model) => model.aliases).find((alias) => /^[A-Z]+\d+$/.test(alias));
    expect(token).toBeDefined();
    const safe = `Компрессоры для N₂, He, SF₆ и CO₂. /equipment/nitrogen-boosters/ pre${token}post`;
    expect(findSourceModelLeaks(safe, sourceModels)).toEqual([]);
    expect(publicObjectLeaks({ text: safe, values: [null, false, 12] }, sourceModels)).toEqual([]);
    expect(findSourceModelLeaks(sourceModels[0].modelName, [])).toEqual([]);
  });
});

describe("private import boundary", () => {
  it.each([
    'import { sourceModels } from "@/content/internal/source-model-registry";',
    'import type { SourceModelRecord } from "../content/internal/source-model-registry";',
    'export { sourceModels } from "../content/internal/source-model-registry";',
    'const registry = await import("../content/internal/source-model-registry");',
    'const registry = require("../content/internal/source-model-registry");',
    'import "../content/internal/source-model-registry";',
  ])("rejects a private runtime dependency: %s", (source) => {
    expect(hasInternalContentImport(source)).toBe(true);
  });

  it.each([
    'import { equipment } from "@/content/equipment";',
    'import { helper } from "../lib/catalog-safety";',
    'const internal = "An internal engineering review is required";',
    'import { glossary } from "../content/internal-glossary";',
  ])("allows a public dependency or plain text: %s", (source) => {
    expect(hasInternalContentImport(source)).toBe(false);
  });
});

describe("equipment structured data", () => {
  it("detects Product and ProductGroup in actual JSON-LD graphs and arrays", () => {
    const html = jsonLd({ "@graph": [
      { "@type": "CollectionPage" },
      { "@type": ["Thing", "Product"] },
      { nested: [{ "@type": "ProductGroup" }, { "@type": "Product" }] },
    ] }) + jsonLd([{ "@type": "ProductGroup" }]);
    expect(equipmentProductSchemaTypes(html)).toEqual(["Product", "ProductGroup"]);
  });

  it("recognizes JSON-LD with single quotes and other script attributes", () => {
    expect(equipmentProductSchemaTypes('<script id="schema" type=\'application/ld+json\' data-source="page">{"@type":"Product"}</script>')).toEqual(["Product"]);
  });

  it("rejects absolute schema type identifiers as well as compact types", () => {
    expect(equipmentProductSchemaTypes(jsonLd({ "@type": "https://schema.org/Product" }))).toEqual(["Product"]);
    expect(equipmentProductSchemaTypes(jsonLd({ "@type": "http://schema.org/ProductGroup" }))).toEqual(["ProductGroup"]);
  });

  it("ignores schema-like words outside JSON-LD and valid non-product schema", () => {
    const html = '<p>Product ProductGroup</p><script type="application/json">{"@type":"Product"}</script>'
      + '<script>const example = {"@type":"ProductGroup"};</script>'
      + jsonLd({ "@type": "CollectionPage", name: "Product", mainEntity: { "@type": "ItemList", description: "ProductGroup" } });
    expect(equipmentProductSchemaTypes(html)).toEqual([]);
  });

  it("fails closed when an actual JSON-LD payload is malformed", () => {
    expect(() => equipmentProductSchemaTypes('<script type="application/ld+json">{"@type":"Product"</script>')).toThrow(SyntaxError);
  });
});

describe("generated catalog output gate", () => {
  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
  });

  it("passes safe static and server output with collection schema", async () => {
    const directory = await outputFixture({
      "equipment/nitrogen-boosters/index.html": `<h1>Бустеры азота высокого давления</h1>${jsonLd({ "@type": "CollectionPage" })}`,
      "server/app/equipment/helium-compressors.html": `<h1>Компрессоры для гелия</h1>${jsonLd({ "@type": "ItemList", itemListElement: [] })}`,
      "equipment/nitrogen-boosters/index.txt": "Подобрать компрессор. Требуется инженерное подтверждение.",
    });
    await expect(checkPublicCatalogOutput(directory, false)).resolves.toBeUndefined();
  });

  it("rejects a source model injected into generated HTML", async () => {
    const directory = await outputFixture({ "equipment/nitrogen-boosters/index.html": `<h1>${sourceModels[0].modelName}</h1>` });
    await expect(checkPublicCatalogOutput(directory, false)).rejects.toThrow("Private model names in generated output");
  });

  it("rejects a former source-model route even when its page text is safe", async () => {
    const directory = await outputFixture({ [`equipment/${sourceModels[0].sourceSlugs[0]}/index.html`]: "<h1>Компрессоры для азота</h1>" });
    await expect(checkPublicCatalogOutput(directory, false)).rejects.toThrow("Private model names in generated output");
  });

  it("rejects encoded source identities in nested generated payloads", async () => {
    const directory = await outputFixture({
      "server/app/equipment/nitrogen-boosters.rsc": JSON.stringify({ data: [{ metadata: { model: percentEncode(sourceModels[0].modelName) } }] }),
    });
    await expect(checkPublicCatalogOutput(directory, false)).rejects.toThrow("Private model names in generated output");
  });

  it.each(["visible heading", "JSON-LD name"])("rejects a derived short source suffix in a %s", async (placement) => {
    const suffix = sourceModels[0].modelName.split("/").slice(1).join("/");
    expect(suffix.length).toBeGreaterThan(0);
    const html = placement === "visible heading"
      ? `<h1>Компрессор ${suffix}</h1>`
      : jsonLd({ "@type": "CollectionPage", name: `Компрессор ${suffix}` });
    const directory = await outputFixture({ "equipment/nitrogen-boosters/index.html": html });
    await expect(checkPublicCatalogOutput(directory, false)).rejects.toThrow("Private model names in generated output");
  });

  it("permits an unrelated minified JavaScript variable matching a short source suffix", async () => {
    const suffix = sourceModels[0].modelName.split("/").slice(1).join("/").toLowerCase();
    expect(suffix).toMatch(/^[a-z]+$/);
    const directory = await outputFixture({
      "equipment/nitrogen-boosters/index.html": "<h1>Бустеры азота высокого давления</h1>",
      "assets/runtime.js": `const ${suffix}=1;export{${suffix}};`,
    });
    await expect(checkPublicCatalogOutput(directory, false)).resolves.toBeUndefined();
  });

  it.each([
    ["equipment/nitrogen-boosters/index.html", "Product"],
    ["server/app/equipment/nitrogen-boosters.html", "ProductGroup"],
    ["server/app/equipment.html", "Product"],
  ])("rejects %s containing %s JSON-LD", async (relative, type) => {
    const directory = await outputFixture({ [relative]: jsonLd({ "@graph": [{ "@type": type }] }) });
    await expect(checkPublicCatalogOutput(directory, false)).rejects.toThrow("Equipment direction published as a model");
  });

  it("does not treat unrelated Product text or non-equipment JSON-LD as an equipment model", async () => {
    const directory = await outputFixture({
      "equipment/process-gas-compressors/index.html": '<h1>Компрессоры для технологических газов</h1><script type="application/json">{"@type":"Product"}</script>',
      "knowledge/schema-example/index.html": jsonLd({ "@type": "Product" }),
    });
    await expect(checkPublicCatalogOutput(directory, false)).resolves.toBeUndefined();
  });

  it("rejects an output directory with no inspectable artifacts", async () => {
    const directory = await outputFixture({});
    await expect(checkPublicCatalogOutput(directory, false)).rejects.toThrow("Catalog output contains no inspectable files");
  });
});
