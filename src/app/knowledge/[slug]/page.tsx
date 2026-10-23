import { notFound } from "next/navigation";
import Link from "next/link";
import { contentRepository } from "@/content";
import { pageMetadata, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumbs, ContentSection, PageIntro, RelatedLinks } from "@/components/content-page";
import { LegacyAlias } from "@/components/legacy-alias";
import { legacyDestination, legacySlugs } from "@/lib/legacy-paths";
import { KnowledgeVisual } from "@/components/knowledge-visual";
import { KnowledgeArticleTable } from "@/components/knowledge-article-table";
import { knowledgeTopic } from "@/lib/knowledge";
import "@/components/knowledge.css";

export async function generateStaticParams() {
  const { articles } = await contentRepository.getSnapshot();
  return [...articles.map(({ slug }) => ({ slug })), ...legacySlugs("knowledge")];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const target = legacyDestination("knowledge", slug);
  if (target) return { ...pageMetadata("Материал перенесён", "Статья о подборе и применении газовых компрессоров Lanfor.", target), robots: { index: false, follow: true } };
  const { articles } = await contentRepository.getSnapshot();
  const article = articles.find((item) => item.slug === slug);
  return article ? pageMetadata(article.title, article.summary, `/knowledge/${article.slug}/`) : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const target = legacyDestination("knowledge", slug);
  if (target) return <LegacyAlias target={target} />;
  const { articles, gases, solutions, equipment } = await contentRepository.getSnapshot();
  const article = articles.find((item) => item.slug === slug);
  if (!article) notFound();
  const sourcePage = `/knowledge/${article.slug}/`;
  const relatedSolutions = solutions.filter((item) => article.solutionIds.includes(item.id));
  const equipmentIds = article.equipmentIds?.length ? article.equipmentIds : relatedSolutions.flatMap((item) => item.equipmentIds);
  const relatedEquipment = equipment.filter((item) => equipmentIds.includes(item.id)).slice(0, 3);
  const relatedGases = gases.filter((item) => article.gasIds.includes(item.id));
  const relatedArticles = article.relatedArticleIds?.length
    ? article.relatedArticleIds.flatMap((id) => articles.filter((item) => item.id === id && item.id !== article.id))
    : articles.filter((item) => item.id !== article.id && (knowledgeTopic(item) === knowledgeTopic(article) || item.gasIds.some((gas) => article.gasIds.includes(gas)))).slice(0, 3);
  const primaryEquipment = relatedEquipment[0];
  const specialistReference = primaryEquipment?.externalReference;
  const rfqParams = new URLSearchParams({ source: sourcePage });
  if (primaryEquipment) { rfqParams.set("equipment", primaryEquipment.id); rfqParams.set("gas", primaryEquipment.rfqGas); }
  else if (article.gasIds.length === 1) rfqParams.set("gas", article.gasIds[0]);
  if (relatedSolutions.length === 1) rfqParams.set("solution", relatedSolutions[0].id);
  const rfqHref = `/rfq/?${rfqParams}`;
  return <>
    <Breadcrumbs items={[{ label: "База знаний", href: "/knowledge/" }, { label: article.title, href: `/knowledge/${article.slug}/` }]} />
    <PageIntro eyebrow="Экспертный центр" title={article.title} summary={article.summary} />
    <div className="container detail-layout knowledge-layout"><article className="prose knowledge-article">
      <p className="article-meta"><span>Обновлено: <time dateTime={article.updated}>{new Date(article.updated).toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}</time></span></p>
      <KnowledgeVisual articleId={article.id} />
      {article.sections.map((section, index) => <div key={section.title}><ContentSection id={`article-section-${index + 1}`} title={section.title}>{section.body.split(/\n\s*\n/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</ContentSection>{index === 1 && <KnowledgeArticleTable articleId={article.id} />}</div>)}
      {specialistReference ? <ContentSection title="Специализированное оборудование для SF₆"><p>Оборудование и решения для работы с элегазом представлены в направлении SF6RUS. При рассмотрении задачи учитываются состояние газа, режим работы, требования к подготовке и обслуживанию конкретного исполнения.</p><a className="button" href={specialistReference.url} target="_blank" rel="noopener noreferrer">Оборудование для SF₆ — {specialistReference.name} <span aria-hidden="true">↗</span></a></ContentSection> : <ContentSection title="Обсудить подбор компрессора"><p>Передайте известные параметры, единицы измерения и требования к газу. Если часть данных пока неизвестна, укажите это в запросе — уточним их при проработке оборудования.</p><Link className="button" href={rfqHref}>Отправить параметры для подбора <span aria-hidden="true">→</span></Link></ContentSection>}
      <RelatedLinks title="Оборудование по теме" items={relatedEquipment.map((item) => ({ title: item.title, href: `/equipment/${item.slug}/` }))} />
      <RelatedLinks title="Решения для технологических задач" items={relatedSolutions.map((item) => ({ title: item.title, href: `/solutions/${item.slug}/` }))} />
      <RelatedLinks title="Технологические газы" items={relatedGases.length ? relatedGases.map((item) => ({ title: item.title, href: `/gases/${item.slug}/` })) : [{ title: "Особенности технологических газов", href: "/gases/" }]} />
      <RelatedLinks title="Читайте также" items={relatedArticles.map((item) => ({ title: item.title, href: `/knowledge/${item.slug}/` }))} />
      <Link className="text-link knowledge-back" href="/knowledge/">Все материалы базы знаний <span aria-hidden="true">→</span></Link>
    </article><aside className="knowledge-sidebar"><nav aria-labelledby="article-contents-title" className="knowledge-toc"><h2 id="article-contents-title">В этой статье</h2><ol>{article.sections.map((section, index) => <li key={section.title}><a href={`#article-section-${index + 1}`}>{section.title}</a></li>)}</ol></nav>{specialistReference ? <section className="knowledge-rfq"><p className="eyebrow">Специализированное направление</p><h2>Оборудование для SF₆ — {specialistReference.name}</h2><p>Перейдите к специализированному оборудованию для сжатия, перекачки и других операций с элегазом.</p><a className="button" href={specialistReference.url} target="_blank" rel="noopener noreferrer">Перейти в SF6RUS <span aria-hidden="true">↗</span></a></section> : <section className="knowledge-rfq"><p className="eyebrow">Газ · P₁ · P₂ · Q · режим</p><h2>Подберём компрессор по вашим параметрам</h2><p>Укажите, какой газ нужно сжимать, откуда он поступает и что требуется потребителю.</p><Link className="button" href={rfqHref}>Подобрать компрессор <span aria-hidden="true">→</span></Link><Link className="knowledge-questionnaire" href="/documents/process-gas-questionnaire/">Заполнить опросный лист →</Link></section>}</aside></div>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.summary, inLanguage: "ru-RU", dateModified: article.updated, mainEntityOfPage: absoluteUrl(sourcePage), isPartOf: { "@type": "CollectionPage", name: "База знаний", url: absoluteUrl("/knowledge/") }, author: { "@type": "Organization", name: "Lanfor Gas Systems" } }} />
  </>;
}
