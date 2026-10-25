import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GasBadge, gasBadgeDefinition, gasCtaLabel } from "../src/components/gas-badge";
import { gases } from "../src/content/gases";
import { GAS_FIELDS } from "../src/lib/rfq/schema";

describe("Issue #13 public gas language", () => {
  it("does not expose MIX as the public mixture symbol", () => {
    const mixture = gases.find((gas) => gas.id === "mixtures");
    expect(mixture?.symbol).toBe("Газ / смесь");
    expect(JSON.stringify(gases)).not.toMatch(/\bMIX\b/);
    expect(gasCtaLabel("mixtures")).toBe("газа или смеси");
  });

  it("uses human Russian for the helium source field", () => {
    expect(GAS_FIELDS.he[0]).toEqual({
      key: "mode",
      label: "Источник гелия",
      help: "Свежий гелий, возвратный газ из процесса или смешанный поток.",
    });
    const publicFieldText = Object.values(GAS_FIELDS)
      .flat()
      .flatMap((field) => [field.label, field.help ?? ""])
      .join(" ");
    expect(publicFieldText).not.toMatch(/\brecovery\b/i);
  });
});

describe("GasBadge", () => {
  it("keeps the visible formula and adds an accessible label", () => {
    const markup = renderToStaticMarkup(createElement(GasBadge, { gas: "n2" }));
    expect(markup).toContain("N₂");
    expect(markup).toContain('aria-label="Азот — N₂"');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain('data-gas-badge="n2"');
  });

  it("uses a human label for mixtures", () => {
    expect(gasBadgeDefinition("mixtures").formula).toBe("Газ / смесь");
  });
});

describe("task-specific Knowledge visual", () => {
  it("wraps the long visible heading inside the SVG safe area", () => {
    const svg = readFileSync("public/images/visuals/knowledge/knowledge-detail-why-process-gas-compressors-need-task-specific-selection.svg", "utf8");
    expect(svg).not.toContain(">От условий процесса к оборудованию</text>");
    expect(svg).toContain('<tspan x="450" y="55">От условий процесса</tspan>');
    expect(svg).toContain('<tspan x="450" dy="30">к оборудованию</tspan>');
  });
});
