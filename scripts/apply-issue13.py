from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
changed: list[str] = []


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, content: str) -> None:
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    current = target.read_text(encoding="utf-8") if target.exists() else None
    if current != content:
        target.write_text(content, encoding="utf-8")
        changed.append(path)


def replace_once(path: str, old: str, new: str) -> None:
    content = read(path)
    count = content.count(old)
    if count != 1:
        raise RuntimeError(f"{path}: expected one occurrence, got {count}: {old[:120]!r}")
    write(path, content.replace(old, new, 1))


# Reusable, lightweight badge: visible formula/text remains primary; SVG is supporting only.
write("src/components/gas-badge.tsx", '''import type { GasId } from "@/content";
import styles from "./gas-badge.module.css";

export type GasBadgeDefinition = {
  formula: string;
  name: string;
  accessibleLabel: string;
};

const DEFINITIONS: Record<GasId, GasBadgeDefinition> = {
  n2: { formula: "N₂", name: "Азот", accessibleLabel: "Азот — N₂" },
  he: { formula: "He", name: "Гелий", accessibleLabel: "Гелий — He" },
  h2: { formula: "H₂", name: "Водород", accessibleLabel: "Водород — H₂" },
  o2: { formula: "O₂", name: "Кислород", accessibleLabel: "Кислород — O₂" },
  co2: { formula: "CO₂", name: "Диоксид углерода", accessibleLabel: "Диоксид углерода — CO₂" },
  mixtures: { formula: "Газ / смесь", name: "Технологический газ или смесь", accessibleLabel: "Технологический газ или смесь" },
};

const CTA_LABELS: Record<GasId, string> = {
  n2: "азота",
  he: "гелия",
  h2: "водорода",
  o2: "кислорода",
  co2: "CO₂",
  mixtures: "газа или смеси",
};

export function gasBadgeDefinition(gas: GasId): GasBadgeDefinition {
  return DEFINITIONS[gas];
}

export function gasCtaLabel(gas: GasId): string {
  return CTA_LABELS[gas];
}

function MoleculeMark({ gas }: { gas: GasId }) {
  if (gas === "he") {
    return <svg className={styles.mark} viewBox="0 0 28 20" aria-hidden="true" focusable="false"><circle cx="14" cy="10" r="5.2" /></svg>;
  }
  if (gas === "co2") {
    return <svg className={styles.mark} viewBox="0 0 34 20" aria-hidden="true" focusable="false"><path d="M9 10h16" /><circle cx="7" cy="10" r="3.6" /><circle cx="17" cy="10" r="4.5" /><circle cx="27" cy="10" r="3.6" /></svg>;
  }
  if (gas === "mixtures") {
    return <svg className={styles.mark} viewBox="0 0 34 20" aria-hidden="true" focusable="false"><circle cx="8" cy="7" r="3.5" /><circle cx="18" cy="12" r="4.3" /><circle cx="27" cy="6" r="2.8" /></svg>;
  }
  return <svg className={styles.mark} viewBox="0 0 30 20" aria-hidden="true" focusable="false"><path d="M10 10h10" /><circle cx="8" cy="10" r="4" /><circle cx="22" cy="10" r="4" /></svg>;
}

export function GasBadge({ gas, className = "" }: { gas: GasId; className?: string }) {
  const definition = DEFINITIONS[gas];
  return <span className={`${styles.badge} ${className}`.trim()} data-gas-badge={gas} role="img" aria-label={definition.accessibleLabel}>
    <MoleculeMark gas={gas} />
    <span className={styles.formula} aria-hidden="true">{definition.formula}</span>
  </span>;
}
''')

write("src/components/gas-badge.module.css", '''.badge {
  display: inline-flex;
  align-items: center;
  gap: .38rem;
  width: fit-content;
  max-width: 100%;
  padding: .28rem .52rem .28rem .4rem;
  border: 1px solid #cad8cd;
  border-radius: 999px;
  background: #f7faf6;
  color: #244b3b;
  font-weight: 750;
  line-height: 1;
  letter-spacing: 0;
  text-transform: none;
  vertical-align: middle;
}

.mark {
  flex: 0 0 auto;
  width: 1.55rem;
  height: 1.05rem;
  overflow: visible;
  stroke: currentColor;
  stroke-width: 1.7;
  fill: #d8e7dc;
}

.formula {
  min-width: 0;
  white-space: nowrap;
}

@media (max-width: 480px) {
  .badge {
    padding: .25rem .46rem .25rem .35rem;
    gap: .3rem;
  }

  .mark {
    width: 1.35rem;
  }
}
''')

