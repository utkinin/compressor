import { mkdir } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

const coreRoutes = [
  "/",
  "/solutions/nitrogen-booster-after-generator/",
  "/gases/nitrogen/",
  "/equipment/oil-free-reciprocating/",
  "/knowledge/how-to-select-nitrogen-booster/",
  "/rfq/",
];

const gasBranches = [
  { gas: "n2", expected: "Источник азота", fields: ["source", "purity", "inletRange", "flowProfile"] },
  { gas: "he", expected: "Свежий газ или recovery?", fields: ["mode", "recoveryScheme", "leakageSensitivity"] },
  { gas: "h2", expected: "Состав и чистота водорода", fields: ["composition", "exRequirements", "hazardousArea", "leakageRequirements", "temperature"] },
  { gas: "o2", expected: "Требования к кислородной совместимости", fields: ["purity", "oxygenCompatibility", "cleanliness"] },
  { gas: "co2", expected: "Температура CO₂ на входе", fields: ["inletTemperature", "phase", "operatingRange"] },
  { gas: "mixtures", expected: "Состав смеси и доли компонентов", fields: ["composition"] },
];

async function fillNitrogen(page: Page) {
  await page.locator("#gas-source").fill("PSA — тестовый генератор");
  await page.locator("#gas-purity").fill("99,9 %; состав примесей уточняется");
  await page.locator("#gas-inletRange").fill("5–7 bar(g)");
  await page.locator("#gas-flowProfile").fill("20 средний / 30 пиковый Nm³/h");
}

for (const width of [360, 390, 768, 1440]) {
  test(`core journeys fit ${width}px and render useful accessible content`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    const runtimeErrors: string[] = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    for (const route of coreRoutes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.locator("main h1"), route).toHaveCount(1);
      await expect(page.locator("main h1"), route).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toMatch(/^https?:\/\//);
      expect(new URL(canonical!).pathname.replace(/\/$/, "") || "/").toBe(route.replace(/\/$/, "") || "/");
      expect((await page.title()).length, route).toBeGreaterThan(15);
      expect(await page.title(), route).toMatch(/[А-Яа-яЁё]/);
      expect(await page.locator("main").innerText(), route).toMatch(/газ|азот|компресс|рабоч|RFQ/i);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `horizontal overflow at ${route} ${width}px`).toBe(true);
      const clippedButtons = await page.locator("main a.button, main button:visible").evaluateAll((elements) => elements.filter((element) => {
        const box = element.getBoundingClientRect();
        return box.width > 0 && (box.left < -1 || box.right > window.innerWidth + 1);
      }).length);
      expect(clippedButtons, `buttons outside viewport at ${route}`).toBe(0);
    }
    expect(runtimeErrors).toEqual([]);
  });
}

