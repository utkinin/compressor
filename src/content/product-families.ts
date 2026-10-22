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
  summary: `Семейство ${seed.name} из исходных материалов проекта. Параметры и допустимые исполнения требуют проверки по первичной документации; эта запись не является предложением подтверждённой модели.`,
  editorialState: "review",
  categoryId: "oil-free-reciprocating",
  source: { title: `Исходная запись семейства ${seed.name}; первичный документ не предоставлен`, status: "draft" },
  sourceNote: `Исходная запись семейства ${seed.name}; первичный документ не предоставлен`,
  verificationStatus: "draft",
  technology: "Тип конструкции, требования к чистоте газа и исполнение должны быть подтверждены первичной документацией. Исходная запись сама по себе не подтверждает безмасляное исполнение или газовую совместимость.",
  checks: [
    "Получить первичный каталог, его редакцию и страницы с данными именно этого семейства.",
    "Сверить тип компрессора, привод, охлаждение и допустимый диапазон мощности.",
    "Для выбранного газа подтвердить материалы, герметичность и применимость исполнения.",
    "Уточнить абсолютную или избыточную базу давлений, температуру и условия приведения расхода.",
    "Подтвердить совместно достижимые P₁/P₂/Q, температуры и режим расчётным листом или ответом изготовителя.",
  ],
  technicalRows: [
    { label: "Конструкция и требования к чистоте", value: "Не подтверждены; требуется первичная документация", status: "draft" },
    { label: "Источник записи", value: "Внутренние исходные материалы; первичный документ не предоставлен", status: "draft" },
    { label: "Страница исходного каталога", value: "Не указана в seed; PDF каталога не предоставлен", status: "draft" },
    { label: "Максимальный входной диапазон", value: "Не опубликован до проверки первоисточника и базы давления", status: "draft" },
    { label: "Диапазон нагнетания и расхода", value: "Не опубликован до проверки каталога и условий расхода", status: "draft" },
    { label: "Охлаждение и привод", value: "Сведения есть в исходном seed, но требуют сверки с первоисточником", status: "draft" },
    { label: "Диапазон мощности двигателя", value: "Не опубликован до подтверждения исполнения", status: "draft" },
    { label: "Утечки и допустимые газы", value: "Не заявлены без подтверждения для газа, материалов и условий испытания", status: "draft" },
  ],
  diagram: seed.slug === "of30-of500-dp" ? "large" : seed.slug.startsWith("of2-") ? "small" : "medium",
}));