# Human Russian in the RFQ and no misleading English Oil-Free wording.
replace_once(
    "src/lib/rfq/schema.ts",
    '    { key: "mode", label: "Свежий газ или recovery?" },',
    '    { key: "mode", label: "Источник гелия", help: "Свежий гелий, возвратный газ из процесса или смешанный поток." },',
)
replace_once(
    "src/lib/rfq/schema.ts",
    '    { key: "oxygenCompatibility", label: "Требования к кислородной совместимости", help: "Материалы и требования проекта; Oil-Free само по себе недостаточно" },',
    '    { key: "oxygenCompatibility", label: "Требования к кислородной совместимости", help: "Материалы и требования проекта; безмасляного исполнения само по себе недостаточно" },',
)

# Public gas data: no MIX and stronger, technically bounded oil-free positioning.
for old, new in [
    ('    summary: "Дожатие после генератора, подача в технологическое оборудование и буферизация. Подбор начинается с минимального давления источника и пикового расхода процесса.",',
     '    summary: "Безмасляное сжатие и дожатие азота после генератора, подача в технологическое оборудование и буферизация. Подбор начинается с минимального давления источника и пикового расхода процесса.",'),
    ('"Oil-Free описывает газовый тракт компрессора; чистота конечного газа дополнительно зависит от трубопровода, уплотнений и подготовки."',
     '"Безмасляное исполнение означает отсутствие подачи масла в газовый тракт компрессора; чистота конечного газа дополнительно зависит от трубопровода, уплотнений и подготовки."'),
    ('    summary:"Сжатие и возврат гелия с вниманием к герметичности, остаточному давлению и качеству возвращаемого газа.",',
     '    summary:"Безмасляное сжатие и возврат гелия с вниманием к герметичности, остаточному давлению и качеству возвращаемого газа.",'),
    ('"Oil-Free и кислородная совместимость не равнозначны: совместимость подтверждается для всего газового тракта."',
     '"Безмасляное исполнение и кислородная совместимость не равнозначны: совместимость подтверждается для всего газового тракта."'),
    ('    summary:"Сжатие газообразного CO₂ с проверкой температуры, фазового состояния и охлаждения на всех режимах процесса.",',
     '    summary:"Безмасляное сжатие газообразного CO₂ с проверкой температуры, фазового состояния и охлаждения на всех режимах процесса.",'),
    ('    id:"mixtures",slug:"process-gas",title:"Технологические газы и смеси",symbol:"MIX",editorialState:"review",',
     '    id:"mixtures",slug:"process-gas",title:"Технологические газы и смеси",symbol:"Газ / смесь",editorialState:"review",'),
    ('    summary:"Подбор компрессора для газа или смеси с известным составом, давлениями, расходом и режимом работы.",',
     '    summary:"Подбор безмасляного компрессора для газа или смеси с известным составом, давлениями, расходом и режимом работы.",'),
]:
    replace_once("src/content/gases.ts", old, new)

# Shared card/hero props may contain a GasBadge React node.
replace_once(
    "src/components/content-page.tsx",
    'export function EntityCard({ title, summary, href, label }: { title: string; summary: string; href: string; label?: string }) {',
    'export function EntityCard({ title, summary, href, label }: { title: string; summary: string; href: string; label?: ReactNode }) {',
)
replace_once(
    "src/components/commercial-hero.tsx",
    '  eyebrow: string;',
    '  eyebrow: ReactNode;',
)

# Homepage: the differentiator is visible in H1/lead, and gas formulas gain supporting badges.
replace_once(
    "src/components/home-hero-v3.tsx",
    '        <h1 id="home-hero-title">Компрессоры и бустеры для <span>технологических газов</span></h1>\n        <p className="home-hero-v3-lead">Нужно повысить давление газа, вернуть его в процесс или подать в оборудование? Подберём компрессор или бустер по газу, P₁, P₂, расходу и режиму работы.</p>',
    '        <h1 id="home-hero-title">Безмасляные компрессоры и бустеры для <span>технологических газов</span></h1>\n        <p className="home-hero-v3-lead">Нужно повысить давление газа, вернуть его в процесс или подать в оборудование? Подбираем компрессор или бустер по газу, P₁, P₂, расходу и режиму работы — без подачи масла в камеру сжатия.</p>',
)

