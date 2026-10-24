import { notFound } from "next/navigation";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, BulletList, ContentSection, RelatedLinks, RfqPanel } from "@/components/content-page";
import { CommercialHero } from "@/components/commercial-hero";
import { ProcessVisual } from "@/components/process-visual";
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
    <CommercialHero eyebrow="Практический маршрут / checklist" title={guide.title} summary={guide.summary} visualId={guide.heroVisualId} action={<Link className="button" href={guide.rfqHref}>Подобрать компрессор <span aria-hidden="true">→</span></Link>} />
    <section className="container commercial-process-section" aria-label="Принцип процесса"><ProcessVisual id={guide.processVisualId} /></section>
    <div className="container detail-layout"><article className="prose">{guide.sections.map((section) => <ContentSection key={section.title} title={section.title}><p>{section.text}</p><BulletList items={section.checks} /></ContentSection>)}<RelatedLinks title="Продолжить по задаче" items={guide.links} /></article><RfqPanel href={guide.rfqHref} sourcePage={`/engineering/${guide.slug}/`} /></div>
  </>;
}
