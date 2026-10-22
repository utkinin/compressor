import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  articles, cases, contentRepository, documents, equipment, gases, industries,
  productFamilies, productGasSpecs, publicDocuments, publicProperties, relatedByIds, solutions,
  type Entity, type TechnicalProperty,
} from "../src/content";
import { productFamilies as originalUnigySeed } from "../src/content/internal/unigy-seed";
import { ORIGINAL_UNIGY_SEED_PROVENANCE } from "../src/content/internal/provenance";

describe("content evidence and editorial safety", () => {
  it("keeps generated staging material in review rather than automatically published", () => {
    const all: Entity[] = [...gases, ...solutions, ...equipment, ...productFamilies, ...articles, ...industries, ...cases, ...documents];
    expect(all.length).toBeGreaterThan(60);
    expect(all.every((entity) => entity.editorialState === "review")).toBe(true);
    expect(all.every((entity) => entity.title.length > 0 && entity.summary.length > 50)).toBe(true);
  });

  it("never emits draft values as verified public specifications", () => {
    const properties: TechnicalProperty[] = [
      {label:"Draft pressure",value:"999 bar",status:"draft"},
      {label:"No provenance",value:"300 bar",status:"source-transcribed"},
      {label:"Manufacturer value",value:"100 bar",status:"source-transcribed",source:{title:"Fixture catalogue",page:"12",status:"source-transcribed"}},
      {label:"Calculated value",value:"10 Nm³/h",status:"engineering-verified",source:{title:"Approved calculation fixture",status:"engineering-verified"}},
    ];
    const visible = publicProperties(properties);
    expect(visible).toEqual([]);
  });

  it("requires an addressable evidence record and locator regardless of verification label", () => {
    // Synthetic validation fixtures, never production content or verification records.
    const fixture: TechnicalProperty = { label: "Fixture only", value: "10 bar", status: "engineering-verified", source: { title: "Synthetic evidence fixture", url: "https://evidence.example.test/calculation.pdf", page: "section 2", status: "engineering-verified" } };
    expect(publicProperties([fixture])).toEqual([fixture]);
    for (const source of [
      { ...fixture.source!, page: "" },
      { ...fixture.source!, url: "not a document URL" },
      { ...fixture.source!, url: "http://evidence.example.test/calculation.pdf" },
      { ...fixture.source!, url: "https://user:pass@evidence.example.test/calculation.pdf" },
      { ...fixture.source!, status: "draft" as const },
    ]) expect(publicProperties([{ ...fixture, source }])).toEqual([]);
  });

  it("does not fabricate manufacturer limits or N2-B verified SKU", () => {
    expect(equipment.every((family) => family.source.status === "draft")).toBe(true);
    expect(equipment.every((family) => publicProperties(family.properties).length === 0)).toBe(true);
    const concept = equipment.flatMap((family) => family.properties).find((property) => property.label.includes("N2-B"));
    expect(concept?.status).toBe("draft");
    expect(equipment.some((family) => family.source.title.includes("не предоставлен"))).toBe(true);
  });

  it("preserves the supplied original UNIGY seed verbatim apart from its local type import", () => {
    const source = readFileSync(new URL("../src/content/internal/unigy-seed.ts", import.meta.url), "utf8");
    const original = source.replace('"./unigy-seed-types"', '"@/lib/types"');
    expect(createHash("sha256").update(original).digest("hex")).toBe(ORIGINAL_UNIGY_SEED_PROVENANCE.sourceFileSha256);
    expect(originalUnigySeed).toHaveLength(5);
    expect(originalUnigySeed.every((family) => family.verificationStatus === "draft")).toBe(true);
    expect(originalUnigySeed.every((family) => family.gases.includes("SF6"))).toBe(true);
    expect(originalUnigySeed.map((family) => [family.slug, family.flowNm3hMin, family.flowNm3hMax])).toEqual([
      ["of2-of8-dp",1,8], ["of2-of8-dz",1,10], ["of8-of30-dp",8,30], ["of30-of500-dp",120,500], ["of60-of200-dp",30,120],
    ]);
  });

  it("publishes a cautious family identity projection without leaking unverified source envelopes or legacy gas", () => {
    expect(productFamilies.map((family) => family.slug)).toEqual(originalUnigySeed.map((family) => family.slug));
    expect(productFamilies.every((family) => family.source.status === "draft" && family.verificationStatus === "draft")).toBe(true);
    expect(productFamilies.every((family) => family.sourceNote.includes("первичный документ не предоставлен"))).toBe(true);
    expect(JSON.stringify(productFamilies)).not.toMatch(/UNIGY|OEM/i);
    expect(productFamilies.every((family) => !family.source.url && !family.source.page)).toBe(true);
    expect(productFamilies.every((family) => family.technicalRows.every((row) => row.status === "draft"))).toBe(true);
    expect(JSON.stringify(productFamilies)).not.toMatch(/SF[₆6]|элегаз|inletPressureMpaMax|dischargePressureMpaMax|tightnessMbarLs|0\.01/);
    expect(productGasSpecs).toHaveLength(0);
    expect(ORIGINAL_UNIGY_SEED_PROVENANCE.manufacturerPdfProvided).toBe(false);
    expect(ORIGINAL_UNIGY_SEED_PROVENANCE.sourcePagesProvided).toBe(false);
  });

  it("has exactly the intended public gases and no legacy public direction", () => {
    expect(gases.map((gas) => gas.id)).toEqual(["n2","he","h2","o2","co2","mixtures"]);
    expect(JSON.stringify(gases)).not.toMatch(/SF[₆6]|элегаз/i);
  });

  it("distinguishes typical scenarios from implemented customer projects", () => {
    expect(cases.length).toBeGreaterThanOrEqual(3);
    expect(cases.every((scenario) => scenario.kind === "typical-engineering-scenario")).toBe(true);
    expect(cases.every((scenario) => /Типовая инженерная задача/.test(scenario.summary))).toBe(true);
  });
});