replace_once(
    "src/app/page.tsx",
    'import { ProcessVisual } from "@/components/process-visual";',
    'import { ProcessVisual } from "@/components/process-visual";\nimport { GasBadge } from "@/components/gas-badge";\nimport type { GasId } from "@/content";',
)
replace_once(
    "src/app/page.tsx",
    '  "Компрессоры и бустеры для технологических газов",\n  "Дожатие азота после генератора, газоснабжение лазерного станка, возврат гелия, сжатие CO₂ и газовых смесей. Подбор компрессора и необходимой комплектации.",',
    '  "Безмасляные компрессоры и бустеры для технологических газов",\n  "Безмасляное сжатие N₂, He, CO₂ и газовых смесей: дожатие азота после генератора, возврат гелия, подача газа в оборудование и проектный подбор.",',
)
replace_once(
    "src/app/page.tsx",
    '''const gases = [
  { symbol: "N₂", title: "Азот", text: "Дожатие после генератора, накопление и подача в оборудование.", href: "/equipment/nitrogen-compressors/" },
  { symbol: "He", title: "Гелий", text: "Сжатие и возврат с учётом герметичности и допустимых потерь.", href: "/equipment/helium-compressors/" },
  { symbol: "CO₂", title: "Диоксид углерода", text: "Подбор с проверкой температуры и фазового состояния.", href: "/equipment/co2-compressors/" },
  { symbol: "Газ / смесь", title: "Другие технологические газы", text: "Индивидуальная проверка состава, материалов и применимости.", href: "/equipment/process-gas-compressors/" },
];''',
    '''const gases: { id: GasId; symbol: string; title: string; text: string; href: string }[] = [
  { id: "n2", symbol: "N₂", title: "Азот", text: "Дожатие после генератора, накопление и подача в оборудование.", href: "/equipment/nitrogen-compressors/" },
  { id: "he", symbol: "He", title: "Гелий", text: "Сжатие и возврат с учётом герметичности и допустимых потерь.", href: "/equipment/helium-compressors/" },
  { id: "co2", symbol: "CO₂", title: "Диоксид углерода", text: "Подбор с проверкой температуры и фазового состояния.", href: "/equipment/co2-compressors/" },
  { id: "mixtures", symbol: "Газ / смесь", title: "Другие технологические газы", text: "Индивидуальная проверка состава, материалов и применимости.", href: "/equipment/process-gas-compressors/" },
];''',
)
replace_once(
    "src/app/page.tsx",
    '<span className="gas-symbol">{gas.symbol}</span><span className="gas-tile-title">{gas.title}</span>',
    '<GasBadge gas={gas.id} /><span className="gas-tile-title">{gas.title}</span>',
)

# Gases hub: visual badges supplement names/formulas, not replace them.
replace_once(
    "src/app/gases/page.tsx",
    'import { Breadcrumbs, ContentSection, EntityCard, PageIntro, RfqPanel } from "@/components/content-page";',
    'import { Breadcrumbs, ContentSection, EntityCard, PageIntro, RfqPanel } from "@/components/content-page";\nimport { GasBadge } from "@/components/gas-badge";',
)
replace_once(
    "src/app/gases/page.tsx",
    'export const metadata = pageMetadata("Компрессоры для технологических газов: подбор по газу", "Азот, гелий, CO₂ и другие технологические газы: особенности сжатия, требования к оборудованию и данные для подбора компрессора.", "/gases/");',
    'export const metadata = pageMetadata("Компрессоры для технологических газов: подбор по газу", "Безмасляные компрессоры и бустеры для азота, гелия, CO₂ и других технологических газов: особенности среды и данные для инженерного подбора.", "/gases/");',
)
replace_once(
    "src/app/gases/page.tsx",
    '<PageIntro eyebrow="Особенности подбора" title="Компрессоры для технологических газов: подбор по газу" summary="Свойства газа, влага, примеси и требования к герметичности влияют на выбор компрессора вместе с давлением и расходом. Здесь собраны исходные данные и особенности сжатия разных газов." />',
    '<PageIntro eyebrow="Безмасляное сжатие · особенности среды" title="Компрессоры для технологических газов: подбор по газу" summary="Основное направление Lanfor — безмасляные компрессоры и бустеры: масло не подаётся в камеру сжатия. Свойства газа, влага, примеси и требования к герметичности учитываются вместе с давлением и расходом." />',
)
replace_once(
    "src/app/gases/page.tsx",
    'label={gas.symbol}',
    'label={<GasBadge gas={gas.id} />}',
)
replace_once(
    "src/app/gases/page.tsx",
    'label={`${gas.symbol} / Проектное рассмотрение`}',
    'label={<><GasBadge gas={gas.id} /> <span>Проектное рассмотрение</span></>}',
)

