import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Правовая информация", "Политика обработки персональных данных, отдельное согласие и управление аналитикой.", "/legal/");

export default function LegalPage() {
  return <div className="container"><Breadcrumbs items={[{ label: "Правовая информация", href: "/legal/" }]} /><section className="page-hero"><p className="eyebrow">Персональные данные</p><h1>Данные только<br />с понятной целью</h1><p className="page-intro">Согласие на обработку запроса отделено от аналитики и маркетинга. Форма не подписывает посетителя на рассылки.</p></section><section className="item-grid content-section"><Link className="entity-card" href="/legal/privacy/"><h2>Политика обработки ПДн</h2><p>Состав данных, цель, порядок хранения и обращения к оператору.</p></Link><Link className="entity-card" href="/legal/consent/"><h2>Текст согласия</h2><p>Отдельное согласие для ответа на технический запрос. Версия сохраняется вместе с заявкой.</p></Link><Link className="entity-card" href="/legal/cookies/"><h2>Аналитика и локальное хранение</h2><p>Какие настройки остаются в браузере и когда включаются внешние счётчики.</p></Link></section><p className="notice">В демонстрационной версии используйте тестовые данные. Возможность отправки и условия обработки указываются непосредственно в форме запроса.</p></div>;
}
