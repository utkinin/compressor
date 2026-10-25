import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactAction } from "@/components/contact-action";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata("Контакты Lanfor Gas Systems", "Связаться с Lanfor Gas Systems по вопросам подбора компрессоров и бустеров для технологических газов.", "/contacts/");

export default function ContactsPage() {
  const email = process.env.CONTACT_EMAIL;
  const hasEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return <div className="container"><Breadcrumbs items={[{ label: "Контакты", href: "/contacts/" }]} /><section className="page-hero"><p className="eyebrow">Lanfor Gas Systems</p><h1>Контакты</h1><p className="page-intro">Укажите задачу, газ, давление на входе, требуемое давление, расход и режим работы. Если часть параметров неизвестна, можно начать с описания процесса, модели установки или ТЗ.</p><div className="hero-actions"><Link className="button" href="/rfq/">Подобрать компрессор</Link><Link className="button button-secondary" href="/rfq/?intake=brief&source=%2Fcontacts%2F">Отправить ТЗ или описание</Link></div></section><section className="detail-layout content-section"><div className="prose"><h2>Что подготовить к обсуждению</h2><ol><li>Газ и состав, чистота, примеси.</li><li>P₁ и P₂ с указанием абсолютного или избыточного давления.</li><li>Q с единицей и условиями приведения.</li><li>Режим работы, температура и условия площадки.</li><li>Что уже есть в процессе и что требуется включить в поставку.</li></ol><p>Если точных P₁, P₂ или Q пока нет, приложите ТЗ, схему, паспорт оборудования или фото шильды — начнём с имеющихся данных.</p></div><aside className="notice contact-notice"><h2>Ланфор</h2><div className="contact-primary"><p><span>Телефон: </span><a href={siteConfig.phoneHref}>{siteConfig.phoneDisplay}</a></p>{hasEmail && <p><span>Почта: </span><ContactAction kind="email" value={email} /></p>}</div><div className="contact-details"><div className="contact-detail-group"><strong>Адрес:</strong><span>{siteConfig.addressDisplay}</span></div><div className="contact-detail-group"><strong>Режим работы:</strong><span>{siteConfig.openingHoursDisplay}<br />Сб–вс — выходные</span></div></div><p className="contact-note">Исполнение, комплектация и условия поставки подтверждаются в коммерческом предложении после проверки исходных данных.</p><Link className="contact-legal-link" href="/legal/">Персональные данные и согласие →</Link></aside></section></div>;
}
