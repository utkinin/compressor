import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { articles, cases, equipment, gases, solutions } from "../src/content";
import { getProcessSpec, getVisualAsset, processSpecs, visualAssets } from "../src/content/visuals";

const project = path.resolve(import.meta.dirname, "..");
const publicRoot = path.join(project, "public");

function filesIn(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(file) : [file];
  });
}

/** Read the published format's own dimensions rather than trusting registry metadata. */
function imageDimensions(src: string): { width: number; height: number } {
  const bytes = readFileSync(path.join(publicRoot, src));
  if (src.endsWith(".svg")) {
    const root = bytes.toString("utf8").match(/<svg\b[^>]*>/)?.[0] ?? "";
    const width = root.match(/\bwidth=["']([\d.]+)(?:px)?["']/);
    const height = root.match(/\bheight=["']([\d.]+)(?:px)?["']/);
    if (width && height) return { width: Number(width[1]), height: Number(height[1]) };
    const viewBox = root.match(/\bviewBox=["']\s*[-\d.]+[ ,]+[-\d.]+[ ,]+([\d.]+)[ ,]+([\d.]+)\s*["']/);
    if (!viewBox) throw new Error(`Missing SVG dimensions: ${src}`);
    return { width: Number(viewBox[1]), height: Number(viewBox[2]) };
  }
  if (src.endsWith(".webp")) {
    expect(bytes.subarray(0, 4).toString()).toBe("RIFF");
    expect(bytes.subarray(8, 12).toString()).toBe("WEBP");
    for (let offset = 12; offset + 8 <= bytes.length;) {
      const chunk = bytes.subarray(offset, offset + 4).toString();
      const size = bytes.readUInt32LE(offset + 4);
      const payload = offset + 8;
      if (chunk === "VP8X") return { width: bytes.readUIntLE(payload + 4, 3) + 1, height: bytes.readUIntLE(payload + 7, 3) + 1 };
      if (chunk === "VP8L") {
        const dimensions = bytes.readUInt32LE(payload + 1);
        return { width: (dimensions & 0x3fff) + 1, height: ((dimensions >>> 14) & 0x3fff) + 1 };
      }
      if (chunk === "VP8 ") return { width: bytes.readUInt16LE(payload + 6) & 0x3fff, height: bytes.readUInt16LE(payload + 8) & 0x3fff };
      offset = payload + size + (size % 2);
    }
  }
  throw new Error(`Unsupported test image format: ${src}`);
}

const requiredIds = [
  "home-compressor-system", "equipment-range", "equipment-nitrogen-compressor", "equipment-nitrogen-booster",
  "equipment-helium-compressor", "equipment-co2-compressor", "equipment-sf6-compressor", "equipment-process-gas",
  "solution-nitrogen-after-generator", "solution-laser", "solution-helium-recovery", "solution-co2", "solution-integration",
  "supply-compressor-to-system", "knowledge-five-parameters", "knowledge-booster-source", "knowledge-multistage",
  "knowledge-system-components", "knowledge-sf6-life", "knowledge-air-vs-nitrogen",
];

describe("public visual asset integrity and migration boundaries", () => {
  it("resolves the complete requested manifest with unique stable IDs", () => {
    expect(new Set(visualAssets.map((asset) => asset.id)).size).toBe(visualAssets.length);
    expect(new Set(processSpecs.map((process) => process.id)).size).toBe(processSpecs.length);
    for (const id of requiredIds) expect(getVisualAsset(id), id).toBeDefined();
    expect(getVisualAsset("missing-visual-fixture")).toBeUndefined();
    expect(getProcessSpec("missing-process-fixture")).toBeUndefined();
  });

  it("ships real local assets with meaningful alternatives and declared dimensions", () => {
    for (const asset of visualAssets.filter((entry) => entry.approvedForPublic)) {
      expect(asset.src, asset.id).toMatch(/^\/images\/visuals\/(?:home|equipment|solutions|knowledge)\/[^?#]+\.(?:webp|svg)$/);
      expect(asset.src.split("/"), asset.id).not.toContain("..");
      expect(asset.alt.trim().length, asset.id).toBeGreaterThan(12);
      expect(asset.alt, asset.id).not.toMatch(/^(?:visual|technical diagram|image)(?:\s*\d+)?$/i);
      expect(asset.width, asset.id).toBeGreaterThan(0);
      expect(asset.height, asset.id).toBeGreaterThan(0);
      expect(imageDimensions(asset.src), asset.id).toEqual({ width: asset.width, height: asset.height });
      const ratio = asset.aspectRatio.split("/").map(Number);
      expect(ratio, `${asset.id}: CSS aspect ratio`).toHaveLength(2);
      expect(ratio[0] / ratio[1], asset.id).toBeCloseTo(asset.width / asset.height, 2);
      for (const variant of [asset.cardSrc, asset.mobileSrc].filter((src): src is string => Boolean(src))) {
        expect(variant, asset.id).toMatch(/^\/images\/visuals\//);
        expect(existsSync(path.join(publicRoot, variant)), `${asset.id}: ${variant}`).toBe(true);
        const dimensions = imageDimensions(variant);
        expect(dimensions.width / dimensions.height, `${asset.id}: responsive source aspect ratio`).toBeCloseTo(asset.width / asset.height, 2);
      }
      for (const candidate of asset.responsiveSources ?? []) {
        expect(candidate.src, asset.id).toMatch(/^\/images\/visuals\//);
        const dimensions = imageDimensions(candidate.src);
        expect(dimensions.width, asset.id).toBe(candidate.width);
        expect(dimensions.width / dimensions.height, asset.id).toBeCloseTo(asset.width / asset.height, 2);
      }
      if (asset.src.endsWith(".svg")) {
        const svg = readFileSync(path.join(publicRoot, asset.src), "utf8");
        expect(svg, asset.id).not.toMatch(/<script\b|\bon\w+\s*=|<foreignObject\b|(?:href|src)=["']https?:/i);
      }
    }
  });

  it("provides card and mobile raster variants instead of sending source images to every slot", () => {
    for (const asset of visualAssets.filter((entry) => entry.approvedForPublic && entry.src.endsWith(".webp"))) {
      expect(asset.width, asset.id).toBeGreaterThanOrEqual(1600);
      expect(asset.width, asset.id).toBeLessThanOrEqual(2000);
      expect(asset.cardSrc, asset.id).toBeDefined();
      expect(asset.mobileSrc, asset.id).toBeDefined();
      const card = imageDimensions(asset.cardSrc!);
      const mobile = imageDimensions(asset.mobileSrc!);
      expect(card.width, asset.id).toBeGreaterThanOrEqual(600);
      expect(card.width, asset.id).toBeLessThanOrEqual(900);
      expect(mobile.width, asset.id).toBeLessThan(asset.width);
      expect(readFileSync(path.join(publicRoot, asset.cardSrc!)).length, `${asset.id}: card bytes`).toBeLessThan(readFileSync(path.join(publicRoot, asset.src)).length);
    }
  });

  it("keeps every published content image and process reference addressable", () => {
    for (const item of [...equipment, ...solutions, ...gases, ...cases]) {
      const visual = getVisualAsset(item.heroVisualId);
      expect(visual, item.id).toBeDefined();
      expect(visual?.approvedForPublic, item.id).toBe(true);
      expect(getProcessSpec(item.processVisualId), item.id).toBeDefined();
    }
    for (const article of articles) {
      expect(getVisualAsset(article.heroVisualId)?.approvedForPublic, article.id).toBe(true);
      for (const id of article.figureIds ?? []) expect(getVisualAsset(id)?.approvedForPublic, `${article.id}: ${id}`).toBe(true);
    }
  });

  it("uses distinct subject images for equipment categories and the five main applications", () => {
    const equipmentSources = equipment.map((item) => getVisualAsset(item.heroVisualId)?.src);
    expect(new Set(equipmentSources).size).toBe(equipment.length);
    const applications = ["nitrogen-booster-after-generator", "nitrogen-for-laser-cutting", "helium-recovery", "co2-compression", "equipment-integration"];
    const sources = applications.map((id) => getVisualAsset(solutions.find((solution) => solution.id === id)!.heroVisualId)?.src);
    expect(new Set(sources).size).toBe(applications.length);
    const articleSources = articles.map((article) => getVisualAsset(article.heroVisualId)?.src);
    expect(new Set(articleSources).size).toBe(articles.length);
  });

  it("keeps nitrogen and laser process choices explicit without promising mandatory buffers", () => {
    const nitrogen = getProcessSpec("process-nitrogen-after-generator")!;
    expect(nitrogen.steps).toHaveLength(4);
    expect(nitrogen.steps?.[1].optional).toBe(true);
    const laser = getProcessSpec("process-laser")!;
    expect(laser.layout).toBe("comparison");
    expect(laser.branches).toHaveLength(2);
    expect(laser.branches?.[0].steps).toHaveLength(5);
    expect(laser.branches?.[1].steps).toHaveLength(4);
    expect(laser.branches?.[1].steps[2].optional).toBe(true);
    expect(JSON.stringify(laser)).not.toMatch(/\bbest\b|\brecommended\b|\bwinner\b|\d+\s*[→-]\s*\d+\s*бар/i);
    expect(getProcessSpec("process-helium-recovery")?.layout).toBe("loop");
    expect(getProcessSpec("process-integration")?.callouts).toHaveLength(4);
  });

  it("removes the former universal diagram from production source", () => {
    const files = filesIn(path.join(project, "src")).filter((file) => /\.[cm]?[jt]sx?$/.test(file));
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, path.relative(project, file)).not.toMatch(/\bTechnicalDiagram\b|\bDiagramKind\b|["'](?:@\/components\/|\.\/|\.\.\/)*technical-diagram["']/);
    }
  });
});
