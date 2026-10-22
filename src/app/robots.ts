import type { MetadataRoute } from "next";
import { absoluteUrl, isIndexable } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Policy reviewed 2026-10-22. Standard robots directives only.
  // Google/Bing/Yandex/OAI-SearchBot inherit search policy from '*'.
  // Training is separate: GPTBot (OpenAI bots docs), Google-Extended
  // (Google Search crawler docs), CCBot (Common Crawl crawler docs).
  // A robots file expresses policy; it is not an authentication boundary.
  return {
    rules: [
      { userAgent: "*", ...(isIndexable ? { allow: "/", disallow: ["/api/"] } : { disallow: "/" }) },
      { userAgent: ["GPTBot", "ClaudeBot", "Google-Extended", "CCBot"], disallow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
