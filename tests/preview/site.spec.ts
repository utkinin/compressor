import { mkdir, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { briefFile, expectBriefIntake, fillBriefContact } from "../support/brief-v21";
import { expect, test } from "@playwright/test";
import { expectProjectLandings } from "../support/landing-v21";
import { expectHomeV21 } from "../support/home-v21";
import { legacyPathPairs } from "../../src/lib/legacy-paths";
import { sourceModels } from "../../src/content/internal/source-model-registry";

const mount = "/compressor";
const origin = "http://127.0.0.1:3100";
const artifact = path.resolve(".local/github-pages");
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
const gasBranches = [
  { gas: "n2", fields: ["source", "purity", "inletRange", "flowProfile"] },
  { gas: "he", fields: ["mode", "recoveryScheme", "leakageSensitivity"] },
  { gas: "h2", fields: ["composition", "exRequirements", "hazardousArea", "leakageRequirements", "temperature"] },
  { gas: "o2", fields: ["purity", "oxygenCompatibility", "cleanliness"] },
  { gas: "co2", fields: ["inletTemperature", "phase", "operatingRange"] },
  { gas: "mixtures", fields: ["composition"] },
];
const core = ["/", "/solutions/nitrogen-booster-after-generator/", "/solutions/nitrogen-for-laser-cutting/", "/solutions/helium-recovery/", "/equipment/", ...equipmentRoutes, "/gases/", "/gases/nitrogen/", "/knowledge/", "/knowledge/how-to-select-nitrogen-booster/", "/industries/laser-cutting/", "/documents/process-gas-questionnaire/", "/rfq/"];

function expectCustomerLanguage(html: string, route: string) {
  const metadata = [...html.matchAll(/<meta\b[^>]*>/gi)].filter(([tag]) => /\b(?:name|property)="(?:description|og:title|og:description|twitter:title|twitter:description)"/i.test(tag)).map(([tag]) => tag.match(/\bcontent="([^"]*)"/i)?.[1] || "").join(" ");
  const accessibleCopy = [...html.matchAll(/\b(?:aria-label|aria-description|alt|title)="([^"]*)"/gi)].map((match) => match[1]).join(" ");
  const text = html.replace(/<(?:script|style)\b[^>]*>[\s\S]*?<\/(?:script|style)>/gi, " ").replace(/<[^>]*>/g, " ");
  const publicCopy = `${metadata} ${accessibleCopy} ${text}`.replace(/\s+/g, " ").toLowerCase();
  for (const term of developerLanguage) expect(publicCopy, `${route}: internal development language`).not.toContain(term);
}

async function filesIn(directory: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error("Symlink in static artifact");
    if (entry.isDirectory()) result.push(...await filesIn(file));
    else result.push(file);
  }
  return result;
}

async function fillNitrogen(page: import("@playwright/test").Page) {
  await page.locator("#gas-source").fill("PSA — тестовый генератор");
  await page.locator("#gas-purity").fill("99,9 %; состав примесей уточняется");
  await page.locator("#gas-inletRange").fill("5–7 bar(g)");
  await page.locator("#gas-flowProfile").fill("20 средний / 30 пиковый Nm³/h");
}

