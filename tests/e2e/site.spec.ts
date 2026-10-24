import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { briefFile, expectBriefIntake, fillBriefContact } from "../support/brief-v21";
import { expectProjectLandings } from "../support/landing-v21";
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

async function fillNitrogen(page: Page) {
  await page.locator("#gas-source").fill("PSA — тестовый генератор");
  await page.locator("#gas-purity").fill("99,9 %; состав примесей уточняется");
  await page.locator("#gas-inletRange").fill("5–7 bar(g)");
  await page.locator("#gas-flowProfile").fill("20 средний / 30 пиковый Nm³/h");
}

const coreRoutes = [
  "/", "/solutions/nitrogen-booster-after-generator/", "/solutions/nitrogen-for-laser-cutting/", "/solutions/helium-recovery/",
  "/equipment/", "/equipment/nitrogen-boosters/", "/gases/", "/gases/nitrogen/", "/knowledge/",
  "/knowledge/how-to-select-nitrogen-booster/", "/industries/laser-cutting/", "/documents/process-gas-questionnaire/", "/rfq/",
];

const gasBranches = [
  { gas: "n2", expected: "Источник азота", fields: ["source", "purity", "inletRange", "flowProfile"] },
  { gas: "he", expected: "Свежий газ или recovery?", fields: ["mode", "recoveryScheme", "leakageSensitivity"] },
  { gas: "h2", expected: "Состав и чистота водорода", fields: ["composition", "exRequirements", "hazardousArea", "leakageRequirements", "temperature"] },
  { gas: "o2", expected: "Требования к кислородной совместимости", fields: ["purity", "oxygenCompatibility", "cleanliness"] },
  { gas: "co2", expected: "Температура CO₂ на входе", fields: ["inletTemperature", "phase", "operatingRange"] },
  { gas: "mixtures", expected: "Состав смеси и доли компонентов", fields: ["composition"] },
];

test("Hero v3 is broad, zero-scroll and routes to five explicit pains", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  await expectHomeV21(page);
  const hero = page.locator(".home-hero-v3");
  await expect(hero.getByRole("heading", { level: 1 })).toHaveText("Компрессоры и бустеры для технологических газов");
  await expect(hero.locator(".home-product-visual")).toBeVisible();
  const painLinks = hero.locator(".home-pain-link");
  await expect(painLinks).toHaveCount(5);
  for (let index = 0; index < 4; index++) {
    const box = await painLinks.nth(index).boundingBox();
    expect(box, `pain ${index + 1} bounding box`).toBeTruthy();
    expect(box!.y + box!.height, `pain ${index + 1} must be above 768px fold`).toBeLessThanOrEqual(768);
  }
  const visualBox = await hero.locator(".home-product-visual").boundingBox();
  expect(visualBox).toBeTruthy();
  expect(visualBox!.y, "product visual starts above fold").toBeLessThan(768);
});

test("Hero v3 mobile exposes pain paths before long homepage content", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const hero = page.locator(".home-hero-v3");
  await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(hero.getByRole("link", { name: /Подобрать компрессор/ })).toBeVisible();
  await expect(hero.locator(".home-pain-link")).toHaveCount(5);
  const firstLongSection = page.locator('[data-home-section="scenarios"]');
  const painBottom = await hero.locator(".home-pain-link").nth(2).boundingBox();
  const sectionTop = await firstLongSection.boundingBox();
  expect(painBottom && sectionTop).toBeTruthy();
  expect(painBottom!.y + painBottom!.height).toBeLessThan(sectionTop!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("priority Solution pages own problem-led H1s and use light process visuals", async ({ page }) => {
  const expectations = [
    ["/solutions/nitrogen-booster-after-generator/", "Не хватает давления после генератора азота?"],
    ["/solutions/nitrogen-for-laser-cutting/", "Нужен газ для лазерного станка?"],
    ["/solutions/helium-recovery/", "Нужно вернуть гелий в процесс?"],
    ["/solutions/process-gas-compressor/", "Нужно сжать CO₂ или другой технологический газ?"],
    ["/solutions/equipment-integration/", "Нужно встроить компрессор в оборудование?"],
  ] as const;
  for (const [route, title] of expectations) {
    await page.goto(route);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator("main h1")).toHaveText(title);
    await expect(page.locator(".solution-process-visual")).toBeVisible();
    await expect(page.locator("main")).not.toContainText(/7\s*(?:bar|бар).*25\s*(?:bar|бар)/i);
  }
  await page.goto("/solutions/nitrogen-for-laser-cutting/");
  await expect(page.locator("main")).toContainText("компрессор → ресивер → осушитель → фильтрация → лазер");
  await expect(page.locator("main")).toContainText("источник N₂ / генератор → бустер → ресивер → лазер");
});

for (const width of [360, 390, 768, 1440]) {
  test(`core journeys fit ${width}px without horizontal overflow`, async ({ page }) => {
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
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `horizontal overflow at ${route} ${width}px`).toBe(true);
    }
    expect(runtimeErrors).toEqual([]);
  });
}

