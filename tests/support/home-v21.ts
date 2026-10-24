import { expect, type Page } from "@playwright/test";

/** The commercial sequence and preserved links are acceptance requirements. */
export async function expectHomeV21(page: Page, mount = "") {
  const hero = page.locator(".hero");
  await expect(hero.getByRole("heading", { level: 1 })).toHaveText("Безмасляные компрессоры и бустеры для технологических газов");
  await expect(hero).toContainText("Не хватает давления после генератора N₂");
  await expect(hero).toContainText("Нужно вернуть гелий в процесс");
  await expect(hero.getByRole("link", { name: "Подобрать компрессор" })).toHaveAttribute("href", new RegExp(`${mount}/rfq(?:/|\\?)`));
  await expect(hero.getByRole("link", { name: "Отправить ТЗ или параметры" })).toHaveAttribute("href", /intake=brief/);
  const painLinks = hero.locator(".home-pain-link");
  await expect(painLinks).toHaveCount(5);
  const painDestinations = ["nitrogen-booster-after-generator", "nitrogen-for-laser-cutting", "helium-recovery", "process-gas-compressor", "equipment-integration"];
  for (const [index, slug] of painDestinations.entries()) await expect(painLinks.nth(index)).toHaveAttribute("href", new RegExp(`${mount}/solutions/${slug}/?$`));
  await expect(hero).not.toContainText(/рабочая точка|(?<![\p{L}\p{N}])(?:H₂|O₂|SF₆)(?![\p{L}\p{N}])|ПЭТ/iu);
  const sections = page.locator("main > section[data-home-section]");
  await expect(sections).toHaveCount(9);
  expect(await sections.evaluateAll((elements) => elements.map((element) => element.getAttribute("data-home-section")))).toEqual([
    "hero", "scenarios", "parameters", "supply", "gases", "engineering", "deliverables", "knowledge", "rfq",
  ]);
  await expect(sections.nth(1).getByRole("heading", { level: 2 })).toHaveText("Что требуется решить?");
  const scenarios = sections.nth(1).locator(".v21-scenario");
  await expect(scenarios).toHaveCount(5);
  const destinations = ["nitrogen-booster-after-generator", "nitrogen-for-laser-cutting", "helium-recovery", "process-gas-compressor", "equipment-integration"];
  for (const [index, slug] of destinations.entries()) await expect(scenarios.nth(index).locator("a").first()).toHaveAttribute("href", new RegExp(`${mount}/solutions/${slug}/?$`));
  await expect(sections.nth(2)).toContainText("5 основных параметров");
  await expect(sections.nth(2).locator(".working-point-field strong")).toHaveText(["Газ", "P₁ — давление на входе", "P₂ — требуемое давление", "Q — расход", "Режим работы"]);
  await expect(sections.nth(3).locator(".v21-supply-grid article")).toHaveCount(3);
  await expect(sections.nth(3)).toContainText("Отдельный компрессор");
  await expect(sections.nth(3)).toContainText("Компрессорный модуль");
  await expect(sections.nth(3)).toContainText("Комплектная система");
  await expect(sections.nth(4).locator(".v21-gas-grid a")).toHaveCount(4);
  await expect(sections.nth(4).locator('a[href="https://www.sf6rus.ru/products/0000004/"]')).toHaveAttribute("href", "https://www.sf6rus.ru/products/0000004/");
  await expect(sections.nth(5).locator(".engineering-step")).toHaveCount(4);
  await expect(sections.nth(6)).toContainText("От расчёта до технического предложения");
  expect(await sections.nth(7).locator("h3").count()).toBeGreaterThanOrEqual(4);
  expect(await sections.nth(7).locator("h3").count()).toBeLessThanOrEqual(6);
  await expect(sections.nth(7)).not.toContainText("SF₆");
  await expect(sections.nth(8).getByRole("link", { name: /ТЗ|описание|параметры/ }).first()).toHaveAttribute("href", /intake=brief/);
  await expect(page.locator('meta[name="description"]')).not.toHaveAttribute("content", /(?<![\p{L}\p{N}])(?:SF₆|H₂|O₂)(?![\p{L}\p{N}])|ПЭТ/u);
  await expect(page.locator("main")).not.toContainText(/\d+\s*[→–-]\s*\d+\s*(?:bar|бар)|\d+\s*(?:Nm³|Нм³)\/ч/i);
}
