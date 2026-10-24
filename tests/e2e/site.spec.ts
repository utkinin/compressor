import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { briefFile, expectBriefIntake, fillBriefContact } from "../support/brief-v21";
import { expect, test, type Page } from "@playwright/test";
import { expectLaserArchitectures, expectProjectLandings } from "../support/landing-v21";
import { expectHomeV21 } from "../support/home-v21";
import { sourceModels } from "../../src/content/internal/source-model-registry";

const equipmentRoutes = ["nitrogen-compressors", "nitrogen-boosters", "helium-compressors", "co2-compressors", "sf6-compressors", "process-gas-compressors"].map((slug) => `/equipment/${slug}/`);
const sourceTerms = [...new Set(sourceModels.flatMap((model) => [model.modelName, ...model.aliases, ...model.sourceSlugs]))];
const sourceRoutes = [...new Set(sourceModels.flatMap((model) => model.sourceSlugs))].map((slug) => `/equipment/${slug}/`);
const retiredRoutes = [...sourceRoutes, ...["oil-free-reciprocating", "gas-boosters", "compressor-modules", "compressor-skids", "recovery-systems"].map((slug) => `/equipment/${slug}/`)];
const removedDocumentRoutes = ["configuration-datasheet", "manufacturer-family-catalogue", "operating-manual", "pid-interface-drawing", "cad-layout", "step-model", "conformity-document-list", "working-point-calculation"].map((slug) => `/documents/${slug}/`);
const featuredArticles = [
  ["what-to-specify-for-gas-compressor", "Какие данные нужны для подбора компрессора"],
  ["why-process-gas-compressors-need-task-specific-selection", "Почему компрессор для технологического газа подбирают под конкретную задачу"],
  ["what-is-in-compressor-skid", "Из чего состоит комплектная компрессорная система"],
  ["sf6-compressor-service-life", "От чего зависит срок службы компрессора SF₆"],
  ["how-to-select-nitrogen-booster", "Как подобрать бустер азота по давлению и расходу"],
  ["compressors-for-gas-mixtures", "Компрессоры для газовых смесей и сложных технологических газов"],
] as const;
const developerLanguage = ["staging", "repository", "source family", "source model", "family envelope", "manufacturer family catalogue", "supplier", "engineering-verified", "source-supported", "draft", "компримирование", "рабочая точка процесса", "согласуем весь узел", "кнопка не означает наличие файла", "knowledge / инженерные ответы", "разобраться до отправки запроса", "маршрут инженерного подбора", "рабочие объяснения величин"];
const optionalProjectData = {
  temperature: "Температура по данным заказчика", composition: "Состав и чистота по анализу газа", placement: "Закрытое помещение",
  cooling: "Охлаждение согласуется с площадкой", power: "Питание по техническим условиям", automation: "Дистанционный контроль по требованиям проекта", other: "Условия обслуживания уточнить",
};

function expectCustomerLanguage(html: string, route: string) {
  const metadata = [...html.matchAll(/<meta\b[^>]*>/gi)].filter(([tag]) => /\b(?:name|property)="(?:description|og:title|og:description|twitter:title|twitter:description)"/i.test(tag)).map(([tag]) => tag.match(/\bcontent="([^"]*)"/i)?.[1] || "").join(" ");
  const accessibleCopy = [...html.matchAll(/\b(?:aria-label|aria-description|alt|title)="([^"]*)"/gi)].map((match) => match[1]).join(" ");
  const text = html.replace(/<(?:script|style)\b[^>]*>[\s\S]*?<\/(?:script|style)>/gi, " ").replace(/<[^>]*>/g, " ");
  const publicCopy = `${metadata} ${accessibleCopy} ${text}`.replace(/\s+/g, " ").toLowerCase();
  for (const term of developerLanguage) expect(publicCopy, `${route}: internal development language`).not.toContain(term);
}

function expectPublicCatalogCopy(html: string, route: string) {
  for (const term of sourceTerms) expect(html.toLowerCase(), `${route}: internal source term`).not.toContain(term.toLowerCase());
  expect(html, route).not.toMatch(/"@type"\s*:\s*"(?:Product|ProductGroup|IndividualProduct|Offer)"/);
}

