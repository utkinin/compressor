import { notFound } from "next/navigation";
import { contentRepository } from "@/content";
import { publicNews } from "@/content/news";
import { Breadcrumbs, ContentSection, PageIntro, RelatedLinks } from "@/components/content-page";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return publicNews().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = publicNews().find((record) => record.slug === slug);
  return item ? pageMetadata(item.title, item.summary, `/news/${item.slug}/`) : {};
}

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = publicNews().find((record) => record.slug === slug);
  if (!item) notFound();
  const { equipment, solutions } = await contentRepository.getSnapshot();
  const published = new Date(`${item.published}T00:00:00.000Z`).toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

  return <>
    <Breadcrumbs items={[{ label: "О компании", href: "/about/" }, { label: "Новости Lanfor", href: "/about/#news" }, { label: item.title, href: `/news/${item.slug}/` }]} />
    <PageIntro eyebrow="Новости Lanfor" title={item.title} summary={item.summary} />
    <article className="container prose content-section">
      <p className="article-meta"><time dateTime={item.published}>{published}</time></p>
      {item.sections.map((section) => <ContentSection key={section.title} title={section.title}>
        {section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </ContentSection>)}
      <RelatedLinks title="Оборудование" items={equipment.filter((record) => item.equipmentIds.includes(record.id)).map((record) => ({ title: record.title, href: `/equipment/${record.slug}/` }))} />
      <RelatedLinks title="Решения" items={solutions.filter((record) => item.solutionIds.includes(record.id)).map((record) => ({ title: record.title, href: `/solutions/${record.slug}/` }))} />
    </article>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "NewsArticle", headline: item.title, description: item.summary, inLanguage: "ru-RU", datePublished: item.published, dateModified: item.updated, mainEntityOfPage: absoluteUrl(`/news/${item.slug}/`), author: { "@type": "Organization", name: "Lanfor Gas Systems" }, publisher: { "@type": "Organization", name: "Lanfor Gas Systems" } }} />
  </>;
}
