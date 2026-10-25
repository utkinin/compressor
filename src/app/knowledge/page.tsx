import { contentRepository } from "@/content";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { Breadcrumbs, PageIntro } from "@/components/content-page";
import { KnowledgeHub } from "@/components/knowledge-hub";
import { JsonLd } from "@/components/json-ld";

const title = "База знаний";
const summary = "Практические материалы о компрессорах, технологических газах и подборе оборудования.";

export const metadata = pageMetadata(title, summary, "/knowledge/");

export default async function KnowledgePage() {
  const { articles } = await contentRepository.getSnapshot();
  return <>
    <Breadcrumbs items={[{ label: "База знаний", href: "/knowledge/" }]} />
    <PageIntro eyebrow="Экспертный центр" title={title} summary={summary} />
    <KnowledgeHub articles={articles.map(({ id, slug, title, summary, gasIds, equipmentIds, topic, heroVisualId }) => ({ id, slug, title, summary, gasIds, heroVisualId, ...(equipmentIds ? { equipmentIds } : {}), ...(topic ? { topic } : {}) }))} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: title, description: summary, url: absoluteUrl("/knowledge/"), inLanguage: "ru-RU", mainEntity: { "@type": "ItemList", numberOfItems: articles.length, itemListElement: articles.map((article, index) => ({ "@type": "ListItem", position: index + 1, item: { "@type": "Article", headline: article.title, url: absoluteUrl(`/knowledge/${article.slug}/`) } })) } }} />
  </>;
}
