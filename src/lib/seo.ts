import type { Metadata } from "next";
import { isStaticPreview, previewBasePath } from "@/lib/preview";

function configuredSiteUrl(): string {
  const value = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://lanfor.example";
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("SITE_URL must be an HTTP(S) origin");
  return url.origin;
}

const siteOrigin = configuredSiteUrl();
export const siteUrl = `${siteOrigin}${previewBasePath}`;
export const absoluteUrl = (path: string) => new URL(`${previewBasePath}${path.startsWith("/") ? path : `/${path}`}`, `${siteOrigin}/`).href;
export const isIndexable = !isStaticPreview && process.env.SEO_INDEXABLE === "true";

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { title, description, url: absoluteUrl(path), siteName: "Lanfor Gas Systems", locale: "ru_RU", type: "website" },
    robots: { index: isIndexable, follow: isIndexable },
  };
}
