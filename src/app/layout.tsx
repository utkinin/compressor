import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AnalyticsConsent } from "@/components/analytics-consent";
import { AttributionCapture } from "@/components/attribution-capture";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/config/site";
import { absoluteUrl, isIndexable, pageMetadata, siteUrl } from "@/lib/seo";
import { isStaticPreview } from "@/lib/preview";
import "./globals.css";

export const metadata: Metadata = {
  ...pageMetadata("Безмасляные компрессоры и бустеры для технологических газов", "Безмасляные компрессоры и бустеры для N₂, He, CO₂ и других технологических газов. Подбор оборудования для сжатия, повышения давления и перекачки газа.", "/"),
  metadataBase: new URL(siteUrl),
  title: { default: "Lanfor Gas Systems — сжатие технологических газов", template: "%s | Lanfor Gas Systems" },
  applicationName: siteConfig.name,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body>
    <a className="skip-link" href="#main">Перейти к содержимому</a>
    <SiteHeader preview={!isIndexable} />
    <main id="main">{children}</main>
    <SiteFooter />
    {!isStaticPreview && <><AnalyticsConsent /><AttributionCapture /></>}
    <JsonLd data={{
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.name,
      url: absoluteUrl("/"),
      telephone: siteConfig.phoneDisplay,
      address: {
        "@type": "PostalAddress",
        postalCode: siteConfig.address.postalCode,
        addressLocality: siteConfig.address.addressLocality,
        streetAddress: siteConfig.address.streetAddress,
        addressCountry: siteConfig.address.addressCountry,
      },
      openingHoursSpecification: [{
        "@type": "OpeningHoursSpecification",
        dayOfWeek: siteConfig.openingHours.dayOfWeek,
        opens: siteConfig.openingHours.opens,
        closes: siteConfig.openingHours.closes,
      }],
      description: "Безмасляные компрессоры и бустеры для N₂, He, CO₂ и других технологических газов. Инженерный подбор оборудования для условий процесса.",
    }} />
  </body></html>;
}
