import { notFound } from "next/navigation";
import Link from "next/link";
import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, BulletList, ContentSection, PageIntro, Procurement, RelatedLinks, RfqPanel } from "@/components/content-page";
import { LegacyAlias } from "@/components/legacy-alias";
import { legacyDestination, legacySlugs } from "@/lib/legacy-paths";
import { CommercialHero } from "@/components/commercial-hero";
import { ProcessVisual } from "@/components/process-visual";

export async function generateStaticParams() {
  const { industries } = await contentRepository.getSnapshot();
  return [...industries.map(({ slug }) => ({ slug })), ...legacySlugs("industries")];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const target = legacyDestination("industries", slug);
  if (target) return { ...pageMetadata("Материал перенесён", "Актуальная страница применения оборудования Lanfor.", target), robots: { index: false, follow: true } };
  const { industries } = await contentRepository.getSnapshot();
  const industry = industries.find((item) => item.slug === slug);
  return industry ? pageMetadata(industry.title, industry.summary, `/industries/${industry.slug}/`) : {};
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const target = legacyDestination("industries", slug);
  if (target) return <LegacyAlias target={target} note={slug === "engineering" ? "Материал о встраивании компрессора находится в разделе для изготовителей оборудования." : undefined} />;
  const { industries, gases, solutions, articles } = await contentRepository.getSnapshot();
  const industry = industries.find((item) => item.slug === slug);
  if (!industry) notFound();
  const laserSolution = industry.id === "laser-cutting" ? solutions.find((item) => item.id === "nitrogen-for-laser-cutting") : undefined;
  return <>
    <Breadcrumbs items={[{ label: "Применения", href: "/industries/" }, { label: industry.title, href: `/industries/${industry.slug}/` }]} />
    {laserSolution ? <CommercialHero eyebrow="Применение оборудования" title={industry.title} summary={industry.summary} visualId={laserSolution.heroVisualId} action={<Link className="button" href="/rfq/?intake=brief&source=%2Findustries%2Flaser-cutting%2F">Обсудить газоснабжение станка <span aria-hidden="true">→</span></Link>} /> : <PageIntro eyebrow="Применение оборудования" title={industry.title} summary={industry.summary} />}
    <div className="container detail-layout"><article className="prose">
      {laserSolution && <ContentSection title="Два варианта газоснабжения"><ProcessVisual id={laserSolution.processVisualId} /><p>Давление, расход и качество газа определяются требованиями станка, материалом, толщиной и технологией резки. Буфер, подготовка и повышение давления согласуются по условиям задачи.</p></ContentSection>}
      <ContentSection title="Какие газовые задачи возникают"><BulletList items={industry.id === "laser-cutting" ? industry.tasks.slice(2) : industry.tasks} /></ContentSection>
      <ContentSection title="Что учитываем при подборе"><BulletList items={industry.constraints} /></ContentSection>
      <ContentSection title="Какие данные нужны для расчёта"><p>Схема подключения, состав и источник газа, минимальное и максимальное давление на входе, требуемые давление и расход у потребителя, режим, температуры и требования площадки. Для встраивания компрессора также важны доступные энергоресурсы и подключения к системе управления.</p></ContentSection>
      <Procurement />
      <RelatedLinks title="Решения для этих задач" items={solutions.filter((item) => industry.solutionIds.includes(item.id)).map((item) => ({ title: item.title, href: `/solutions/${item.slug}/` }))} />
      <RelatedLinks title="Газовые требования" items={gases.filter((item) => industry.gasIds.includes(item.id)).map((item) => ({ title: item.title, href: `/gases/${item.slug}/` }))} />
      <RelatedLinks title="Полезно для подбора компрессора" items={articles.filter((item) => item.solutionIds.some((id) => industry.solutionIds.includes(id))).slice(0, 5).map((item) => ({ title: item.title, href: `/knowledge/${item.slug}/` }))} />
    </article><RfqPanel sourcePage={`/industries/${industry.slug}/`} title="Подберём компрессор для вашего процесса" /></div>
  </>;
}
