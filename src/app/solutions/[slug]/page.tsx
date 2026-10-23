import Link from "next/link";
import { notFound } from "next/navigation";
import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, BulletList, ContentSection, PageIntro, Procurement, RelatedLinks, RfqPanel } from "@/components/content-page";
import { TechnicalDiagram } from "@/components/technical-diagram";
import { ContentView } from "@/components/content-events";
import { LegacyAlias } from "@/components/legacy-alias";
import { legacyDestination, legacySlugs } from "@/lib/legacy-paths";

export async function generateStaticParams() {
  const { solutions } = await contentRepository.getSnapshot();
  return [...solutions.map(({ slug }) => ({ slug })), ...legacySlugs("solutions")];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const target = legacyDestination("solutions", slug);
  if (target) return { ...pageMetadata("Материал перенесён", "Актуальная страница решения Lanfor.", target), robots: { index: false, follow: true } };
  const { solutions } = await contentRepository.getSnapshot();
  const solution = solutions.find((item) => item.slug === slug);
  return solution ? pageMetadata(solution.title, solution.summary, `/solutions/${solution.slug}/`) : {};
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const target = legacyDestination("solutions", slug);
  if (target) return <LegacyAlias target={target} />;
  const { solutions, gases, equipment, articles, documents, cases } = await contentRepository.getSnapshot();
  const solution = solutions.find((item) => item.slug === slug);
  if (!solution) notFound();
  const query = new URLSearchParams({ solution: solution.id, source: `/solutions/${solution.slug}/` });
  if (solution.gasIds.length === 1) query.set("gas", solution.gasIds[0]);
  const rfqHref = `/rfq/?${query.toString()}`;
  return <>
    <ContentView event="solution_view" id={solution.id} />
    <Breadcrumbs items={[{ label: "Решения", href: "/solutions/" }, { label: solution.title, href: `/solutions/${solution.slug}/` }]} />
    <PageIntro eyebrow="Подбор компрессора под задачу" title={solution.title} summary={solution.summary} action={<Link className="button" href={rfqHref}>Подобрать компрессор →</Link>} />
    <section className="container"><TechnicalDiagram kind={solution.diagram} title={`Схема решения: ${solution.title}`} /></section>
    <div className="container detail-layout"><article className="prose">
      <ContentSection title="Задача"><p>{solution.intent}</p></ContentSection>
      <ContentSection title="Какие исходные данные нужны"><BulletList items={solution.inputs} /></ContentSection>
      <ContentSection title="Как выстраивается решение"><BulletList items={solution.approach} /></ContentSection>
      <ContentSection title="Что ограничивает выбор"><BulletList items={solution.constraints} /></ContentSection>
      <Procurement items={solution.supply} />
      <RelatedLinks title="Газы и их особенности" items={gases.filter((item) => solution.gasIds.includes(item.id)).map((item) => ({ title: item.title, href: `/gases/${item.slug}/` }))} />
      <RelatedLinks title="Оборудование" items={equipment.filter((item) => solution.equipmentIds.includes(item.id)).map((item) => ({ title: item.title, href: `/equipment/${item.slug}/` }))} />
      <RelatedLinks title="Материалы для подготовки запроса" items={articles.filter((item) => solution.articleIds.includes(item.id)).map((item) => ({ title: item.title, href: `/knowledge/${item.slug}/` }))} />
      <RelatedLinks title="Примеры расчётных задач" items={cases.filter((item) => item.solutionIds.includes(solution.id)).map((item) => ({ title: item.title, href: `/cases/${item.slug}/` }))} />
      <RelatedLinks title="Опросный лист" items={documents.filter((item) => item.access === "public" && item.href && item.type === "Questionnaire").map((item) => ({ title: item.title, href: `/documents/${item.slug}/` }))} />
    </article><RfqPanel href={rfqHref} sourcePage={`/solutions/${solution.slug}/`} /></div>
  </>;
}
