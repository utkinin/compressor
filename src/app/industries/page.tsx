import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, EntityCard, PageIntro, RfqPanel } from "@/components/content-page";

export const metadata = pageMetadata("Отрасли и процессы", "Компрессоры для производственного оборудования, генерации газа, лазерной резки и испытательных процессов.", "/industries/");

export default async function IndustriesPage() {
  const { industries } = await contentRepository.getSnapshot();
  return <>
    <Breadcrumbs items={[{ label: "Применения", href: "/industries/" }]} />
    <PageIntro eyebrow="Применения" title="Компрессоры для производственных и испытательных процессов" summary="Газоснабжение станка, испытательный стенд, возврат газа и производственная линия предъявляют разные требования к давлению, расходу и режиму работы. Выберите применение, чтобы уточнить исходные данные и состав оборудования." />
    <section className="container section"><div className="content-grid">{industries.map((industry) => <EntityCard key={industry.id} title={industry.title} summary={industry.summary} href={`/industries/${industry.slug}/`} />)}</div></section>
    <section className="container section"><RfqPanel sourcePage="/industries/" title="Расскажите о своём процессе" /></section>
  </>;
}
