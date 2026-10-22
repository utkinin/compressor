import { mkdir, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { legacyPathPairs } from "../../src/lib/legacy-paths";

const mount = "/compressor";
const origin = "http://127.0.0.1:3100";
const artifact = path.resolve(".local/github-pages");
const core = ["/", "/solutions/nitrogen-booster-after-generator/", "/gases/nitrogen/", "/equipment/oil-free-reciprocating/", "/equipment/of2-of8-dp/", "/knowledge/how-to-select-nitrogen-booster/", "/knowledge/what-to-specify-for-gas-compressor/", "/industries/laser-cutting/", "/rfq/"];
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
  expect(htmlFiles.length).toBeGreaterThan(90);
  const urls = new Set<string>();
  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
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

test("static sitemap, robots, family provenance and finite legacy routes remain correct", async ({ request, page }) => {
  const robots = await request.get(`${mount}/robots.txt`);
  expect(await robots.text()).toContain("Disallow: /");
  expect(await robots.text()).toContain("https://utkinin.github.io/compressor/sitemap.xml");
  const sitemap = await request.get(`${mount}/sitemap.xml`);
  const xml = await sitemap.text();
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const url = new URL(match[1]);
    expect(url.origin).toBe("https://utkinin.github.io");
    expect(url.pathname).toMatch(/^\/compressor\//);
    expect((await request.get(`${origin}${url.pathname}`)).status(), url.pathname).toBe(200);
  }
  await page.goto(`${mount}/gases/`);
  await expect(page.locator("main")).not.toContainText(/SF[₆6]|элегаз/);
  await page.goto(`${mount}/equipment/of2-of8-dp/`);
  await expect(page.locator("main")).toContainText(/draft/i);
  const evidenceStatuses = await page.locator("main table tbody tr td:last-child").allTextContents();
  expect(evidenceStatuses.length).toBeGreaterThan(5);
  expect(evidenceStatuses.every((status) => status.trim() === "draft")).toBe(true);
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

for (const branch of gasBranches) {
  test(`preview query prefill and dynamic questions work for ${branch.gas}`, async ({ page }) => {
    await page.goto(`${mount}/rfq/?gas=${branch.gas}`);
    await expect(page.locator(`input[name="gas"][value="${branch.gas}"]`)).toBeChecked();
    for (const field of branch.fields) await page.locator(`#gas-${field}`).fill("Нужно уточнить по проекту");
    await page.getByRole("button", { name: "Продолжить" }).click();
    await expect(page.getByRole("heading", { name: "Какое давление на входе?" })).toBeVisible();
  });
}

test("demo RFQ completes only in memory, requires consent and never submits or stores contact data", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const writes: string[] = [];
  const requests: string[] = [];
  page.on("request", (request) => {
    requests.push(`${request.method()} ${request.url()} ${request.postData() || ""}`);
    if (!["GET", "HEAD"].includes(request.method()) || request.url().includes("/api/")) writes.push(`${request.method()} ${request.url()}`);
  });
  await page.goto(`${mount}/rfq/?gas=n2`);
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
  expect(storage).toEqual({ local: {}, session: {}, cookie: "", url: `${origin}${mount}/rfq/?gas=n2` });
  await page.reload();
  await expect(page.getByRole("heading", { name: "С каким газом работаем?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Демонстрация пройдена", exact: true })).toHaveCount(0);
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
  }
});
