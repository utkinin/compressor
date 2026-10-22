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
  const labels = { "typical-engineering-scenario": "Типовая инженерная задача", "real-project": "Реальный проект", "reference-working-point": "Reference working point" };
  const relatedSolutions = solutions.filter((item) => scenario.solutionIds.includes(item.id));
  const firstGas = scenario.gasIds[0];
  const query = new URLSearchParams({ source: `/cases/${scenario.slug}/` });
  if (firstGas && scenario.gasIds.length === 1) query.set("gas", firstGas);
  if (relatedSolutions[0]) query.set("solution", relatedSolutions[0].id);
  return <>
    <Breadcrumbs items={[{ label: "Типовые задачи", href: "/cases/" }, { label: scenario.title, href: `/cases/${scenario.slug}/` }]} />
    <PageIntro eyebrow={labels[scenario.kind]} title={scenario.title} summary={scenario.summary} />
    <section className="container"><TechnicalDiagram kind={relatedSolutions[0]?.diagram || "hero"} title={scenario.title} /></section>
    <div className="container detail-layout"><article className="prose">
      {scenario.kind === "typical-engineering-scenario" ? <p className="notice">Типовой сценарий: это не реализованный объект, не отзыв заказчика и не подтверждённая характеристика оборудования.</p> : null}
      <ContentSection title="Постановка задачи"><p>{scenario.input}</p></ContentSection>
      <ContentSection title="Подход к компоновке"><BulletList items={scenario.approach} /></ContentSection>
      <ContentSection title="Что нужно проверить до выбора"><BulletList items={scenario.checks} /></ContentSection>
      <ContentSection title="Ожидаемый результат инженерного этапа"><p>Согласованные параметры компрессора и диапазон режимов, принципиальная схема, границы поставки и список недостающих исходных данных. Конкретная модель и гарантируемые значения появляются после расчёта и проверки источников.</p></ContentSection>
      <RelatedLinks title="Связанные решения" items={relatedSolutions.map((item) => ({ title: item.title, href: `/solutions/${item.slug}/` }))} />
      <RelatedLinks title="Особенности газов" items={gases.filter((item) => scenario.gasIds.includes(item.id)).map((item) => ({ title: item.title, href: `/gases/${item.slug}/` }))} />
    </article><RfqPanel href={`/rfq/?${query.toString()}`} sourcePage={`/cases/${scenario.slug}/`} title="Есть похожая задача?" /></div>
  </>;
}
