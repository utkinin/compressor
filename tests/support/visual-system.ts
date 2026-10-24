import { expect, type Page } from "@playwright/test";

export const visualQaRoutes = [
  "/", "/equipment/", "/equipment/nitrogen-compressors/", "/equipment/nitrogen-boosters/", "/solutions/",
  "/solutions/nitrogen-booster-after-generator/", "/solutions/nitrogen-for-laser-cutting/", "/solutions/helium-recovery/",
  "/equipment/co2-compressors/", "/knowledge/", "/knowledge/what-to-specify-for-gas-compressor/",
] as const;

/** Runtime checks cover image delivery, layout stability and the separate visual layers. */
export async function expectVisualSystem(page: Page) {
  await expect(page.locator("main .technical-figure")).toHaveCount(0);
  const figures = page.locator("main figure[data-visual-id]");
  expect(await figures.count(), "No registered image rendered").toBeGreaterThan(0);
  const firstImage = figures.first().locator("img");
  await expect(firstImage).toBeVisible();
  await expect.poll(() => firstImage.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0), { message: "Main image failed to decode" }).toBe(true);
  const imageMetadata = await figures.locator("img").evaluateAll((images) => images.map((image) => ({
    alt: image.getAttribute("alt") ?? "", width: Number(image.getAttribute("width")), height: Number(image.getAttribute("height")),
  })));
  for (const image of imageMetadata) {
    expect(image.alt.trim().length).toBeGreaterThan(12);
    expect(image.width).toBeGreaterThan(0);
    expect(image.height).toBeGreaterThan(0);
  }
  const background = await figures.first().evaluate((element) => {
    let ancestor: Element | null = element;
    while (ancestor) {
      const value = getComputedStyle(ancestor).backgroundColor;
      const channels = value.match(/[\d.]+/g)?.map(Number);
      if (channels && channels.length >= 3 && (channels.length < 4 || channels[3] > 0)) return channels.slice(0, 3);
      ancestor = ancestor.parentElement;
    }
    return [255, 255, 255];
  });
  expect(Math.min(...background), "Product/application image is on a dark background").toBeGreaterThan(180);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "Horizontal page overflow").toBe(true);
  const clipped = await page.locator("main [data-process-id], main a.button:visible").evaluateAll((elements) => elements.filter((element) => {
    const box = element.getBoundingClientRect();
    return box.width > 0 && (box.left < -1 || box.right > innerWidth + 1);
  }).length);
  expect(clipped, "Process or CTA extends outside viewport").toBe(0);
}
