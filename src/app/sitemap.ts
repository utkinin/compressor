import type { MetadataRoute } from "next";
import { articles, cases, documents, equipment, gases, industries, solutions } from "@/content";
import { absoluteUrl } from "@/lib/seo";
import { publicNews } from "@/content/news";
import { engineeringGuides } from "@/app/engineering/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = ["/", "/solutions/", "/gases/", "/equipment/", "/industries/", "/engineering/", "/knowledge/", "/cases/", "/rfq/", "/about/", "/contacts/", "/legal/", "/legal/privacy/", "/legal/consent/", "/legal/cookies/"];
  const groups = { solutions, gases, equipment, industries, knowledge: articles, cases, news: publicNews(), documents: documents.filter(d => d.access !== "internal") };
  for (const [group, entities] of Object.entries(groups)) for (const entity of entities) base.push(`/${group}/${entity.slug}/`);
  for (const guide of engineeringGuides) base.push(`/engineering/${guide.slug}/`);
  return [...new Set(base)].map(path => ({ url: absoluteUrl(path), lastModified: "2026-10-23", changeFrequency: "monthly", priority: path === "/" ? 1 : 0.7 }));
}