test("published navigation has no broken internal links or empty HTML pages", async ({ request }) => {
  const pending = ["/", "/solutions/", "/gases/", "/equipment/", "/industries/", "/engineering/", "/knowledge/", "/cases/", "/documents/", "/about/", "/contacts/", "/legal/"];
  const visited = new Set<string>();
  while (pending.length) {
    const route = pending.shift();
    if (!route || visited.has(route)) continue;
    visited.add(route);
    expect(visited.size, "unexpected infinite route graph").toBeLessThan(180);
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    if (!response.headers()["content-type"]?.includes("text/html")) continue;
    const html = await response.text();
    expect(html, `missing H1 at ${route}`).toMatch(/<h1[\s>]/);
    expect(html, `missing canonical at ${route}`).toMatch(/rel="canonical"/);
    expect(html, `placeholder at ${route}`).not.toMatch(/lorem ipsum|coming-soon/i);
    for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
      const href = match[1].replaceAll("&amp;", "&");
      if (!href.startsWith("/") || href.startsWith("//") || href.startsWith("/api/") || href.startsWith("/_next/")) continue;
      const path = href.split(/[?#]/)[0];
      if (path && !visited.has(path)) pending.push(path);
    }
    const ldJson = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
    for (const match of ldJson) {
      const structuredData: unknown = JSON.parse(match[1]);
      expect(JSON.stringify(structuredData), `invented sales data ${route}`).not.toMatch(/"(?:Offer|AggregateRating|Review)"|"price"\s*:\s*(?:0|"0")/);
    }
  }
  expect(visited.size).toBeGreaterThan(55);
});

test("search endpoints are valid and public gases exclude the legacy gas direction", async ({ page, request }) => {
  await page.goto("/gases/");
  await expect(page.locator("main")).not.toContainText(/SF[₆6]|элегаз/);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain("<urlset");
  expect(xml).toContain("/rfq");
  expect(xml).not.toMatch(/sf6|элегаз/i);
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) expect(() => new URL(match[1])).not.toThrow();
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  const directives = await robots.text();
  expect(directives).toMatch(/User-Agent:/i);
  expect(directives).toMatch(/Sitemap:/i);
  for (const route of ["/solutions/no-such-working-point/", "/gases/not-a-gas/", "/equipment/imaginary-model/"]) {
    expect((await request.get(route)).status(), route).toBe(404);
  }
});

test("equipment provenance and document access stay honest", async ({ page, request }) => {
  await page.goto("/equipment/oil-free-reciprocating/");
  await expect(page.locator("main")).toContainText("Исходный каталог производителя не предоставлен");
  await expect(page.locator("main")).toContainText("draft — исходные технические данные ожидают проверки");
  await expect(page.locator("main table.data-table")).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText("engineering-verified");
  const questionnaire = await request.get("/documents/process-gas-questionnaire.txt");
  expect(questionnaire.status()).toBe(200);
  expect(await questionnaire.text()).toMatch(/Газ|P₁|давлени/i);
  await page.goto("/documents/");
  await expect(page.locator('main a[href^="/rfq"]')).not.toHaveCount(0);
  await expect(page.locator('main a[download][href$=".pdf"]')).toHaveCount(0);
});

test("mobile navigation works by keyboard and closes after choosing a section", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Меню" });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Закрыть" })).toHaveAttribute("aria-expanded", "true");
  const gasLink = page.getByRole("navigation", { name: "Основная навигация" }).getByRole("link", { name: "Газы", exact: true });
  await gasLink.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/gases\/?$/);
  await expect(page.getByRole("button", { name: "Меню" })).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("main h1")).toBeVisible();
});

