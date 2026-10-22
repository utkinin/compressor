import type { NextConfig } from "next";
import { ANALYTICS_FRAME_CSP } from "./src/lib/analytics-security";

const staticPreview = process.env.LANFOR_STATIC_PREVIEW === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
if (basePath && !/^\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(basePath)) throw new Error("NEXT_PUBLIC_BASE_PATH must be a safe path without a trailing slash");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  basePath,
  ...(staticPreview ? { output: "export", trailingSlash: true, images: { unoptimized: true } } : {}),
  experimental: { cpus: 2 },
  headers: staticPreview ? undefined : async function headers() {
    const isDevelopment = process.env.NODE_ENV === "development";
    const csp = [
      "default-src 'self'",
      // Next's streamed App Router hydration uses inline script blocks.
      `script-src 'self' 'unsafe-inline' ${isDevelopment ? "'unsafe-eval'" : ""} https://mc.yandex.ru https://www.googletagmanager.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://mc.yandex.ru https://www.google-analytics.com",
      "connect-src 'self' https://mc.yandex.ru https://*.mc.yandex.ru https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
    ].join("; ");
    return [{ source: "/:path*", headers: [
      { key: "Content-Security-Policy", value: csp },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ...((process.env.SEO_INDEXABLE === "true") ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
    ] }, {
      source: "/api/analytics-frame",
      headers: [
        { key: "Content-Security-Policy", value: ANALYTICS_FRAME_CSP },
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "X-Robots-Tag", value: "noindex, nofollow" },
      ],
    }];
  },
};

export default nextConfig;
