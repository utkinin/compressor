import { mkdir, writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { expectVisualSystem, visualQaRoutes } from "../support/visual-system";

for (const width of [1440, 1280, 1024, 768, 390]) {
  test(`visual migration delivers clear equipment and process layers at ${width}px`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    const errors: string[] = [];
    const failedImages: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400 && response.url().includes("/images/visuals/")) failedImages.push(`${response.status()} ${response.url()}`);
    });
    const folder = `.local/visual-v2/final/screenshots/${width}`;
    await mkdir(folder, { recursive: true });
    const metrics = [];
    for (const route of visualQaRoutes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expectVisualSystem(page);
      if (route === "/") {
        const object = await page.locator(".home-product-visual img").boundingBox();
        expect(object, "Home product image missing").not.toBeNull();
        if (width === 390) {
          const pain = await page.locator(".home-pain-link").nth(2).boundingBox();
          expect(pain, "Mobile pain navigator missing").not.toBeNull();
          expect(pain!.y + pain!.height, "Mobile pain paths are hidden below the initial viewport").toBeLessThanOrEqual(844);
        } else expect(object!.y + object!.height / 2, "Home equipment is hidden below the initial viewport").toBeLessThan(page.viewportSize()!.height);
      }
      const heroImage = await page.locator("main figure[data-visual-id] img").first().boundingBox();
      const primaryCta = page.locator("main .hero-actions a.button, main .home-hero-v3-actions a.button").first();
      const primaryCtaBox = await primaryCta.count() ? await primaryCta.boundingBox() : null;
      const name = route === "/" ? "home" : route.replace(/^\/|\/$/g, "").replaceAll("/", "--");
      await page.screenshot({ path: `${folder}/${name}.png` });
      const process = page.locator("main [data-process-id]").first();
      if (await process.count()) await process.screenshot({ path: `${folder}/${name}--process.png` });
      metrics.push({ route, heroImage, primaryCtaBox, images: await page.locator("main figure[data-visual-id] img").count(), processes: await page.locator("main [data-process-id]").count(), overflow: await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) });
    }
    expect(errors).toEqual([]);
    expect(failedImages).toEqual([]);
    await writeFile(`${folder}/metrics.json`, JSON.stringify(metrics, null, 2) + "\n");
  });
}
