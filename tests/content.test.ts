import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  articles, cases, contentRepository, documents, equipment, gases, industries,
  publicDocuments, publicProperties, relatedByIds, solutions,
  type Entity, type TechnicalProperty,
} from "../src/content";
import { productFamilies as manufacturerSeed } from "../src/content/internal/manufacturer-seed";
import { MANUFACTURER_SEED_PROVENANCE } from "../src/content/internal/provenance";
import { equipmentCapabilityLinks, sourceModels } from "../src/content/internal/source-model-registry";
import { equipmentMigrationManifest } from "../src/content/internal/equipment-migration";

describe("content evidence and editorial safety", () => {
  it("keeps generated staging material in review rather than automatically published", () => {
    const all: Entity[] = [...gases, ...solutions, ...equipment, ...articles, ...industries, ...cases, ...documents];
    expect(all.length).toBeGreaterThanOrEqual(60);
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

  it("publishes six equipment directions without unsupported performance claims", () => {
    expect(equipment.map((item) => [item.id, item.title])).toEqual([
      ["nitrogen-compressors", "Компрессоры для азота"],
      ["nitrogen-boosters", "Бустеры азота высокого давления"],
      ["helium-compressors", "Компрессоры для гелия"],
      ["co2-compressors", "Компрессоры для CO₂"],
      ["sf6-compressors", "Компрессоры для SF₆"],
      ["process-gas-compressors", "Компрессоры для технологических газов"],
    ]);
    expect(equipment.every((item) => item.kind === "equipment-direction" && item.id === item.slug)).toBe(true);
    expect(equipment.every((item) => item.source.status === "draft")).toBe(true);
    expect(equipment.every((item) => item.properties.length === 0 && item.verifiedCapabilities.length === 0)).toBe(true);
    expect(equipment.every((item) => publicProperties(item.verifiedCapabilities).length === 0)).toBe(true);
    const sulfurDirection = equipment.find((item) => item.id === "sf6-compressors");
    expect(sulfurDirection?.gas).toBe("sf6");
    expect(sulfurDirection?.rfqGas).toBe("mixtures");
    expect(sulfurDirection?.gasIds).toEqual([]);
  });

  it("keeps the sanitized manufacturer seed traceable without approving its draft values", () => {
    const source = readFileSync(new URL("../src/content/internal/manufacturer-seed.ts", import.meta.url), "utf8");
    expect(createHash("sha256").update(source).digest("hex")).toBe(MANUFACTURER_SEED_PROVENANCE.sourceFileSha256);
    expect(manufacturerSeed).toHaveLength(5);
    expect(manufacturerSeed.every((family) => family.verificationStatus === "draft")).toBe(true);
    expect(manufacturerSeed.every((family) => family.gases.includes("SF6"))).toBe(true);
    expect(manufacturerSeed.map((family) => [family.flowNm3hMin, family.flowNm3hMax])).toEqual([
      [1,8], [1,10], [8,30], [120,500], [30,120],
    ]);
  });

  it("keeps source identities and complete draft envelopes private", async () => {
    const snapshot = await contentRepository.getSnapshot();
    expect(Object.keys(snapshot).sort()).toEqual(["articles", "cases", "documents", "equipment", "gases", "industries", "news", "solutions"]);
    expect(sourceModels).toHaveLength(manufacturerSeed.length);
    for (const seed of manufacturerSeed) {
      const model = sourceModels.find((item) => item.sourceSlugs.includes(seed.slug));
      expect(model).toBeDefined();
      expect(model?.modelName).toBe(seed.name);
      expect(model?.verificationStatus).toBe("draft");
      expect(model?.source.status).toBe("draft");
      expect(model?.source.primaryDocumentProvided).toBe(false);
      expect(model?.capabilities).toEqual({
        candidateGasCodes: seed.gases,
        inletPressureMpaMax: seed.inletPressureMpaMax,
        dischargePressureMpaMax: seed.dischargePressureMpaMax,
        flowNm3hMin: seed.flowNm3hMin,
        flowNm3hMax: seed.flowNm3hMax,
        motorKwMin: seed.motorKwMin,
        motorKwMax: seed.motorKwMax,
        tightnessMbarLs: seed.tightnessMbarLs,
        cooling: seed.cooling,
        transmission: seed.transmission,
      });
    }
    const publicText = JSON.stringify(snapshot).toLowerCase();
    for (const model of sourceModels) {
      for (const identity of [model.id, model.modelName, ...model.sourceSlugs, ...model.aliases]) {
        expect(publicText).not.toContain(identity.toLowerCase());
      }
    }
    expect(MANUFACTURER_SEED_PROVENANCE.manufacturerPdfProvided).toBe(false);
    expect(MANUFACTURER_SEED_PROVENANCE.sourcePagesProvided).toBe(false);
  });

  it("uses many-to-many research links without asserting verified model selection", () => {
    const publicIds = new Set(equipment.map((item) => item.id));
    const sourceIds = new Set(sourceModels.map((item) => item.id));
    expect(equipmentCapabilityLinks).toHaveLength(5);
    expect(equipmentCapabilityLinks.every((link) => link.status === "draft" && link.selectionStatus === "requires-engineering-review")).toBe(true);
    expect(equipmentCapabilityLinks.flatMap((link) => link.publicEquipmentIds).sort()).toEqual([...publicIds].sort());
    for (const link of equipmentCapabilityLinks) {
      expect(link.publicEquipmentIds.every((id) => publicIds.has(id))).toBe(true);
      expect(link.sourceModelIds.every((id) => sourceIds.has(id))).toBe(true);
      expect(link.rationale.length).toBeGreaterThan(50);
    }
    const nitrogenLink = equipmentCapabilityLinks.find((link) => link.publicEquipmentIds.includes("nitrogen-boosters"));
    expect(nitrogenLink?.publicEquipmentIds).toContain("nitrogen-compressors");
    expect(nitrogenLink?.sourceModelIds.length).toBeGreaterThan(1);
    expect(equipmentCapabilityLinks.find((link) => link.publicEquipmentIds.includes("sf6-compressors"))?.sourceModelIds).toEqual([]);
    expect(equipmentCapabilityLinks.find((link) => link.publicEquipmentIds.includes("process-gas-compressors"))?.sourceModelIds).toEqual([]);
  });

  it("accounts for all ten removed public entries without inventing replacement models", () => {
    const publicPaths = new Set(equipment.map((item) => `/equipment/${item.slug}/`));
    expect(equipmentMigrationManifest).toHaveLength(10);
    expect(new Set(equipmentMigrationManifest.map((record) => record.currentSlug)).size).toBe(10);
    expect(equipmentMigrationManifest.every((record) => record.previousRoute === "404" && !record.publicLanforModel && !record.verified)).toBe(true);
    const merged = equipmentMigrationManifest.filter((record) => record.action === "MERGE");
    const internal = equipmentMigrationManifest.filter((record) => record.action === "CONVERT TO INTERNAL");
    expect(merged).toHaveLength(5);
    expect(internal).toHaveLength(5);
    for (const record of merged) {
      expect(record.currentSourceModel).toBeNull();
      expect(record.newPublicPaths.length).toBeGreaterThan(0);
      expect(record.newPublicPaths.every((path) => publicPaths.has(path))).toBe(true);
      expect(record.newPublicNames.length).toBe(record.newPublicPaths.length);
    }
    expect(internal.map((record) => record.currentSourceModel).sort()).toEqual(sourceModels.map((model) => model.id).sort());
    expect(internal.every((record) => record.newPublicNames.length === 0 && record.newPublicPaths.length === 0)).toBe(true);
  });

  it("keeps the gas-pillar taxonomy separate from the SF₆ equipment direction", () => {
    expect(gases.map((gas) => gas.id)).toEqual(["n2","he","h2","o2","co2","mixtures"]);
    expect(JSON.stringify(gases)).not.toMatch(/SF[₆6]|элегаз/i);
  });

  it("distinguishes typical scenarios from implemented customer projects", () => {
    expect(cases.length).toBeGreaterThanOrEqual(3);
    expect(cases.every((scenario) => scenario.kind === "typical-engineering-scenario")).toBe(true);
    expect(cases.every((scenario) => /Пример расчётной задачи/.test(scenario.summary))).toBe(true);
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
    for (const item of equipment) {
      expect(item.gasIds.every((id) => identifiers.gases.has(id))).toBe(true);
      expect(identifiers.gases.has(item.rfqGas)).toBe(true);
      expect(item.solutionIds.every((id) => identifiers.solutions.has(id))).toBe(true);
      expect(item.articleIds.every((id) => identifiers.articles.has(id))).toBe(true);
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
    expect(equipment).toHaveLength(6);
    expect(equipment.every((item) => item.applications.length >= 3 && item.inputs.length >= 5 && item.approach.length >= 3)).toBe(true);
    expect(equipment.every((item) => item.configurations.length >= 3 && item.options.length >= 3)).toBe(true);
    expect(solutions).toHaveLength(14);
    expect(solutions.find((item) => item.id === "nitrogen-for-laser-cutting")?.title).toBe("Система подачи азота для лазерной резки");
    expect(equipment.some((item) => item.title === "Система подачи азота для лазерной резки")).toBe(false);
    expect(articles).toHaveLength(19);
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
    expect(documents).toHaveLength(1);
    expect(documents.every(document => document.type === "Questionnaire")).toBe(true);
  });
});
