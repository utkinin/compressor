import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, BulletList, ContentSection, PageIntro, RelatedLinks, RfqPanel } from "@/components/content-page";
import { TechnicalDiagram } from "@/components/technical-diagram";
import { engineeringGuides } from "../guides";

export function generateStaticParams() { return engineeringGuides.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = engineeringGuides.find((item) => item.slug === slug);
  return guide ? pageMetadata(guide.title, guide.summary, `/engineering/${guide.slug}/`) : {};
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = engineeringGuides.find((item) => item.slug === slug);
  if (!guide) notFound();
  return <>
    <Breadcrumbs items={[{ label: "Инжиниринг", href: "/engineering/" }, { label: guide.title, href: `/engineering/${guide.slug}/` }]} />
    <PageIntro eyebrow="Практический маршрут / checklist" title={guide.title} summary={guide.summary} />
    <section className="container"><TechnicalDiagram kind={guide.diagram} title={guide.title} /></section>
    <div className="container detail-layout"><article className="prose">{guide.sections.map((section) => <ContentSection key={section.title} title={section.title}><p>{section.text}</p><BulletList items={section.checks} /></ContentSection>)}<RelatedLinks title="Продолжить по задаче" items={guide.links} /></article><RfqPanel href={guide.rfqHref} sourcePage={`/engineering/${guide.slug}/`} /></div>
  </>;
}
