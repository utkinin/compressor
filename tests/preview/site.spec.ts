import { mkdir, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { legacyPathPairs } from "../../src/lib/legacy-paths";
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

const mount = "/compressor";
const origin = "http://127.0.0.1:3100";
const artifact = path.resolve(".local/github-pages");
const core = ["/", "/solutions/nitrogen-booster-after-generator/", "/gases/nitrogen/", "/equipment/", ...equipmentRoutes, "/knowledge/how-to-select-nitrogen-booster/", "/knowledge/what-to-specify-for-gas-compressor/", "/industries/laser-cutting/", "/solutions/equipment-integration/", "/industries/equipment-manufacturers/", "/cases/compressor-integration/", "/documents/process-gas-questionnaire/", "/rfq/"];
const gasBranches = [
  { gas: "n2", fields: ["source", "purity", "inletRange", "flowProfile"] },
  { gas: "he", fields: ["mode", "recoveryScheme", "leakageSensitivity"] },
  { gas: "h2", fields: ["composition", "exRequirements", "hazardousArea", "leakageRequirements", "temperature"] },
  { gas: "o2", fields: ["purity", "oxygenCompatibility", "cleanliness"] },
  { gas: "co2", fields: ["inletTemperature", "phase", "operatingRange"] },
  { gas: "mixtures", fields: ["composition"] },
];

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

test("every exported HTML page, internal link and referenced asset is available under the project basePath", async ({ request }) => {
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
  await test.info().attach("preview-crawl.json", { body: JSON.stringify({ htmlPages: htmlFiles.length, checkedUrls: urls.size, urls: [...urls].sort() }, null, 2), contentType: "application/json" });
});

for (const width of [360, 390, 768, 1440]) {
  test(`static preview core routes hydrate and fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const failedAssets: string[] = [];
    page.on("response", (response) => { if (response.status() >= 400) failedAssets.push(`${response.status()} ${response.url()}`); });
    for (const route of core) {
      const response = await page.goto(`${mount}${route}`);
      expect(response?.status(), route).toBe(200);
      await expect(page.locator("main h1")).toHaveCount(1);
      await expect(page.locator("main h1")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width} ${route}`).toBe(true);
      expect((await page.locator('link[rel="canonical"]').getAttribute("href")) || "").toContain("https://utkinin.github.io/compressor/");
      if (route === "/rfq/") await expect(page.getByRole("heading", { name: "С каким газом работаем?" })).toBeVisible();
    }
    expect(errors).toEqual([]);
    expect(failedAssets).toEqual([]);
  });
}

test("static sitemap exposes equipment intents, rejects internal model routes and preserves finite aliases", async ({ request, page }) => {
  const robots = await request.get(`${mount}/robots.txt`);
  expect(await robots.text()).toContain("Disallow: /");
  expect(await robots.text()).toContain("https://utkinin.github.io/compressor/sitemap.xml");
  const sitemap = await request.get(`${mount}/sitemap.xml`);
  const xml = await sitemap.text();
  for (const term of sourceTerms) expect(xml.toLowerCase()).not.toContain(term.toLowerCase());
  for (const route of equipmentRoutes) expect(xml).toContain(`${mount}${route}`);
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const url = new URL(match[1]);
    expect(url.origin).toBe("https://utkinin.github.io");
    expect(url.pathname).toMatch(/^\/compressor\//);
    expect((await request.get(`${origin}${url.pathname}`)).status(), url.pathname).toBe(200);
  }
  await page.goto(`${mount}/gases/`);
  await expect(page.locator("main")).not.toContainText(/SF[₆6]|элегаз/);
  await page.goto(`${mount}/equipment/`);
  await expect(page.locator("main h1")).toHaveText("Компрессоры и бустеры для технологических газов");
  for (const route of ["/equipment/", ...equipmentRoutes]) {
    const html = await (await request.get(`${mount}${route}`)).text();
    expect(html, route).not.toMatch(/"@type"\s*:\s*"(?:Product|ProductGroup|IndividualProduct|Offer)"/);
  }
  for (const route of retiredRoutes) expect((await request.get(`${mount}${route}`)).status(), route).toBe(404);
  for (const route of ["/documents/", ...removedDocumentRoutes, "/news/", "/news/no-such-event/"]) expect((await request.get(`${mount}${route}`)).status(), route).toBe(404);
  await page.goto(`${mount}/solutions/nitrogen-for-laser-cutting/`);
  await expect(page.locator("main h1")).toHaveText("Система подачи азота для лазерной резки");
  await page.goto(`${mount}/solutions/nitrogen-booster-after-generator/`);
  await expect(page.locator("main h1")).toHaveText("Дожатие азота после генератора");
  await page.goto(`${mount}/solutions/helium-compression/`);
  await expect(page.locator("main h1")).toHaveText("Сжатие гелия");
  for (const alias of legacyPathPairs) {
    const response = await request.get(`${mount}${alias.source}`);
    const html = await response.text();
    expect(response.status(), alias.source).toBe(200);
    expect(html).toContain(`content="0;url=${mount}${alias.destination}"`);
    expect(html).toContain(`href="https://utkinin.github.io${mount}${alias.destination}"`);
  }
  await page.goto(`${mount}${legacyPathPairs[0].source}`);
  await expect(page).toHaveURL(`${origin}${mount}${legacyPathPairs[0].destination}`);
});