test("published route graph has no broken links, fake document pages or developer language", async ({ request }) => {
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
    for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
      const href = match[1].replaceAll("&amp;", "&");
      if (!href.startsWith("/") || href.startsWith("//") || href.startsWith("/api/") || href.startsWith("/_next/")) continue;
      const localPath = href.split(/[?#]/)[0];
      if (localPath && !visited.has(localPath)) pending.push(localPath);
    }
  }
  expect(visited.size).toBeGreaterThan(55);
  for (const route of ["/documents/", ...removedDocumentRoutes, "/news/", "/news/no-such-event/", ...retiredRoutes]) expect((await request.get(route)).status(), route).toBe(404);
});

test("equipment catalog exposes public intents only and keeps schema conservative", async ({ page, request }) => {
  await page.goto("/equipment/");
  await expect(page.locator("main h1")).toHaveText("Компрессоры и бустеры для технологических газов");
  await expect(page.locator(".equipment-catalog-card")).toHaveCount(5);
  await expect(page.locator(".equipment-card-grid")).not.toContainText("SF₆");
  for (const route of equipmentRoutes) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    const html = await response.text();
    expectPublicCatalogCopy(html, route);
    expect(html, route).not.toMatch(/1[–-]500\+|150\+\s*(?:bar|бар)/);
  }
  for (const route of sourceRoutes) expect((await request.get(route)).status(), route).toBe(404);
});

test("project gas URLs and linked nitrogen intents remain distinct", async ({ page }) => {
  await expectProjectLandings(page);
});

test("header exposes six navigation sections, phone and RFQ separately", async ({ page }) => {
  await page.goto("/knowledge/");
  const navigation = page.getByRole("navigation", { name: "Основная навигация" });
  await expect(navigation.locator("a:not(.header-rfq):not(.header-phone)")).toHaveText(["Оборудование", "Решения", "Технологические газы", "База знаний", "О компании", "Контакты"]);
  await expect(navigation.locator(".header-phone")).toHaveText("+7 (812) 309-05-12");
  await expect(navigation.locator(".header-phone")).toHaveAttribute("href", "tel:+78123090512");
  await expect(navigation.locator(".header-rfq")).toContainText("Подобрать компрессор");
});

test("knowledge hub keeps six primary substantial articles and related links", async ({ page }) => {
  await page.goto("/knowledge/");
  await expect(page.locator("main h1")).toHaveText("База знаний");
  await expect(page.locator(".page-hero .eyebrow")).toHaveText("Экспертный центр");
  const featured = page.locator('[aria-labelledby="knowledge-start-title"]');
  await expect(featured.locator("article")).toHaveCount(6);
  for (const [slug, title] of featuredArticles) {
    await expect(featured.getByRole("link", { name: title, exact: true })).toHaveAttribute("href", new RegExp(`/knowledge/${slug}/?$`));
    await page.goto(`/knowledge/${slug}/`);
    await expect(page.locator("main h1")).toHaveText(title);
    expect((await page.locator("article.prose").innerText()).length, slug).toBeGreaterThan(1800);
    expect(await page.locator("article.prose h2").count(), slug).toBeGreaterThanOrEqual(5);
    expect(await page.locator('main svg[role="img"], main img[alt], main table').count(), `${slug}: explanatory visual`).toBeGreaterThan(0);
    await page.goto("/knowledge/");
  }
});

