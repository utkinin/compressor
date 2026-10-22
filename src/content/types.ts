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
  technology: string;
  scope: string[];
  checks: string[];
  source: Source;
  properties: TechnicalProperty[];
  /** Navigation associations are engineering topics, not an approval of gas compatibility. */
  gasIds: GasId[];
  diagram: string;
}

/** Manufacturer family identity from the supplied seed, separate from verified gas-specific performance. */
export interface ProductFamily extends Entity {
  /** Optional approved public brand; private supplier identity stays in the internal seed. */
  brand?: string;
  categoryId: "oil-free-reciprocating";
  source: Source;
  sourceNote: string;
  verificationStatus: "draft";
  technology: string;
  checks: string[];
  technicalRows: { label: string; value: string; status: EvidenceStatus }[];
  diagram: string;
}

/** A family envelope cannot stand in for this gas/configuration-specific relation. */
export interface ProductGasSpec {
  id: string;
  productFamilyId: string;
  gasId: GasId;
  configuration: string;
  inlet: { min: number; max: number; unit: "bar" | "MPa"; reference: "gauge" | "absolute" };
  outlet: { min: number; max: number; unit: "bar" | "MPa"; reference: "gauge" | "absolute" };
  flow: { min: number; max: number; unit: "Nm3/h" | "m3/h" | "l/min" | "kg/h"; reference: string };
  inletTemperature: string;
  duty: string;
  source: Source;
  status: EvidenceStatus;
}

export interface KnowledgeArticle extends Entity {
  sections: { title: string; body: string }[];
  gasIds: GasId[];
  solutionIds: string[];
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

export const FAMILY_ENVELOPE_DISCLAIMER = "Каталожный диапазон семейства не подтверждает характеристики в конкретных условиях. Компрессор подбирается с учётом газа, давления на входе, требуемого давления, расхода, температуры и режима работы.";
