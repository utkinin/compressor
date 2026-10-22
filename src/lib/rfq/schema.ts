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
  requestContext: z.object({ solution: z.string().max(150).optional(), equipment: z.string().max(150).optional(), document: z.string().max(150).optional() }).strict().optional(),
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

export function preliminarySolution(input: Pick<RfqInput, "gas" | "duty">): string {
  if (input.gas === "he") return "Безмасляный компрессорный модуль; схема recovery уточняется инженером";
  if (input.gas === "o2") return "Специальное кислородное исполнение после проверки совместимости и чистоты";
  if (input.gas === "h2") return "Компрессорный модуль для водорода с проверкой материалов, утечек и Ex-требований";
  if (input.gas === "co2") return "Компрессорный узел для CO₂ после проверки фазового состояния";
  return "Oil-Free booster / компрессорный модуль под рабочую точку процесса";
}
