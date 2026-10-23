import { z } from "zod";

export const CONSENT_VERSION = "2026-10-22-v1";
export const GAS_OPTIONS = [
  { value: "n2", label: "N₂ · Азот" },
  { value: "he", label: "He · Гелий" },
  { value: "h2", label: "H₂ · Водород" },
  { value: "o2", label: "O₂ · Кислород" },
  { value: "co2", label: "CO₂ · Диоксид углерода" },
  { value: "mixtures", label: "Смесь / другой газ" },
] as const;

export type Gas = (typeof GAS_OPTIONS)[number]["value"];

/** Public catalogue context only; no internal selection records enter the form. */
export const RFQ_EQUIPMENT_CONTEXTS = {
  "nitrogen-compressors": { title: "Компрессор для азота", gas: "n2" },
  "nitrogen-boosters": { title: "Бустер азота высокого давления", gas: "n2" },
  "helium-compressors": { title: "Компрессор для гелия", gas: "he" },
  "co2-compressors": { title: "Компрессор для CO₂", gas: "co2" },
  "sf6-compressors": { title: "Компрессор для SF₆", gas: "mixtures" },
  "process-gas-compressors": { title: "Компрессор для технологических газов", gas: "mixtures" },
} as const satisfies Record<string, { title: string; gas: Gas }>;

export const RFQ_SOLUTION_CONTEXTS: Record<string, { title: string; gases?: Gas[] }> = {
  "nitrogen-booster-after-generator": { title: "Дожатие азота после генератора", gases: ["n2"] },
  "nitrogen-pressure-boosting": { title: "Повышение давления азота", gases: ["n2"] },
  "nitrogen-for-laser-cutting": { title: "Система подачи азота для лазерной резки", gases: ["n2"] },
  "helium-compression": { title: "Сжатие гелия", gases: ["he"] },
  "helium-recovery": { title: "Возврат и повторное использование гелия", gases: ["he"] },
  "hydrogen-compression": { title: "Сжатие водорода", gases: ["h2"] },
  "co2-compression": { title: "Сжатие и подача CO₂ в процесс", gases: ["co2"] },
  "oxygen-compression": { title: "Сжатие кислорода", gases: ["o2"] },
  "process-gas-compressor": { title: "Сжатие технологического газа до требуемого давления" },
  "oil-free-gas-booster": { title: "Дожатие газа с сохранением чистоты" },
  "compressor-skid": { title: "Комплектная компрессорная система на общей раме" },
  "equipment-integration": { title: "Встраивание компрессора в оборудование" },
  "gas-transfer-recovery": { title: "Перекачка и возврат газа" },
  "buffer-receiver-charging": { title: "Заполнение буфера и ресивера" },
};

export const RFQ_DOCUMENT_CONTEXTS: Record<string, { title: string }> = {
  "process-gas-questionnaire": { title: "Опросный лист на подбор газового компрессора" },
  "technical-documentation": { title: "Техническая документация" },
};

export const PROJECT_FIELDS = [
  { key: "temperature", label: "Температура газа и окружающей среды" },
  { key: "composition", label: "Состав и чистота газа" },
  { key: "placement", label: "Условия размещения" },
  { key: "cooling", label: "Охлаждение" },
  { key: "power", label: "Электропитание" },
  { key: "automation", label: "Автоматика" },
  { key: "other", label: "Прочие требования" },
] as const;

export const projectRequirementsSchema = z.object({
  temperature: z.string().trim().max(2000).optional(),
  composition: z.string().trim().max(2000).optional(),
  placement: z.string().trim().max(2000).optional(),
  cooling: z.string().trim().max(2000).optional(),
  power: z.string().trim().max(2000).optional(),
  automation: z.string().trim().max(2000).optional(),
  other: z.string().trim().max(2000).optional(),
}).strict();

export type ProjectRequirements = z.infer<typeof projectRequirementsSchema>;

export type RfqContextKind = "solution" | "equipment" | "document";
export type RfqRequestContext = Partial<Record<RfqContextKind, string>>;

export function publicRfqContextLabel(kind: RfqContextKind, id: string): string | undefined {
  const contexts = {
    solution: RFQ_SOLUTION_CONTEXTS,
    equipment: RFQ_EQUIPMENT_CONTEXTS,
    document: RFQ_DOCUMENT_CONTEXTS,
  }[kind];
  return Object.hasOwn(contexts, id)
    ? (contexts as Record<string, { title: string }>)[id].title
    : undefined;
}

