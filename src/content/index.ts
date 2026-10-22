import { articles } from "./articles";
import { cases } from "./cases";
import { documents } from "./documents";
import { equipment } from "./equipment";
import { gases } from "./gases";
import { industries } from "./industries";
import { productFamilies, productGasSpecs } from "./product-families";
import { solutions } from "./solutions";
import type { Case, Document, Entity, Equipment, Gas, Industry, KnowledgeArticle, ProductFamily, Solution } from "./types";

export * from "./types";
export { articles, cases, documents, equipment, gases, industries, productFamilies, productGasSpecs, solutions };

export interface Collections {
  gases: Gas;
  solutions: Solution;
  equipment: Equipment;
  productFamilies: ProductFamily;
  articles: KnowledgeArticle;
  industries: Industry;
  cases: Case;
  documents: Document;
}

export type CollectionName = keyof Collections;
export type ContentSnapshot = { [K in CollectionName]: Collections[K][] };
export interface ContentRepository {
  getSnapshot(): Promise<ContentSnapshot>;
  list<K extends CollectionName>(collection: K): Collections[K][];
  findBySlug<K extends CollectionName>(collection: K, slug: string): Collections[K] | undefined;
  findById<K extends CollectionName>(collection: K, id: string): Collections[K] | undefined;
}

const collections: ContentSnapshot = {
  gases, solutions, equipment, productFamilies, articles, industries, cases, documents,
};

/** The local adapter includes review content for staging; no AI-generated entity is marked published. */
export const contentRepository: ContentRepository = {
  getSnapshot: async () => collections,
  list: (collection) => collections[collection],
  findBySlug: (collection, slug) => collections[collection].find((entity) => entity.slug === slug),
  findById: (collection, id) => collections[collection].find((entity) => entity.id === id),
};

export function relatedByIds<T extends Entity>(entities: T[], ids: string[]): T[] {
  const selected = new Set(ids);
  return entities.filter((entity) => selected.has(entity.id));
}

/** Public hubs never emit internal document records. */
export function publicDocuments(): Document[] {
  return documents.filter((document) => document.access !== "internal");
}
