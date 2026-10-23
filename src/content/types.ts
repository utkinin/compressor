export type EditorialState = "draft" | "review" | "approved" | "published";
export type EvidenceStatus = "engineering-verified" | "source-transcribed" | "draft";
export type GasId = "n2" | "he" | "h2" | "o2" | "co2" | "mixtures";

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
  gasIds: GasId[];
  intent: string;
  inputs: string[];
  approach: string[];
  constraints: string[];
  supply: string[];
  equipmentIds: string[];
  articleIds: string[];
  diagram: string;
}

export interface Equipment extends Entity {
  externalReference?: { name: string; url: string };
  kind: "equipment-direction";
  gas: GasId | "sf6";
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
  rfqGas: GasId;
  /** Navigation associations are engineering topics, not an approval of gas compatibility. */
  gasIds: GasId[];
  diagram: string;
}

export type KnowledgeTopic = "selection" | "gas-properties" | "configuration" | "operation";

export interface KnowledgeArticle extends Entity {
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
