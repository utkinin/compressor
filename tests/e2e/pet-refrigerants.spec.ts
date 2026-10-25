import { expect, test } from "@playwright/test";

const noHorizontalOverflow = async (page: import("@playwright/test").Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);

test("PET solution is public, Oil-Free and uses brief RFQ", async ({ page }) => {
  await page.goto("/solutions/oil-free-high-pressure-air-for-pet/");
  await expect(page.getByRole("heading", { level: 1, name: "Нужно стабильное высокое давление для выдува ПЭТ?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Безмасляное сжатие" })).toBeVisible();
  const cta = page.getByRole("link", { name: /Рассчитать систему для ПЭТ/ }).first();
  await expect(cta).toHaveAttribute("href", /intake=brief/);
  await expect(page.getByText("Контур высокого давления для выдува ПЭТ")).toBeVisible();
});

test("refrigerant solution does not make an automatic Oil-Free claim", async ({ page }) => {
  await page.goto("/solutions/refrigerant-transfer-compression/");
  await expect(page.getByRole("heading", { level: 1, name: "Нужно перекачать или фасовать хладагент?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Безмасляное сжатие" })).toHaveCount(0);
  await expect(page.getByText("Перекачка хладагента между системами")).toBeVisible();
  const cta = page.getByRole("link", { name: /Отправить данные по хладагенту/ }).first();
  await expect(cta).toHaveAttribute("href", /intake=brief/);
});

test("PET and refrigerant solution pages do not overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/solutions/oil-free-high-pressure-air-for-pet/", "/solutions/refrigerant-transfer-compression/"]) {
    await page.goto(path);
    expect(await noHorizontalOverflow(page)).toBe(true);
  }
});