# Gas detail pages: avoid awkward "для Газ / смесь", show badge in the hero and explain Oil-Free precisely.
replace_once(
    "src/app/gases/[slug]/page.tsx",
    'import { ContentView } from "@/components/content-events";',
    'import { ContentView } from "@/components/content-events";\nimport { GasBadge, gasCtaLabel } from "@/components/gas-badge";',
)
replace_once(
    "src/app/gases/[slug]/page.tsx",
    '  const actionLabel = projectReview ? `Обсудить применимость для ${gas.symbol}` : `Подобрать компрессор для ${gas.symbol}`;',
    '  const gasForAction = gasCtaLabel(gas.id);\n  const actionLabel = projectReview ? `Обсудить применимость для ${gasForAction}` : `Подобрать компрессор для ${gasForAction}`;',
)
replace_once(
    "src/app/gases/[slug]/page.tsx",
    '<CommercialHero eyebrow={`${gas.symbol} / ${projectReview ? "проектное рассмотрение" : "подбор компрессора"}`} title={gas.title} summary={gas.summary} visualId={gas.heroVisualId} action={<Link className="button" href={rfqHref}>{actionLabel} →</Link>} />',
    '<CommercialHero eyebrow={<><GasBadge gas={gas.id} /> <span>{projectReview ? "проектное рассмотрение" : "безмасляное сжатие / подбор"}</span></>} title={gas.title} summary={gas.summary} visualId={gas.heroVisualId} action={<Link className="button" href={rfqHref}>{actionLabel} →</Link>} />',
)
replace_once(
    "src/app/gases/[slug]/page.tsx",
    '    <section className="container commercial-process-section" aria-label="Принцип процесса"><ProcessVisual id={gas.processVisualId} /></section>\n    <div className="container detail-layout"><article className="prose">',
    '    <section className="container commercial-process-section" aria-label="Принцип процесса"><ProcessVisual id={gas.processVisualId} /></section>\n    {!projectReview && <section className="container prose"><ContentSection title="Безмасляное сжатие"><p>В основных газовых направлениях Lanfor масло не подаётся в камеру сжатия компрессора. Это снижает риск внесения масла самим компрессором, но не заменяет требования к чистоте трубопровода, уплотнений и остальной системы.</p><Link className="text-link" href="/knowledge/oil-free-compression/">Что означает безмасляный компрессор <span aria-hidden="true">→</span></Link></ContentSection></section>}\n    <div className="container detail-layout"><article className="prose">',
)
replace_once(
    "src/app/gases/[slug]/page.tsx",
    'title={projectReview ? `Рассмотреть задачу с ${gas.symbol}` : `Подобрать компрессор для ${gas.symbol}`}',
    'title={projectReview ? `Рассмотреть задачу для ${gasForAction}` : `Подобрать компрессор для ${gasForAction}`}',
)

