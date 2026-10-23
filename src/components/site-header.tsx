"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import "./site-navigation.css";

const links = [
  ["/equipment/", "Оборудование"], ["/solutions/", "Решения"], ["/gases/", "Технологические газы"],
  ["/knowledge/", "База знаний"], ["/about/", "О компании"], ["/contacts/", "Контакты"],
] as const;

export function SiteHeader({ preview = true }: { preview?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return <>
    {preview && <div className="site-preview-banner"><div className="container"><span className="status-dot" />Предварительная версия сайта<span className="site-preview-note">Компрессоры и бустеры для технологических газов</span></div></div>}
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Lanfor Gas Systems — главная" onClick={() => setOpen(false)}><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span className="brand-wordmark">LANFOR<span>GAS SYSTEMS</span></span></Link>
        <button type="button" className="menu-toggle" aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}><span>{open ? "Закрыть" : "Меню"}</span><span className={`menu-icon${open ? " is-open" : ""}`} aria-hidden="true"><i /><i /></span></button>
        <nav aria-label="Основная навигация" id="primary-navigation" className={`primary-nav${open ? " is-open" : ""}`}>
          {links.map(([href, label]) => <Link key={href} href={href} aria-current={pathname.startsWith(href.replace(/\/$/, "")) ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>)}
          <Link href="/rfq/" className="header-rfq" onClick={() => setOpen(false)}>Подобрать компрессор<span aria-hidden="true">→</span></Link>
        </nav>
      </div>
    </header>
  </>;
}