const coreRoutes = [
  "/",
  "/solutions/nitrogen-booster-after-generator/",
  "/gases/nitrogen/",
  "/equipment/",
  ...equipmentRoutes,
  "/knowledge/how-to-select-nitrogen-booster/",
  "/knowledge/what-to-specify-for-gas-compressor/",
  "/industries/laser-cutting/",
  "/solutions/equipment-integration/",
  "/industries/equipment-manufacturers/",
  "/cases/compressor-integration/",
  "/documents/process-gas-questionnaire/",
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

test("problem-first homepage preserves selection depth and the laser supply alternatives", async ({ page }) => {
  await page.goto("/");
  await expectHomeV21(page);
  await page.goto("/industries/laser-cutting/");
  await expect(page.locator("main h1")).toHaveText("Газоснабжение лазерного станка");
  await expectLaserArchitectures(page);
  await expect(page.locator("main")).toContainText("Азот не является универсально лучшим вариантом");
  await expect(page.locator("main")).not.toContainText(/15\s*(?:→|-)\s*40/);
  await page.goto("/knowledge/what-to-specify-for-gas-compressor/");
  await expect(page.locator("main h1")).toHaveText("Какие данные нужны для подбора компрессора");
  await expect(page.locator(".page-hero")).toContainText("Чтобы начать подбор компрессора, укажите пять основных параметров");
  // Engineering terminology remains in one explanatory paragraph, never in a CTA.
  expect((await page.locator("main").innerText()).match(/рабочая точка/gi)).toHaveLength(1);
});

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

test("published navigation has no broken internal links, development language or empty HTML pages", async ({ request }) => {
  const pending = ["/"];
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
    expectCustomerLanguage(html, route);
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
  const canonicalPaths = [...(await (await request.get("/sitemap.xml")).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname.replace(/\/$/, "") || "/");
  const reachable = new Set([...visited].map((route) => route.replace(/\/$/, "") || "/"));
  expect(canonicalPaths.filter((route) => !reachable.has(route)), "canonical pages orphaned from the homepage").toEqual([]);
});

test("search endpoints expose public equipment intents and exclude internal source routes", async ({ page, request }) => {
  await page.goto("/gases/");
  await expect(page.locator("main")).not.toContainText(/SF[₆6]|элегаз/);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain("<urlset");
  expect(xml).toContain("/rfq");
  for (const route of equipmentRoutes) expect(xml).toContain(route.replace(/\/$/, ""));
  for (const term of sourceTerms) expect(xml.toLowerCase()).not.toContain(term.toLowerCase());
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) expect(() => new URL(match[1])).not.toThrow();
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  const directives = await robots.text();
  expect(directives).toMatch(/User-Agent:/i);
  expect(directives).toMatch(/Sitemap:/i);
  for (const route of ["/solutions/no-such-working-point/", "/gases/not-a-gas/", "/equipment/imaginary-model/"]) {
    expect((await request.get(route)).status(), route).toBe(404);
  }
  for (const route of retiredRoutes) expect((await request.get(route)).status(), route).toBe(404);
  for (const route of ["/documents/", ...removedDocumentRoutes, "/news/", "/news/no-such-event/"]) expect((await request.get(route)).status(), route).toBe(404);
});

test("equipment catalog describes applications without source identities, product schema or unverified limits", async ({ page, request }) => {
  await page.goto("/equipment/");
  await expect(page.locator("main h1")).toHaveText("Компрессоры и бустеры для технологических газов");
  await expect(page.locator(".equipment-catalog-card")).toHaveCount(5);
  await expect(page.locator(".equipment-card-grid")).not.toContainText("SF₆");
  for (const route of equipmentRoutes) await expect(page.locator(`main a[href="${route.replace(/\/$/, "")}"], main a[href="${route}"]`).first()).toBeVisible();
  for (const route of ["/equipment/", ...equipmentRoutes]) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    const html = await response.text();
    expectPublicCatalogCopy(html, route);
    expect(html, route).not.toMatch(/1[–-]500\+|150\+\s*(?:bar|бар)/);
  }
  await page.goto("/solutions/nitrogen-for-laser-cutting/");
  await expect(page.locator("main h1")).toHaveText("Система подачи азота для лазерной резки");
  await page.goto("/solutions/nitrogen-booster-after-generator/");
  await expect(page.locator("main h1")).toHaveText("Дожатие азота после генератора");
  await page.goto("/solutions/helium-compression/");
  await expect(page.locator("main h1")).toHaveText("Сжатие гелия");
  const questionnaire = await request.get("/documents/process-gas-questionnaire.txt");
  expect(questionnaire.status()).toBe(200);
  expect(await questionnaire.text()).toMatch(/Газ|P₁|давлени/i);
});

