import { expect, test } from "@playwright/test";

test("integrator landing is project-first and evidence-safe", async ({ page }) => {
  await page.goto("/integrators/");
  await expect(page.locator("main h1")).toHaveText("Компрессорные модули и системы для интеграторов");
  await expect(page.getByRole("heading", { name: "Проектные и повторяемые поставки вместо розничного каталога" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Что можно встроить в оборудование" })).toBeVisible();
  await expect(page.locator(".integrator-direction-card")).toHaveCount(4);
  const primary = page.getByRole("link", { name: /Передать ТЗ проекта/ });
  await expect(primary).toHaveAttribute("href", /intake=brief/);
  await expect(primary).toHaveAttribute("href", /solution=equipment-integration/);
  const publicText = (await page.locator("main").innerText()).toLowerCase();
  expect(publicText).not.toMatch(/\boem\b|naili|supplier|factory|поставщик|железнодорож/iu);
});

for (const width of [390, 360]) {
  test(`integrator landing has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/integrators/");
    const size = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(size.scroll).toBeLessThanOrEqual(size.client + 1);
    await expect(page.getByRole("link", { name: /Передать ТЗ проекта/ })).toBeVisible();
  });
}
