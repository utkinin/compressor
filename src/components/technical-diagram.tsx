import type { ReactNode } from "react";

type DiagramKind = "hero" | "small" | "medium" | "large" | "nitrogen" | "helium" | "hydrogen" | "co2" | "instrumentation" | "oem";

const descriptions: Record<DiagramKind, string> = {
  hero: "Источник газа, давление P₁, безмасляный компрессор, охлаждение, ресивер и подача в процесс с давлением P₂ и расходом Q.",
  small: "Принципиальное устройство компактного безмасляного поршневого компрессорного узла: привод, компрессорная часть и газовая обвязка.",
  medium: "Компрессорный модуль с несколькими ступенями, охлаждением, измерением давления и температуры.",
  large: "Компрессорный skid: рама, компрессор, привод, охлаждение, буфер, КИП и шкаф управления.",
  nitrogen: "Генератор азота, буфер на входе, безмасляный booster, охлаждение, ресивер и технологическое оборудование.",
  helium: "Принцип возврата гелия: сбор отработанного газа, буфер, подготовка, компрессия, хранение и повторная подача в процесс.",
  hydrogen: "Водородный газовый тракт с проверкой состава и зоны, безмасляным сжатием, охлаждением и защитными блокировками.",
  co2: "Проверка температуры и фазового состояния CO₂ на входе, сжатие и охлаждение с контролем рабочего диапазона.",
  instrumentation: "Давление и температура до и после сжатия, отсечные клапаны, охлаждение и контур управления.",
  oem: "Граница OEM-модуля: вход газа, компрессорный блок и выход газа, интерфейсы питания, охлаждения, сигналов и защит.",
};

const diagramLabels: Record<DiagramKind, string> = {
  hero: "Архитектура компрессорного узла", small: "Компактная компрессорная часть", medium: "Компрессорный модуль",
  large: "Компрессорный skid", nitrogen: "Азот: от генератора к процессу", helium: "Контур возврата гелия",
  hydrogen: "Контролируемое сжатие H₂", co2: "CO₂: давление, температура, фаза",
  instrumentation: "КИП, клапаны и охлаждение", oem: "Интерфейсы OEM-интеграции",
};

function Pipe({ d, accent = false, dashed = false }: { d: string; accent?: boolean; dashed?: boolean }) {
  return <path d={d} fill="none" stroke={accent ? "#dd7950" : "#8fa39b"} strokeWidth={accent ? 3 : 2} strokeDasharray={dashed ? "5 6" : undefined} strokeLinejoin="round" strokeLinecap="round" />;
}

function Label({ x, y, children, muted = false, small = false }: { x: number; y: number; children: ReactNode; muted?: boolean; small?: boolean }) {
  return <text x={x} y={y} fill={muted ? "#9aaba3" : "#eef2ea"} fontSize={small ? 12 : 15} fontFamily="ui-monospace, SFMono-Regular, Consolas, monospace">{children}</text>;
}

function Gauge({ x, y, label = "PI" }: { x: number; y: number; label?: string }) {
  return <g><path d={`M${x} ${y + 17} v17`} stroke="#8fa39b" strokeWidth="2" /><circle cx={x} cy={y} r="17" fill="#1a2b25" stroke="#b3bfb8" strokeWidth="1.5" /><text x={x} y={y + 4} fill="#dce5dc" textAnchor="middle" fontSize="11" fontFamily="monospace">{label}</text></g>;
}

function Valve({ x, y }: { x: number; y: number }) {
  return <g stroke="#b3bfb8" fill="#1a2b25" strokeWidth="1.5"><path d={`M${x - 10} ${y - 8} l20 16 v-16 l-20 16 Z`} /><path d={`M${x} ${y - 1} v-18 m-7 0 h14`} /></g>;
}