test("project gases retain their URLs and nitrogen and laser keep distinct linked tasks", async ({ page }) => {
  await expectProjectLandings(page);
});

test("customer navigation and the knowledge hub expose six substantial linked articles", async ({ page }) => {
  await page.goto("/knowledge/");
  const navigation = page.getByRole("navigation", { name: "Основная навигация" });
  await expect(navigation.locator("a:not(.header-rfq)")).toHaveText(["Оборудование", "Решения", "Технологические газы", "База знаний", "О компании", "Контакты"]);
  await expect(navigation.locator(".header-rfq")).toContainText("Подобрать компрессор");
  await expect(page.locator("main h1")).toHaveText("База знаний");
  await expect(page.locator(".page-hero .eyebrow")).toHaveText("Экспертный центр");
  await expect(page.locator(".page-hero")).toContainText("Практические материалы о компрессорах, технологических газах и подборе оборудования.");
  const featured = page.locator('[aria-labelledby="knowledge-start-title"]');
  await expect(featured.locator("article")).toHaveCount(6);
  await expect(page.getByTestId("knowledge-library").locator("article")).toHaveCount(19);
  for (const [slug, title] of featuredArticles) await expect(featured.getByRole("link", { name: title, exact: true })).toHaveAttribute("href", new RegExp(`/knowledge/${slug}/?$`));
  await page.getByLabel("Поиск по базе знаний", { exact: true }).fill("несуществующийпоисковыйзапрос");
  await expect(page.getByRole("heading", { name: "По этому запросу статьи не найдены" })).toBeVisible();
  await page.getByRole("button", { name: "Показать все материалы", exact: true }).click();
  await expect(page.getByTestId("knowledge-library").locator("article")).toHaveCount(19);
  for (const [slug, title] of featuredArticles) {
    await page.goto(`/knowledge/${slug}/`);
    await expect(page.locator("main h1")).toHaveText(title);
    expect((await page.locator("article.prose").innerText()).length, slug).toBeGreaterThan(1800);
    expect(await page.locator("article.prose h2").count(), slug).toBeGreaterThanOrEqual(5);
    expect(await page.locator('main svg[role="img"], main img[alt], main table').count(), `${slug}: explanatory visual`).toBeGreaterThan(0);
    for (const section of (slug === "sf6-compressor-service-life" ? ["equipment", "solutions", "gases"] : ["equipment", "solutions", "gases", "rfq"])) await expect(page.locator(`main a[href^="/${section}"]`).first(), `${slug}: ${section} link`).toBeVisible();
    if (slug === "sf6-compressor-service-life") {
      await expect(page.locator('main a[href="https://www.sf6rus.ru/products/0000004/"]').first()).toBeVisible();
      await expect(page.locator('main a[href^="/rfq"]')).toHaveCount(0);
    }
    const related = page.locator(`main a[href^="/knowledge/"]:not([href="/knowledge/"]):not([href="/knowledge/${slug}/"]):not([href="/knowledge/${slug}"])`);
    await expect(related.first(), `${slug}: related article`).toBeVisible();
  }
});

