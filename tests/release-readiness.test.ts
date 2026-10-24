import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";
import { safeAnalyticsProps } from "@/lib/analytics";
import { solutionHeroOverrides } from "@/lib/solution-hero";

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("production release contracts", () => {
  it("uses the registered compressor domain as the production origin", () => {
    expect(siteConfig.productionOrigin).toBe("https://lanfor-gas.ru");
  });

  it("keeps explicit customer pain routes instead of deriving them from slugs", () => {
    const home = source("src/components/home-hero-v3.tsx");
    for (const path of [
      "/solutions/nitrogen-booster-after-generator/",
      "/solutions/nitrogen-for-laser-cutting/",
      "/solutions/helium-recovery/",
      "/solutions/process-gas-compressor/",
      "/solutions/equipment-integration/",
    ]) expect(home).toContain(path);
    expect(home).not.toContain("/solutions/oem-module");
    expect(home).not.toContain("/solutions/co2-gases");
  });

  it("locks problem-led H1s for the five priority solutions", () => {
    expect(solutionHeroOverrides["nitrogen-booster-after-generator"].title).toBe("Не хватает давления после генератора азота?");
    expect(solutionHeroOverrides["nitrogen-for-laser-cutting"].title).toBe("Нужен газ для лазерного станка?");
    expect(solutionHeroOverrides["helium-recovery"].title).toBe("Нужно вернуть гелий в процесс?");
    expect(solutionHeroOverrides["process-gas-compressor"].title).toBe("Нужно сжать CO₂ или другой технологический газ?");
    expect(solutionHeroOverrides["equipment-integration"].title).toBe("Нужно встроить компрессор в оборудование?");
  });

  it("allows only controlled Hero v3 analytics properties", () => {
    expect(safeAnalyticsProps({
      pain: "nitrogen",
      position: 1,
      source_page: "/?secret=value",
      destination: "/solutions/nitrogen-booster-after-generator/?x=1",
      email: "person@example.test",
    })).toEqual({
      pain: "nitrogen",
      position: 1,
      source_page: "/",
      destination: "/solutions/nitrogen-booster-after-generator/",
    });
  });

  it("physically disables both RFQ submit paths until consent is checked", () => {
    const brief = source("src/components/rfq-brief-form.tsx");
    const detailed = source("src/components/rfq-form.tsx");
    expect(brief).toContain('disabled={sending || mode === "disabled" || !consent}');
    expect(brief).toContain('if (sending || mode === "disabled" || !consent) return;');
    expect(detailed).toContain('disabled={sending || mode === "disabled" || !consent}');
    expect(detailed).toContain('if (sending || mode === "disabled" || !consent || !validate()) return;');
  });
});
