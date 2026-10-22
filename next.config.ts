import type { NextConfig } from "next";
import { ANALYTICS_FRAME_CSP } from "./src/lib/analytics-security";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: { cpus: 2 },
  async headers() {
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
