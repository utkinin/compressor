import type { VisualAsset } from "./types";
import { knowledgeVisualAssets } from "./knowledge-visuals";

const conceptCaption = "Иллюстрация компоновки. Исполнение определяется при подборе.";

function renderAsset(id: string, kind: "product" | "application", directory: string, filename: string, alt: string): VisualAsset {
  const stem = `/images/visuals/${directory}/${filename}`;
  return {
    id, kind, src: `${stem}.webp`, cardSrc: `${stem}-card.webp`, mobileSrc: `${stem}-mobile.webp`,
    alt, aspectRatio: "3 / 2", width: 1800, height: 1200, focalPoint: "50% 50%",
    responsiveSources: [{ src: `${stem}-small.webp`, width: 384 }, { src: `${stem}-medium.webp`, width: 600 }, { src: `${stem}-mobile.webp`, width: 900 }, { src: `${stem}.webp`, width: 1800 }],
    cardWidth: directory === "solutions" ? 720 : 900,
    approvedForPublic: true, depiction: "concept", caption: conceptCaption,
  };
}

function sceneAsset(id: string, filename: string, alt: string): VisualAsset {
  return {
    id, kind: "application", src: `/images/visuals/solutions/${filename}.svg`,
    alt, aspectRatio: "3 / 2", width: 900, height: 600,
    approvedForPublic: true, depiction: "principle", caption: "Принцип применения. Комплектация определяется условиями задачи.",
  };
}

/** Images illustrate an equipment class or a task; they are not model photographs. */
export const visualAssets: VisualAsset[] = [
  renderAsset("home-compressor-system", "product", "home", "process-gas-compressor-system", "Компрессорная система для сжатия технологического газа: компрессор, привод и охлаждение"),
  renderAsset("equipment-range", "product", "equipment", "range", "Вариант компоновки компрессорного оборудования с приводом и охлаждением"),
  renderAsset("equipment-nitrogen-compressor", "product", "equipment", "nitrogen-compressor", "Компрессор с приводом и охлаждением — иллюстрация компоновки для азотного направления"),
  renderAsset("equipment-nitrogen-booster", "product", "equipment", "nitrogen-booster", "Компактный бустер с приводом — иллюстрация повышения давления азота от источника"),
  renderAsset("equipment-helium-compressor", "product", "equipment", "helium-compressor", "Компрессор в закрытой компоновке — иллюстрация оборудования для сжатия и возврата гелия"),
  renderAsset("equipment-co2-compressor", "product", "equipment", "co2-compressor", "Компрессор с отдельным охлаждением — иллюстрация компоновки для работы с CO₂"),
  {
    ...renderAsset("equipment-sf6-compressor", "product", "equipment", "sf6-compressor", "Обобщённая форма газового компрессора для справочного раздела об оборудовании SF₆"),
    depiction: "principle",
    caption: "Обобщённая иллюстрация. Специализированное оборудование — в направлении SF6RUS.",
  },
  renderAsset("equipment-process-gas", "product", "equipment", "process-gas-compressor", "Газовый компрессор с приводом — иллюстрация оборудования для технологических газов и смесей"),
  renderAsset("solution-nitrogen-after-generator", "application", "solutions", "nitrogen-after-generator", "Генератор азота, отдельный бустер и оборудование потребителя"),
  renderAsset("solution-laser", "application", "solutions", "laser", "Лазерный станок и оборудование подачи технологического газа"),
  renderAsset("solution-helium-recovery", "application", "solutions", "helium-recovery", "Испытательный процесс, сбор газа, компрессор и ёмкости повторной подачи гелия"),
  renderAsset("solution-co2", "application", "solutions", "co2", "Компрессор, охлаждение и потребитель технологического газа без изображения фазового перехода"),
  renderAsset("solution-integration", "application", "solutions", "integration", "Компрессорный модуль в границах оборудования заказчика с подключениями газа, питания, охлаждения и управления"),
  sceneAsset("solution-nitrogen-pressure-boosting", "nitrogen-pressure-boosting", "Бустер между источником азота и оборудованием потребителя"),
  sceneAsset("solution-clean-gas", "clean-gas", "Разделение газового тракта компрессора и привода для рассмотрения чистоты газа"),
  sceneAsset("solution-buffer", "buffer", "Компрессор рядом с буферной ёмкостью и потребителем газа"),
  sceneAsset("solution-transfer", "transfer", "Перенос газа между исходной и приёмной ёмкостями с помощью компрессора"),
  sceneAsset("solution-hydrogen", "hydrogen", "Компрессор в границах проектного рассмотрения водородной установки"),
  sceneAsset("solution-oxygen", "oxygen", "Газовый компрессор и контролируемые подключения для проектного рассмотрения кислородной задачи"),
  sceneAsset("solution-supply", "supply", "Компрессор с отдельно показанными возможными элементами комплектации"),
  sceneAsset("solution-helium-compression", "helium-compression", "Компрессор между источником гелия и приёмной ёмкостью"),
  sceneAsset("solution-process-gas", "process-gas", "Компрессор и оборудование процесса для технологического газа или смеси"),
  {
    id: "supply-compressor-to-system", kind: "infographic", src: "/images/visuals/solutions/supply-compressor-to-system.svg",
    alt: "От отдельного компрессора к необходимым опциям и комплектной системе; дополнительные элементы показаны как варианты",
    aspectRatio: "3 / 2", width: 1200, height: 800, approvedForPublic: true, depiction: "principle",
  },
  ...knowledgeVisualAssets,
];