test("RFQ validates missing gas requirements before advancing", async ({ page }) => {
  await page.goto("/rfq/");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await expect(page.getByRole("heading", { name: "С каким газом работаем?" })).toBeVisible();
  await expect(page.locator("#gas-source")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#gas-source")).toBeFocused();
});

for (const branch of gasBranches) {
  test(`RFQ ${branch.gas} asks the required technical questions`, async ({ page }) => {
    await page.goto(`/rfq/?gas=${branch.gas}`);
    await expect(page.locator(`input[name="gas"][value="${branch.gas}"]`)).toBeChecked();
    await expect(page.getByLabel(branch.expected, { exact: true })).toBeVisible();
    for (const field of branch.fields) await page.locator(`#gas-${field}`).fill("Требует уточнения по проекту");
    await page.getByRole("button", { name: "Продолжить" }).click();
    await expect(page.getByRole("heading", { name: "Какое давление на входе?" })).toBeVisible();
  });
}

test("RFQ rejects P₂ ≤ P₁ at the pressure step", async ({ page }) => {
  await page.goto("/rfq/");
  await fillNitrogen(page);
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByLabel("Давление на входе P₁", { exact: true }).fill("6");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByLabel("Давление на выходе P₂", { exact: true }).fill("5");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await expect(page.getByRole("heading", { name: "Какое давление нужно на выходе?" })).toBeVisible();
  await expect(page.getByLabel("Давление на выходе P₂", { exact: true })).toHaveAttribute("aria-invalid", "true");
});

test("qualified RFQ completes with explicit consent and honest local-staging receipt", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const submitted: unknown[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/api/rfq") && request.method() === "POST") submitted.push(request.postDataJSON() as unknown);
  });
  await page.goto("/gases/nitrogen/?utm_source=e2e");
  await page.getByRole("link", { name: "Подобрать решение для N₂" }).click();
  await expect(page).toHaveURL(/\/rfq\/?\?/);
  await expect(page.getByText("Staging · локальная проверка", { exact: true })).toBeVisible();
  await fillNitrogen(page);
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByLabel("Давление на входе P₁", { exact: true }).fill("6");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByLabel("Давление на выходе P₂", { exact: true }).fill("20");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByLabel("Производительность Q", { exact: true }).fill("25");
  await expect(page.getByLabel("Условия расхода: температура и абсолютное давление", { exact: true })).toHaveValue(/1,01325 bar\(a\)/);
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByRole("radio", { name: /По циклу/ }).check();
  await page.getByRole("button", { name: "Проверить рабочую точку" }).click();
  await expect(page.getByRole("heading", { name: "Как работает процесс?" })).toBeVisible();
  await expect(page.locator("#duty-details")).toHaveAttribute("aria-invalid", "true");
  await page.getByRole("radio", { name: /Непрерывный 24\/7/ }).check();
  await page.getByRole("button", { name: "Проверить рабочую точку" }).click();
  await expect(page.getByRole("heading", { name: "Рабочая точка для инженерного подбора" })).toBeVisible();
  await expect(page.getByText("Предварительный класс решения", { exact: true })).toBeVisible();
  await page.getByLabel("Имя", { exact: true }).fill("Тестовый инженер");
  await page.getByLabel("Компания", { exact: true }).fill("Тестовая организация E2E");
  await page.getByLabel("Рабочий email", { exact: true }).fill("engineer@example.test");
  const consent = page.locator('.rfq-consent input[type="checkbox"]');
  await expect(consent).not.toBeChecked();
  await page.getByRole("button", { name: "Сохранить тестовую заявку" }).click();
  await expect(consent).toHaveAttribute("aria-invalid", "true");
  expect(submitted).toHaveLength(0);
  await consent.focus();
  await page.keyboard.press("Space");
  const received = page.waitForResponse((response) => response.url().endsWith("/api/rfq") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Сохранить тестовую заявку" }).click();
  const response = await received;
  expect(response.ok(), `RFQ ${response.status()}: ${await response.text()}`).toBe(true);
  await expect(page.getByRole("heading", { name: "Тестовая заявка сохранена локально" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("инженер не получил уведомление");
  expect(submitted).toHaveLength(1);
  expect(submitted[0]).toMatchObject({
    gas: "n2",
    inlet: { value: 6, unit: "bar(g)" },
    outlet: { value: 20, unit: "bar(g)" },
    flow: { value: 25, unit: "Nm3/h" },
    duty: "continuous",
    consent: { accepted: true, version: "2026-10-22-v1" },
    attribution: { sourcePage: "/gases/nitrogen/", landingPage: expect.stringMatching(/^\/gases\/nitrogen\/?$/), utm: { source: "e2e" } },
  });
});

test("desktop and mobile staging screenshots", async ({ page }) => {
  await mkdir(".local/screenshots", { recursive: true });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");
  await page.screenshot({ path: ".local/screenshots/home-1440-fold.png" });
  await page.screenshot({ path: ".local/screenshots/home-1440.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({ path: ".local/screenshots/home-390-fold.png" });
  await page.screenshot({ path: ".local/screenshots/home-390.png", fullPage: true });
  await page.goto("/rfq/");
  await page.screenshot({ path: ".local/screenshots/rfq-390.png", fullPage: true });
});
