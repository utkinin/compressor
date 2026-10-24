import Link from "next/link";
import type { Equipment } from "@/content";
import { HeroVisual } from "@/components/hero-visual";
import { ProcessVisual } from "@/components/process-visual";
import "./equipment-catalog.css";

const categoryLabels: Record<string, { symbol: string; task: string; cta: string }> = {
  "nitrogen-compressors": { symbol: "N₂", task: "Сжатие и повышение давления", cta: "Подобрать компрессор для азота" },
  "nitrogen-boosters": { symbol: "N₂", task: "Дожатие газа от источника", cta: "Подобрать бустер азота" },
  "helium-compressors": { symbol: "He", task: "Сжатие, перекачка и возврат", cta: "Подобрать компрессор для гелия" },
  "co2-compressors": { symbol: "CO₂", task: "Подбор с учётом состояния газа", cta: "Подобрать компрессор для CO₂" },
  "process-gas-compressors": { symbol: "Газ / смесь", task: "Индивидуальное рассмотрение состава", cta: "Отправить параметры газа" },
};

export function equipmentRfqHref(equipment: Equipment, sourcePage = `/equipment/${equipment.slug}/`): string {
  const query = new URLSearchParams({ gas: equipment.rfqGas, equipment: equipment.id, source: sourcePage });
  return `/rfq/?${query.toString()}`;
}

export function equipmentActionLabel(equipment: Equipment): string {
  return categoryLabels[equipment.id]?.cta ?? "Отправить параметры";
}

export function EquipmentCards({ items, sourcePage = "/equipment/", headingLevel = 2 }: { items: Equipment[]; sourcePage?: string; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 3 ? "h3" : "h2";
  return <div className="equipment-card-grid">{items.filter((item) => !item.externalReference).map((item) => {
    const label = categoryLabels[item.id];
    return <article className="equipment-catalog-card" key={item.id}>
      <Link className="equipment-card-illustration" href={`/equipment/${item.slug}/`} aria-label={`Открыть: ${item.title}`}><HeroVisual id={item.heroVisualId} variant="card" caption={false} /></Link>
      <div className="equipment-card-copy"><p className="eyebrow">{label?.task ?? "Подбор под параметры процесса"}</p><Heading><Link href={`/equipment/${item.slug}/`}>{item.title}</Link></Heading><p>{item.summary.split(/(?<=\.)\s+/)[0]}</p><ul className="equipment-card-tags" aria-label="Назначение"><li>{label?.symbol ?? "Газ"}</li><li>Подбор по параметрам</li></ul><Link className="equipment-card-detail" href={`/equipment/${item.slug}/`}>Назначение и варианты исполнения <span aria-hidden="true">→</span></Link><Link className="equipment-card-rfq" href={equipmentRfqHref(item, sourcePage)}>{equipmentActionLabel(item)} <span aria-hidden="true">→</span></Link></div>
    </article>;
  })}</div>;
}

const selectionParameters = [
  { name: "Газ", explanation: "Название газа или состав смеси, известные требования к чистоте." },
  { name: "Давление на входе P₁", explanation: "Давление непосредственно перед компрессором и его возможные изменения." },
  { name: "Требуемое давление P₂", explanation: "Давление на выходе с учётом требований потребителя." },
  { name: "Расход Q", explanation: "Значение, единица измерения, условия приведения, среднее и пиковое потребление." },
  { name: "Режим работы", explanation: "Непрерывная работа, периодическое включение или циклы с пиками и паузами." },
];

export function EquipmentSelection({ rfqHref = "/rfq/" }: { rfqHref?: string }) {
  return <section className="equipment-selection" aria-labelledby="equipment-selection-title">
    <p className="eyebrow">Как подобрать компрессор</p><h2 id="equipment-selection-title">Начнём с 5 основных параметров</h2>
    <p>Этого достаточно, чтобы начать подбор компрессора. Остальные параметры уточним в процессе проработки.</p>
    <ProcessVisual id="process-five-parameters" compact />
    <dl className="equipment-selection-fields">{selectionParameters.map((parameter, index) => <div key={parameter.name}><dt><span aria-hidden="true">0{index + 1}</span>{parameter.name}</dt><dd>{parameter.explanation}</dd></div>)}</dl>
    <p className="equipment-selection-note">Это начало подбора. Температура, влажность, герметичность, размещение, охлаждение, управление и другие условия уточняются для конкретного проекта.</p>
    <Link className="button" href={rfqHref}>Отправить параметры для подбора <span aria-hidden="true">→</span></Link>
  </section>;
}

export function EquipmentConfiguration({ configurations, options }: { configurations: string[]; options: string[] }) {
  return <section className="content-section equipment-configuration">
    <p className="eyebrow">После выбора компрессора</p><h2>Исполнение и необходимая комплектация</h2>
    <p>Сначала выбираем компрессор или бустер. Затем согласуем формат поставки и дополнительные компоненты. Возможность каждого исполнения и его состав подтверждаются при инженерной проработке.</p>
    <ProcessVisual id="process-supply" />
    <h3>Варианты для обсуждения</h3><ul>{configurations.map((configuration) => <li key={configuration}>{configuration}</li>)}</ul>
    <h3>Что может потребоваться дополнительно</h3><ul className="equipment-options">{options.map((option) => <li key={option}>{option}<span>По необходимости</span></li>)}</ul>
    <p className="equipment-selection-note">Перечень не означает, что все компоненты входят в поставку. Необходимость привода, охлаждения, КИП, арматуры, ресивера, автоматики, трубной обвязки и общей рамы определяется задачей и фиксируется в предложении.</p>
  </section>;
}
