import { GAS_FIELDS, GAS_OPTIONS, PROJECT_FIELDS, type Pressure, type RfqInput } from "./schema";

type QuestionnaireInput = Pick<RfqInput, "gas" | "inlet" | "outlet" | "flow" | "duty" | "dutyDetails" | "details" | "project">;

const dutyLabels: Record<RfqInput["duty"], string> = {
  continuous: "Непрерывный",
  intermittent: "Периодический",
  cycle: "По циклу",
  peak: "Пиковая нагрузка",
  unknown: "Требует уточнения",
};

function pressureText(pressure: Pressure): string {
  const reference = pressure.unit === "MPa" ? pressure.reference === "absolute" ? " (абс.)" : " (изб.)" : "";
  return `${pressure.value} ${pressure.unit}${reference}`;
}

/** Exports technical inputs only; contact details and consent are not part of the sheet. */
export function formatRfqQuestionnaire(input: QuestionnaireInput): string {
  const flowUnit = input.flow.unit === "Nm3/h" ? "Nm³/h" : input.flow.unit === "m3/h" ? "m³/h" : input.flow.unit;
  const lines = [
    "LANFOR GAS SYSTEMS",
    "Опросный лист на подбор газового компрессора",
    "",
    `Газ: ${GAS_OPTIONS.find((gas) => gas.value === input.gas)?.label}`,
    `P₁ — давление на входе: ${pressureText(input.inlet)}`,
    `P₂ — требуемое давление: ${pressureText(input.outlet)}`,
    `Q — расход: ${input.flow.value} ${flowUnit}`,
    ...(input.flow.reference ? [`Условия расхода: ${input.flow.reference}`] : []),
    `Режим работы: ${dutyLabels[input.duty]}`,
    ...(input.dutyDetails ? [`Цикл и пиковая нагрузка: ${input.dutyDetails}`] : []),
    "",
    "Уточняющие параметры газа",
    ...GAS_FIELDS[input.gas].map((field) => `${field.label}: ${input.details[field.key] || "Требует уточнения"}`),
    "",
    "Дополнительные требования",
    ...PROJECT_FIELDS.map((field) => `${field.label}: ${input.project?.[field.key]?.trim() || "Не указано"}`),
    "",
    "Параметры и исполнение оборудования требуют инженерного подтверждения.",
  ];
  return `${lines.join("\n")}\n`;
}
