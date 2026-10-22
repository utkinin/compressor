import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactAction } from "@/components/contact-action";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata("Обсудить инженерную задачу", "Какие данные передать для подбора и что согласовать перед запросом коммерческого предложения.", "/contacts/");

export default function ContactsPage() {
  const email = process.env.CONTACT_EMAIL;
  const phone = process.env.CONTACT_PHONE;
  const hasEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hasPhone = phone && /^\+?[0-9 ()-]{7,30}$/.test(phone);
  return <div className="container"><Breadcrumbs items={[{ label: "Контакты", href: "/contacts/" }]} /><section className="page-hero"><p className="eyebrow">ENGINEERING ENQUIRY</p><h1>Начнём с задачи,<br />а не с номера модели</h1><p className="page-intro">Передайте рабочую точку и условия площадки. Так следующий разговор будет о совместимости, составе узла и границах поставки.</p><Link className="button" href="/rfq/">Подготовить технический запрос</Link></section><section className="detail-layout content-section"><div className="prose"><h2>Минимум для первого разбора</h2><ol><li>Газ и состав, чистота, примеси.</li><li>P₁ и P₂ с явным указанием абсолютного или избыточного давления.</li><li>Q с единицей и условиями приведения.</li><li>Режим работы, температура и условия площадки.</li><li>Что уже есть в процессе и что требуется включить в поставку.</li></ol><p>Не отправляйте коммерческую тайну, паспортные данные или данные третьих лиц через демонстрационную форму.</p></div><aside className="notice"><h2>Каналы связи</h2>{hasEmail && <p><span>Почта: </span><ContactAction kind="email" value={email} /></p>}{hasPhone && <p><span>Телефон: </span><ContactAction kind="phone" value={phone} /></p>}{!hasEmail && !hasPhone && <p>Утверждённые контакты и реквизиты владельца сайта пока не предоставлены. Для демонстрации используйте staging-форму с тестовыми данными; внешняя доставка не подключена.</p>}<p>Срок ответа, условия поставки и гарантия согласуются отдельно. На staging они не заявляются.</p><Link href="/legal/">Персональные данные и согласие →</Link></aside></section></div>;
}
