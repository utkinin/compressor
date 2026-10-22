import Link from "next/link";
import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, EntityCard, PageIntro } from "@/components/content-page";

export const metadata = pageMetadata("Инженерная база знаний", "Практические ответы о давлении, расходе, Oil-Free компрессии, режимах, охлаждении и подборе газового компрессора.", "/knowledge/");

export default async function KnowledgePage() {
  const { articles } = await contentRepository.getSnapshot();
  return <>
    <Breadcrumbs items={[{ label: "База знаний", href: "/knowledge/" }]} />
    <PageIntro eyebrow="Knowledge / инженерные ответы" title="Разобраться до отправки запроса." summary="Рабочие объяснения величин и решений, которые влияют на выбор компрессора. Не новости компании и не обещания по каталожной модели — материал для постановки инженерной задачи." action={<Link className="button-secondary" href="/engineering/">Маршрут инженерного подбора →</Link>} />
    <section className="container section"><div className="content-grid">{articles.map((article) => <EntityCard key={article.id} title={article.title} summary={article.summary} href={`/knowledge/${article.slug}/`} />)}</div></section>
  </>;
}
