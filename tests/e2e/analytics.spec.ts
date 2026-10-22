import { expect, test } from "@playwright/test";
import { GET } from "../../src/app/api/analytics-frame/route";

test("analytics stays unloaded when counter IDs are absent", async ({ page }) => {
  const analyticsRequests: string[] = [];
  page.on("request", (request) => {
    if (/googletagmanager|google-analytics|mc\.yandex/.test(request.url())) analyticsRequests.push(request.url());
  });
  await page.goto("/rfq/?email=fixture%40example.test");
  const adapter = await page.request.get("/api/analytics-frame");
  expect(adapter.status()).toBe(200);
  expect(adapter.headers()["content-security-policy"]).toContain("frame-ancestors 'self'");
  expect(adapter.headers()["content-security-policy"]).not.toContain("frame-ancestors 'none'");
  expect(adapter.headers()["referrer-policy"]).toBe("no-referrer");
  await expect(page.locator('iframe[title="Изолированный адаптер аналитики"]')).toHaveCount(0);
  await expect(page.locator('script[src*="googletagmanager"],script[src*="mc.yandex"]')).toHaveCount(0);
  expect(analyticsRequests).toEqual([]);
});

test("opaque analytics frame cannot read parent contacts, URL or referrer", async ({ page }) => {
  const previousGa = process.env.NEXT_PUBLIC_GA4_ID;
  const previousYm = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  let response: Response;
  try {
    process.env.NEXT_PUBLIC_GA4_ID = "G-TESTPRIVACY";
    process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID = "123456789";
    response = GET();
  } finally {
    if (previousGa === undefined) delete process.env.NEXT_PUBLIC_GA4_ID;
    else process.env.NEXT_PUBLIC_GA4_ID = previousGa;
    if (previousYm === undefined) delete process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
    else process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID = previousYm;
  }
  const adapterHtml = await response.text();
  const adapterHeaders = Object.fromEntries(response.headers.entries());
  const sdkRequests: { url: string; referrer: string }[] = [];
  await page.route("**/api/analytics-frame", (route) => route.fulfill({ status: 200, headers: adapterHeaders, body: adapterHtml }));
  await page.route(/https:\/\/(?:www\.googletagmanager\.com|mc\.yandex\.ru)\//, async (route) => {
    const request = route.request();
    sdkRequests.push({ url: request.url(), referrer: request.headers().referer || "" });
    await route.fulfill({ contentType: "application/javascript", body: `
      window.__adapterProbe = {referrer:document.referrer, frameUrl:location.href, parentDenied:false};
      try {window.__adapterProbe.parentUrl=parent.location.href;} catch {window.__adapterProbe.parentDenied=true;}
      try {window.__adapterProbe.parentForm=parent.document.querySelector('input')?.value;} catch {window.__adapterProbe.formDenied=true;}
    ` });
  });
  await page.goto("/rfq/?email=fixture%40example.test&phone=79990001122", { referer: "http://127.0.0.1:3000/private/fixture-contact?email=fixture%40example.test" });
  expect(await page.evaluate(() => location.search)).toContain("fixture");
  expect(await page.evaluate(() => document.referrer)).toContain("fixture-contact");
  await page.evaluate(() => {
    const frame = document.createElement("iframe");
    frame.id = "analytics-privacy-probe";
    frame.title = "Test opaque analytics adapter";
    frame.sandbox.add("allow-scripts");
    frame.referrerPolicy = "no-referrer";
    frame.src = "/api/analytics-frame";
    document.body.append(frame);
  });
  await expect.poll(() => sdkRequests.length).toBe(2);
  const frame = page.frame({ url: /\/api\/analytics-frame$/ });
  expect(frame).not.toBeNull();
  if (!frame) throw new Error("Analytics sandbox did not load");
  const privacy = await frame.evaluate(() => (window as typeof window & {
    __adapterProbe?: { referrer: string; frameUrl: string; parentDenied: boolean; formDenied: boolean; parentUrl?: string; parentForm?: string };
  }).__adapterProbe);
  expect(privacy).toMatchObject({ referrer: "", parentDenied: true, formDenied: true });
  expect(privacy?.parentUrl).toBeUndefined();
  expect(privacy?.parentForm).toBeUndefined();
  expect(JSON.stringify(sdkRequests)).not.toMatch(/fixture|79990001122|example\.test|private/);
  expect(sdkRequests.every((request) => request.referrer === "")).toBe(true);
  await page.evaluate(() => {
    const iframe = document.querySelector<HTMLIFrameElement>("#analytics-privacy-probe");
    iframe?.contentWindow?.postMessage({
      name: "rfq_submit",
      properties: { gas: "n2", step: 5, email: "fixture@example.test", phone: "79990001122", path: "/rfq/?email=fixture@example.test" },
    }, "*");
  });
  const eventCalls = () => frame.evaluate(() => {
    const queue = (window as typeof window & { dataLayer?: ArrayLike<unknown>[] }).dataLayer || [];
    return queue.map((row) => Array.from(row));
  });
  await expect.poll(async () => (await eventCalls()).filter((call) => call[0] === "event").length).toBe(1);
  const calls = await eventCalls();
  expect(calls.find((call) => call[0] === "event")).toEqual([
    "event", "rfq_submit", { gas: "n2", step: 5, page_location: "http://127.0.0.1:3000/analytics/events", page_referrer: "" },
  ]);
  expect(JSON.stringify(calls)).not.toMatch(/fixture|79990001122|private/);
});