/** Keep query parameters and submitted context inside the public catalogue. */
export function sanitizeRfqContext(raw: Partial<Record<RfqContextKind, unknown>>): RfqRequestContext {
  const context: RfqRequestContext = {};
  for (const kind of ["solution", "equipment", "document"] as const) {
    const value = raw[kind];
    if (typeof value === "string" && publicRfqContextLabel(kind, value)) context[kind] = value;
  }
  return context;
}

export function equipmentRfqContext(id?: string): { title: string; gas: Gas } | undefined {
  return id && Object.hasOwn(RFQ_EQUIPMENT_CONTEXTS, id)
    ? RFQ_EQUIPMENT_CONTEXTS[id as keyof typeof RFQ_EQUIPMENT_CONTEXTS]
    : undefined;
}

export function initialRfqSelection(gas: Gas | undefined, equipment?: string): { gas: Gas; details: Record<string, string> } {
  const selectedGas = gas ?? equipmentRfqContext(equipment)?.gas ?? "n2";
  const details: Record<string, string> = equipment === "sf6-compressors" && selectedGas === "mixtures"
    ? { composition: "SF₆; чистота и примеси требуют уточнения" }
    : {};
  return { gas: selectedGas, details };
}
export interface GasField {
  key: string;
  label: string;
  help?: string;
}

export const GAS_FIELDS: Record<Gas, GasField[]> = {
  n2: [
    { key: "source", label: "Источник азота", help: "PSA, мембранный генератор, магистраль или криогенный источник" },
    { key: "purity", label: "Чистота азота", help: "Укажите известную чистоту и примеси либо «неизвестно»" },
    { key: "inletRange", label: "Минимальное и максимальное давление на входе", help: "Укажите диапазон и единицы; это влияет на производительность" },
    { key: "flowProfile", label: "Средний и пиковый расход", help: "Расход, длительность пика и единицы либо «требует уточнения»" },
  ],
  he: [
    { key: "mode", label: "Свежий газ или recovery?" },
    { key: "recoveryScheme", label: "Предполагаемая схема возврата", help: "Источники возврата, газгольдер, очистка, буфер либо «требует разработки»" },
    { key: "leakageSensitivity", label: "Требования к утечкам и герметичности" },
  ],
  h2: [
    { key: "composition", label: "Состав и чистота водорода" },
    { key: "exRequirements", label: "Требования к взрывозащите", help: "Укажите требование проекта либо «не определено»" },
    { key: "hazardousArea", label: "Классификация опасной зоны" },
    { key: "leakageRequirements", label: "Допустимые утечки и контроль герметичности" },
    { key: "temperature", label: "Температура газа и окружающей среды" },
  ],
  o2: [
    { key: "purity", label: "Чистота кислорода" },
    { key: "oxygenCompatibility", label: "Требования к кислородной совместимости", help: "Материалы и требования проекта; Oil-Free само по себе недостаточно" },
    { key: "cleanliness", label: "Требования к чистоте и обезжириванию" },
  ],
  co2: [
    { key: "inletTemperature", label: "Температура CO₂ на входе" },
    { key: "phase", label: "Фаза на входе: газ / жидкость / неизвестно", help: "Жидкая и двухфазная среда требуют отдельной проверки" },
    { key: "operatingRange", label: "Диапазон давления и температуры при работе" },
  ],
  mixtures: [
    { key: "composition", label: "Состав смеси и доли компонентов", help: "Включая примеси, влагу и опасные компоненты; неизвестный состав уточняется до подбора" },
  ],
};

export const pressureSchema = z.object({
  value: z.number().finite().min(0).max(10000),
  unit: z.enum(["bar(g)", "bar(a)", "MPa"]),
  reference: z.enum(["gauge", "absolute"]).optional(),
}).strict().superRefine((pressure, context) => {
  if (pressure.unit === "MPa" && !pressure.reference) {
    context.addIssue({ code: "custom", path: ["reference"], message: "Для MPa укажите избыточное или абсолютное давление" });
  }
  if ((pressure.unit === "bar(a)" || (pressure.unit === "MPa" && pressure.reference === "absolute")) && pressure.value <= 0) {
    context.addIssue({ code: "custom", path: ["value"], message: "Абсолютное давление должно быть больше нуля" });
  }
  if ((pressure.unit === "bar(g)" && pressure.reference === "absolute") || (pressure.unit === "bar(a)" && pressure.reference === "gauge")) {
    context.addIssue({ code: "custom", path: ["reference"], message: "База давления противоречит выбранной единице" });
  }
});

export type Pressure = z.infer<typeof pressureSchema>;

