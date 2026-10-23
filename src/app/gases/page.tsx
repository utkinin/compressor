import Link from "next/link";
import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, ContentSection, EntityCard, PageIntro, RfqPanel } from "@/components/content-page";

export const metadata = pageMetadata("Технологические газы", "Азот, гелий, CO₂ и другие технологические газы: особенности сжатия, требования к оборудованию и данные для подбора компрессора.", "/gases/");

export default async function GasesPage() {
  const { gases } = await contentRepository.getSnapshot();
  return <>
    <Breadcrumbs items={[{ label: "Технологические газы", href: "/gases/" }]} />
    <PageIntro eyebrow="Особенности подбора" title="Технологические газы" summary="Свойства газа, влага, примеси и требования к герметичности влияют на выбор компрессора вместе с давлением и расходом. Здесь собраны исходные данные и особенности сжатия разных газов." />
    <section className="container section"><div className="content-grid">{gases.map((gas) => <EntityCard key={gas.id} title={gas.title} summary={gas.summary} label={gas.symbol} href={`/gases/${gas.slug}/`} />)}</div></section>
    <div className="container detail-layout"><div className="prose"><ContentSection title="Если газ — смесь"><p>Укажите компонентный состав, диапазон концентраций, примеси, точку росы и возможные изменения состава. По этим данным проверяют материалы газового тракта, герметичность и требования безопасности.</p><Link href="/gases/process-gas/" className="link-arrow">Технологические газы и смеси →</Link></ContentSection><ContentSection title="Что определяет исполнение компрессора"><p>Исполнение выбирается по составу газа, давлениям, расходу, режиму и условиям площадки. Требования к чистоте, утечкам и безопасности задаются для конкретного процесса.</p></ContentSection></div><RfqPanel sourcePage="/gases/" /></div>
  </>;
}