# Equipment hub/cards/detail: Oil-Free is a commercial differentiator, with gas badges beside the existing content.
replace_once(
    "src/app/equipment/page.tsx",
    'const title = "Компрессоры и бустеры для технологических газов";',
    'const title = "Безмасляные компрессоры и бустеры для технологических газов";',
)
replace_once(
    "src/app/equipment/page.tsx",
    '<CommercialHero eyebrow="Оборудование / назначение и подбор"',
    '<CommercialHero eyebrow="Безмасляное сжатие / оборудование и подбор"',
)
replace_once(
    "src/components/equipment-catalog.tsx",
    'import type { Equipment } from "@/content";',
    'import type { Equipment, GasId } from "@/content";\nimport { GasBadge } from "@/components/gas-badge";',
)
replace_once(
    "src/components/equipment-catalog.tsx",
    '''const categoryLabels: Record<string, { symbol: string; task: string; cta: string }> = {
  "nitrogen-compressors": { symbol: "N₂", task: "Сжатие и повышение давления", cta: "Подобрать компрессор для азота" },
  "nitrogen-boosters": { symbol: "N₂", task: "Дожатие газа от источника", cta: "Подобрать бустер азота" },
  "helium-compressors": { symbol: "He", task: "Сжатие, перекачка и возврат", cta: "Подобрать компрессор для гелия" },
  "co2-compressors": { symbol: "CO₂", task: "Подбор с учётом состояния газа", cta: "Подобрать компрессор для CO₂" },
  "process-gas-compressors": { symbol: "Газ / смесь", task: "Индивидуальное рассмотрение состава", cta: "Отправить параметры газа" },
};''',
    '''const categoryLabels: Record<string, { gas: GasId; task: string; cta: string }> = {
  "nitrogen-compressors": { gas: "n2", task: "Сжатие и повышение давления", cta: "Подобрать компрессор для азота" },
  "nitrogen-boosters": { gas: "n2", task: "Дожатие газа от источника", cta: "Подобрать бустер азота" },
  "helium-compressors": { gas: "he", task: "Сжатие, перекачка и возврат", cta: "Подобрать компрессор для гелия" },
  "co2-compressors": { gas: "co2", task: "Подбор с учётом состояния газа", cta: "Подобрать компрессор для CO₂" },
  "process-gas-compressors": { gas: "mixtures", task: "Индивидуальное рассмотрение состава", cta: "Отправить параметры газа" },
};''',
)
replace_once(
    "src/components/equipment-catalog.tsx",
    '<ul className="equipment-card-tags" aria-label="Назначение"><li>{label?.symbol ?? "Газ"}</li><li>Подбор по параметрам</li></ul>',
    '<ul className="equipment-card-tags" aria-label="Назначение"><li>{label ? <GasBadge gas={label.gas} /> : "Газ"}</li><li>Безмасляное сжатие</li><li>Подбор по параметрам</li></ul>',
)
replace_once(
    "src/components/public-equipment-page.tsx",
    '<ContentSection title="Что это и для каких задач"><p>{equipment.technology}</p><BulletList items={equipment.applications} /></ContentSection>\n      <EquipmentSelection rfqHref={rfqHref} />',
    '<ContentSection title="Что это и для каких задач"><p>{equipment.technology}</p><BulletList items={equipment.applications} /></ContentSection>\n      <ContentSection title="Безмасляное сжатие"><p>Для этих направлений масло не подаётся в камеру сжатия компрессора. Чистота газа на выходе при этом зависит также от трубопроводов, арматуры, уплотнений и согласованной подготовки всей системы.</p><Link className="text-link" href="/knowledge/oil-free-compression/">Подробнее о безмасляном сжатии <span aria-hidden="true">→</span></Link></ContentSection>\n      <EquipmentSelection rfqHref={rfqHref} />',
)

# Relevant Solutions get a precise Oil-Free cue; H2/O2 remain project-review only.
replace_once(
    "src/app/solutions/[slug]/page.tsx",
    '<CommercialHero eyebrow={projectReview ? "Проектное рассмотрение" : "Подбор компрессора под задачу"}',
    '<CommercialHero eyebrow={projectReview ? "Проектное рассмотрение" : "Безмасляное сжатие / подбор под задачу"}',
)
replace_once(
    "src/app/solutions/[slug]/page.tsx",
    '    {projectReview && <section className="container prose"><ContentSection title="Проектное рассмотрение"><p>Состав газа, давления, расход, материалы газового тракта и требования безопасности проверяются для конкретного процесса. Применимость и исполнение оборудования подтверждаются инженерной проработкой; серийное исполнение без такой проверки не заявляется.</p></ContentSection></section>}\n    {solution.id === "nitrogen-for-laser-cutting"',
    '    {projectReview && <section className="container prose"><ContentSection title="Проектное рассмотрение"><p>Состав газа, давления, расход, материалы газового тракта и требования безопасности проверяются для конкретного процесса. Применимость и исполнение оборудования подтверждаются инженерной проработкой; серийное исполнение без такой проверки не заявляется.</p></ContentSection></section>}\n    {!projectReview && <section className="container prose"><ContentSection title="Безмасляное сжатие"><p>В основных решениях Lanfor для технологических газов масло не подаётся в камеру сжатия компрессора. Требования к чистоте всей системы, материалам и подготовке среды подтверждаются отдельно для конкретного процесса.</p><Link className="text-link" href="/knowledge/oil-free-compression/">Подробнее о безмасляном сжатии <span aria-hidden="true">→</span></Link></ContentSection></section>}\n    {solution.id === "nitrogen-for-laser-cutting"',
)

