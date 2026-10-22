import { notFound } from "next/navigation";
import { contentRepository } from "@/content";
import { pageMetadata, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumbs, ContentSection, PageIntro, RelatedLinks, RfqPanel } from "@/components/content-page";
import { LegacyAlias } from "@/components/legacy-alias";
import { legacyDestination, legacySlugs } from "@/lib/legacy-paths";

export async function generateStaticParams() {
  const { articles } = await contentRepository.getSnapshot();
  return [...articles.map(({ slug }) => ({ slug })), ...legacySlugs("knowledge")];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const target = legacyDestination("knowledge", slug);
  if (target) return { ...pageMetadata("Материал перенесён", "Канонический адрес инженерного материала Lanfor.", target), robots: { index: false, follow: true } };
  const { articles } = await contentRepository.getSnapshot();
  const article = articles.find((item) => item.slug === slug);
  return article ? pageMetadata(article.title, article.summary, `/knowledge/${article.slug}/`) : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const target = legacyDestination("knowledge", slug);
  if (target) return <LegacyAlias target={target} />;
  const { articles, gases, solutions } = await contentRepository.getSnapshot();
  const article = articles.find((item) => item.slug === slug);
  if (!article) notFound();
  return <>
    <Breadcrumbs items={[{ label: "База знаний", href: "/knowledge/" }, { label: article.title, href: `/knowledge/${article.slug}/` }]} />
    <PageIntro eyebrow="Инженерная база знаний" title={article.title} summary={article.summary} />
    <div className="container detail-layout"><article className="prose">
      <p className="article-meta">Обновлено: <time dateTime={article.updated}>{new Date(article.updated).toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}</time> · Инженерный материал, на согласовании</p>
      {article.sections.map((section) => <ContentSection key={section.title} title={section.title}><p>{section.body}</p></ContentSection>)}
      <ContentSection title="Как использовать материал в запросе"><p>Перенесите известные параметры в рабочую точку, укажите единицы и диапазоны. Если расчёт ещё не выполнен, отделите заданные требования от предположений. Это позволит проверить решение без подмены исходных данных каталогом.</p></ContentSection>
      <RelatedLinks title="Связанные инженерные решения" items={solutions.filter((item) => article.solutionIds.includes(item.id)).map((item) => ({ title: item.title, href: `/solutions/${item.slug}/` }))} />
      <RelatedLinks title="Особенности газов" items={gases.filter((item) => article.gasIds.includes(item.id)).map((item) => ({ title: item.title, href: `/gases/${item.slug}/` }))} />
    </article><RfqPanel sourcePage={`/knowledge/${article.slug}/`} title="Уточним вашу рабочую точку" /></div>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.summary, inLanguage: "ru-RU", dateModified: article.updated, mainEntityOfPage: absoluteUrl(`/knowledge/${article.slug}/`), author: { "@type": "Organization", name: "Lanfor Gas Systems" } }} />
  </>;
}
