"use client";

import Link from "next/link";
import { useState } from "react";
import type { GasId, KnowledgeArticle, KnowledgeTopic } from "@/content/types";
import { firstKnowledgeCluster, knowledgeTopic, knowledgeTopics, knowledgeTopicTitle } from "@/lib/knowledge";
import { HeroVisual } from "@/components/hero-visual";
import "./knowledge.css";

export type KnowledgeCard = Pick<KnowledgeArticle, "id" | "slug" | "title" | "summary" | "gasIds" | "equipmentIds" | "topic" | "heroVisualId">;
type GasFilter = GasId | "sf6";

const gasFilters: { id: GasFilter; title: string }[] = [
  { id: "n2", title: "Азот N₂" }, { id: "he", title: "Гелий He" },
  { id: "sf6", title: "Элегаз SF₆" }, { id: "co2", title: "Углекислый газ CO₂" },
  { id: "mixtures", title: "Газовые смеси" }, { id: "h2", title: "Водород H₂" }, { id: "o2", title: "Кислород O₂" },
];

function searchValue(value: string) {
  return value.toLocaleLowerCase("ru-RU").replace(/ё/g, "е").replace(/[₀-₉]/g, (digit) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(digit)));
}

function ArticleCard({ article, featured = false }: { article: KnowledgeCard; featured?: boolean }) {
  return <article className={`knowledge-card${featured ? " knowledge-card-featured" : ""}`}>
    <Link href={`/knowledge/${article.slug}/`} className="knowledge-card-visual" tabIndex={-1} aria-hidden="true"><HeroVisual id={article.heroVisualId} variant="card" caption={false} /></Link>
    <p className="knowledge-card-topic">{knowledgeTopicTitle(article)}</p>
    <h3><Link href={`/knowledge/${article.slug}/`}>{article.title}</Link></h3>
    <p>{article.summary}</p>
    <Link className="text-link" href={`/knowledge/${article.slug}/`}>Читать статью <span aria-hidden="true">→</span></Link>
  </article>;
}

export function KnowledgeHub({ articles }: { articles: KnowledgeCard[] }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<KnowledgeTopic | "">("");
  const [gas, setGas] = useState<GasFilter | "">("");
  const featured = firstKnowledgeCluster.flatMap((id) => articles.filter((article) => article.id === id));
  const terms = searchValue(query.trim()).split(/\s+/).filter(Boolean);
  const results = articles.filter((article) => {
    const gasMatch = !gas || (gas === "sf6" ? article.equipmentIds?.includes("sf6-compressors") : article.gasIds.includes(gas));
    const text = searchValue(`${article.title} ${article.summary} ${knowledgeTopicTitle(article)}`);
    return gasMatch && (!topic || knowledgeTopic(article) === topic) && terms.every((term) => text.includes(term));
  });
  const activeFilters = Boolean(query || topic || gas);
  const clearFilters = () => { setQuery(""); setTopic(""); setGas(""); };

  return <div className="container knowledge-hub">
    <section className="knowledge-start" aria-labelledby="knowledge-start-title">
      <div className="section-heading"><div><p className="eyebrow">Основные вопросы</p><h2 id="knowledge-start-title">Подбор и устройство компрессоров</h2></div><p>От исходных параметров до комплектации, условий работы и обслуживания.</p></div>
      <div className="knowledge-featured-grid">{featured.map((article) => <ArticleCard key={article.id} article={article} featured />)}</div>
    </section>
    <section className="knowledge-library" aria-labelledby="knowledge-library-title">
      <div className="section-heading"><div><p className="eyebrow">Все материалы</p><h2 id="knowledge-library-title">Найти статью</h2></div></div>
      <form className="knowledge-filters" role="search" onSubmit={(event) => event.preventDefault()}>
        <div className="field knowledge-search-field"><label htmlFor="knowledge-search">Поиск по базе знаний</label><input id="knowledge-search" type="search" placeholder="Например, расход или бустер азота" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        <div className="field"><label htmlFor="knowledge-topic">Тема</label><select id="knowledge-topic" value={topic} onChange={(event) => setTopic(event.target.value as KnowledgeTopic | "")}><option value="">Все темы</option>{knowledgeTopics.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></div>
        <div className="field"><label htmlFor="knowledge-gas">Газ</label><select id="knowledge-gas" value={gas} onChange={(event) => setGas(event.target.value as GasFilter | "")}><option value="">Все газы</option>{gasFilters.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></div>
      </form>
      <div className="knowledge-results-info"><p role="status" aria-live="polite">Материалов: {results.length}</p>{activeFilters && <button type="button" onClick={clearFilters}>Сбросить фильтры <span aria-hidden="true">×</span></button>}</div>
      {results.length ? <div className="knowledge-library-grid" data-testid="knowledge-library">{results.map((article) => <ArticleCard key={article.id} article={article} />)}</div> : <div className="knowledge-empty"><h3>По этому запросу статьи не найдены</h3><p>Попробуйте другое название газа или параметра либо выберите все темы.</p><button type="button" className="button button-secondary" onClick={clearFilters}>Показать все материалы</button></div>}
    </section>
    <section className="knowledge-help" aria-labelledby="knowledge-help-title"><div><h2 id="knowledge-help-title">Нужен компрессор под ваши параметры?</h2><p>Укажите газ, давление на входе, требуемое давление, расход и режим работы. Остальные требования уточним при подборе.</p></div><Link href="/rfq/?source=%2Fknowledge%2F" className="button">Подобрать компрессор <span aria-hidden="true">→</span></Link></section>
  </div>;
}
