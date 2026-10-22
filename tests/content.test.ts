import { describe, expect, it } from "vitest";
import {
  articles, cases, contentRepository, documents, equipment, gases, industries,
  publicDocuments, publicProperties, relatedByIds, solutions,
  type Entity, type TechnicalProperty,
} from "../src/content";

describe("content evidence and editorial safety", () => {
  it("keeps generated staging material in review rather than automatically published", () => {
    const all: Entity[] = [...gases, ...solutions, ...equipment, ...articles, ...industries, ...cases, ...documents];
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
    expect(visible.map((property) => property.label)).toEqual(["Manufacturer value","Calculated value"]);
    expect(visible[0]?.source?.title).toBe("Fixture catalogue");
    expect(visible[0]?.source?.page).toBe("12");
  });

  it("does not fabricate manufacturer limits or N2-B verified SKU", () => {
    expect(equipment.every((family) => family.source.status === "draft")).toBe(true);
    expect(equipment.every((family) => publicProperties(family.properties).length === 0)).toBe(true);
    const concept = equipment.flatMap((family) => family.properties).find((property) => property.label.includes("N2-B"));
    expect(concept?.status).toBe("draft");
    expect(equipment.some((family) => family.source.title.includes("не предоставлен"))).toBe(true);
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
    expect(articles).toHaveLength(15);
    expect(solutions.every((solution) => solution.approach.length >= 4 && solution.inputs.length >= 4)).toBe(true);
    expect(articles.every((article) => article.sections.length >= 3 && article.sections.every((section) => section.body.length > 180))).toBe(true);
    expect(gases.every((gas) => gas.faq.length >= 2 && gas.limitations.length >= 2)).toBe(true);
  });

  it("only links downloads to real public documents and excludes internal material", () => {
    const publicFiles = documents.filter((document) => document.access === "public");
    expect(publicFiles).toHaveLength(1);
    expect(publicFiles[0]?.href).toBe("/documents/process-gas-questionnaire.txt");
    expect(documents.filter((document) => document.access === "request").every((document) => !document.href)).toBe(true);
    expect(publicDocuments().some((document) => document.access === "internal")).toBe(false);
  });
});
