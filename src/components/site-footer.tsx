import Link from "next/link";
import { siteConfig } from "@/config/site";
import "./site-navigation.css";

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="container footer-top"><div><Link className="footer-brand" href="/">LANFOR<span>GAS SYSTEMS</span></Link><p>Безмасляные компрессоры<br />и бустеры для технологических газов.</p></div>
      <nav className="footer-column" aria-label="Оборудование и решения"><strong>Оборудование и решения</strong><Link href="/equipment/">Оборудование</Link><Link href="/solutions/">Решения</Link><Link href="/integrators/">Интеграторам</Link><Link href="/gases/">Технологические газы</Link></nav>
      <nav className="footer-column" aria-label="База знаний и компания"><strong>Материалы и компания</strong><Link href="/knowledge/">База знаний</Link><Link href="/about/">О компании</Link><Link href="/contacts/">Контакты</Link></nav>
      <div className="footer-column footer-contact"><strong>Связаться</strong><a href={siteConfig.phoneHref}>{siteConfig.phoneDisplay}</a><span>{siteConfig.addressDisplay}</span><span>{siteConfig.openingHoursDisplay}</span><Link href="/rfq/">Подобрать компрессор →</Link></div>
    </div>
    <div className="container footer-bottom"><p>© {new Date().getFullYear()} Lanfor Gas Systems</p><div><Link href="/legal/privacy/">Политика обработки ПДн</Link><Link href="/legal/consent/">Согласие на обработку ПДн</Link></div><span className="footer-disclaimer">Исполнение и характеристики оборудования подтверждаются при подборе.</span></div>
  </footer>;
}
