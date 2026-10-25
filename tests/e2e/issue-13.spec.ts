import { expect, test } from "@playwright/test";

for (const width of [360, 390]) {
  test(`task-specific knowledge page has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/knowledge/why-process-gas-compressors-need-task-specific-selection/");
    const dimensions = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
    await expect(page.getByText("От условий процесса к оборудованию", { exact: true }).first()).toBeVisible();
  });
}

test("gas badges supplement public gas text", async ({ page }) => {
  await page.goto("/");
  const badges = page.locator("[data-gas-badge]");
  expect(await badges.count()).toBeGreaterThanOrEqual(4);
  await expect(page.locator('[data-gas-badge="n2"]').first()).toContainText("N₂");
  await expect(page.locator('[data-gas-badge="n2"]').first()).toHaveAttribute("aria-label", "Азот — N₂");

  await page.goto("/gases/process-gas/");
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/\bMIX\b/);
  expect(text).toContain("Газ / смесь");
});