test("questionnaire exports supplied parameters without contacts and does not send before consent", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const writes: string[] = [];
  page.on("request", (request) => { if (!["GET", "HEAD"].includes(request.method())) writes.push(request.url()); });
  await page.goto("/documents/process-gas-questionnaire/");
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
  for (const value of ["6", "40", "80", ...Object.values(optionalProjectData)]) expect(sheet).toContain(value);
  expect(sheet).not.toContain("QuestionnaireContactFixture");
  await page.getByRole("button", { name: "Скопировать данные", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(sheet);
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Скачать заполненный лист", exact: true }).click();
  expect(await (await downloaded).path()).toBeTruthy();
  const submit = page.getByRole("button", { name: "Сохранить тестовую заявку", exact: true });
  await expect(page.locator('.rfq-shell:visible .rfq-consent input[type="checkbox"]')).not.toBeChecked();
  await expect(submit).toBeDisabled();
  expect(writes).toEqual([]);
});

for (const branch of gasBranches) {
  test(`RFQ ${branch.gas} asks its required technical questions`, async ({ page }) => {
    await page.goto(`/rfq/?gas=${branch.gas}`);
    await expect(page.locator(`input[name="gas"][value="${branch.gas}"]`)).toBeChecked();
    await expect(page.getByLabel(branch.expected, { exact: true })).toBeVisible();
    for (const field of branch.fields) await page.locator(`#gas-${field}`).fill("Требует уточнения по проекту");
    await page.getByRole("button", { name: "Продолжить" }).click();
    await expect(page.getByRole("heading", { name: "Какое давление на входе?" })).toBeVisible();
  });
}

test("RFQ rejects P₂ not greater than P₁", async ({ page }) => {
  await page.goto("/rfq/");
  await fillNitrogen(page);
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByLabel("Давление на входе P₁", { exact: true }).fill("6");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByLabel("Давление на выходе P₂", { exact: true }).fill("5");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await expect(page.getByLabel("Давление на выходе P₂", { exact: true })).toHaveAttribute("aria-invalid", "true");
});

test("qualified RFQ is physically disabled until explicit consent and then persists once", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const submitted: unknown[] = [];
  page.on("request", (request) => { if (request.url().endsWith("/api/rfq") && request.method() === "POST") submitted.push(request.postDataJSON() as unknown); });
  await page.goto("/gases/nitrogen/?utm_source=e2e");
  await page.getByRole("link", { name: /Подобрать компрессор для N₂/ }).click();
  await fillNitrogen(page);
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByLabel("Давление на входе P₁", { exact: true }).fill("6");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByLabel("Давление на выходе P₂", { exact: true }).fill("20");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByLabel("Производительность Q", { exact: true }).fill("25");
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByRole("radio", { name: /Непрерывный 24\/7/ }).check();
  await page.getByRole("button", { name: "Проверить параметры подбора" }).click();
  await page.locator(".rfq-shell:visible").getByLabel("Имя", { exact: true }).fill("Тестовый инженер");
  await page.locator(".rfq-shell:visible").getByLabel("Компания", { exact: true }).fill("Тестовая организация E2E");
  await page.locator(".rfq-shell:visible").getByLabel("Рабочий email", { exact: true }).fill("engineer@example.test");
  const consent = page.locator('.rfq-shell:visible .rfq-consent input[type="checkbox"]');
  const submit = page.getByRole("button", { name: "Сохранить тестовую заявку", exact: true });
  await expect(consent).not.toBeChecked();
  await expect(submit).toBeDisabled();
  expect(submitted).toHaveLength(0);
  await consent.check();
  await expect(submit).toBeEnabled();
  const received = page.waitForResponse((response) => response.url().endsWith("/api/rfq") && response.request().method() === "POST");
  await submit.click();
  const response = await received;
  expect(response.ok(), `RFQ ${response.status()}: ${await response.text()}`).toBe(true);
  await expect(page.getByRole("heading", { name: "Тестовая заявка сохранена локально" })).toBeVisible();
  expect(submitted).toHaveLength(1);
  expect(submitted[0]).toMatchObject({ gas: "n2", inlet: { value: 6 }, outlet: { value: 20 }, flow: { value: 25 }, duty: "continuous", consent: { accepted: true } });
});

test("file-only brief is disabled until consent and persists private bytes once", async ({ page, request }) => {
  await page.goto("/rfq/?intake=brief&source=%2Fsolutions%2Fequipment-integration%2F");
  await expectBriefIntake(page);
  await page.locator("#brief-files").setInputFiles(briefFile);
  await fillBriefContact(page);
  const posted: string[] = [];
  page.on("request", (submission) => { if (submission.url().endsWith("/api/rfq") && submission.method() === "POST") posted.push(submission.url()); });
  const consent = page.locator("#brief-consent");
  const submit = page.getByRole("button", { name: "Сохранить тестовую заявку", exact: true });
  await expect(consent).not.toBeChecked();
  await expect(submit).toBeDisabled();
  expect(posted).toEqual([]);
  await consent.check();
  await expect(submit).toBeEnabled();
  const receiving = page.waitForResponse((response) => response.url().endsWith("/api/rfq") && response.request().method() === "POST");
  await submit.click();
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
  expect(stored.envelope.rfq).toMatchObject({ intake: "brief", description: "", attachmentCount: 1, consent: { accepted: true } });
  expect(stored.state).toBe("complete");
  expect(stored.envelope.attachments).toHaveLength(1);
  const attachment = stored.envelope.attachments[0];
  expect(Buffer.from(attachment.contentBase64, "base64")).toEqual(briefFile.buffer);
  expect((await stat(filePath)).mode & 0o077).toBe(0);
  const duplicate = await request.post("/api/rfq", {
    headers: { "Idempotency-Key": key, Origin: "http://127.0.0.1:3000" },
    multipart: { payload: JSON.stringify(stored.envelope.rfq), files: { name: briefFile.name, mimeType: briefFile.mimeType, buffer: briefFile.buffer } },
  });
  expect(duplicate.status(), await duplicate.text()).toBe(200);
  expect(await duplicate.json()).toMatchObject({ id: receipt.id, duplicate: true, delivery: "local-staging" });
});

test("mobile navigation remains keyboard accessible", async ({ page }) => {
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
});

test("desktop and mobile staging screenshots", async ({ page }) => {
  await mkdir(".local/screenshots", { recursive: true });
  await mkdir(".local/screenshots/catalog", { recursive: true });
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  await page.screenshot({ path: ".local/screenshots/home-1366-fold.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({ path: ".local/screenshots/home-390-fold.png" });
  await page.goto("/rfq/");
  await page.screenshot({ path: ".local/screenshots/rfq-390.png", fullPage: true });
});
