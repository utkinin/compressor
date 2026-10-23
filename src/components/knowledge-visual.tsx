import type { ReactNode } from "react";

type BlockProps = { x: number; y: number; width?: number; title: string; note?: string; accent?: boolean; noteSize?: number };
function Block({ x, y, width = 160, title, note, accent = false, noteSize = 13 }: BlockProps) {
  return <g transform={`translate(${x} ${y})`}>
    <rect width={width} height="74" rx="2" fill={accent ? "#e2b995" : "#e9eee1"} stroke={accent ? "#c47c50" : "#91a18a"} />
    <text x={width / 2} y={note ? 31 : 43} textAnchor="middle" fill="#243b2c" fontSize="17" fontWeight="600">{title}</text>
    {note && <text x={width / 2} y="53" textAnchor="middle" fill="#52654d" fontSize={noteSize}>{note}</text>}
  </g>;
}
function Arrow({ x, y, width = 38 }: { x: number; y: number; width?: number }) {
  return <g fill="none" stroke="#8da17f" strokeWidth="2"><path d={`M${x} ${y}h${width}`} /><path d={`m${x + width - 6} ${y - 5} 6 5-6 5`} /></g>;
}
function Diagram({ label, children }: { label: string; children: ReactNode }) {
  return <svg className="knowledge-visual-wide" viewBox="0 0 760 240" role="img" aria-label={label}><title>{label}</title>{children}</svg>;
}

const mobileStages: Record<string, { title: string; note: string }[]> = {
  "what-to-specify-for-gas-compressor": [
    { title: "Газ · P₁ · P₂ · Q · режим", note: "пять основных параметров" },
    { title: "Подбор компрессора", note: "по условиям процесса" },
    { title: "Исполнение и комплектация", note: "после выбора компрессора" },
  ],
  "why-process-gas-compressors-need-task-specific-selection": [
    { title: "Условия процесса", note: "газ · P₁ · P₂ · Q · режим" },
    { title: "Подбор", note: "расчёт и совместимость" },
    { title: "Оборудование", note: "исполнение и необходимые опции" },
  ],
  "what-is-in-compressor-skid": [
    { title: "Компрессор", note: "основное оборудование" },
    { title: "Необходимые опции", note: "по условиям процесса" },
    { title: "Комплектная система", note: "согласованный состав" },
  ],
  "sf6-compressor-service-life": [
    { title: "Состояние SF₆ и нагрузка", note: "влага · примеси · температура · режим" },
    { title: "Клапаны и уплотнения", note: "состояние и герметичность" },
    { title: "Обслуживание", note: "контроль по документации" },
  ],
  "how-to-select-nitrogen-booster": [
    { title: "Источник азота", note: "доступные давление P₁ и расход Q" },
    { title: "Бустер", note: "повышение давления" },
    { title: "Ресивер", note: "по расчёту" },
    { title: "Потребитель", note: "требуемые давление P₂ и расход Q" },
  ],
  "compressors-for-gas-mixtures": [
    { title: "Состав смеси", note: "компоненты, концентрации и примеси" },
    { title: "Совместимость", note: "материалы и безопасность" },
    { title: "Компрессор", note: "подтверждённое исполнение" },
  ],
};

function MobileDiagram({ articleId, label }: { articleId: string; label: string }) {
  const stages = mobileStages[articleId];
  if (!stages) return null;
  return <svg className="knowledge-visual-mobile" viewBox={`0 0 380 ${stages.length * 102 + 16}`} role="img" aria-label={label}><title>{label}</title>
    {stages.map((stage, index) => <g key={stage.title}>
      <Block x={24} y={20 + index * 102} width={332} title={stage.title} note={stage.note} noteSize={15} accent={index === 1} />
      {index < stages.length - 1 && <g fill="none" stroke="#8da17f" strokeWidth="2"><path d={`M190 ${101 + index * 102}v14`} /><path d={`m185 ${110 + index * 102} 5 5 5-5`} /></g>}
    </g>)}
  </svg>;
}

