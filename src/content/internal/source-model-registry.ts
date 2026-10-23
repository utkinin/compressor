import { productFamilies as sourceSeed } from "./manufacturer-seed";

/** Private source reference only. A seed envelope is never a public performance guarantee. */
export interface SourceModelRecord {
  id: string;
  modelName: string;
  series: string;
  sourceSlugs: string[];
  aliases: string[];
  verificationStatus: "draft";
  source: { title: string; status: "draft"; primaryDocumentProvided: false };
  capabilities: {
    candidateGasCodes: string[];
    inletPressureMpaMax?: number;
    dischargePressureMpaMax?: number;
    flowNm3hMin?: number;
    flowNm3hMax?: number;
    motorKwMin?: number;
    motorKwMax?: number;
    tightnessMbarLs?: number;
    cooling: string[];
    transmission?: string;
  };
}

/** The only registry from which source-name denylist checks derive their terms. */
export const sourceModels: SourceModelRecord[] = sourceSeed.map((record) => {
  const suffix = record.name.split("/")[1];
  const tokens = record.name.match(/[A-Z]+\d+/g) ?? [];
  const aliases = [...new Set([
    record.name.replaceAll("–", "-"),
    ...tokens,
    ...(suffix ? [`/${suffix}`, `-${suffix}`] : []),
  ])];
  return {
    id: `source-${record.slug}`,
    modelName: record.name,
    series: record.name.split("/")[0],
    sourceSlugs: [record.slug],
    aliases,
    verificationStatus: "draft",
    source: { title: record.sourceNote, status: "draft", primaryDocumentProvided: false },
    capabilities: {
      candidateGasCodes: [...record.gases],
      inletPressureMpaMax: record.inletPressureMpaMax,
      dischargePressureMpaMax: record.dischargePressureMpaMax,
      flowNm3hMin: record.flowNm3hMin,
      flowNm3hMax: record.flowNm3hMax,
      motorKwMin: record.motorKwMin,
      motorKwMax: record.motorKwMax,
      tightnessMbarLs: record.tightnessMbarLs,
      cooling: [...record.cooling],
      transmission: record.transmission,
    },
  };
});

export interface EquipmentCapabilityLink {
  id: string;
  publicEquipmentIds: string[];
  sourceModelIds: string[];
  status: "draft";
  selectionStatus: "requires-engineering-review";
  rationale: string;
}

const candidateSourceIds = (gasCode: string) => sourceModels
  .filter((model) => model.capabilities.candidateGasCodes.includes(gasCode))
  .map((model) => model.id);

/**
 * Many-to-many private research links, not gas compatibility approvals or an
 * automated model-selection rule. No runtime page or client imports this file.
 */
export const equipmentCapabilityLinks: EquipmentCapabilityLink[] = [
  {
    id: "nitrogen-compression-review",
    publicEquipmentIds: ["nitrogen-compressors", "nitrogen-boosters"],
    sourceModelIds: candidateSourceIds("N2"),
    status: "draft", selectionStatus: "requires-engineering-review",
    rationale: "Исходный список газа позволяет начать проверку нескольких баз; первичная документация и совместно достижимые параметры не подтверждены.",
  },
  {
    id: "helium-compression-review", publicEquipmentIds: ["helium-compressors"],
    sourceModelIds: candidateSourceIds("He"),
    status: "draft", selectionStatus: "requires-engineering-review",
    rationale: "Требуется отдельная проверка материалов, утечек, давления источника и режима; исходный envelope не является разрешением на применение.",
  },
  {
    id: "carbon-dioxide-compression-review", publicEquipmentIds: ["co2-compressors"],
    sourceModelIds: candidateSourceIds("CO2"),
    status: "draft", selectionStatus: "requires-engineering-review",
    rationale: "Связь служит только списком для проверки газовой фазы, материалов и температурного режима по первоисточнику.",
  },
  {
    id: "sulfur-hexafluoride-own-data-review", publicEquipmentIds: ["sf6-compressors"], sourceModelIds: [],
    status: "draft", selectionStatus: "requires-engineering-review",
    rationale: "Собственные утверждённые данные на исполнение не предоставлены. Совместимость из внешнего draft-списка не перенесена в публичное направление.",
  },
  {
    id: "process-composition-review", publicEquipmentIds: ["process-gas-compressors"], sourceModelIds: [],
    status: "draft", selectionStatus: "requires-engineering-review",
    rationale: "Для смеси нужны состав и требования проекта; принадлежность source model к отдельному газу не подтверждает пригодность к смеси.",
  },
];
