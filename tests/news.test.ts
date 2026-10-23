import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { equipment, solutions, type News } from "../src/content";
import { news, publicNews } from "../src/content/news";
import { NewsSection } from "../src/components/news-section";
import NewsPage, { generateMetadata, generateStaticParams } from "../src/app/news/[slug]/page";

/** Synthetic validation only; never added to the production content collection. */
function fixture(overrides: Partial<News> = {}): News {
  return {
    id: "synthetic-event", slug: "synthetic-event", title: "Синтетическое событие для проверки шаблона",
    summary: "Текст проверочного события существует только в тесте и не описывает поставку, сертификат или проект Lanfor.",
    editorialState: "approved", kind: "lanfor-event", organization: "Lanfor Gas Systems", eventType: "testing",
    eventDate: "2026-01-10", published: "2026-01-11", updated: "2026-01-12",
    verification: {
      status: "confirmed", approvedBy: "synthetic-private-approver",
      source: { title: "Synthetic evidence fixture", url: "https://evidence.example.test/event", locator: "Synthetic section 1" },
    },
    sections: [{ title: "Описание проверочного события", paragraphs: ["Содержательная тестовая секция проверяет вывод даты, текста и связанных страниц без создания реальной новости."] }],
    equipmentIds: [equipment[0].id], solutionIds: [solutions[0].id], gasIds: [],
    ...overrides,
  };
}

function routeIdentity(href: string): string {
  const url = new URL(href, "https://example.test");
  return `${url.pathname.replace(/\/+$/, "") || "/"}${url.hash}`;
}

afterEach(() => {
  news.splice(0);
});

describe("real-event news publication", () => {
  it("has no fabricated records, public route parameters or empty About section", () => {
    expect(news).toEqual([]);
    expect(publicNews()).toEqual([]);
    expect(generateStaticParams()).toEqual([]);
    expect(NewsSection()).toBeNull();
  });

  it("returns 404 and no placeholder metadata for an unknown event", async () => {
    const params = Promise.resolve({ slug: "unknown-future-event" });
    expect(await generateMetadata({ params })).toEqual({});
    await expect(NewsPage({ params })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it.each(["draft", "review"] as const)("rejects an event still in %s", (editorialState) => {
    expect(publicNews([fixture({ editorialState })])).toEqual([]);
  });

  it("does not publish an unconfirmed future event or its source metadata", async () => {
    const item = fixture({ eventDate: "2099-01-01", verification: { status: "pending" } });
    news.push(item);
    expect(publicNews()).toEqual([]);
    expect(generateStaticParams()).toEqual([]);
    expect(NewsSection()).toBeNull();
    expect(await generateMetadata({ params: Promise.resolve({ slug: item.slug }) })).toEqual({});
    await expect(NewsPage({ params: Promise.resolve({ slug: item.slug }) })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("keeps a future publication out of pages and metadata", async () => {
    const item = fixture({ published: "2099-01-01", updated: "2099-01-01" });
    news.push(item);
    expect(publicNews()).toEqual([]);
    expect(await generateMetadata({ params: Promise.resolve({ slug: item.slug }) })).toEqual({});
  });

  it.each([
    { title: "", url: "https://evidence.example.test/event", locator: "section 1" },
    { title: "Fixture evidence", url: "http://evidence.example.test/event", locator: "section 1" },
    { title: "Fixture evidence", url: "https://user:pass@evidence.example.test/event", locator: "section 1" },
    { title: "Fixture evidence", url: "not a document locator", locator: "section 1" },
    { title: "Fixture evidence", url: "https://evidence.example.test/event", locator: "" },
  ])("rejects missing or unusable event evidence: $url $locator", (source) => {
    expect(publicNews([fixture({ verification: { status: "confirmed", approvedBy: "fixture-approver", source } })])).toEqual([]);
  });

  it("requires an approver, valid dates and an actual article body", () => {
    const valid = fixture();
    expect(publicNews([
      fixture({ verification: { status: "confirmed", approvedBy: "", source: { title: "Fixture", url: "https://evidence.example.test/event", locator: "section 1" } } }),
      fixture({ eventDate: "2026-02-30" }),
      fixture({ updated: "2026-01-01" }),
      fixture({ sections: [] }),
      fixture({ sections: [{ title: "Пустая секция", paragraphs: [" "] }] }),
    ])).toEqual([]);
    expect(publicNews([valid])).toEqual([valid]);
  });

  it("renders a confirmed synthetic fixture with NewsArticle schema and existing related links", async () => {
    const item = fixture();
    news.push(item);
    expect(generateStaticParams()).toEqual([{ slug: item.slug }]);
    expect((await generateMetadata({ params: Promise.resolve({ slug: item.slug }) })).title).toBe(item.title);
    const html = renderToStaticMarkup(await NewsPage({ params: Promise.resolve({ slug: item.slug }) }));
    const section = renderToStaticMarkup(createElement(NewsSection));
    expect(section).toMatch(new RegExp(`href="/news/${item.slug}/?"`));
    expect(html).toContain(`<h1>${item.title}</h1>`);
    expect(html).toContain(item.sections[0].paragraphs[0]);
    expect(html).toContain(`dateTime="${item.published}"`);
    expect(html).toContain('"@type":"NewsArticle"');
    expect(html).not.toContain("synthetic-private-approver");
    expect(html).not.toContain("evidence.example.test");
    expect(html).not.toMatch(/"@type":"(?:Product|ProductGroup|Offer|AggregateOffer)"/);
    const destinations = new Set([
      "/", "/about/", "/about/#news", `/news/${item.slug}/`,
      `/equipment/${equipment[0].slug}/`, `/solutions/${solutions[0].slug}/`,
    ].map(routeIdentity));
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) expect(destinations.has(routeIdentity(href))).toBe(true);
  });
});
