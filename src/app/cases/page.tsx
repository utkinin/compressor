import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, ContentSection, EntityCard, PageIntro } from "@/components/content-page";

export const metadata = pageMetadata("Типовые инженерные задачи", "Примеры постановки задач для газового узла: исходные данные, принципиальная схема и проверки без вымышленных заказчиков.", "/cases/");

export default async function CasesPage() {
  const { cases } = await contentRepository.getSnapshot();
  return <>
    <Breadcrumbs items={[{ label: "Типовые задачи", href: "/cases/" }]} />
    <PageIntro eyebrow="Typical engineering scenarios" title="Как задача превращается в требования к узлу." summary="Это типовые инженерные сценарии. Они помогают описать процесс, но не являются отчётами о реализованных объектах и не подтверждают характеристики конкретного оборудования." />
    <section className="container section"><div className="content-grid">{cases.map((item) => <EntityCard key={item.id} title={item.title} summary={item.summary} label="Типовая инженерная задача" href={`/cases/${item.slug}/`} />)}</div></section>
    <section className="container prose"><ContentSection title="Реальные проекты и reference working points"><p>Материалы реальных проектов могут быть опубликованы только после разрешения заказчика и проверки исходных данных. Утверждённые reference working points должны ссылаться на расчёт или протокол. Пока таких документов нет, мы не подменяем их типовыми сценариями.</p></ContentSection></section>
  </>;
}
