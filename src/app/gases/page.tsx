import Link from "next/link";
import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, ContentSection, EntityCard, PageIntro, RfqPanel } from "@/components/content-page";
import { GasBadge } from "@/components/gas-badge";

export const metadata = pageMetadata("Компрессоры для технологических газов: подбор по газу", "Безмасляные компрессоры и бустеры для азота, гелия, CO₂ и других технологических газов: особенности среды и данные для инженерного подбора.", "/gases/");

export default async function GasesPage() {
  const { gases } = await contentRepository.getSnapshot();
  const primary = gases.filter((gas) => gas.id !== "h2" && gas.id !== "o2");
  const project = gases.filter((gas) => gas.id === "h2" || gas.id === "o2");
  return <>
    <Breadcrumbs items={[{ label: "Технологические газы", href: "/gases/" }]} />
    <PageIntro eyebrow="Безмасляное сжатие · особенности среды" title="Компрессоры для технологических газов: подбор по газу" summary="Основное направление Lanfor — безмасляные компрессоры и бустеры: масло не подаётся в камеру сжатия. Свойства газа, влага, примеси и требования к герметичности учитываются вместе с давлением и расходом." />
    <section className="container section" aria-label="Основные технологические газы"><div className="content-grid">{primary.map((gas) => <EntityCard key={gas.id} title={gas.title} summary={gas.summary} label={<GasBadge gas={gas.id} />} href={`/gases/${gas.slug}/`} />)}</div></section>
    <section className="container section" aria-labelledby="project-gases-title"><h2 id="project-gases-title">Проектное рассмотрение</h2><p className="section-intro">Для водорода и кислорода отдельно проверяем состав газа, требования к материалам, чистоте и безопасности. Применимость оборудования подтверждается для условий конкретного проекта.</p><div className="content-grid">{project.map((gas) => <EntityCard key={gas.id} title={gas.title} summary={gas.summary} label={<><GasBadge gas={gas.id} /> <span>Проектное рассмотрение</span></>} href={`/gases/${gas.slug}/`} />)}</div></section>
    <div className="container detail-layout"><div className="prose"><ContentSection title="Если газ — смесь"><p>Укажите компонентный состав, диапазон концентраций, примеси, точку росы и возможные изменения состава. По этим данным проверяют материалы газового тракта, герметичность и требования безопасности.</p><Link href="/gases/process-gas/" className="link-arrow">Технологические газы и смеси →</Link></ContentSection><ContentSection title="Что определяет исполнение компрессора"><p>Исполнение выбирается по составу газа, давлениям, расходу, режиму и условиям площадки. Требования к чистоте, утечкам и безопасности задаются для конкретного процесса.</p></ContentSection></div><RfqPanel sourcePage="/gases/" /></div>
  </>;
}
