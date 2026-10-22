import type { MetadataRoute } from "next";
import { articles, cases, documents, equipment, gases, industries, solutions, productFamilies } from "@/content";
import { absoluteUrl } from "@/lib/seo";
import { engineeringGuides } from "@/app/engineering/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = ["/", "/solutions/", "/gases/", "/equipment/", "/industries/", "/engineering/", "/knowledge/", "/cases/", "/documents/", "/rfq/", "/about/", "/contacts/", "/legal/", "/legal/privacy/", "/legal/consent/", "/legal/cookies/"];
  const groups = { solutions, gases, equipment: [...equipment, ...productFamilies], industries, knowledge: articles, cases, documents: documents.filter(d => d.access !== "internal") };
  for (const [group, entities] of Object.entries(groups)) for (const entity of entities) base.push(`/${group}/${entity.slug}/`);
  for (const guide of engineeringGuides) base.push(`/engineering/${guide.slug}/`);
  return [...new Set(base)].map(path => ({ url: absoluteUrl(path), lastModified: "2026-10-22", changeFrequency: "monthly", priority: path === "/" ? 1 : 0.7 }));
}
