import "./solution-process-visual.css";

type Kind = "nitrogen" | "laser" | "helium" | "process-gas" | "integration";

const steps: Record<Kind, { title: string; note?: string }[]> = {
  nitrogen: [
    { title: "Источник N₂", note: "генератор или магистраль" },
    { title: "Бустер", note: "повышает давление" },
    { title: "Потребитель", note: "требуемые P₂ и Q" },
  ],
  laser: [
    { title: "Источник газа", note: "N₂ или сжатый воздух" },
    { title: "Подготовка / буфер", note: "по требованиям станка" },
    { title: "Лазер", note: "стабильная подача газа" },
  ],
  helium: [
    { title: "Процесс", note: "точка возврата газа" },
    { title: "Сбор / буфер", note: "стабилизация потока" },
    { title: "Компрессор", note: "повторное сжатие" },
    { title: "Возврат", note: "в хранение или процесс" },
  ],
  "process-gas": [
    { title: "Источник газа", note: "состав и состояние" },
    { title: "Проверка условий", note: "P₁, T, состав" },
    { title: "Компрессор", note: "под заданный режим" },
    { title: "Процесс", note: "требуемые P₂ и Q" },
  ],
  integration: [
    { title: "Интерфейсы", note: "газ · питание · охлаждение · управление" },
    { title: "Компрессорный модуль", note: "под ограничения установки" },
    { title: "Оборудование заказчика", note: "сервисный доступ и подключения" },
  ],
};

const labels: Record<Kind, string> = {
  nitrogen: "Схема дожатия азота после источника",
  laser: "Схема подачи газа к лазерному станку",
  helium: "Схема возврата гелия в технологический процесс",
  "process-gas": "Схема подбора компрессора для технологического газа",
  integration: "Схема встраивания компрессорного модуля в оборудование",
};

export function SolutionProcessVisual({ kind }: { kind: Kind }) {
  return <figure className={`solution-process-visual is-${kind}`} aria-label={labels[kind]}>
    <div className="solution-process-track">
      {steps[kind].map((step, index) => <div className="solution-process-stage" key={step.title}>
        <div className="solution-process-node"><span className="solution-process-index" aria-hidden="true">0{index + 1}</span><strong>{step.title}</strong>{step.note && <small>{step.note}</small>}</div>
        {index < steps[kind].length - 1 && <span className="solution-process-arrow" aria-hidden="true">→</span>}
      </div>)}
    </div>
    <figcaption>{labels[kind]}. Конкретная комплектация определяется после проверки исходных данных.</figcaption>
  </figure>;
}
