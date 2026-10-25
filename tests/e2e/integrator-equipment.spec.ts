import { expect, test } from "@playwright/test";

const routes = [
  ["/equipment/oil-free-piston-compressor-modules/", "Безмасляные поршневые компрессорные модули"],
  ["/equipment/compact-oil-free-air-systems/", "Компактные безмасляные компрессорные системы"],
  ["/equipment/oil-free-vacuum-modules/", "Безмасляные вакуумные модули"],
] as const;

for (const [path, title] of routes) {
  test(`${title} is a project-integration equipment direction`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    const cta = page.locator('main a[href*="intake=integration"]').first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", /intake=integration/);
    await expect(page.getByText("Для интеграторов / проектная поставка")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  });
}

test("equipment hub separates process-gas equipment from integrator modules", async ({ page }) => {
  await page.goto("/equipment/");
  await expect(page.getByRole("heading", { name: "Компрессоры и бустеры по газу и задаче" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Модули для встраивания в машины и установки" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Безмасляные поршневые компрессорные модули" }).first()).toBeVisible();
});

test("integrator landing links the three verified public category directions", async ({ page }) => {
  await page.goto("/integrators/");
  for (const [, title] of routes) await expect(page.getByRole("link", { name: title }).first()).toBeVisible();
});
