import { productFamilies as originalSeed } from "./internal/unigy-seed";
import type { ProductFamily, ProductGasSpec } from "./types";

/** No gas-specific performance has been verified in the supplied material. */
export const productGasSpecs: ProductGasSpec[] = [];

/**
 * Public identity projection, deliberately excluding all unverified numerical data,
 * gas compatibility, cooling and drive claims from the supplied original seed.
 * Raw source values remain in internal/unigy-seed.ts until the catalogue is supplied.
 */
export const productFamilies: ProductFamily[] = originalSeed.map((seed) => ({
  id: seed.slug,
  slug: seed.slug,
  title: seed.name,
  summary: `Семейство UNIGY ${seed.name} из предоставленного исходного seed. Это отправная точка проектного рассмотрения: параметры и допустимые исполнения требуют проверки по каталогу и рабочей точке.`,
  editorialState: "review",
  brand: "UNIGY",
  categoryId: "oil-free-reciprocating",
  source: { title: seed.sourceNote, status: "draft" },
  sourceNote: seed.sourceNote,
  verificationStatus: "draft",
  technology: "В исходном seed семейство отнесено к Oil-Free поршневым компрессорам. Конструкция и исполнение должны быть сверены с первоисточником.",
  checks: [
    "Получить исходный каталог UNIGY, его редакцию и страницы с данными именно этого семейства.",
    "Сверить тип компрессора, привод, охлаждение и допустимый диапазон мощности.",
    "Для выбранного газа подтвердить материалы, герметичность и применимость исполнения.",
    "Уточнить абсолютную или избыточную базу давлений, температуру и условия приведения расхода.",
    "Подтвердить совместно достижимые P₁/P₂/Q, температуры и режим расчётным листом или ответом изготовителя.",
  ],
  technicalRows: [
    { label: "Категория в исходном seed", value: "Безмасляное поршневое семейство; требует сверки по каталогу", status: "draft" },
    { label: "Источник записи", value: seed.sourceNote, status: "draft" },
    { label: "Страница исходного каталога", value: "Не указана в seed; PDF каталога не предоставлен", status: "draft" },
    { label: "Максимальный входной диапазон", value: "Не опубликован до проверки первоисточника и базы давления", status: "draft" },
    { label: "Диапазон нагнетания и расхода", value: "Не опубликован до проверки каталога и условий расхода; не гарантированная рабочая точка", status: "draft" },
    { label: "Охлаждение и привод", value: "Сведения есть в исходном seed, но требуют сверки с первоисточником", status: "draft" },
    { label: "Диапазон мощности двигателя", value: "Не опубликован до подтверждения исполнения", status: "draft" },
    { label: "Утечки и допустимые газы", value: "Не заявлены без подтверждения для газа, материалов и условий испытания", status: "draft" },
  ],
  diagram: seed.slug === "of30-of500-dp" ? "large" : seed.slug.startsWith("of2-") ? "small" : "medium",
}));