# Fix the knowledge SVG itself rather than hiding overflow. The accessible <title> remains; visible title wraps to two lines.
replace_once(
    "public/images/visuals/knowledge/knowledge-detail-why-process-gas-compressors-need-task-specific-selection.svg",
    '<text x="450" y="70" font-family="Arial,Helvetica,sans-serif" font-size="27" font-weight="600" text-anchor="middle" fill="#243e32">От условий процесса к оборудованию</text>',
    '<text x="450" y="55" font-family="Arial,Helvetica,sans-serif" font-size="25" font-weight="600" text-anchor="middle" fill="#243e32"><tspan x="450" y="55">От условий процесса</tspan><tspan x="450" dy="30">к оборудованию</tspan></text>',
)

# Regression tests: public wording, badge accessibility, target SVG structure.
write("tests/issue-13.test.ts", '''import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GasBadge, gasBadgeDefinition, gasCtaLabel } from "../src/components/gas-badge";
import { gases } from "../src/content/gases";
import { GAS_FIELDS } from "../src/lib/rfq/schema";

describe("Issue #13 public gas language", () => {
  it("does not expose MIX as the public mixture symbol", () => {
    const mixture = gases.find((gas) => gas.id === "mixtures");
    expect(mixture?.symbol).toBe("Газ / смесь");
    expect(JSON.stringify(gases)).not.toMatch(/\\bMIX\\b/);
    expect(gasCtaLabel("mixtures")).toBe("газа или смеси");
  });

  it("uses human Russian for the helium source field", () => {
    expect(GAS_FIELDS.he[0]).toEqual({
      key: "mode",
      label: "Источник гелия",
      help: "Свежий гелий, возвратный газ из процесса или смешанный поток.",
    });
    expect(JSON.stringify(GAS_FIELDS)).not.toMatch(/recovery/i);
  });
});

describe("GasBadge", () => {
  it("keeps the visible formula and adds an accessible label", () => {
    const markup = renderToStaticMarkup(createElement(GasBadge, { gas: "n2" }));
    expect(markup).toContain("N₂");
    expect(markup).toContain('aria-label="Азот — N₂"');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain('data-gas-badge="n2"');
  });

  it("uses a human label for mixtures", () => {
    expect(gasBadgeDefinition("mixtures").formula).toBe("Газ / смесь");
  });
});

describe("task-specific Knowledge visual", () => {
  it("wraps the long visible heading inside the SVG safe area", () => {
    const svg = readFileSync("public/images/visuals/knowledge/knowledge-detail-why-process-gas-compressors-need-task-specific-selection.svg", "utf8");
    expect(svg).not.toContain(">От условий процесса к оборудованию</text>");
    expect(svg).toContain('<tspan x="450" y="55">От условий процесса</tspan>');
    expect(svg).toContain('<tspan x="450" dy="30">к оборудованию</tspan>');
  });
});
''')

write("tests/e2e/issue-13.spec.ts", '''import { expect, test } from "@playwright/test";

for (const width of [360, 390]) {
  test(`task-specific knowledge page has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/knowledge/why-process-gas-compressors-need-task-specific-selection/");
    const dimensions = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
    await expect(page.getByText("От условий процесса к оборудованию", { exact: true }).first()).toBeVisible();
  });
}

test("gas badges supplement public gas text", async ({ page }) => {
  await page.goto("/");
  const badges = page.locator("[data-gas-badge]");
  expect(await badges.count()).toBeGreaterThanOrEqual(4);
  await expect(page.locator('[data-gas-badge="n2"]').first()).toContainText("N₂");
  await expect(page.locator('[data-gas-badge="n2"]').first()).toHaveAttribute("aria-label", "Азот — N₂");

  await page.goto("/gases/process-gas/");
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/\\bMIX\\b/);
  expect(text).toContain("Газ / смесь");
});
''')

print("Issue #13 patch changed:")
for path in changed:
    print(f"- {path}")
if not changed:
    raise RuntimeError("Patch made no changes")