const illustrations: Record<string, { label: string; caption: string; content: ReactNode }> = {
  "what-to-specify-for-gas-compressor": {
    label: "Пять основных параметров для подбора компрессора",
    caption: "Газ, два давления, расход и режим работы задают начало подбора. Дополнительные требования уточняются для конкретного процесса.",
    content: <><text x="40" y="44" fontSize="14" fill="#afbd9f">ИСХОДНЫЕ ПАРАМЕТРЫ</text>{["Газ", "P₁", "P₂", "Q", "Режим"].map((item, index) => <g key={item}><rect x={40 + index * 89} y="85" width="76" height="68" fill="#e9eee1" stroke="#91a18a" /><text x={78 + index * 89} y="127" textAnchor="middle" fontSize="21" fill="#243b2c">{item}</text></g>)}<Arrow x={491} y={119} width={42} /><Block x={548} y={82} width={172} title="Компрессор" note="под ваши параметры" accent /></>,
  },
  "why-process-gas-compressors-need-task-specific-selection": {
    label: "Условия процесса определяют выбор компрессора",
    caption: "Одинаковое требуемое давление может соответствовать разным газам, расходам и режимам. Подбор учитывает условия вместе.",
    content: <><Block x={35} y={83} width={193} title="Условия процесса" note="газ · P₁ · P₂ · Q · режим" /><Arrow x={239} y={120} width={40} /><Block x={290} y={83} width={180} title="Подбор" note="расчёт и совместимость" accent /><Arrow x={482} y={120} width={40} /><Block x={534} y={83} width={191} title="Оборудование" note="исполнение и опции" /><text x="380" y="204" textAnchor="middle" fontSize="14" fill="#afbd9f">ТЕМПЕРАТУРА · МАТЕРИАЛЫ · ГЕРМЕТИЧНОСТЬ · ПЛОЩАДКА</text></>,
  },
  "what-is-in-compressor-skid": {
    label: "От компрессора к комплектной системе через необходимые опции",
    caption: "Состав поставки определяется задачей. Исполнение на общей раме и дополнительные компоненты согласуются после выбора компрессора.",
    content: <><Block x={30} y={83} width={186} title="Компрессор" note="основное оборудование" /><Arrow x={227} y={120} width={33} /><Block x={272} y={83} width={194} title="Необходимые опции" note="по условиям процесса" accent /><Arrow x={478} y={120} width={33} /><Block x={523} y={83} width={207} title="Комплектная система" note="согласованный состав" /></>,
  },
  "sf6-compressor-service-life": {
    label: "Состояние газа, режим и обслуживание влияют на срок службы компрессора SF₆",
    caption: "Срок службы зависит от условий эксплуатации. Его нельзя определить только по названию газа или перенести с другого исполнения.",
    content: <><Block x={35} y={34} width={190} title="Состояние SF₆" note="влага и примеси" /><Block x={35} y={132} width={190} title="Нагрузка" note="температура и режим" /><path d="M240 71h42v98h-42m42-49h48" fill="none" stroke="#8da17f" strokeWidth="2" /><Block x={345} y={83} width={176} title="Условия работы" note="клапаны и уплотнения" accent /><Arrow x={532} y={120} width={33} /><Block x={577} y={83} width={148} title="Обслуживание" note="по документации" /></>,
  },
  "how-to-select-nitrogen-booster": {
    label: "Источник азота, бустер, ресивер и потребитель",
    caption: "Бустер повышает давление имеющегося азота. Ресивер может сглаживать пики, а постоянный расход обеспечивается источником газа.",
    content: <><Block x={25} y={83} width={152} title="Источник N₂" note="доступные P₁ и Q" /><Arrow x={187} y={120} width={25} /><Block x={224} y={83} width={143} title="Бустер" note="повышение давления" accent /><Arrow x={378} y={120} width={25} /><Block x={415} y={83} width={143} title="Ресивер" note="по расчёту" /><Arrow x={568} y={120} width={25} /><Block x={605} y={83} width={130} title="Потребитель" note="требуемые P₂ и Q" /></>,
  },
  "compressors-for-gas-mixtures": {
    label: "Состав газовой смеси определяет проверку совместимости и выбор оборудования",
    caption: "Для смеси учитывают все компоненты и диапазон их концентраций. Возможность сжатия подтверждается для конкретного состава и условий.",
    content: <><Block x={35} y={83} width={194} title="Состав смеси" note="компоненты и примеси" /><Arrow x={241} y={120} width={37} /><Block x={290} y={83} width={185} title="Совместимость" note="материалы и безопасность" accent /><Arrow x={487} y={120} width={37} /><Block x={536} y={83} width={189} title="Компрессор" note="подтверждённое исполнение" /><text x="380" y="204" textAnchor="middle" fontSize="14" fill="#afbd9f">ВЛАГА · КОНДЕНСАТ · ТЕМПЕРАТУРА · ДАВЛЕНИЕ · РАСХОД</text></>,
  },
};

export function KnowledgeVisual({ articleId, compact = false }: { articleId: string; compact?: boolean }) {
  const illustration = illustrations[articleId];
  if (!illustration) return null;
  return <figure className={`knowledge-visual${compact ? " knowledge-visual-compact" : ""}`}>
    <Diagram label={illustration.label}>{illustration.content}</Diagram>
    {!compact && <MobileDiagram articleId={articleId} label={illustration.label} />}
    {!compact && <figcaption>{illustration.caption}</figcaption>}
  </figure>;
}
