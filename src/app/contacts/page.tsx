import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactAction } from "@/components/contact-action";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata("Контакты Lanfor Gas Systems", "Какие данные передать для подбора и что согласовать перед запросом коммерческого предложения.", "/contacts/");

export default function ContactsPage() {
  const email = process.env.CONTACT_EMAIL;
  const phone = process.env.CONTACT_PHONE;
  const hasEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hasPhone = phone && /^\+?[0-9 ()-]{7,30}$/.test(phone);
  return <div className="container"><Breadcrumbs items={[{ label: "Контакты", href: "/contacts/" }]} /><section className="page-hero"><p className="eyebrow">Подбор оборудования</p><h1>Обсудим вашу задачу</h1><p className="page-intro">Укажите газ, давление на входе, требуемое давление, расход и режим работы. По этим данным начнём подбор компрессора, затем уточним необходимую комплектацию.</p><Link className="button" href="/rfq/">Отправить параметры</Link></section><section className="detail-layout content-section"><div className="prose"><h2>Какие данные подготовить</h2><ol><li>Газ и состав, чистота, примеси.</li><li>P₁ и P₂ с явным указанием абсолютного или избыточного давления.</li><li>Q с единицей и условиями приведения.</li><li>Режим работы, температура и условия площадки.</li><li>Что уже есть в процессе и что требуется включить в поставку.</li></ol><p>Не отправляйте коммерческую тайну, паспортные данные или данные третьих лиц через демонстрационную форму.</p></div><aside className="notice"><h2>Запрос на подбор</h2>{hasEmail && <p><span>Почта: </span><ContactAction kind="email" value={email} /></p>}{hasPhone && <p><span>Телефон: </span><ContactAction kind="phone" value={phone} /></p>}{!hasEmail && !hasPhone && <p>В этой демонстрационной версии отправка запросов отключена. Вы можете заполнить и сохранить опросный лист для дальнейшего подбора.</p>}<p>Исполнение, комплектация и условия поставки согласуются в предложении.</p><p><Link href="/documents/process-gas-questionnaire/">Заполнить опросный лист →</Link></p><Link href="/legal/">Персональные данные и согласие →</Link></aside></section></div>;
}