export type ProcessStep = { id: string; label: string; detail?: string; icon?: string; optional?: boolean };
export type ProcessSpec = {
  id: string;
  title: string;
  caption?: string;
  layout?: "flow" | "loop" | "comparison" | "progression" | "parameters" | "interfaces";
  steps?: ProcessStep[];
  branches?: { id: string; title: string; steps: ProcessStep[] }[];
  callouts?: ProcessStep[];
};

const parameters: ProcessStep[] = [
  { id: "gas", label: "Газ", detail: "Состав и известные требования к качеству", icon: "gas" },
  { id: "inlet", label: "P₁ — давление на входе", detail: "Доступные условия источника", icon: "inlet" },
  { id: "outlet", label: "P₂ — требуемое давление", detail: "Требования потребителя", icon: "outlet" },
  { id: "flow", label: "Q — расход", detail: "С единицей и условиями приведения", icon: "flow" },
  { id: "duty", label: "Режим работы", detail: "Непрерывная работа или цикл", icon: "duty" },
];

const supplySteps: ProcessStep[] = [
  { id: "compressor", label: "Компрессор", detail: "Базовое оборудование для согласованной задачи", icon: "compressor" },
  { id: "options", label: "Компрессор + опции", detail: "Необходимые охлаждение и КИП", icon: "options" },
  { id: "system", label: "Комплектная система", detail: "Согласованный состав, при необходимости — ресивер, автоматика и общая рама", icon: "system" },
];

