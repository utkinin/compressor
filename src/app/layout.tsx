import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AnalyticsConsent } from "@/components/analytics-consent";
import { AttributionCapture } from "@/components/attribution-capture";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl, isIndexable, pageMetadata, siteUrl } from "@/lib/seo";
import { isStaticPreview } from "@/lib/preview";
import "./globals.css";

export const metadata: Metadata = {
  ...pageMetadata("Технологический газ под рабочую точку процесса", "Oil-Free компрессоры, бустеры и skid-системы. Подбор по газу, давлениям P₁/P₂, расходу и режиму работы.", "/"),
  metadataBase: new URL(siteUrl),
  title: { default: "Lanfor Gas Systems — сжатие технологических газов", template: "%s | Lanfor Gas Systems" },
  applicationName: "Lanfor Gas Systems",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body>
    <a className="skip-link" href="#main">Перейти к содержимому</a>
    <SiteHeader staging={!isIndexable} />
    <main id="main">{children}</main>
    <SiteFooter />
    {!isStaticPreview && <><AnalyticsConsent /><AttributionCapture /></>}
    <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: "Lanfor Gas Systems", url: absoluteUrl("/"), description: "Подбор функциональных компрессорных узлов под рабочую точку технологического газа." }} />
  </body></html>;
}