describe("content graph and repository", () => {
  it("has unique stable identifiers and slugs in every collection", async () => {
    const snapshot = await contentRepository.getSnapshot();
    for (const collection of Object.values(snapshot)) {
      expect(new Set(collection.map((entity) => entity.id)).size).toBe(collection.length);
      expect(new Set(collection.map((entity) => entity.slug)).size).toBe(collection.length);
      expect(collection.every((entity) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entity.slug))).toBe(true);
    }
  });

  it("resolves all declared semantic relationships", () => {
    const identifiers = {
      gases:new Set(gases.map((entity) => entity.id)),
      solutions:new Set(solutions.map((entity) => entity.id)),
      equipment:new Set(equipment.map((entity) => entity.id)),
      articles:new Set(articles.map((entity) => entity.id)),
    };
    for (const gas of gases) {
      expect(gas.solutionIds.every((id) => identifiers.solutions.has(id))).toBe(true);
      expect(gas.equipmentIds.every((id) => identifiers.equipment.has(id))).toBe(true);
    }
    for (const solution of solutions) {
      expect(solution.gasIds.every((id) => identifiers.gases.has(id))).toBe(true);
      expect(solution.equipmentIds.every((id) => identifiers.equipment.has(id))).toBe(true);
      expect(solution.articleIds.every((id) => identifiers.articles.has(id))).toBe(true);
    }
    for (const entity of [...articles,...industries,...cases]) {
      expect(entity.gasIds.every((id) => identifiers.gases.has(id))).toBe(true);
      expect(entity.solutionIds.every((id) => identifiers.solutions.has(id))).toBe(true);
    }
    for (const document of documents) {
      expect(document.gasIds.every((id) => identifiers.gases.has(id))).toBe(true);
      expect(document.equipmentIds.every((id) => identifiers.equipment.has(id))).toBe(true);
    }
  });

  it("supports list and lookup without coupling consumers to storage", () => {
    expect(contentRepository.list("gases")).toHaveLength(6);
    expect(contentRepository.findBySlug("gases","nitrogen")?.id).toBe("n2");
    expect(contentRepository.findById("solutions","helium-recovery")?.gasIds).toEqual(["he"]);
    expect(contentRepository.findBySlug("gases","missing")).toBeUndefined();
    expect(relatedByIds(gases,["n2","he"]).map((gas) => gas.id)).toEqual(["n2","he"]);
  });

  it("has substantive intent pages and a useful engineering article set", () => {
    expect(solutions).toHaveLength(14);
    expect(articles).toHaveLength(16);
    expect(solutions.every((solution) => solution.approach.length >= 4 && solution.inputs.length >= 4)).toBe(true);
    expect(articles.every((article) => article.sections.length >= 3 && article.sections.every((section) => section.body.length > 180))).toBe(true);
    expect(gases.every((gas) => gas.faq.length >= 2 && gas.limitations.length >= 2)).toBe(true);
  });

  it("retains the original source-capacity intent as a complete canonical article", () => {
    const article = contentRepository.findBySlug("articles","booster-vs-source");
    expect(article?.sections).toHaveLength(4);
    expect(article?.sections.some((section) => section.title === "Постоянный дефицит расхода")).toBe(true);
    expect(article?.solutionIds).toContain("nitrogen-booster-after-generator");
  });

  it("only links downloads to real public documents and excludes internal material", () => {
    const publicFiles = documents.filter((document) => document.access === "public");
    expect(publicFiles).toHaveLength(1);
    expect(publicFiles[0]?.href).toBe("/documents/process-gas-questionnaire.txt");
    expect(documents.filter((document) => document.access === "request").every((document) => !document.href)).toBe(true);
    expect(publicDocuments().some((document) => document.access === "internal")).toBe(false);
  });
});
