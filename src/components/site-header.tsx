"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  ["/solutions/", "Решения"], ["/gases/", "Газы"], ["/equipment/", "Оборудование"],
  ["/engineering/", "Инжиниринг"], ["/knowledge/", "Знания"], ["/documents/", "Документы"],
] as const;

export function SiteHeader({ staging = true }: { staging?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return <>
    {staging && <div className="staging-banner"><div className="container"><span className="status-dot" />Staging · инженерные материалы на согласовании<span className="staging-banner-note">Подбор начинается с рабочей точки</span></div></div>}
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Lanfor Gas Systems — главная" onClick={() => setOpen(false)}><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span className="brand-wordmark">LANFOR<span>GAS SYSTEMS</span></span></Link>
        <button type="button" className="menu-toggle" aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}><span>{open ? "Закрыть" : "Меню"}</span><span className={`menu-icon${open ? " is-open" : ""}`} aria-hidden="true"><i /><i /></span></button>
        <nav aria-label="Основная навигация" id="primary-navigation" className={`primary-nav${open ? " is-open" : ""}`}>
          {links.map(([href, label]) => <Link key={href} href={href} aria-current={pathname.startsWith(href.replace(/\/$/, "")) ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>)}
          <Link href="/rfq/" className="header-rfq" onClick={() => setOpen(false)}>Обсудить задачу<span aria-hidden="true">→</span></Link>
        </nav>
      </div>
    </header>
  </>;
}
