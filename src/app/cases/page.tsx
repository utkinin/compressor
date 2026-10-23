import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, EntityCard, PageIntro } from "@/components/content-page";

export const metadata = pageMetadata("Примеры расчётных задач", "Подбор бустера после генератора азота, возврат гелия и встраивание компрессора: исходные данные, схема и необходимые проверки.", "/cases/");

export default async function CasesPage() {
  const { cases } = await contentRepository.getSnapshot();
  return <>
    <Breadcrumbs items={[{ label: "Примеры расчётных задач", href: "/cases/" }]} />
    <PageIntro eyebrow="Примеры подбора" title="Примеры расчётных задач" summary="Как согласовать генератор с потребителем, вернуть гелий после испытания или встроить компрессор в установку. В каждом примере — исходные данные, схема выбора и проверки перед предложением." />
    <section className="container section"><div className="content-grid">{cases.map((item) => <EntityCard key={item.id} title={item.title} summary={item.summary} label="Пример расчётной задачи" href={`/cases/${item.slug}/`} />)}</div></section>
  </>;
}
