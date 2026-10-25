import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { contentRepository } from "../src/content";
import { sourceModels } from "../src/content/internal/source-model-registry";
import { equipmentMigrationManifest } from "../src/content/internal/equipment-migration";
import { PublicEquipmentPage } from "../src/components/public-equipment-page";
import EquipmentPage, { generateStaticParams as equipmentParams } from "../src/app/equipment/[slug]/page";
import { legacyDestination, legacyPathPairs, legacySlugs } from "../src/lib/legacy-paths";

const legacyEquipmentSlugs = [
  "nitrogen-compressors", "nitrogen-boosters", "helium-compressors",
  "co2-compressors", "sf6-compressors", "process-gas-compressors",
];
const integrationEquipmentSlugs = [
  "oil-free-piston-compressor-modules", "compact-oil-free-air-systems", "oil-free-vacuum-modules",
];
const equipmentSlugs = [...legacyEquipmentSlugs, ...integrationEquipmentSlugs];

function structuredDataTypes(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(structuredDataTypes);
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  const ownTypes = Array.isArray(record["@type"]) ? record["@type"] : [record["@type"]];
  return [...ownTypes.filter((type): type is string => typeof type === "string"), ...Object.values(record).flatMap(structuredDataTypes)];
}

describe("public equipment catalogue and canonical intent preservation", () => {
  it("preserves legacy equipment URLs and adds only the three approved integration-category routes", async () => {
    const { equipment } = await contentRepository.getSnapshot();
    const params = await equipmentParams();
    expect(equipment.map((item) => item.slug)).toEqual(equipmentSlugs);
    expect(params).toEqual(equipmentSlugs.map((slug) => ({ slug })));
    expect(new Set(params.map((item) => item.slug)).size).toBe(params.length);
    for (const record of equipmentMigrationManifest) {
      expect(params).not.toContainEqual({ slug: record.currentSlug });
      await expect(EquipmentPage({ params: Promise.resolve({ slug: record.currentSlug }) })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    }
  });

  it("renders substantive equipment pages with parameters, optional configurations and contextual RFQ links", async () => {
    const content = await contentRepository.getSnapshot();
    for (const equipment of content.equipment.filter((item) => item.id !== "sf6-compressors")) {
      const html = renderToStaticMarkup(createElement(PublicEquipmentPage, { equipment, content }));
      const headings = [...html.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/g)];
      expect(headings).toHaveLength(1);
      expect(headings[0]?.[1]).toBe(equipment.title);
      for (const label of ["Что это и для каких задач", "Исполнение и необходимая комплектация", "По необходимости"]) expect(html).toContain(label);
      if (equipment.rfqGas) {
        for (const label of ["Начнём с 5 основных параметров", "Газ", "Давление на входе P₁", "Требуемое давление P₂", "Расход Q", "Режим работы"]) expect(html).toContain(label);
        expect(html.indexOf("Начнём с 5 основных параметров")).toBeLessThan(html.indexOf("Исполнение и необходимая комплектация"));
      } else {
        expect(html).toContain("Проектный подбор для встраивания");
        expect(html).toContain("Передать ТЗ проекта");
        expect(html).not.toContain("Начнём с 5 основных параметров");
      }
      for (const application of equipment.applications) expect(html).toContain(application);
      for (const configuration of equipment.configurations) expect(html).toContain(configuration);
      expect(html).not.toContain("Подтверждённые параметры исполнения");
      const rfqLinks = [...html.matchAll(/href="([^"]+)"/g)]
        .map((match) => match[1].replaceAll("&amp;", "&"))
        .filter((href) => href.startsWith("/rfq"))
        .map((href) => new URL(href, "https://example.test"));
      const contexts = rfqLinks.map((url) => Object.fromEntries(url.searchParams));
      if (equipment.rfqGas) expect(contexts).toContainEqual({ equipment: equipment.id, gas: equipment.rfqGas, source: `/equipment/${equipment.slug}/` });
      else expect(contexts).toContainEqual({ equipment: equipment.id, source: `/equipment/${equipment.slug}/`, intake: "integration" });
    }
  });

  it("preserves the SF₆ canonical as a specialist reference without a local product offer", async () => {
    const content = await contentRepository.getSnapshot();
    const equipment = content.equipment.find((item) => item.id === "sf6-compressors")!;
    const html = renderToStaticMarkup(createElement(PublicEquipmentPage, { equipment, content }));
    expect(html).toContain('data-testid="sf6-specialist-reference"');
    expect(html).toContain("https://www.sf6rus.ru/products/0000004/");
    expect(html).toContain("noopener");
    expect(html).toContain("SF6RUS");
    expect(html).not.toMatch(/href="\/rfq(?:\/|\?)/);
    expect(html).not.toContain("Предварительный вариант оборудования");
    expect(html).not.toContain("Исполнение и необходимая комплектация");
  });

  it("never exposes private model identities or product-and-offer schema in equipment HTML", async () => {
    const content = await contentRepository.getSnapshot();
    for (const equipment of content.equipment) {
      const html = renderToStaticMarkup(createElement(PublicEquipmentPage, { equipment, content }));
      for (const model of sourceModels) {
        for (const identity of [model.id, model.modelName, ...model.sourceSlugs, ...model.aliases]) {
          expect(html.toLowerCase()).not.toContain(identity.toLowerCase());
        }
      }
      const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)]
        .map((match) => JSON.parse(match[1]) as Record<string, unknown>);
      expect(jsonLd.find((item) => ["CollectionPage", "WebPage"].includes(String(item["@type"])))?.name).toBe(equipment.title);
      const types = jsonLd.flatMap(structuredDataTypes);
      for (const forbiddenType of ["Product", "ProductGroup", "ProductModel", "Offer", "AggregateOffer"]) {
        expect(types).not.toContain(forbiddenType);
      }
      expect(JSON.stringify(jsonLd)).not.toMatch(/additionalProperty|priceCurrency|availability/);
    }
  });

  it("maps only real legacy links to existing canonical content without cycles", async () => {
    const content = await contentRepository.getSnapshot();
    const canonical = new Set([
      ...content.solutions.map((item) => `/solutions/${item.slug}/`),
      ...content.articles.map((item) => `/knowledge/${item.slug}/`),
      ...content.industries.map((item) => `/industries/${item.slug}/`),
    ]);
    expect(legacyPathPairs).toHaveLength(8);
    const oldPaths = new Set(legacyPathPairs.map((item) => item.source));
    for (const pair of legacyPathPairs) {
      expect(canonical.has(pair.destination)).toBe(true);
      expect(oldPaths.has(pair.destination)).toBe(false);
      expect(canonical.has(pair.source)).toBe(false);
    }
    expect(legacyDestination("knowledge", "how-to-select")).toBe("/knowledge/what-to-specify-for-gas-compressor/");
    expect(legacySlugs("knowledge")).not.toContainEqual({ slug: "booster-vs-source" });
    expect(content.articles.some((item) => item.slug === "booster-vs-source")).toBe(true);
  });
});
