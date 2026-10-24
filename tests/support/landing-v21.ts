import { expect, type Page } from "@playwright/test";

export async function expectLaserArchitectures(page: Page) {
  const alternatives = page.locator('[data-process-id="process-laser"]');
  const branches = alternatives.locator(".process-branch");
  await expect(branches).toHaveCount(2);
  await expect(branches.nth(0).getByRole("heading")).toHaveText("Сжатый воздух");
  await expect(branches.nth(0).locator(".process-step-copy > strong")).toHaveText(["Компрессор", "Ресивер", "Осушение", "Фильтрация", "Лазер"]);
  await expect(branches.nth(1).getByRole("heading")).toHaveText("Азот");
  await expect(branches.nth(1).locator(".process-step-copy > strong")).toHaveText(["Источник / генератор N₂", "Бустер", "Ресивер", "Лазер"]);
  await expect(branches.nth(1).locator(".process-step--optional")).toContainText("Ресивер");
}

export async function expectProjectLandings(page: Page, mount = "") {
  await page.goto(`${mount}/gases/`);
  const projectGases = page.locator('[aria-labelledby="project-gases-title"]');
  await expect(projectGases).toContainText("Проектное рассмотрение");
  for (const slug of ["hydrogen", "oxygen"]) {
    await expect(projectGases.locator(`a[href="${mount}/gases/${slug}"],a[href="${mount}/gases/${slug}/"]`).first()).toBeVisible();
    await page.goto(`${mount}/gases/${slug}/`);
    await expect(page.locator("#project-review")).toContainText("Проектное рассмотрение");
    const order = await page.locator("#project-review").evaluate((notice) => {
      const diagram = document.querySelector("main [data-process-id]");
      return Boolean(diagram && (notice.compareDocumentPosition(diagram) & Node.DOCUMENT_POSITION_FOLLOWING));
    });
    expect(order, `${slug}: project review must precede the process explanation`).toBe(true);
    const canonical = (await page.locator('link[rel="canonical"]').getAttribute("href"))!;
    expect(new URL(canonical).pathname.replace(/\/$/, "")).toBe(`${mount}/gases/${slug}`);
    if (slug === "hydrogen") await page.goto(`${mount}/gases/`);
  }
  const nitrogenPath = `${mount}/solutions/nitrogen-booster-after-generator/`;
  const laserPath = `${mount}/solutions/nitrogen-for-laser-cutting/`;
  await page.goto(nitrogenPath);
  await expect(page.locator("main h1")).toHaveText("Дожатие азота после генератора");
  await expect(page.locator(`main a[href="${laserPath}"],main a[href="${laserPath.slice(0, -1)}"]`).first()).toBeVisible();
  await page.goto(laserPath);
  await expect(page.locator("main h1")).toHaveText("Система подачи азота для лазерной резки");
  await expect(page.locator(`main a[href="${nitrogenPath}"],main a[href="${nitrogenPath.slice(0, -1)}"]`).first()).toBeVisible();
  await expectLaserArchitectures(page);
  await expect(page.locator("main")).not.toContainText(/15\s*(?:→|-)\s*40/);
}
