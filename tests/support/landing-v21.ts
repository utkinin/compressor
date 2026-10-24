import { expect, type Page } from "@playwright/test";

export async function expectProjectLandings(page: Page, mount = "") {
  await page.goto(`${mount}/gases/`);
  const projectGases = page.locator('[aria-labelledby="project-gases-title"]');
  await expect(projectGases).toContainText("Проектное рассмотрение");
  for (const slug of ["hydrogen", "oxygen"]) {
    await expect(projectGases.locator(`a[href="${mount}/gases/${slug}"],a[href="${mount}/gases/${slug}/"]`).first()).toBeVisible();
    await page.goto(`${mount}/gases/${slug}/`);
    await expect(page.locator("#project-review")).toContainText("Проектное рассмотрение");
    const order = await page.locator("#project-review").evaluate((notice) => {
      const diagram = document.querySelector("main .technical-figure");
      return !diagram || Boolean(notice.compareDocumentPosition(diagram) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(order, `${slug}: project review must precede the technical diagram`).toBe(true);
    const canonical = (await page.locator('link[rel="canonical"]').getAttribute("href"))!;
    expect(new URL(canonical).pathname.replace(/\/$/, "")).toBe(`${mount}/gases/${slug}`);
    if (slug === "hydrogen") await page.goto(`${mount}/gases/`);
  }
  const nitrogenPath = `${mount}/solutions/nitrogen-booster-after-generator/`;
  const laserPath = `${mount}/solutions/nitrogen-for-laser-cutting/`;
  await page.goto(nitrogenPath);
  await expect(page.locator("main h1")).toHaveText("Не хватает давления после генератора азота?");
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator(".solution-process-visual")).toBeVisible();
  await expect(page.locator(`main a[href="${laserPath}"],main a[href="${laserPath.slice(0, -1)}"]`).first()).toBeVisible();
  await page.goto(laserPath);
  await expect(page.locator("main h1")).toHaveText("Нужен газ для лазерного станка?");
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator(".solution-process-visual")).toBeVisible();
  await expect(page.locator(`main a[href="${nitrogenPath}"],main a[href="${nitrogenPath.slice(0, -1)}"]`).first()).toBeVisible();
  await expect(page.locator("main")).toContainText("компрессор → ресивер → осушитель → фильтрация → лазер");
  await expect(page.locator("main")).toContainText("источник N₂ / генератор → бустер → ресивер → лазер");
  await expect(page.locator("main")).not.toContainText(/15\s*(?:→|-)\s*40/);
}