function Compressor({ x = 230, y = 200, small = false }: { x?: number; y?: number; small?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${small ? 0.72 : 1})`}>
    <path d="M-24 112 H174 l34 20 H10 Z" fill="#23372e" stroke="#7b9185" strokeWidth="1.5" />
    <path d="M-14 132 v17 h186 v-17 M0 149 l-9 8 M160 149 l9 8" fill="none" stroke="#7b9185" strokeWidth="2" />
    <path d="M16 35 l38-20 h65 l-30 20 Z M16 35 v68 h73 V35 M89 35 l30-20 v68 l-30 20" fill="#2f463b" stroke="#b3bfb8" strokeWidth="1.6" />
    <ellipse cx="54" cy="72" rx="24" ry="27" fill="#1a2b25" stroke="#9cb1a3" strokeWidth="2" />
    <ellipse cx="54" cy="72" rx="7" ry="9" fill="#9cb1a3" />
    <path d="M37 52 l34 40 M37 92 l34-40 M30 72 h48" fill="none" stroke="#617d6c" strokeWidth="2" />
    <path d="M20 20 v-34 l20-12 h35 l-20 12 v34 M20-14 h35 M55-14 v34 l20-12 v-34" fill="#294035" stroke="#b3bfb8" strokeWidth="1.5" />
    {[-8, -3, 2, 7, 12].map((v) => <path key={v} d={`M21 ${v} h33`} stroke="#627f6d" strokeWidth="1.2" />)}
    <path d="M91 10 v-39 l21-13 h28 l-19 13 V10 M91-29 h30 M121-29 l19-13 v39 l-19 13" fill="#294035" stroke="#b3bfb8" strokeWidth="1.5" />
    {[-23, -17, -11, -5, 1].map((v) => <path key={v} d={`M92 ${v} h28`} stroke="#627f6d" strokeWidth="1.2" />)}
    <path d="M91 80 h32" stroke="#d4dbd2" strokeWidth="5" />
    <path d="M128 52 l24-13 h41 l-21 13 Z M128 52 v42 h44 V52 M172 52 l21-13 v42 l-21 13" fill="#3c5346" stroke="#b3bfb8" strokeWidth="1.5" />
    {[137, 144, 151, 158, 165].map((v) => <path key={v} d={`M${v} 56 v33`} stroke="#7d9786" strokeWidth="1.2" />)}
    <path d="M136 94 v11 h30 V94" fill="#294035" stroke="#93aa9b" strokeWidth="1.5" />
    <Pipe d="M36-25 V-54 H-45" accent /><Pipe d="M137-42 V-72 H193" accent />
  </g>;
}

function Cooler({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}><rect x="0" y="0" width="56" height="95" rx="3" fill="#21382d" stroke="#a8bbae" strokeWidth="1.5" /><path d="M10 14 h36 v13 H10 v13 h36 v13 H10 v13 h36 v14 H10" fill="none" stroke="#a8bbae" strokeWidth="2" /><path d="M14 95 v20 M44 95 v20" stroke="#718c7a" strokeWidth="2" /><path d="M-9 20 h8 M56 72 h15" stroke="#dd7950" strokeWidth="3" /></g>;
}

function Receiver({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}><path d="M0 20 C0-7 56-7 56 20 V99 C56 126 0 126 0 99 Z" fill="#273f32" stroke="#b6c3b8" strokeWidth="1.6" /><ellipse cx="28" cy="20" rx="28" ry="9" fill="none" stroke="#6a8873" /><path d="M0 99 c0 12 56 12 56 0 M10 114 v18 M46 114 v18" fill="none" stroke="#8da995" strokeWidth="1.5" /><path d="M-13 62 H0 M56 62 h13" stroke="#dd7950" strokeWidth="3" /></g>;
}

function Skid({ variant }: { variant: DiagramKind }) {
  const isSmall = variant === "small";
  return <>
    <path d="M76 367 L537 367 L675 415 L185 415 Z M76 367 V385 L185 433 H675 V415 M185 415 V433 M537 367 V385" fill="#1c3026" stroke="#536d5c" strokeWidth="1.6" />
    <path d="M122 380 L583 380 M158 396 L630 396 M194 367 L308 415 M373 367 L496 415" fill="none" stroke="#3b5544" strokeWidth="1" />
    {variant === "large" && <g><path d="M597 180 v-87 h66 l19 12 v87 h-66 Z" fill="#243b2e" stroke="#8fa48e" strokeWidth="1.4" /><path d="M597 93 l19 12 h66 M616 105 v87" fill="none" stroke="#8fa48e" strokeWidth="1.4" /><rect x="625" y="119" width="35" height="23" fill="#182c22" stroke="#6e8c73" /><circle cx="631" cy="160" r="3" fill="#dd7950" /><circle cx="646" cy="160" r="3" fill="#83a57c" /><Label x={558} y={77} muted small>УПРАВЛЕНИЕ</Label><Pipe d="M597 136 H546 V190 H398" dashed /></g>}
    <Compressor x={205} y={228} small={isSmall} />
    {!isSmall && <><Cooler x={456} y={225} /><Receiver x={557} y={216} /></>}
    <Pipe d={isSmall ? "M76 190 H172 V189 H213" : "M76 174 H160 V174 H241"} accent />
    <Valve x={119} y={174} /><Gauge x={178} y={140} />
    {!isSmall && <><Pipe d="M398 156 H437 V245 H455" accent /><Pipe d="M512 297 H544 V278 H557" accent /><Pipe d="M613 278 H674 V174 H710" accent /><Gauge x={670} y={140} /><Valve x={635} y={278} /><Gauge x={435} y={188} label="TI" /><path d="M486 213 v-45 h76" fill="none" stroke="#5f8372" strokeWidth="1.5" strokeDasharray="5 6" /><Label x={490} y={154} muted small>COOLING</Label></>}
    {isSmall && <Pipe d="M343 176 H504 V270 H673" accent />}
    <path d="M216 336 L108 310 M484 337 L473 372 M584 349 L624 379" fill="none" stroke="#6a8272" strokeWidth="1" />
    <Label x={76} y={126} muted small>ИСТОЧНИК ГАЗА</Label><Label x={76} y={150}>P₁ · ВХОД</Label><Label x={604} y={110}>P₂ / Q</Label><Label x={616} y={194} muted small>В ПРОЦЕСС</Label>
    <Label x={65} y={299} muted small>OIL-FREE</Label><Label x={65} y={315} muted small>КОМПРЕССОР</Label>
    {!isSmall && <><Label x={418} y={397} muted small>ОХЛАЖДЕНИЕ</Label><Label x={590} y={400} muted small>БУФЕР</Label></>}
    <Label x={76} y={469} muted small>{variant === "large" ? "ГАЗОВЫЙ ТРАКТ + КИП + УПРАВЛЕНИЕ + ЕДИНАЯ РАМА" : "КОМПОНОВКА ПОД РАБОЧУЮ ТОЧКУ ПРОЦЕССА"}</Label>
  </>;
}

function FlowBox({ x, y, width = 130, title, detail, symbol }: { x: number; y: number; width?: number; title: string; detail: string; symbol?: string }) {
  return <g transform={`translate(${x} ${y})`}><rect width={width} height="102" rx="3" fill="#22392d" stroke="#8ba490" strokeWidth="1.5" /><Label x={14} y={28} small>{symbol ?? title}</Label><path d={`M14 41 H${width - 14}`} stroke="#526e5a" /><text x="14" y="65" fill="#dbe4d9" fontSize="13" fontFamily="Arial, sans-serif">{symbol ? title : detail}</text>{symbol && <text x="14" y="84" fill="#9aafa0" fontSize="11" fontFamily="Arial, sans-serif">{detail}</text>}</g>;
}

function Arrow({ x, y, width = 27 }: { x: number; y: number; width?: number }) {
  return <g stroke="#dd7950" strokeWidth="2.5" fill="none"><path d={`M${x} ${y} h${width}`} /><path d={`M${x + width - 7} ${y - 5} l7 5 l-7 5`} /></g>;
}

function FlowDiagram({ variant }: { variant: DiagramKind }) {
  if (variant === "instrumentation") return <>
    <FlowBox x={270} y={220} width={170} title="Компрессор" detail="контроль рабочего режима" symbol="OIL-FREE" />
    <Pipe d="M68 271 H270 M440 271 H690" accent /><Valve x={111} y={271} /><Gauge x={168} y={237} /><Gauge x={226} y={237} label="TI" /><Gauge x={490} y={237} /><Gauge x={550} y={237} label="TI" /><Valve x={609} y={271} />
    <rect x="274" y="70" width="166" height="64" fill="#22392d" stroke="#8ba490" /><Label x={296} y={97}>УПРАВЛЕНИЕ</Label><Label x={296} y={119} muted small>защиты / сигналы</Label>
    <Pipe d="M168 220 V164 H356 V134 M550 220 V164 H356 M356 220 V134" dashed /><Pipe d="M304 322 V380 H492 V322" dashed /><Label x={310} y={410} muted>Контур охлаждения</Label>
    <Label x={65} y={316} muted>P₁ / T₁</Label><Label x={601} y={316} muted>P₂ / T₂</Label>
  </>;
  if (variant === "oem") return <>
    <rect x="188" y="100" width="382" height="280" rx="3" fill="none" stroke="#8ba490" strokeDasharray="7 6" />
    <Label x={208} y={130} muted small>ГРАНИЦА ПОСТАВКИ OEM-МОДУЛЯ</Label>
    <Compressor x={264} y={226} small />
    <Pipe d="M52 218 H188 V187 H258 M552 218 H708" accent />
    <Pipe d="M510 187 H552 V218" accent />
    <Label x={45} y={198}>ГАЗ / P₁</Label><Label x={595} y={198}>P₂ / Q</Label>
    <Pipe d="M270 100 V60 M375 100 V60 M480 100 V60" dashed />
    <Label x={226} y={47} muted small>ПИТАНИЕ</Label><Label x={330} y={47} muted small>СИГНАЛЫ</Label><Label x={441} y={47} muted small>ОХЛАЖДЕНИЕ</Label>
    <Label x={202} y={426} muted>Габарит · сервисный доступ · логика защит</Label>
  </>;
  const data = variant === "nitrogen"
    ? [{ title: "Генератор", detail: "PSA / membrane", symbol: "N₂" }, { title: "Booster", detail: "Oil-Free", symbol: "P₁ → P₂" }, { title: "Ресивер", detail: "пиковый расход", symbol: "БУФЕР" }, { title: "Процесс", detail: "рабочая точка", symbol: "Q / P₂" }]
    : variant === "helium"
      ? [{ title: "Сбор газа", detail: "возврат из процесса", symbol: "He / RECOVERY" }, { title: "Подготовка", detail: "состав / загрязнения", symbol: "КОНТРОЛЬ" }, { title: "Компрессия", detail: "утечки / охлаждение", symbol: "OIL-FREE" }, { title: "Хранение", detail: "повторная подача", symbol: "БУФЕР" }]
      : variant === "hydrogen"
        ? [{ title: "Источник H₂", detail: "состав / чистота", symbol: "H₂ / P₁" }, { title: "Компрессия", detail: "материалы / утечки", symbol: "OIL-FREE" }, { title: "Охлаждение", detail: "тепловой режим", symbol: "T / P" }, { title: "Процесс", detail: "согласованный режим", symbol: "P₂ / Q" }]
        : [{ title: "Источник CO₂", detail: "состав / диапазон", symbol: "CO₂ / P₁ / T₁" }, { title: "Проверка фазы", detail: "газ / жидкость / ?", symbol: "PHASE CHECK" }, { title: "Компрессия", detail: "расчёт ступеней", symbol: "OIL-FREE" }, { title: "Охлаждение", detail: "контроль фазности", symbol: "P₂ / T₂" }];
  return <>
    {data.map((box, i) => <g key={box.title}><FlowBox x={44 + i * 178} y={186} width={141} {...box} />{i < 3 && <Arrow x={190 + i * 178} y={237} width={27} />}</g>)}
    <Gauge x={218} y={139} /><Pipe d="M218 173 V237" />
    {variant === "helium" ? <><Pipe d="M649 288 V371 H115 V288" accent /><path d="M108 298 l7-10 l7 10" stroke="#dd7950" strokeWidth="2" fill="none" /><Label x={257} y={401} muted>ЗАМКНУТЫЙ КОНТУР · ПО СОСТАВУ ГАЗА</Label></> : <><Pipe d="M114 288 V361 H649 V288" dashed /><Label x={variant === "hydrogen" ? 158 : 147} y={393} muted>{variant === "hydrogen" ? "Ex-зона · герметичность · защитные блокировки" : variant === "co2" ? "Температура и фаза проверяются во всём диапазоне" : "Чистота · стабильность P₁ · средний и пиковый Q"}</Label></>}
    <Label x={44} y={89} muted small>{variant === "co2" ? "ПОДБОР НЕ ОГРАНИЧИВАЕТСЯ P₁ / P₂ / Q" : "СХЕМА УТОЧНЯЕТСЯ ПО ИСХОДНЫМ ДАННЫМ"}</Label>
  </>;
}

export function TechnicalDiagram({ kind = "hero", compact = false, title }: { kind?: string; compact?: boolean; title?: string }) {
  const variant: DiagramKind = Object.hasOwn(descriptions, kind) ? kind as DiagramKind : "hero";
  const isSkid = ["hero", "small", "medium", "large"].includes(variant);
  return <figure className={`technical-figure${compact ? " technical-figure-compact" : ""}`}>
    <div className="diagram-heading"><span>LANFOR / ENGINEERING</span><span>{variant === "hero" ? "01 — PROCESS" : "SCHEMATIC"}</span></div>
    <svg viewBox="0 0 760 510" role="img" aria-label={title ?? diagramLabels[variant]} xmlns="http://www.w3.org/2000/svg">
      <title>{title ?? diagramLabels[variant]}</title><desc>{descriptions[variant]}</desc>
      {[80, 160, 240, 320, 400, 480, 560, 640, 720].map((x) => <path key={`v${x}`} d={`M${x} 24 V488`} stroke="#2e4436" strokeWidth=".6" />)}
      {[70, 150, 230, 310, 390, 470].map((y) => <path key={`h${y}`} d={`M24 ${y} H736`} stroke="#2e4436" strokeWidth=".6" />)}
      <path d="M24 40 V24 H40 M720 24 H736 V40 M24 470 V486 H40 M720 486 H736 V470" fill="none" stroke="#758a79" strokeWidth="1" />
      {isSkid ? <Skid variant={variant} /> : <FlowDiagram variant={variant} />}
      <circle cx="25" cy="25" r="2" fill="#dd7950" /><circle cx="735" cy="485" r="2" fill="#dd7950" />
    </svg>
    <figcaption><span className="diagram-swatch" />{title ?? diagramLabels[variant]}<span>Принципиальная схема · не рабочий чертёж</span></figcaption>
  </figure>;
}
