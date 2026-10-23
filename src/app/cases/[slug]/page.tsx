import { notFound } from "next/navigation";
import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, BulletList, ContentSection, PageIntro, RelatedLinks, RfqPanel } from "@/components/content-page";
import { TechnicalDiagram } from "@/components/technical-diagram";

export async function generateStaticParams() { const { cases } = await contentRepository.getSnapshot(); return cases.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { cases } = await contentRepository.getSnapshot();
  const scenario = cases.find((item) => item.slug === slug);
  return scenario ? pageMetadata(scenario.title, scenario.summary, `/cases/${scenario.slug}/`) : {};
}

export default async function ScenarioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { cases, gases, solutions } = await contentRepository.getSnapshot();
  const scenario = cases.find((item) => item.slug === slug);
  if (!scenario) notFound();
  const labels = { "typical-engineering-scenario": "Пример расчётной задачи", "real-project": "Реальный проект", "reference-working-point": "Расчётный пример" };
  const relatedSolutions = solutions.filter((item) => scenario.solutionIds.includes(item.id));
  const firstGas = scenario.gasIds[0];
  const query = new URLSearchParams({ source: `/cases/${scenario.slug}/` });
  if (firstGas && scenario.gasIds.length === 1) query.set("gas", firstGas);
  if (relatedSolutions[0]) query.set("solution", relatedSolutions[0].id);
  return <>
    <Breadcrumbs items={[{ label: "Примеры расчётных задач", href: "/cases/" }, { label: scenario.title, href: `/cases/${scenario.slug}/` }]} />
    <PageIntro eyebrow={labels[scenario.kind]} title={scenario.title} summary={scenario.summary} />
    <section className="container"><TechnicalDiagram kind={relatedSolutions[0]?.diagram || "hero"} title={scenario.title} /></section>
    <div className="container detail-layout"><article className="prose">
      <ContentSection title="Постановка задачи"><p>{scenario.input}</p></ContentSection>
      <ContentSection title="Подход к компоновке"><BulletList items={scenario.approach} /></ContentSection>
      <ContentSection title="Что нужно проверить до выбора"><BulletList items={scenario.checks} /></ContentSection>
      <ContentSection title="Что включить в техническое предложение"><p>Расчётные параметры компрессора, допустимые режимы, принципиальную схему и состав поставки. Отдельно согласуются подключения, документация и критерии приёмки.</p></ContentSection>
      <RelatedLinks title="Связанные решения" items={relatedSolutions.map((item) => ({ title: item.title, href: `/solutions/${item.slug}/` }))} />
      <RelatedLinks title="Особенности газов" items={gases.filter((item) => scenario.gasIds.includes(item.id)).map((item) => ({ title: item.title, href: `/gases/${item.slug}/` }))} />
    </article><RfqPanel href={`/rfq/?${query.toString()}`} sourcePage={`/cases/${scenario.slug}/`} title="Есть похожая задача?" /></div>
  </>;
}
