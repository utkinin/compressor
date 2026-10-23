import type { KnowledgeArticle, KnowledgeTopic } from "@/content/types";

export const firstKnowledgeCluster = [
  "what-to-specify-for-gas-compressor",
  "why-process-gas-compressors-need-task-specific-selection",
  "what-is-in-compressor-skid",
  "sf6-compressor-service-life",
  "how-to-select-nitrogen-booster",
  "compressors-for-gas-mixtures",
] as const;

export const knowledgeTopics: { id: KnowledgeTopic; title: string }[] = [
  { id: "selection", title: "Подбор компрессора" },
  { id: "gas-properties", title: "Свойства газов" },
  { id: "configuration", title: "Комплектация" },
  { id: "operation", title: "Эксплуатация" },
];

export function knowledgeTopic(article: Pick<KnowledgeArticle, "id" | "title" | "topic">): KnowledgeTopic {
  if (article.topic) return article.topic;
  if (/service-life|duty|maintenance|cooling|sealing|leak|noise/.test(article.id)) return "operation";
  if (/skid|receiver|automation|system/.test(article.id)) return "configuration";
  if (/gas-mixtures|oil-free|helium|oxygen|hydrogen|co2|purity/.test(article.id)) return "gas-properties";
  return "selection";
}

export function knowledgeTopicTitle(article: Pick<KnowledgeArticle, "id" | "title" | "topic">): string {
  return knowledgeTopics.find((topic) => topic.id === knowledgeTopic(article))!.title;
}

export function isFirstKnowledgeArticle(id: string): boolean {
  return firstKnowledgeCluster.some((item) => item === id);
}
