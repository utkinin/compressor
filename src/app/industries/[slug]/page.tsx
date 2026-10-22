import { notFound } from "next/navigation";
import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, BulletList, ContentSection, PageIntro, Procurement, RelatedLinks, RfqPanel } from "@/components/content-page";
import { LegacyAlias } from "@/components/legacy-alias";
import { legacyDestination, legacySlugs } from "@/lib/legacy-paths";

export async function generateStaticParams() {
  const { industries } = await contentRepository.getSnapshot();
  return [...industries.map(({ slug }) => ({ slug })), ...legacySlugs("industries")];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const target = legacyDestination("industries", slug);
  if (target) return { ...pageMetadata("Материал перенесён", "Канонический адрес контекста интеграции Lanfor.", target), robots: { index: false, follow: true } };
  const { industries } = await contentRepository.getSnapshot();
  const industry = industries.find((item) => item.slug === slug);
  return industry ? pageMetadata(industry.title, industry.summary, `/industries/${industry.slug}/`) : {};
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const target = legacyDestination("industries", slug);
  if (target) return <LegacyAlias target={target} note={slug === "engineering" ? "В исходном проекте эта ссылка относилась к интеграции компрессорного узла в оборудование. Соответствующий материал находится в разделе OEM." : undefined} />;
  const { industries, gases, solutions, articles } = await contentRepository.getSnapshot();
  const industry = industries.find((item) => item.slug === slug);
  if (!industry) notFound();
  return <>
    <Breadcrumbs items={[{ label: "Применения", href: "/industries/" }, { label: industry.title, href: `/industries/${industry.slug}/` }]} />
    <PageIntro eyebrow="Процесс / интеграция" title={industry.title} summary={industry.summary} />
    <div className="container detail-layout"><article className="prose">
      <ContentSection title="Какие газовые задачи возникают"><BulletList items={industry.tasks} /></ContentSection>
      <ContentSection title="Условия применимости"><BulletList items={industry.constraints} /><p>Эти сценарии описывают возможные задачи для обсуждения. Они не являются подтверждением отраслевой сертификации или реализованных поставок.</p></ContentSection>
      <ContentSection title="Что нужно от владельца процесса"><p>Схема подключения, состав и источник газа, минимальное и максимальное давление на входе, требуемые давление и расход у потребителя, режим, температуры и требования площадки. Для интеграции также важны доступные энергоресурсы и границы системы управления.</p></ContentSection>
      <Procurement />
      <RelatedLinks title="Решения для обсуждения" items={solutions.filter((item) => industry.solutionIds.includes(item.id)).map((item) => ({ title: item.title, href: `/solutions/${item.slug}/` }))} />
      <RelatedLinks title="Газовые требования" items={gases.filter((item) => industry.gasIds.includes(item.id)).map((item) => ({ title: item.title, href: `/gases/${item.slug}/` }))} />
      <RelatedLinks title="Полезно для задания на узел" items={articles.filter((item) => item.solutionIds.some((id) => industry.solutionIds.includes(id))).slice(0, 5).map((item) => ({ title: item.title, href: `/knowledge/${item.slug}/` }))} />
    </article><RfqPanel sourcePage={`/industries/${industry.slug}/`} title="Опишем газовый узел для вашего процесса" /></div>
  </>;
}
