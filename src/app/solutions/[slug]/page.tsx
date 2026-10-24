import Link from "next/link";
import { notFound } from "next/navigation";
import { contentRepository } from "@/content";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { solutionHeroOverrides } from "@/lib/solution-hero";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumbs, BulletList, ContentSection, PageIntro, Procurement, RelatedLinks, RfqPanel } from "@/components/content-page";
import { TechnicalDiagram } from "@/components/technical-diagram";
import { SolutionProcessVisual } from "@/components/solution-process-visual";
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
  if (!solution) return {};
  const hero = solutionHeroOverrides[solution.id];
  return pageMetadata(hero?.title ?? solution.title, hero?.summary ?? solution.summary, `/solutions/${solution.slug}/`);
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const target = legacyDestination("solutions", slug);
  if (target) return <LegacyAlias target={target} />;
  const { solutions, gases, equipment, articles, documents, cases, industries } = await contentRepository.getSnapshot();
  const solution = solutions.find((item) => item.slug === slug);
  if (!solution) notFound();
  const hero = solutionHeroOverrides[solution.id];
  const query = new URLSearchParams({ solution: solution.id, source: `/solutions/${solution.slug}/` });
  if (solution.gasIds.length === 1) query.set("gas", solution.gasIds[0]);
  const rfqHref = `/rfq/?${query.toString()}`;
  const counterpart = solution.id === "nitrogen-booster-after-generator"
    ? solutions.find((item) => item.id === "nitrogen-for-laser-cutting")
    : solution.id === "nitrogen-for-laser-cutting"
      ? solutions.find((item) => item.id === "nitrogen-booster-after-generator")
      : undefined;
  const projectReview = solution.id === "hydrogen-compression" || solution.id === "oxygen-compression";
  const publicTitle = hero?.title ?? solution.title;
  const publicSummary = hero?.summary ?? solution.summary;
  const primaryCta = hero?.cta ?? (projectReview ? "Обсудить применимость оборудования" : "Подобрать компрессор");
  return <>
    <ContentView event="solution_view" id={solution.id} />
    <Breadcrumbs items={[{ label: "Решения", href: "/solutions/" }, { label: publicTitle, href: `/solutions/${solution.slug}/` }]} />
    <PageIntro eyebrow={projectReview ? "Проектное рассмотрение" : "Подбор компрессора под задачу"} title={publicTitle} summary={publicSummary} action={<Link className="button" href={projectReview ? `${rfqHref}&intake=brief` : rfqHref}>{primaryCta} →</Link>} />
    {projectReview && <section className="container prose"><ContentSection title="Проектное рассмотрение"><p>Состав газа, давления, расход, материалы газового тракта и требования безопасности проверяются для конкретного процесса. Применимость и исполнение оборудования подтверждаются инженерной проработкой; серийное исполнение без такой проверки не заявляется.</p></ContentSection></section>}
    {solution.id === "nitrogen-for-laser-cutting" && <section className="container prose"><ContentSection title="Газоснабжение начинается с требований станка"><p>Сначала уточняются требования изготовителя лазерного станка, материал, толщина и технология резки. По ним определяют давление у подключения, средний и пиковый расход, чистоту и подготовку газа. Азот и сжатый воздух рассматриваются по условиям процесса; один вариант не объявляется универсально лучшим.</p><div className="laser-supply-options"><article><h3>Сжатый воздух</h3><p>компрессор → ресивер → осушитель → фильтрация → лазер</p></article><article><h3>Азот</h3><p>источник N₂ / генератор → бустер → ресивер → лазер</p></article></div><p>Это возможные схемы, а не фиксированная комплектация. Бустер нужен при недостаточном давлении источника; ресивер и подготовка газа определяются расчётом и требованиями станка.</p></ContentSection></section>}
    {hero ? <section className="container"><SolutionProcessVisual kind={hero.processVisual} /></section> : <section className="container"><TechnicalDiagram kind={solution.diagram} title={`Схема решения: ${solution.title}`} /></section>}
    <div className="container detail-layout"><article className="prose">
      <ContentSection title="Задача"><p>{solution.intent}</p></ContentSection>
      {counterpart && <ContentSection title="Связанная задача"><p>{solution.id === "nitrogen-booster-after-generator" ? "Если азот используется для лазерной резки, отдельно согласуются требования станка, качество газа и профиль потребления." : "Если генератор азота уже есть, но его давления недостаточно, сначала проверьте доступную подачу источника и условия дожатия."}</p><Link className="text-link" href={`/solutions/${counterpart.slug}/`} data-testid="solution-intent-crosslink">{counterpart.title} →</Link></ContentSection>}
      <ContentSection title="Какие исходные данные нужны"><BulletList items={solution.inputs} /></ContentSection>
      <ContentSection title="Как выстраивается решение"><BulletList items={solution.approach} /></ContentSection>
      <ContentSection title="Что ограничивает выбор"><BulletList items={solution.constraints} /></ContentSection>
      <Procurement items={solution.supply} />
      <RelatedLinks title="Газы и их особенности" items={gases.filter((item) => solution.gasIds.includes(item.id)).map((item) => ({ title: item.title, href: `/gases/${item.slug}/` }))} />
      <RelatedLinks title="Оборудование" items={equipment.filter((item) => solution.equipmentIds.includes(item.id)).map((item) => ({ title: item.title, href: `/equipment/${item.slug}/` }))} />
      <RelatedLinks title="Материалы для подготовки запроса" items={articles.filter((item) => solution.articleIds.includes(item.id)).map((item) => ({ title: item.title, href: `/knowledge/${item.slug}/` }))} />
      <RelatedLinks title="Примеры расчётных задач" items={cases.filter((item) => item.solutionIds.includes(solution.id)).map((item) => ({ title: item.title, href: `/cases/${item.slug}/` }))} />
      <RelatedLinks title="Отрасли и применения" items={industries.filter((item) => item.solutionIds.includes(solution.id)).map((item) => ({ title: item.title, href: `/industries/${item.slug}/` }))} />
      <RelatedLinks title="Опросный лист" items={documents.filter((item) => item.access === "public" && item.href && item.type === "Questionnaire").map((item) => ({ title: item.title, href: `/documents/${item.slug}/` }))} />
    </article><RfqPanel href={projectReview ? `${rfqHref}&intake=brief` : rfqHref} sourcePage={`/solutions/${solution.slug}/`} title={projectReview ? "Обсудить применимость оборудования" : "Подберём компрессор для вашей задачи"} /></div>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "WebPage", name: publicTitle, description: publicSummary, url: absoluteUrl(`/solutions/${solution.slug}/`), inLanguage: "ru-RU", about: { "@type": "Thing", name: solution.intent } }} />
  </>;
}