/** Preliminary comparison only; local atmospheric pressure is confirmed by the engineer. */
export function pressureToAbsoluteBar(pressure: Pressure): number {
  const base = pressure.unit === "MPa" ? pressure.value * 10 : pressure.value;
  return pressure.unit === "bar(g)" || (pressure.unit === "MPa" && pressure.reference === "gauge") ? base + 1.01325 : base;
}

const optionalText = z.string().trim().max(1000).optional();
const location = z.string().trim().min(1).max(2000).refine((value) => {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
}, "Укажите путь страницы или HTTP(S) URL");

export const flowSchema = z.object({
  value: z.number().finite().positive("Расход должен быть больше нуля").max(1_000_000_000),
  unit: z.enum(["Nm3/h", "m3/h", "l/min", "kg/h"]),
  reference: optionalText,
}).strict().superRefine((value, context) => {
  if (["Nm3/h", "m3/h", "l/min"].includes(value.unit) && !value.reference?.trim()) {
    context.addIssue({ code: "custom", path: ["reference"], message: "Укажите температуру и давление приведения либо рабочие условия расхода" });
  }
});

const workingPointBase = z.object({
  gas: z.enum(["n2", "he", "h2", "o2", "co2", "mixtures"]),
  inlet: pressureSchema,
  outlet: pressureSchema,
  flow: flowSchema,
  duty: z.enum(["continuous", "intermittent", "cycle", "peak", "unknown"]),
  dutyDetails: optionalText,
  details: z.record(z.string().max(50), z.string().trim().max(2000)),
});

function validateGasDetails(value: Pick<z.infer<typeof workingPointBase>, "gas" | "details">, context: z.RefinementCtx): void {
  for (const requirement of GAS_FIELDS[value.gas]) {
    if (!value.details[requirement.key]?.trim()) {
      context.addIssue({ code: "custom", path: ["details", requirement.key], message: `Уточните: ${requirement.label.toLowerCase()}` });
    }
  }
  const allowed = new Set(GAS_FIELDS[value.gas].map((requirement) => requirement.key));
  for (const key of Object.keys(value.details)) {
    if (!allowed.has(key)) context.addIssue({ code: "custom", path: ["details", key], message: "Параметр не относится к выбранному газу" });
  }
}

function validatePressurePair(value: Pick<z.infer<typeof workingPointBase>, "inlet" | "outlet">, context: z.RefinementCtx): void {
  if (pressureToAbsoluteBar(value.outlet) <= pressureToAbsoluteBar(value.inlet)) {
    context.addIssue({ code: "custom", path: ["outlet", "value"], message: "Давление P₂ должно быть выше P₁ при одинаковой базе сравнения" });
  }
}

function validateDuty(value: Pick<z.infer<typeof workingPointBase>, "duty" | "dutyDetails">, context: z.RefinementCtx): void {
  if (["cycle", "peak"].includes(value.duty) && !value.dutyDetails?.trim()) {
    context.addIssue({ code: "custom", path: ["dutyDetails"], message: "Опишите цикл или пиковую нагрузку" });
  }
}

function validateWorkingPoint(value: z.infer<typeof workingPointBase>, context: z.RefinementCtx): void {
  validateGasDetails(value, context);
  validatePressurePair(value, context);
  validateDuty(value, context);
}

export const gasDetailsSchema = workingPointBase.pick({ gas: true, details: true }).superRefine(validateGasDetails);
export const pressurePairSchema = workingPointBase.pick({ inlet: true, outlet: true }).superRefine(validatePressurePair);
export const dutySchema = workingPointBase.pick({ duty: true, dutyDetails: true }).superRefine(validateDuty);
export const rfqWorkingPointSchema = workingPointBase.strict().superRefine(validateWorkingPoint);

export const rfqSchema = workingPointBase.extend({
  project: projectRequirementsSchema.optional(),
  contact: z.object({
    name: z.string().trim().min(2, "Укажите имя").max(120),
    company: z.string().trim().min(2, "Укажите организацию").max(200),
    email: z.email("Проверьте email").max(254),
    phone: z.string().trim().max(50).optional(),
  }).strict(),
  consent: z.object({
    accepted: z.literal(true, { error: "Необходимо отдельное согласие на обработку персональных данных" }),
    version: z.literal(CONSENT_VERSION, { error: "Версия согласия изменилась. Обновите страницу" }),
  }).strict(),
  attribution: z.object({
    sourcePage: location,
    landingPage: location,
    referrer: z.string().max(2000).optional(),
    utm: z.object({ source: z.string().max(200).optional(), medium: z.string().max(200).optional(), campaign: z.string().max(200).optional(), term: z.string().max(200).optional(), content: z.string().max(200).optional() }).strict().optional(),
  }).strict(),
  honeypot: z.string().max(0, "Запрос отклонён").optional(),
  requestContext: z.object({
    solution: z.string().max(150).refine((id) => Boolean(publicRfqContextLabel("solution", id)), "Выберите задачу из публичного каталога").optional(),
    equipment: z.string().max(150).refine((id) => Boolean(publicRfqContextLabel("equipment", id)), "Выберите оборудование из публичного каталога").optional(),
    document: z.string().max(150).refine((id) => Boolean(publicRfqContextLabel("document", id)), "Выберите документ из публичного каталога").optional(),
  }).strict().optional(),
}).strict().superRefine(validateWorkingPoint);