test("questionnaire exports the supplied parameters without contacts and keeps sending explicit", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const writes: string[] = [];
  page.on("request", (request) => { if (!["GET", "HEAD"].includes(request.method())) writes.push(request.url()); });
  await page.goto("/documents/process-gas-questionnaire/");
  await expect(page.locator("main h1")).toHaveText("Опросный лист на подбор газового компрессора");
  await fillNitrogen(page);
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByLabel("Давление на входе P₁", { exact: true }).fill("6");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByLabel("Давление на выходе P₂", { exact: true }).fill("40");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByLabel("Производительность Q", { exact: true }).fill("80");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByRole("radio", { name: /Непрерывный 24\/7/ }).check();
  await page.getByRole("button", { name: "Проверить параметры подбора" }).click();
  for (const [field, value] of Object.entries(optionalProjectData)) await page.locator(`#project-${field}`).fill(value);
  await page.locator(".rfq-shell:visible").getByLabel("Имя", { exact: true }).fill("QuestionnaireContactFixture");
  const sheet = await page.locator("#questionnaire-text").inputValue();
  expect(sheet).toMatch(/азот|N₂/i);
  for (const value of ["6", "40", "80", ...Object.values(optionalProjectData)]) expect(sheet).toContain(value);
  expect(sheet).not.toContain("QuestionnaireContactFixture");
  await page.getByRole("button", { name: "Скопировать данные", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(sheet);
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Скачать заполненный лист", exact: true }).click();
  const download = await downloaded;
  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();
  expect(await readFile(downloadPath!, "utf8")).toBe(sheet);
  await page.evaluate(() => { window.print = () => { document.documentElement.dataset.printRequests = "1"; }; });
  await page.getByRole("button", { name: "Распечатать", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-print-requests", "1");
  await expect(page.getByRole("button", { name: "Сохранить тестовую заявку", exact: true })).toBeVisible();
  await expect(page.locator('.rfq-shell:visible .rfq-consent input[type="checkbox"]')).not.toBeChecked();
  expect(writes).toEqual([]);
});

test("equipment RFQ carries a descriptive nitrogen booster and only a preliminary engineering result", async ({ page }) => {
  await page.goto("/equipment/nitrogen-boosters/");
  await expect(page.locator("main h1")).toHaveText("Бустеры азота высокого давления");
  await page.locator('main a[href*="equipment=nitrogen-boosters"]').first().click();
  await expect(page).toHaveURL(/\/rfq\/?\?/);
  await expect(page.locator('input[name="gas"][value="n2"]')).toBeChecked();
  await fillNitrogen(page);
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByLabel("Давление на входе P₁", { exact: true }).fill("6");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByLabel("Давление на выходе P₂", { exact: true }).fill("40");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByLabel("Производительность Q", { exact: true }).fill("80");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByRole("radio", { name: /Непрерывный 24\/7/ }).check();
  await page.getByRole("button", { name: "Проверить параметры подбора" }).click();
  await expect(page.getByRole("heading", { name: "Предварительный вариант оборудования", exact: true })).toBeVisible();
  const preliminary = page.locator(".rfq-preliminary-data");
  await expect(preliminary).toContainText("Бустер азота высокого давления");
  await expect(preliminary).toContainText("Назначение");
  await expect(preliminary).toContainText(/азот/i);
  await expect(preliminary).toContainText("Уточняется после инженерного расчёта");
  await expect(preliminary).toContainText("Требуется инженерное подтверждение");
  await expect(page.locator(".rfq-summary")).toContainText("40 bar(g)");
  await expect(page.locator(".rfq-summary")).toContainText("80 Nm³/h");
  for (const term of sourceTerms) await expect(page.locator("main")).not.toContainText(term);
});

test("SF₆ keeps its canonical specialist reference without a local commercial selection", async ({ page }) => {
  await page.goto("/equipment/sf6-compressors/");
  const reference = page.getByTestId("sf6-specialist-reference");
  await expect(page.locator("main h1")).toHaveText("Оборудование для SF₆ — SF6RUS");
  await expect(reference.locator('a[href="https://www.sf6rus.ru/products/0000004/"]').first()).toHaveAttribute("href", "https://www.sf6rus.ru/products/0000004/");
  await expect(reference.locator('a[href^="/rfq"]')).toHaveCount(0);
  expect(new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!).pathname.replace(/\/$/, "")).toBe("/equipment/sf6-compressors");
  await page.goto("/rfq/?equipment=sf6-compressors");
  await expect(page.locator('input[name="gas"][value="n2"]')).toBeChecked();
  await expect(page.locator("main")).not.toContainText("Компрессор для SF₆");
});

test("mobile navigation works by keyboard and closes after choosing a section", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Меню" });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Закрыть" })).toHaveAttribute("aria-expanded", "true");
  const gasLink = page.getByRole("navigation", { name: "Основная навигация" }).getByRole("link", { name: "Технологические газы", exact: true });
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
  await page.getByRole("link", { name: /Подобрать компрессор для N₂/ }).click();
  await expect(page).toHaveURL(/\/rfq\/?\?/);
  await expect(page.locator(".rfq-shell:visible").getByText("Тестовый режим · локальная проверка", { exact: true })).toBeVisible();
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
  await page.getByRole("button", { name: "Проверить параметры подбора" }).click();
  await expect(page.getByRole("heading", { name: "Как работает процесс?" })).toBeVisible();
  await expect(page.locator("#duty-details")).toHaveAttribute("aria-invalid", "true");
  await page.getByRole("radio", { name: /Непрерывный 24\/7/ }).check();
  await page.getByRole("button", { name: "Проверить параметры подбора" }).click();
  await expect(page.getByRole("heading", { name: "Предварительный вариант оборудования", exact: true })).toBeVisible();
  await expect(page.locator(".rfq-preliminary-data")).toContainText("Требуется инженерное подтверждение");
  await page.locator(".rfq-shell:visible").getByLabel("Имя", { exact: true }).fill("Тестовый инженер");
  await page.locator(".rfq-shell:visible").getByLabel("Компания", { exact: true }).fill("Тестовая организация E2E");
  await page.locator(".rfq-shell:visible").getByLabel("Рабочий email", { exact: true }).fill("engineer@example.test");
  const consent = page.locator('.rfq-shell:visible .rfq-consent input[type="checkbox"]');
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