test("preview navigation and six featured knowledge articles use customer language and useful links", async ({ page }) => {
  await page.goto(`${mount}/knowledge/`);
  const navigation = page.getByRole("navigation", { name: "Основная навигация" });
  await expect(navigation.locator("a:not(.header-rfq)")).toHaveText(["Оборудование", "Решения", "Технологические газы", "База знаний", "О компании", "Контакты"]);
  await expect(navigation.locator(".header-rfq")).toContainText("Подобрать компрессор");
  await expect(page.locator("main h1")).toHaveText("База знаний");
  await expect(page.locator(".page-hero .eyebrow")).toHaveText("Экспертный центр");
  await expect(page.locator(".page-hero")).toContainText("Практические материалы о компрессорах, технологических газах и подборе оборудования.");
  const featured = page.locator('[aria-labelledby="knowledge-start-title"]');
  await expect(featured.locator("article")).toHaveCount(6);
  await expect(page.getByTestId("knowledge-library").locator("article")).toHaveCount(19);
  for (const [slug, title] of featuredArticles) await expect(featured.getByRole("link", { name: title, exact: true })).toHaveAttribute("href", new RegExp(`${mount}/knowledge/${slug}/?$`));
  await page.getByLabel("Поиск по базе знаний", { exact: true }).fill("несуществующийпоисковыйзапрос");
  await expect(page.getByRole("heading", { name: "По этому запросу статьи не найдены" })).toBeVisible();
  await page.getByRole("button", { name: "Показать все материалы", exact: true }).click();
  await expect(page.getByTestId("knowledge-library").locator("article")).toHaveCount(19);
  for (const [slug, title] of featuredArticles) {
    await page.goto(`${mount}/knowledge/${slug}/`);
    await expect(page.locator("main h1")).toHaveText(title);
    expect((await page.locator("article.prose").innerText()).length, slug).toBeGreaterThan(1800);
    expect(await page.locator("article.prose h2").count(), slug).toBeGreaterThanOrEqual(5);
    expect(await page.locator('main svg[role="img"], main img[alt], main table').count(), `${slug}: explanatory visual`).toBeGreaterThan(0);
    for (const section of ["equipment", "solutions", "gases", "rfq"]) await expect(page.locator(`main a[href^="${mount}/${section}"]`).first(), `${slug}: ${section} link`).toBeVisible();
    const related = page.locator(`main a[href^="${mount}/knowledge/"]:not([href="${mount}/knowledge/"]):not([href="${mount}/knowledge/${slug}/"]):not([href="${mount}/knowledge/${slug}"])`);
    await expect(related.first(), `${slug}: related article`).toBeVisible();
  }
});

test("preview questionnaire copies, downloads and prints supplied parameters without sending contacts", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const writes: string[] = [];
  page.on("request", (request) => { if (!["GET", "HEAD"].includes(request.method()) || request.url().includes("/api/")) writes.push(request.url()); });
  await page.goto(`${mount}/documents/process-gas-questionnaire/`);
  await expect(page.locator("main h1")).toHaveText("Опросный лист на подбор газового компрессора");
  for (const field of gasBranches[0].fields) await page.locator(`#gas-${field}`).fill("Исходные данные заказчика");
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
  await page.getByLabel("Имя", { exact: true }).fill("QuestionnaireContactFixture");
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
  await expect(page.getByRole("button", { name: "Завершить демонстрацию", exact: true })).toBeVisible();
  await expect(page.locator('.rfq-consent input[type="checkbox"]')).not.toBeChecked();
  expect(writes).toEqual([]);
  expect(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage }, cookie: document.cookie }))).toEqual({ local: {}, session: {}, cookie: "" });
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

