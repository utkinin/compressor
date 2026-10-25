import { expect, test } from "@playwright/test";

const routes = [
  "/knowledge/what-to-specify-for-gas-compressor/",
  "/knowledge/why-process-gas-compressors-need-task-specific-selection/",
  "/knowledge/how-to-select-nitrogen-booster/",
  "/knowledge/compressors-for-gas-mixtures/",
  "/knowledge/how-working-point-is-calculated/",
];

for (const width of [1366, 1024, 768, 390]) {
  test(`knowledge step cards stay inside their frames at ${width}px`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);

      const figure = page.locator("figure.knowledge-detail-steps").first();
      await expect(figure, `${route}: missing steps figure`).toBeVisible();

      const result = await figure.locator(":scope > .knowledge-detail-steps > li").evaluateAll((cards) =>
        cards.map((card) => {
          const cardRect = card.getBoundingClientRect();
          const textNodes = Array.from(card.querySelectorAll("h3,p"));
          return {
            horizontalOverflow: card.scrollWidth - card.clientWidth,
            escapedText: textNodes.some((node) => {
              const rect = node.getBoundingClientRect();
              return rect.left < cardRect.left - 1 || rect.right > cardRect.right + 1;
            }),
          };
        }),
      );

      expect(result, `${route}: step content overflow`).toEqual(
        result.map(() => ({ horizontalOverflow: 0, escapedText: false })),
      );
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${route}: page overflow`).toBeLessThanOrEqual(0);
    }
  });
}
