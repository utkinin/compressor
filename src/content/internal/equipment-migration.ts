import { equipment } from "../equipment";
import { sourceModels } from "./source-model-registry";

export interface EquipmentMigrationRecord {
  currentName: string;
  currentSlug: string;
  currentSourceModel: string | null;
  source: string;
  realFunction: string;
  gasContext: string;
  application: string;
  publicLanforModel: false;
  verified: false;
  newPublicNames: string[];
  newPublicPaths: string[];
  action: "MERGE" | "CONVERT TO INTERNAL";
  previousRoute: "404";
}

function publicTargets(ids: string[]) {
  const items = equipment.filter((item) => ids.includes(item.id));
  return {
    newPublicNames: items.map((item) => item.title),
    newPublicPaths: items.map((item) => `/equipment/${item.slug}/`),
  };
}

const oldDirections = [
  {
    currentName: "Безмасляные поршневые компрессоры", currentSlug: "oil-free-reciprocating",
    realFunction: "Технология сжатия, не самостоятельная подтверждённая модель",
    gasContext: "Индивидуальный подбор по газу; список старой категории не подтверждает совместимость",
    application: "Сжатие азота, гелия, CO₂ либо другого согласованного газа",
    targets: ["nitrogen-compressors", "helium-compressors", "co2-compressors", "process-gas-compressors"],
  },
  {
    currentName: "Газовые бустеры", currentSlug: "gas-boosters",
    realFunction: "Дожатие предварительно сжатого газа",
    gasContext: "Азот как отдельный коммерческий intent; другие среды требуют индивидуальной проверки",
    application: "Повышение давления источника и согласование его с потребителем",
    targets: ["nitrogen-boosters", "process-gas-compressors"],
  },
  {
    currentName: "Компрессоры для встраивания", currentSlug: "compressor-modules",
    realFunction: "Вариант исполнения и интеграции, не отдельная линейка моделей",
    gasContext: "Газ определяется проектом",
    application: "Встраивание выбранного компрессора и необходимых опций в оборудование заказчика",
    targets: ["nitrogen-compressors", "nitrogen-boosters", "helium-compressors", "co2-compressors", "sf6-compressors", "process-gas-compressors"],
  },
  {
    currentName: "Компрессорные системы на общей раме", currentSlug: "compressor-skids",
    realFunction: "Вариант комплектации после выбора компрессора",
    gasContext: "Применимость проверяется по газу и исполнению",
    application: "Согласованная интеграция охлаждения, КИП, арматуры, буфера и автоматики",
    targets: ["nitrogen-compressors", "nitrogen-boosters", "helium-compressors", "co2-compressors", "sf6-compressors", "process-gas-compressors"],
  },
  {
    currentName: "Системы возврата газа", currentSlug: "recovery-systems",
    realFunction: "Технологическое решение из сбора, подготовки, компрессии и повторной подачи",
    gasContext: "Возвратный газ требует анализа состава",
    application: "Компрессорная функция связана с Solutions для полного цикла возврата",
    targets: ["helium-compressors", "co2-compressors", "process-gas-compressors"],
  },
];

/** Internal migration history is never a catalogue collection or a route generator. */
export const equipmentMigrationManifest: EquipmentMigrationRecord[] = [
  ...oldDirections.map((record): EquipmentMigrationRecord => ({
    currentName: record.currentName,
    currentSlug: record.currentSlug,
    currentSourceModel: null,
    source: "Предыдущая редакционная категория проекта; не паспорт оборудования",
    realFunction: record.realFunction,
    gasContext: record.gasContext,
    application: record.application,
    publicLanforModel: false,
    verified: false,
    ...publicTargets(record.targets),
    action: "MERGE",
    previousRoute: "404",
  })),
  ...sourceModels.map((model): EquipmentMigrationRecord => ({
    currentName: model.modelName,
    currentSlug: model.sourceSlugs[0],
    currentSourceModel: model.id,
    source: model.source.title,
    realFunction: "Непроверенная исходная компрессорная база; envelope не является характеристикой публичного предложения",
    gasContext: "Исходные gas codes сохраняются только как draft и не перенесены в публичную совместимость",
    application: "Список для инженерной проверки; применяется только после анализа документации и конкретных условий",
    publicLanforModel: false,
    verified: false,
    newPublicNames: [],
    newPublicPaths: [],
    action: "CONVERT TO INTERNAL",
    previousRoute: "404",
  })),
];