export interface RfqValidationIssue { path: string; message: string }

/** Validate only the active form stage; future blank fields must not suppress its refinements. */
export function validateRfqStep(step: number, input: unknown): RfqValidationIssue[] {
  const value = input !== null && typeof input === "object" ? input as Record<string, unknown> : {};
  const results = [
    () => gasDetailsSchema.safeParse({ gas: value.gas, details: value.details }),
    () => z.object({ inlet: pressureSchema }).safeParse({ inlet: value.inlet }),
    () => pressurePairSchema.safeParse({ inlet: value.inlet, outlet: value.outlet }),
    () => z.object({ flow: flowSchema }).safeParse({ flow: value.flow }),
    () => dutySchema.safeParse({ duty: value.duty, dutyDetails: value.dutyDetails }),
  ];
  const result = results[step]?.();
  if (!result) return [{ path: "form", message: "Неизвестный шаг формы" }];
  return result.success ? [] : result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
}

export type RfqInput = z.infer<typeof rfqSchema>;

export interface PreliminaryEquipment {
  type: string;
  purpose: string;
  configuration: "Уточняется после инженерного расчёта";
  status: "Требуется инженерное подтверждение";
}

type PreliminaryInput = Pick<RfqInput, "gas"> & Partial<Pick<RfqInput, "details" | "requestContext">>;

export function solutionRfqPurpose(id: string | undefined, gas: Gas): string | undefined {
  if (!id || !Object.hasOwn(RFQ_SOLUTION_CONTEXTS, id)) return undefined;
  const purpose = RFQ_SOLUTION_CONTEXTS[id];
  return !purpose.gases || purpose.gases.includes(gas) ? purpose.title : undefined;
}

/** Describes the requested public equipment class, never a calculated model selection. */
export function preliminaryEquipment(input: PreliminaryInput): PreliminaryEquipment {
  const details = input.details ?? {};
  const equipment = equipmentRfqContext(input.requestContext?.equipment);
  const sf6Request = input.gas === "mixtures" && /SF[₆6]|элегаз/i.test(details.composition ?? "");
  const matchingEquipment = equipment?.gas === input.gas
    && (input.requestContext?.equipment !== "sf6-compressors" || sf6Request);
  const defaults: Record<Gas, string> = {
    n2: "Компрессор или бустер для азота",
    he: "Компрессор для гелия",
    h2: "Компрессор для водорода после проверки исполнения",
    o2: "Компрессор для кислорода после проверки совместимости",
    co2: "Компрессор для CO₂",
    mixtures: sf6Request ? "Компрессор для SF₆" : "Компрессор для заданного состава газа",
  };
  const defaultPurposes: Record<Gas, string> = {
    n2: "Сжатие или повышение давления азота",
    he: /recovery|возврат|рекуп|восстанов/i.test(details.mode ?? "") ? "Возврат и повторное использование гелия" : "Сжатие и перекачка гелия",
    h2: "Индивидуальная задача сжатия водородсодержащего газа",
    o2: "Индивидуальная задача сжатия кислорода",
    co2: "Сжатие и перекачка CO₂ с проверкой фазового состояния",
    mixtures: sf6Request ? "Индивидуальная задача сжатия или перекачки SF₆" : "Сжатие технологического газа после анализа состава",
  };
  return {
    type: matchingEquipment ? equipment.title : defaults[input.gas],
    purpose: solutionRfqPurpose(input.requestContext?.solution, input.gas) ?? defaultPurposes[input.gas],
    configuration: "Уточняется после инженерного расчёта",
    status: "Требуется инженерное подтверждение",
  };
}

export function preliminarySolution(input: Pick<RfqInput, "gas" | "duty">): string {
  return preliminaryEquipment(input).type;
}