test("every exported HTML page and internal asset stays inside the preview basePath", async ({ request }) => {
  const files = await filesIn(artifact);
  expect(files.some((file) => /(?:^|\/)\.env(?:\.|$)|(?:^|\/)api\//.test(path.relative(artifact, file)))).toBe(false);
  const htmlFiles = files.filter((file) => file.endsWith(".html"));
  expect(htmlFiles.length).toBeGreaterThan(80);
  const urls = new Set<string>();
  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    expectCustomerLanguage(html, file);
    for (const term of sourceTerms) expect(html.toLowerCase(), `${file}: internal source term`).not.toContain(term.toLowerCase());
    const relative = path.relative(artifact, file).replaceAll(path.sep, "/");
    const route = relative === "index.html" ? "/" : relative.endsWith("/index.html") ? `/${relative.slice(0, -10)}` : `/${relative}`;
    if (relative !== "404.html" && !relative.startsWith("_not-found/")) urls.add(`${mount}${route}`);
    expect(html, file).toMatch(/<meta name="robots" content="noindex(?:, (?:no)?follow)?"/);
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const value = match[1].replaceAll("&amp;", "&");
      if (!value.startsWith("/") || value.startsWith("//")) continue;
      expect(value.startsWith(`${mount}/`) || value === mount, `${file}: ${value}`).toBe(true);
      expect(value, file).not.toMatch(/\/api\//);
      urls.add(value.split(/[?#]/)[0]);
    }
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
    if (canonical) expect(canonical[1], file).toMatch(/^https:\/\/utkinin\.github\.io\/compressor\//);
  }
  for (const url of urls) expect((await request.get(`${origin}${url}`)).status(), url).toBe(200);
});

for (const width of [360, 390, 768, 1440]) {
  test(`static preview core routes hydrate and fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    const errors: string[] = [];
    const failedAssets: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => { if (response.status() >= 400) failedAssets.push(`${response.status()} ${response.url()}`); });
    for (const route of core) {
      const response = await page.goto(`${mount}${route}`);
      expect(response?.status(), route).toBe(200);
      await expect(page.locator("main h1"), route).toHaveCount(1);
      await expect(page.locator("main h1"), route).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width} ${route}`).toBe(true);
      expect((await page.locator('link[rel="canonical"]').getAttribute("href")) || "").toContain("https://utkinin.github.io/compressor/");
    }
    expect(errors).toEqual([]);
    expect(failedAssets).toEqual([]);
  });
}

test("static sitemap keeps public equipment routes, finite aliases and Hero v3 solution H1s", async ({ request, page }) => {
  const robots = await request.get(`${mount}/robots.txt`);
  expect(await robots.text()).toContain("Disallow: /");
  const sitemap = await request.get(`${mount}/sitemap.xml`);
  const xml = await sitemap.text();
  for (const term of sourceTerms) expect(xml.toLowerCase()).not.toContain(term.toLowerCase());
  for (const route of equipmentRoutes) expect(xml).toContain(`${mount}${route}`);
  for (const route of retiredRoutes) expect((await request.get(`${mount}${route}`)).status(), route).toBe(404);
  for (const route of ["/documents/", ...removedDocumentRoutes, "/news/", "/news/no-such-event/"]) expect((await request.get(`${mount}${route}`)).status(), route).toBe(404);
  const solutionTitles = [
    ["/solutions/nitrogen-for-laser-cutting/", "Нужен газ для лазерного станка?"],
    ["/solutions/nitrogen-booster-after-generator/", "Не хватает давления после генератора азота?"],
    ["/solutions/helium-recovery/", "Нужно вернуть гелий в процесс?"],
    ["/solutions/process-gas-compressor/", "Нужно сжать CO₂ или другой технологический газ?"],
    ["/solutions/equipment-integration/", "Нужно встроить компрессор в оборудование?"],
  ] as const;
  for (const [route, title] of solutionTitles) {
    await page.goto(`${mount}${route}`);
    await expect(page.locator("main h1")).toHaveText(title);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator("[data-process-id]")).toBeVisible();
  }
  for (const alias of legacyPathPairs) {
    const response = await request.get(`${mount}${alias.source}`);
    expect(response.status(), alias.source).toBe(200);
    const html = await response.text();
    expect(html).toContain(`content="0;url=${mount}${alias.destination}"`);
  }
});

test("preview homepage uses Hero v3 and keeps specialist SF₆ external", async ({ page }) => {
  await page.goto(`${mount}/`);
  await expectHomeV21(page, mount);
  await expect(page.locator(".home-product-visual")).toBeVisible();
  await expect(page.locator(".home-pain-link")).toHaveCount(5);
});

test("project gases and linked nitrogen intents remain distinct", async ({ page }) => {
  await expectProjectLandings(page, mount);
});

test("preview navigation exposes seven sections plus phone and RFQ", async ({ page }) => {
  await page.goto(`${mount}/knowledge/`);
  const navigation = page.getByRole("navigation", { name: "Основная навигация" });
  await expect(navigation.locator("a:not(.header-rfq):not(.header-phone)")).toHaveText(["Оборудование", "Решения", "Интеграторам", "Технологические газы", "База знаний", "О компании", "Контакты"]);
  await expect(navigation.locator(".header-phone")).toHaveText("+7 (812) 309-05-12");
  await expect(navigation.locator(".header-phone")).toHaveAttribute("href", "tel:+78123090512");
  await expect(navigation.locator(".header-rfq")).toContainText("Подобрать компрессор");
  const featured = page.locator('[aria-labelledby="knowledge-start-title"]');
  await expect(featured.locator("article")).toHaveCount(6);
  for (const [slug, title] of featuredArticles) await expect(featured.getByRole("link", { name: title, exact: true })).toHaveAttribute("href", new RegExp(`${mount}/knowledge/${slug}/?$`));
});

test("preview questionnaire exports parameters and never sends before consent", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const writes: string[] = [];
  page.on("request", (request) => { if (!["GET", "HEAD"].includes(request.method()) || request.url().includes("/api/")) writes.push(request.url()); });
  await page.goto(`${mount}/documents/process-gas-questionnaire/`);
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
  const sheet = await page.locator("#questionnaire-text").inputValue();
  for (const value of ["6", "40", "80"]) expect(sheet).toContain(value);
  await page.getByRole("button", { name: "Скопировать данные", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(sheet);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Скачать заполненный лист", exact: true }).click();
  expect(await (await download).path()).toBeTruthy();
  const submit = page.getByRole("button", { name: "Завершить демонстрацию", exact: true });
  await expect(page.locator('.rfq-shell:visible .rfq-consent input[type="checkbox"]')).not.toBeChecked();
  await expect(submit).toBeDisabled();
  expect(writes).toEqual([]);
});

for (const branch of gasBranches) {
  test(`preview query prefill and dynamic questions work for ${branch.gas}`, async ({ page }) => {
    await page.goto(`${mount}/rfq/?gas=${branch.gas}`);
    await expect(page.locator(`input[name="gas"][value="${branch.gas}"]`)).toBeChecked();
    for (const field of branch.fields) await page.locator(`#gas-${field}`).fill("Нужно уточнить по проекту");
    await page.getByRole("button", { name: "Продолжить" }).click();
    await expect(page.getByRole("heading", { name: "Какое давление на входе?" })).toBeVisible();
  });
}

test("equipment RFQ preview is disabled until consent, then completes only in memory", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const writes: string[] = [];
  page.on("request", (request) => { if (!["GET", "HEAD"].includes(request.method()) || request.url().includes("/api/")) writes.push(request.url()); });
  await page.goto(`${mount}/equipment/nitrogen-boosters/`);
  await page.locator('main a[href*="equipment=nitrogen-boosters"]').first().click();
  for (const field of gasBranches[0].fields) await page.locator(`#gas-${field}`).fill("Тестовые исходные данные");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByLabel("Давление на входе P₁", { exact: true }).fill("6");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByLabel("Давление на выходе P₂", { exact: true }).fill("20");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByLabel("Производительность Q", { exact: true }).fill("25");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByRole("radio", { name: /Непрерывный 24\/7/ }).check();
  await page.getByRole("button", { name: "Проверить параметры подбора" }).click();
  await page.locator(".rfq-shell:visible").getByLabel("Имя", { exact: true }).fill("PreviewContactFixture");
  await page.locator(".rfq-shell:visible").getByLabel("Компания", { exact: true }).fill("PreviewCompanyFixture");
  await page.locator(".rfq-shell:visible").getByLabel("Рабочий email", { exact: true }).fill("preview-fixture@example.test");
  const consent = page.locator('.rfq-shell:visible .rfq-consent input[type="checkbox"]');
  const submit = page.getByRole("button", { name: "Завершить демонстрацию", exact: true });
  await expect(consent).not.toBeChecked();
  await expect(submit).toBeDisabled();
  expect(writes).toEqual([]);
  await consent.check();
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByRole("heading", { name: "Демонстрация пройдена", exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Заявка не отправлена и не сохранена");
  expect(writes).toEqual([]);
});

test("SF₆ remains an external specialist reference", async ({ page }) => {
  await page.goto(`${mount}/equipment/sf6-compressors/`);
  const reference = page.getByTestId("sf6-specialist-reference");
  await expect(page.locator("main h1")).toHaveText("Оборудование для SF₆ — SF6RUS");
  await expect(reference.locator('a[href="https://www.sf6rus.ru/products/0000004/"]').first()).toHaveAttribute("href", "https://www.sf6rus.ru/products/0000004/");
  await expect(reference.locator(`a[href^="${mount}/rfq"]`)).toHaveCount(0);
});

test("preview static server cannot serve API, credentials or accept writes", async ({ request }) => {
  for (const target of ["/compressor/.env.local", "/compressor/api/rfq", "/compressor/nonexistent/", "/compressor/%2e%2e/%2e%2e/package.json"]) expect((await request.get(`${origin}${target}`)).status(), target).toBeGreaterThanOrEqual(400);
  expect((await request.post(`${mount}/rfq/`, { data: "blocked" })).status()).toBe(405);
});

test("brief preview is disabled until consent and never sends or stores the file", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", (request) => { if (!["GET", "HEAD"].includes(request.method()) || request.url().includes("/api/")) writes.push(request.url()); });
  await page.goto(`${mount}/rfq/?intake=brief`);
  await expectBriefIntake(page);
  await page.locator("#brief-files").setInputFiles(briefFile);
  await fillBriefContact(page);
  const consent = page.locator("#brief-consent");
  const submit = page.getByRole("button", { name: "Завершить демонстрацию", exact: true });
  await expect(consent).not.toBeChecked();
  await expect(submit).toBeDisabled();
  expect(writes).toEqual([]);
  await consent.check();
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByTestId("brief-receipt")).toContainText("Описание и файлы не отправлены и не сохранены");
  expect(writes).toEqual([]);
  const storage = JSON.stringify(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } })));
  expect(storage).not.toContain("brief-fixture@example.test");
  expect(storage).not.toContain(briefFile.name);
});

test("preview desktop and mobile screenshots", async ({ page }) => {
  await mkdir(".local/screenshots/preview", { recursive: true });
  for (const width of [1366, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 768 });
    await page.goto(`${mount}/`);
    await page.screenshot({ path: `.local/screenshots/preview/home-${width}.png` });
    await page.goto(`${mount}/equipment/`);
    await page.screenshot({ path: `.local/screenshots/preview/equipment-${width}.png`, fullPage: true });
  }
});
