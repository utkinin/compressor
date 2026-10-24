import { expect, test } from "@playwright/test";
import { expectVisualSystem, visualQaRoutes } from "../support/visual-system";

for (const width of [1440, 390]) {
  test(`static visual assets and responsive sources stay under the preview basePath at ${width}px`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    const failedImages: string[] = [];
    page.on("response", (response) => {
      if (response.status() >= 400 && response.url().includes("/images/visuals/")) failedImages.push(`${response.status()} ${response.url()}`);
    });
    for (const route of visualQaRoutes) {
      const response = await page.goto(`/compressor${route}`);
      expect(response?.status(), route).toBe(200);
      await expectVisualSystem(page);
      const currentSource = await page.locator("main figure[data-visual-id] img").first().evaluate((image: HTMLImageElement) => new URL(image.currentSrc).pathname);
      expect(currentSource, route).toMatch(/^\/compressor\/images\/visuals\//);
    }
    expect(failedImages).toEqual([]);
  });
}
