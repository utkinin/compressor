import { notFound } from "next/navigation";
import Link from "next/link";
import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, BulletList, ContentSection, Faq, RelatedLinks, RfqPanel } from "@/components/content-page";
import { CommercialHero } from "@/components/commercial-hero";
import { ProcessVisual } from "@/components/process-visual";
import { ContentView } from "@/components/content-events";

export async function generateStaticParams() { const { gases } = await contentRepository.getSnapshot(); return gases.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { gases } = await contentRepository.getSnapshot();
  const gas = gases.find((item) => item.slug === slug);
  return gas ? pageMetadata(gas.title, gas.summary, `/gases/${gas.slug}/`) : {};
}

export default async function GasPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { gases, solutions, equipment, articles, cases, documents } = await contentRepository.getSnapshot();
  const gas = gases.find((item) => item.slug === slug);
  if (!gas) notFound();
  const projectReview = gas.id === "h2"
    ? "Применимость компрессорного оборудования для водорода подтверждается для конкретного состава газа, давления, расхода, требований к материалам, герметичности, вентиляции и взрывозащите. Серийное исполнение без инженерной проверки параметров проекта не заявляется."
    : gas.id === "o2"
      ? "Применимость компрессорного оборудования для кислорода подтверждается для конкретного процесса с учётом материалов газового тракта, требований к чистоте, обезжириванию, температуре, давлению и условиям эксплуатации. Серийное исполнение без инженерной проверки не заявляется."
      : undefined;
  const query = new URLSearchParams({ gas: gas.id, source: `/gases/${gas.slug}/` });
  if (projectReview) query.set("intake", "brief");
  const rfqHref = `/rfq/?${query.toString()}`;
  const actionLabel = projectReview ? `Обсудить применимость для ${gas.symbol}` : `Подобрать компрессор для ${gas.symbol}`;
  return <>
    <ContentView event="gas_view" id={gas.id} />
    <Breadcrumbs items={[{ label: "Технологические газы", href: "/gases/" }, { label: gas.title, href: `/gases/${gas.slug}/` }]} />
    <CommercialHero eyebrow={`${gas.symbol} / ${projectReview ? "проектное рассмотрение" : "подбор компрессора"}`} title={gas.title} summary={gas.summary} visualId={gas.heroVisualId} action={<Link className="button" href={rfqHref}>{actionLabel} →</Link>} />
    {projectReview && <section className="container prose"><ContentSection id="project-review" title="Проектное рассмотрение"><p>{projectReview}</p></ContentSection></section>}
    <section className="container commercial-process-section" aria-label="Принцип процесса"><ProcessVisual id={gas.processVisualId} /></section>
    <div className="container detail-layout"><article className="prose">
      <ContentSection title="Какие задачи решаем"><BulletList items={gas.tasks} /></ContentSection>
      <ContentSection title="Исходные данные для подбора"><BulletList items={gas.inputs} /></ContentSection>
      <ContentSection title="Технологические особенности"><BulletList items={gas.features} /></ContentSection>
      <ContentSection title="Ограничения и обязательные проверки"><BulletList items={gas.limitations} /></ContentSection>
      <ContentSection title="Принципиальная схема"><p>{gas.scheme}</p><p>Арматура, приборы, защитные функции и алгоритм управления определяются для заданных параметров процесса.</p></ContentSection>
      <RelatedLinks title="Решения под этот газ" items={solutions.filter((item) => gas.solutionIds.includes(item.id)).map((item) => ({ title: item.title, href: `/solutions/${item.slug}/` }))} />
      {gas.id === "mixtures" && <RelatedLinks title="Газы для проектного рассмотрения" items={gases.filter((item) => item.id === "h2" || item.id === "o2").map((item) => ({ title: `${item.title} — Проектное рассмотрение`, href: `/gases/${item.slug}/` }))} />}
      <RelatedLinks title="Оборудование" items={equipment.filter((item) => gas.equipmentIds.includes(item.id)).map((item) => ({ title: item.title, href: `/equipment/${item.slug}/` }))} />
      <RelatedLinks title="База знаний" items={articles.filter((item) => item.gasIds.includes(gas.id)).map((item) => ({ title: item.title, href: `/knowledge/${item.slug}/` }))} />
      <RelatedLinks title="Примеры расчётных задач" items={cases.filter((item) => item.gasIds.includes(gas.id)).map((item) => ({ title: item.title, href: `/cases/${item.slug}/` }))} />
      <RelatedLinks title="Опросный лист" items={documents.filter((item) => item.access === "public" && item.href && item.type === "Questionnaire").map((item) => ({ title: item.title, href: `/documents/${item.slug}/` }))} />
      <Faq items={gas.faq} />
    </article><RfqPanel href={rfqHref} sourcePage={`/gases/${gas.slug}/`} title={projectReview ? `Рассмотреть задачу с ${gas.symbol}` : `Подобрать компрессор для ${gas.symbol}`} /></div>
  </>;
}
