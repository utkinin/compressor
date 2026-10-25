export type EditorialState = "draft" | "review" | "approved" | "published";
export type EvidenceStatus = "engineering-verified" | "source-transcribed" | "draft";
export type GasId = "n2" | "he" | "h2" | "o2" | "co2" | "mixtures";

/** Public imagery describes equipment principles, never an unapproved model. */
export type VisualAsset = {
  id: string;
  kind: "product" | "application" | "process" | "infographic" | "editorial";
  src: string;
  alt: string;
  aspectRatio: string;
  width: number;
  height: number;
  cardSrc?: string;
  mobileSrc?: string;
  focalPoint?: string;
  responsiveSources?: { src: string; width: number }[];
  cardWidth?: number;
  approvedForPublic: boolean;
  depiction?: "concept" | "principle";
  caption?: string;
};

export interface Entity {
  id: string;
  slug: string;
  title: string;
  summary: string;
  editorialState: EditorialState;
}

export interface Source {
  title: string;
  url?: string;
  page?: string;
  status: EvidenceStatus;
}

export interface TechnicalProperty {
  label: string;
  value: string;
  status: EvidenceStatus;
  source?: Source;
}

export interface Gas extends Entity {
  heroVisualId: string;
  processVisualId: string;
  id: GasId;
  symbol: string;
  tasks: string[];
  inputs: string[];
  features: string[];
  limitations: string[];
  scheme: string;
  faq: { question: string; answer: string }[];
  solutionIds: string[];
  equipmentIds: string[];
}

export interface Solution extends Entity {
  heroVisualId: string;
  processVisualId: string;
  gasIds: GasId[];
  intent: string;
  inputs: string[];
  approach: string[];
  constraints: string[];
  supply: string[];
  equipmentIds: string[];
  articleIds: string[];
}

export interface Equipment extends Entity {
  heroVisualId: string;
  processVisualId: string;
  externalReference?: { name: string; url: string };
  kind: "equipment-direction";
  gas: GasId | "air" | "vacuum" | "sf6";
  technology: string;
  scope: string[];
  checks: string[];
  source: Source;
  properties: TechnicalProperty[];
  applications: string[];
  inputs: string[];
  approach: string[];
  configurations: string[];
  options: string[];
  solutionIds: string[];
  articleIds: string[];
  verifiedCapabilities: TechnicalProperty[];
  rfqGas?: GasId;
  /** Navigation associations are engineering topics, not an approval of gas compatibility. */
  gasIds: GasId[];
}

export type KnowledgeTopic = "selection" | "gas-properties" | "configuration" | "operation";

export interface KnowledgeArticle extends Entity {
  heroVisualId: string;
  figureIds?: string[];
  sections: { title: string; body: string }[];
  gasIds: GasId[];
  solutionIds: string[];
  equipmentIds?: string[];
  relatedArticleIds?: string[];
  topic?: KnowledgeTopic;
  updated: string;
}

export interface Industry extends Entity {
  tasks: string[];
  constraints: string[];
  gasIds: GasId[];
  solutionIds: string[];
}

export type CaseKind = "real-project" | "reference-working-point" | "typical-engineering-scenario";

export interface Case extends Entity {
  heroVisualId: string;
  processVisualId: string;
  kind: CaseKind;
  input: string;
  approach: string[];
  checks: string[];
  gasIds: GasId[];
  solutionIds: string[];
}

export type DocumentType = "Datasheet" | "Catalogue" | "Manual" | "Drawing" | "CAD" | "STEP" | "Questionnaire" | "Certificate" | "Calculation sheet";
export interface Document extends Entity {
  type: DocumentType;
  access: "public" | "request" | "internal";
  href?: string;
  gasIds: GasId[];
  equipmentIds: string[];
}

/**
 * A status label is not evidence. A publishable property also needs a source
 * record with a retrievable HTTPS document and a specific page/section.
 * The record and its applicability still require human engineering review.
 */
export function publicProperties(properties: TechnicalProperty[]): TechnicalProperty[] {
  return properties.filter((property) => {
    const source = property.source;
    if (property.status === "draft" || !source || source.status !== property.status) return false;
    if (!source.title.trim() || !source.page?.trim() || !source.url) return false;
    try {
      const locator = new URL(source.url);
      return locator.protocol === "https:" && Boolean(locator.hostname) && !locator.username && !locator.password;
    } catch {
      return false;
    }
  });
}
