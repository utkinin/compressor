import Link from "next/link";
import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, ContentSection, EntityCard, PageIntro, RfqPanel } from "@/components/content-page";

export const metadata = pageMetadata("Технологические газы", "N₂, He, H₂, O₂, CO₂ и газовые смеси: требования к безмасляной компрессии и исходные данные для подбора.", "/gases/");

export default async function GasesPage() {
  const { gases } = await contentRepository.getSnapshot();
  return <>
    <Breadcrumbs items={[{ label: "Газы", href: "/gases/" }]} />
    <PageIntro eyebrow="Process gases" title="Один принцип. Разные требования к газу." summary="Подбор компрессора начинается с состава газа. Молекулярная масса, влажность, совместимость материалов и утечки влияют на конструкцию не меньше, чем давление и расход." />
    <section className="container section"><div className="content-grid">{gases.map((gas) => <EntityCard key={gas.id} title={gas.title} summary={gas.summary} label={gas.symbol} href={`/gases/${gas.slug}/`} />)}</div></section>
    <div className="container detail-layout"><div className="prose"><ContentSection title="Если газ — смесь"><p>Укажите компонентный состав, диапазон концентраций, примеси, точку росы и возможные изменения состава. Название основного компонента не заменяет проверку материалов, герметичности и взрывозащиты.</p><Link href="/gases/process-gas/" className="link-arrow">Особенности process gas и смесей →</Link></ContentSection><ContentSection title="Граница применимости"><p>Эти страницы описывают инженерную постановку задач. Они не подтверждают пригодность любого компрессора для любого газа. Исполнение согласуется по составу, давлениям, расходу, режиму и условиям площадки.</p></ContentSection></div><RfqPanel sourcePage="/gases/" /></div>
  </>;
}