/** Native process figures remain editable and become vertical steps on phones. */
export const processSpecs: ProcessSpec[] = [
  {
    id: "process-home", title: "От источника газа к потребителю", layout: "flow",
    steps: [
      { id: "source", label: "Источник газа", icon: "source" },
      { id: "compressor", label: "Компрессор / бустер", icon: "compressor" },
      { id: "consumer", label: "Потребитель", icon: "consumer" },
    ], caption: "Дополнительное оборудование определяем по условиям задачи.",
  },
  { id: "process-five-parameters", title: "Пять исходных параметров для подбора", layout: "parameters", callouts: parameters },
  { id: "process-selection", title: "Как подбирается оборудование", layout: "parameters", callouts: parameters },
  {
    id: "process-nitrogen-after-generator", title: "Дожатие азота после источника", layout: "flow",
    steps: [
      { id: "source", label: "Источник N₂", icon: "generator" },
      { id: "buffer", label: "Буфер", detail: "Если требуется по графику потребления", icon: "receiver", optional: true },
      { id: "booster", label: "Бустер", icon: "compressor" },
      { id: "consumer", label: "Потребитель", icon: "consumer" },
    ], caption: "Бустер повышает давление. Доступное количество газа определяется подачей источника и режимом потребления.",
  },
  {
    id: "process-laser", title: "Два варианта газоснабжения лазера", layout: "comparison",
    branches: [
      { id: "air", title: "Сжатый воздух", steps: [
        { id: "compressor", label: "Компрессор", icon: "compressor" },
        { id: "receiver", label: "Ресивер", icon: "receiver" },
        { id: "dryer", label: "Осушение", icon: "dryer" },
        { id: "filter", label: "Фильтрация", icon: "filter" },
        { id: "laser", label: "Лазер", icon: "laser" },
      ] },
      { id: "nitrogen", title: "Азот", steps: [
        { id: "source", label: "Источник / генератор N₂", icon: "generator" },
        { id: "booster", label: "Бустер", icon: "compressor" },
        { id: "receiver", label: "Ресивер", detail: "По условиям потребления", icon: "receiver", optional: true },
        { id: "laser", label: "Лазер", icon: "laser" },
      ] },
    ], caption: "Давление, расход и качество газа определяются требованиями станка, материалом, толщиной и технологией резки. Подходящий газ выбирают по условиям процесса.",
  },
  {
    id: "process-helium-recovery", title: "Возврат гелия в процесс", layout: "loop",
    steps: [
      { id: "process", label: "Процесс", icon: "process" },
      { id: "collection", label: "Сбор", icon: "recovery" },
      { id: "buffer", label: "Буфер", icon: "receiver" },
      { id: "compressor", label: "Компрессор", icon: "compressor" },
      { id: "reuse", label: "Хранение / повторная подача", icon: "storage" },
    ], caption: "Качество возвращаемого газа, допустимые потери и полный материальный баланс проверяют до выбора исполнения.",
  },
  {
    id: "process-co2", title: "Сжатие CO₂ с проверкой условий", layout: "flow",
    steps: [
      { id: "source", label: "Источник", icon: "source" },
      { id: "conditions", label: "Проверка условий", detail: "Состав, температура, давление и фаза", icon: "conditions" },
      { id: "compressor", label: "Компрессор", icon: "compressor" },
      { id: "cooling", label: "Охлаждение", icon: "cooling" },
      { id: "process", label: "Процесс", icon: "process" },
    ], caption: "Состояние CO₂ по маршруту сжатия и охлаждения проверяется расчётом для конкретных условий.",
  },
  {
    id: "process-integration", title: "Компрессор в границах вашей установки", layout: "interfaces",
    callouts: [
      { id: "gas", label: "Газ", detail: "Вход и выход, состав и герметичность", icon: "gas" },
      { id: "power", label: "Питание", detail: "Привод и электрические подключения", icon: "power" },
      { id: "cooling", label: "Охлаждение", detail: "Тепловой режим и доступный теплоноситель", icon: "cooling" },
      { id: "control", label: "Управление", detail: "Сигналы, разрешения и защиты", icon: "control" },
    ], caption: "Габариты, интерфейсы и сервисный доступ согласуются с интегратором до выбора комплектации.",
  },
  { id: "process-supply", title: "От компрессора до комплектной системы", layout: "progression", steps: supplySteps, caption: "Показаны варианты комплектации. Дополнительные элементы и общая рама включаются только по необходимости и в согласованных границах поставки." },
  { id: "supply-compressor-to-system", title: "Компрессор → необходимые опции → комплектная система", layout: "progression", steps: supplySteps, caption: "Состав определяем после выбора компрессора. Охлаждение, КИП, ресивер, управление и рама не являются обязательным набором для каждой задачи." },
  {
    id: "process-gas", title: "От исходных условий к подаче газа", layout: "flow",
    steps: [
      { id: "source", label: "Источник газа", icon: "source" },
      { id: "conditions", label: "Проверка условий", detail: "Газ, давление, расход и режим", icon: "conditions" },
      { id: "compressor", label: "Компрессор / бустер", icon: "compressor" },
      { id: "consumer", label: "Потребитель", icon: "consumer" },
    ], caption: "Необходимые материалы, охлаждение, подготовку и управление определяют для конкретного газа и процесса.",
  },
  {
    id: "process-buffer", title: "Компрессор, накопление и потребление", layout: "flow",
    steps: [
      { id: "source", label: "Источник", icon: "source" },
      { id: "compressor", label: "Компрессор", icon: "compressor" },
      { id: "buffer", label: "Ресивер", detail: "Объём и рабочие условия — по расчёту", icon: "receiver" },
      { id: "consumer", label: "Потребитель", icon: "consumer" },
    ], caption: "Буфер помогает согласовать графики подачи и потребления, но не создаёт дополнительный газ.",
  },
  {
    id: "process-transfer", title: "Перенос газа между объёмами", layout: "flow",
    steps: [
      { id: "source", label: "Исходный объём", icon: "storage" },
      { id: "compressor", label: "Компрессор", icon: "compressor" },
      { id: "receiver", label: "Приёмный объём", icon: "receiver" },
    ], caption: "Условия в обоих объёмах и их изменение в ходе операции учитываются при подборе оборудования.",
  },
  {
    id: "process-multistage", title: "Последовательное сжатие с охлаждением", layout: "flow",
    steps: [
      { id: "stage-1", label: "Ступень 1", icon: "stage" },
      { id: "cooling-1", label: "Охлаждение", icon: "cooling" },
      { id: "stage-2", label: "Ступень 2", icon: "stage" },
      { id: "cooling-2", label: "Охлаждение", icon: "cooling" },
      { id: "stage-3", label: "Ступень 3", icon: "stage" },
    ], caption: "Необходимое число ступеней и состав охлаждения определяются расчётом для конкретного газа и режима.",
  },
];

const visualById = new Map(visualAssets.map(asset => [asset.id, asset]));
const processById = new Map(processSpecs.map(spec => [spec.id, spec]));

export function getVisualAsset(id: string): VisualAsset | undefined {
  const asset = visualById.get(id);
  return asset?.approvedForPublic ? asset : undefined;
}

export function getProcessSpec(id: string): ProcessSpec | undefined {
  return processById.get(id);
}
