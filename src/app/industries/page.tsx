import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, EntityCard, PageIntro, RfqPanel } from "@/components/content-page";

export const metadata = pageMetadata("Отрасли и процессы", "Газовая компрессия для OEM, генерации газа, лазерной резки, испытательных и специальных технологических процессов.", "/industries/");

export default async function IndustriesPage() {
  const { industries } = await contentRepository.getSnapshot();
  return <>
    <Breadcrumbs items={[{ label: "Применения", href: "/industries/" }]} />
    <PageIntro eyebrow="Сначала требования процесса" title="Отрасль задаёт контекст. Рабочая точка — решение." summary="Одинаковый газ может потребовать разных схем в испытательном стенде, на производственной линии и в OEM-оборудовании. Ниже — возможные постановки инженерных задач, а не утверждение об уже выполненных поставках." />
    <section className="container section"><div className="content-grid">{industries.map((industry) => <EntityCard key={industry.id} title={industry.title} summary={industry.summary} href={`/industries/${industry.slug}/`} />)}</div></section>
    <section className="container section"><RfqPanel sourcePage="/industries/" title="Расскажите о своём процессе" /></section>
  </>;
}
