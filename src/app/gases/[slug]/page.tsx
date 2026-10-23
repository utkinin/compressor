import { notFound } from "next/navigation";
import Link from "next/link";
import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, BulletList, ContentSection, Faq, PageIntro, RelatedLinks, RfqPanel } from "@/components/content-page";
import { TechnicalDiagram } from "@/components/technical-diagram";
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
  const diagramKind = ({ n2: "nitrogen", he: "helium", h2: "hydrogen", o2: "instrumentation", co2: "co2", mixtures: "hero" })[gas.id];
  return <>
    <ContentView event="gas_view" id={gas.id} />
    <Breadcrumbs items={[{ label: "Технологические газы", href: "/gases/" }, { label: gas.title, href: `/gases/${gas.slug}/` }]} />
    <PageIntro eyebrow={`${gas.symbol} / подбор компрессора`} title={gas.title} summary={gas.summary} action={<Link className="button" href={`/rfq/?gas=${gas.id}&source=${encodeURIComponent(`/gases/${gas.slug}/`)}`}>Подобрать компрессор для {gas.symbol} →</Link>} />
    <section className="container"><TechnicalDiagram kind={diagramKind} title={`Принципиальная схема сжатия: ${gas.symbol}`} /></section>
    <div className="container detail-layout"><article className="prose">
      <ContentSection title="Какие задачи решаем"><BulletList items={gas.tasks} /></ContentSection>
      <ContentSection title="Исходные данные для подбора"><BulletList items={gas.inputs} /></ContentSection>
      <ContentSection title="Технологические особенности"><BulletList items={gas.features} /></ContentSection>
      <ContentSection title="Ограничения и обязательные проверки"><BulletList items={gas.limitations} /></ContentSection>
      <ContentSection title="Принципиальная схема"><p>{gas.scheme}</p><p>Арматура, приборы, защитные функции и алгоритм управления определяются для заданных параметров процесса.</p></ContentSection>
      <RelatedLinks title="Решения под этот газ" items={solutions.filter((item) => gas.solutionIds.includes(item.id)).map((item) => ({ title: item.title, href: `/solutions/${item.slug}/` }))} />
      <RelatedLinks title="Оборудование" items={equipment.filter((item) => gas.equipmentIds.includes(item.id)).map((item) => ({ title: item.title, href: `/equipment/${item.slug}/` }))} />
      <RelatedLinks title="База знаний" items={articles.filter((item) => item.gasIds.includes(gas.id)).map((item) => ({ title: item.title, href: `/knowledge/${item.slug}/` }))} />
      <RelatedLinks title="Примеры расчётных задач" items={cases.filter((item) => item.gasIds.includes(gas.id)).map((item) => ({ title: item.title, href: `/cases/${item.slug}/` }))} />
      <RelatedLinks title="Опросный лист" items={documents.filter((item) => item.access === "public" && item.href && item.type === "Questionnaire").map((item) => ({ title: item.title, href: `/documents/${item.slug}/` }))} />
      <Faq items={gas.faq} />
    </article><RfqPanel href={`/rfq/?gas=${gas.id}`} sourcePage={`/gases/${gas.slug}/`} title={`Подобрать компрессор для ${gas.symbol}`} /></div>
  </>;
}
