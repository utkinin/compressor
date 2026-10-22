import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/seo";

export interface Crumb {
  label: string;
  href: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const crumbs = [{ label: "Главная", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Хлебные крошки" className="breadcrumb container">
        <ol>
          {crumbs.map((item, index) => (
            <li key={item.href}>
              {index === crumbs.length - 1 ? <span aria-current="page">{item.label}</span> : <Link href={item.href}>{item.label}</Link>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.label,
          item: absoluteUrl(crumb.href),
        })),
      }} />
    </>
  );
}

export function PageIntro({ eyebrow, title, summary, action }: { eyebrow: string; title: string; summary: string; action?: ReactNode }) {
  return (
    <header className="page-hero container">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-summary">{summary}</p>
      {action ? <div className="hero-actions">{action}</div> : null}
    </header>
  );
}

export function ContentSection({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return <section className="content-section" id={id}><h2>{title}</h2>{children}</section>;
}

export function BulletList({ items }: { items: readonly string[] }) {
  return <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export function EntityCard({ title, summary, href, label }: { title: string; summary: string; href: string; label?: string }) {
  return (
    <article className="content-card entity-card">
      {label ? <p className="eyebrow">{label}</p> : null}
      <h2><Link href={href}>{title}</Link></h2>
      <p>{summary}</p>
      <Link className="link-arrow" href={href}>Подробнее <span aria-hidden="true">→</span></Link>
    </article>
  );
}

export function RelatedLinks({ title, items }: { title: string; items: { title: string; href: string }[] }) {
  if (!items.length) return null;
  return (
    <section className="content-section">
      <h2>{title}</h2>
      <ul className="related-links">{items.map((item) => <li key={item.href}><Link href={item.href}>{item.title}<span aria-hidden="true"> →</span></Link></li>)}</ul>
    </section>
  );
}

export function RfqPanel({ href = "/rfq/", title = "Начнём с рабочей точки", sourcePage = "/" }: { href?: string; title?: string; sourcePage?: string }) {
  const target = new URL(href, "https://staging.lanfor.example");
  target.searchParams.set("source", sourcePage);
  const contextualHref = `${target.pathname}${target.search}`;
  return (
    <aside className="rfq-panel">
      <p className="eyebrow">Gas · P₁ · P₂ · Q · режим</p>
      <h2>{title}</h2>
      <p>Укажите газ, давления и расход с единицами. Для расчёта нужны числовые P₁/P₂/Q; неизвестные дополнительные условия отметьте в уточнениях. Итогом будет предварительный класс решения и перечень инженерных проверок.</p>
      <Link className="button" href={contextualHref}>Передать рабочую точку <span aria-hidden="true">→</span></Link>
      <p className="small-text">Автоматический выбор модели без расчёта не выполняется.</p>
    </aside>
  );
}

export function Procurement({ items }: { items?: string[] }) {
  return (
    <ContentSection title="Для закупки и согласования поставки">
      <p>Комплектность фиксируется после инженерного расчёта и согласования границ поставки. В запросе полезно отдельно назвать требования проекта и обязательные документы.</p>
      <BulletList items={items?.length ? items : [
        "Компрессорный блок либо модуль с согласованной обвязкой, охлаждением, КИП и системой управления.",
        "Габаритный чертёж, схема подключения и перечень интерфейсов для интеграции; доступность CAD/STEP уточняется для конфигурации.",
        "Паспорт, руководство и комплект разрешительных документов — по конкретному исполнению и применимым требованиям.",
      ]} />
      <p>Производитель, страна происхождения, срок, условия гарантии, перечень документов и стоимость указываются в предложении на выбранную конфигурацию. Универсальных обещаний для всех исполнений нет.</p>
      <Link className="link-arrow" href="/documents/">Документы и запрос чертежей →</Link>
    </ContentSection>
  );
}

export function Faq({ items }: { items: { question: string; answer: string }[] }) {
  if (!items.length) return null;
  return (
    <ContentSection title="Инженерные вопросы">
      <div className="faq-list">{items.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
      }} />
    </ContentSection>
  );
}