test("equipment RFQ demo completes only in memory, requires consent and never submits or stores contact data", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const writes: string[] = [];
  const requests: string[] = [];
  page.on("request", (request) => {
    requests.push(`${request.method()} ${request.url()} ${request.postData() || ""}`);
    if (!["GET", "HEAD"].includes(request.method()) || request.url().includes("/api/")) writes.push(`${request.method()} ${request.url()}`);
  });
  await page.goto(`${mount}/equipment/nitrogen-boosters/`);
  await page.locator('main a[href*="equipment=nitrogen-boosters"]').first().click();
  await expect(page.locator('input[name="gas"][value="n2"]')).toBeChecked();
  const rfqUrl = page.url();
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
  await expect(page.getByRole("heading", { name: "Предварительный вариант оборудования", exact: true })).toBeVisible();
  const preliminary = page.locator(".rfq-preliminary-data");
  await expect(preliminary).toContainText("Бустер азота высокого давления");
  await expect(preliminary).toContainText("Уточняется после инженерного расчёта");
  await expect(preliminary).toContainText("Требуется инженерное подтверждение");
  await page.getByLabel("Имя", { exact: true }).fill("PreviewContactFixture");
  await page.getByLabel("Компания", { exact: true }).fill("PreviewCompanyFixture");
  await page.getByLabel("Рабочий email", { exact: true }).fill("preview-fixture@example.test");
  const consent = page.locator('.rfq-consent input[type="checkbox"]');
  await expect(consent).not.toBeChecked();
  await page.getByRole("button", { name: "Завершить демонстрацию" }).click();
  await expect(consent).toHaveAttribute("aria-invalid", "true");
  await consent.focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Завершить демонстрацию" }).click();
  await expect(page.getByRole("heading", { name: "Демонстрация пройдена", exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Заявка не отправлена и не сохранена");
  expect(writes).toEqual([]);
  expect(requests.join("\n")).not.toMatch(/PreviewContactFixture|PreviewCompanyFixture|preview-fixture/);
  const storage = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage }, cookie: document.cookie, url: location.href }));
  expect(storage).toEqual({ local: {}, session: {}, cookie: "", url: rfqUrl });
  await page.reload();
  await expect(page.getByRole("heading", { name: "С каким газом работаем?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Демонстрация пройдена", exact: true })).toHaveCount(0);
});

test("SF₆ equipment opens an individual enquiry with editable mixture composition", async ({ page }) => {
  await page.goto(`${mount}/rfq/?equipment=sf6-compressors`);
  await expect(page.locator('input[name="gas"][value="mixtures"]')).toBeChecked();
  await expect(page.locator("#gas-composition")).toHaveValue("SF₆; чистота и примеси требуют уточнения");
  await page.locator("#gas-composition").fill("SF₆; состав и примеси по анализу заказчика");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await expect(page.getByRole("heading", { name: "Какое давление на входе?" })).toBeVisible();
});

test("preview static server cannot serve API, credentials, files outside the export or accept writes", async ({ request }) => {
  for (const target of ["/compressor/.env.local", "/compressor/api/rfq", "/compressor/nonexistent/", "/compressor/%2e%2e/%2e%2e/package.json", "/compressor/%5c..%5c.env.local"]) {
    expect((await request.get(`${origin}${target}`)).status(), target).toBeGreaterThanOrEqual(400);
  }
  expect((await request.post(`${mount}/rfq/`, { data: "blocked" })).status()).toBe(405);
});

test("preview desktop and mobile screenshots", async ({ page }) => {
  await mkdir(".local/screenshots/preview", { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto(`${mount}/`);
    await page.screenshot({ path: `.local/screenshots/preview/home-${width}.png` });
    await page.goto(`${mount}/rfq/`);
    await expect(page.getByRole("heading", { name: "С каким газом работаем?" })).toBeVisible();
    await page.screenshot({ path: `.local/screenshots/preview/rfq-${width}.png`, fullPage: true });
    await page.goto(`${mount}/equipment/`);
    await page.screenshot({ path: `.local/screenshots/preview/equipment-${width}.png`, fullPage: true });
    await page.goto(`${mount}/equipment/nitrogen-boosters/`);
    await page.screenshot({ path: `.local/screenshots/preview/nitrogen-boosters-${width}.png`, fullPage: true });
  }
});
