import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { contentRepository } from "../src/content";
import { ProductFamilyPage } from "../src/components/product-family-page";
import { generateStaticParams as equipmentParams } from "../src/app/equipment/[slug]/page";
import { legacyDestination, legacyPathPairs, legacySlugs } from "../src/lib/legacy-paths";

describe("original product families and canonical intent preservation", () => {
  it("keeps each original family reachable in static and server builds", async () => {
    const { productFamilies } = await contentRepository.getSnapshot();
    const params = await equipmentParams();
    expect(productFamilies).toHaveLength(5);
    for (const family of productFamilies) expect(params).toContainEqual({ slug: family.slug });
    expect(new Set(params.map((item) => item.slug)).size).toBe(params.length);
  });

  it("renders source and draft status as HTML without leaking unverified envelopes", async () => {
    const content = await contentRepository.getSnapshot();
    for (const family of content.productFamilies) {
      const html = renderToStaticMarkup(createElement(ProductFamilyPage, { family, content }));
      const table = html.slice(html.indexOf("<table"), html.indexOf("</table>") + 8);
      expect(table).toContain(family.sourceNote);
      expect(table).toContain("draft");
      expect(table).toContain("Не опубликован");
      expect(table).not.toMatch(/\b(?:MPa|Nm³\/h|kW|mbar[·.]l\/s)\b/u);
      expect(html).not.toMatch(/SF₆|SF6/u);
      const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)]
        .map((match) => JSON.parse(match[1]) as Record<string, unknown>);
      const product = jsonLd.find((item) => item["@type"] === "ProductGroup");
      expect(product?.name).toBe(family.title);
      expect(product?.offers).toBeUndefined();
      expect(product?.additionalProperty).toEqual([
        { "@type": "PropertyValue", name: "Статус технических данных", value: "draft" },
      ]);
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