test("a file-only brief accepts unknown parameters, requires consent and persists private file bytes once", async ({ page, request }) => {
  await page.goto("/rfq/?intake=brief&source=%2Fsolutions%2Fequipment-integration%2F");
  await expectBriefIntake(page);
  await page.locator("#brief-files").setInputFiles(briefFile);
  await expect(page.locator(".brief-files-list")).toContainText(briefFile.name);
  await fillBriefContact(page);
  const posted: string[] = [];
  page.on("request", (submission) => { if (submission.url().endsWith("/api/rfq") && submission.method() === "POST") posted.push(submission.url()); });
  await page.getByRole("button", { name: "Сохранить тестовую заявку", exact: true }).click();
  await expect(page.locator("#brief-consent")).toHaveAttribute("aria-invalid", "true");
  expect(posted).toEqual([]);
  await page.locator("#brief-consent").check();
  const receiving = page.waitForResponse((response) => response.url().endsWith("/api/rfq") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Сохранить тестовую заявку", exact: true }).click();
  const response = await receiving;
  expect(response.status(), await response.text()).toBe(201);
  const receipt = await response.json() as { id: string; duplicate: boolean; delivery: string };
  expect(receipt).toMatchObject({ duplicate: false, delivery: "local-staging" });
  await expect(page.getByTestId("brief-receipt")).toContainText("Тестовая заявка сохранена локально");
  const sent = response.request();
  const key = sent.headers()["idempotency-key"];
  expect(key).toBeTruthy();
  const filePath = path.resolve(".local/e2e-rfq", `${createHash("sha256").update(key).digest("hex")}.json`);
  const stored = JSON.parse(await readFile(filePath, "utf8")) as { envelope: { id: string; rfq: Record<string, unknown>; attachments: { name: string; size: number; contentBase64: string; sha256: string }[] }; state: string };
  const payload = stored.envelope.rfq;
  expect(payload).toMatchObject({ intake: "brief", description: "", attachmentCount: 1, consent: { accepted: true } });
  for (const field of ["gas", "inlet", "outlet", "flow"]) expect(payload).not.toHaveProperty(field);
  expect(stored.state).toBe("complete");
  expect(stored.envelope.id).toBe(receipt.id);
  expect(stored.envelope.attachments).toHaveLength(1);
  const attachment = stored.envelope.attachments[0];
  expect(attachment.name).toBe(briefFile.name);
  expect(attachment.size).toBe(briefFile.buffer.byteLength);
  expect(Buffer.from(attachment.contentBase64, "base64")).toEqual(briefFile.buffer);
  expect(attachment.sha256).toBe(createHash("sha256").update(briefFile.buffer).digest("hex"));
  expect((await stat(filePath)).mode & 0o077).toBe(0);
  const duplicate = await request.post("/api/rfq", {
    headers: { "Idempotency-Key": key, Origin: "http://127.0.0.1:3000" },
    multipart: { payload: JSON.stringify(payload), files: { name: briefFile.name, mimeType: briefFile.mimeType, buffer: briefFile.buffer } },
  });
  expect(duplicate.status(), await duplicate.text()).toBe(200);
  expect(await duplicate.json()).toMatchObject({ id: receipt.id, duplicate: true, delivery: "local-staging" });
  expect(await readFile(filePath, "utf8")).toContain(attachment.sha256);
});

test("desktop and mobile staging screenshots", async ({ page }) => {
  await mkdir(".local/screenshots", { recursive: true });
  await mkdir(".local/screenshots/catalog", { recursive: true });
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
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/equipment/");
    await page.screenshot({ path: `.local/screenshots/catalog/equipment-${width}.png`, fullPage: true });
    await page.goto("/equipment/nitrogen-boosters/");
    await page.screenshot({ path: `.local/screenshots/catalog/nitrogen-boosters-${width}.png`, fullPage: true });
  }
});
