from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(path: str, old: str, new: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{path}: expected 1 occurrence, got {count}: {old[:120]!r}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")


# Add two substantive solution records. No source model/SKU names and no unverified numeric envelope.
solutions_path = ROOT / "src/content/solutions.ts"
solutions = solutions_path.read_text(encoding="utf-8")
if 'id:"pet-high-pressure-air"' in solutions or 'id:"refrigerant-transfer-compression"' in solutions:
    raise RuntimeError("PET/refrigerant solutions already present")
insert = r'''
  {
    id:"pet-high-pressure-air",slug:"oil-free-high-pressure-air-for-pet",title:"Безмасляный воздух высокого давления для выдува ПЭТ",editorialState:"review",
    heroVisualId:"solution-pet",processVisualId:"process-pet",
    summary:"Проектный контур безмасляного воздуха высокого давления для выдувного автомата: подготовка воздуха, дожим, буферизация и интеграция в линию.",gasIds:[],
    intent:"Обеспечить выдувной автомат стабильным безмасляным воздухом требуемого давления и расхода без расширения всей цеховой сети высокого давления.",
    inputs:["Требования изготовителя выдувного автомата к давлению, расходу и качеству воздуха.","Доступное давление и качество воздуха в существующей цеховой сети либо параметры отдельного источника.","Цикл выдува, пиковое потребление, число одновременно работающих машин и допустимое падение давления.","Требования к осушению, фильтрации, охлаждению, ресиверу, размещению и интерфейсам управления."],
    approach:["Считаем систему от требований выдувного автомата, а не от номинала существующей компрессорной станции.","Проверяем, можно ли локально дожать только необходимый расход вместо повышения давления всей сети.","Определяем функции подготовки воздуха до дожима и после охлаждения; состав не объявляется фиксированным заранее.","Согласуем объём буфера, алгоритм поддержания давления, сигналы готовности и границы интеграции с линией."],
    constraints:["Требуемые давление и расход определяются конкретным автоматом, преформой, форматом тары и циклом; универсальный диапазон для всех линий не заявляется.","Безмасляная конструкция компрессора снижает риск внесения масла в воздушный тракт, но требования к качеству всей системы подтверждаются отдельно.","Ресивер, осушка, фильтрация и охлаждение подбираются по расчёту и требованиям линии, а не входят автоматически в каждую поставку."],
    supply:["Безмасляный компрессорный модуль высокого давления под согласованный режим.","Охлаждение и подготовка воздуха в требуемых границах.","Ресивер, КИП и автоматика — если требуются расчётом и ТЗ.","Схема подключения, интерфейсы управления и данные для интеграции в линию."],
    equipmentIds:[],articleIds:["oil-free-compression","why-a-receiver","continuous-vs-intermittent","air-vs-water-cooling"],
  },
  {
    id:"refrigerant-transfer-compression",slug:"refrigerant-transfer-compression",title:"Перекачка и фасовка хладагентов",editorialState:"review",
    heroVisualId:"solution-refrigerant",processVisualId:"process-refrigerant",
    summary:"Компрессор или бустер для перекачки, возврата и фасовки хладагента с проверкой состава среды, фазового состояния, температур и материалов газового тракта.",gasIds:[],
    intent:"Переместить или дожать хладагент между контуром, исходной ёмкостью и приёмной ёмкостью либо фасовочной системой в согласованном режиме.",
    inputs:["Точное обозначение и состав хладагента, включая смесь компонентов при её наличии.","Откуда и куда переносится среда: контур, баллон, резервуар или фасовочная линия; начальные и конечные давления.","Температуры, ожидаемое фазовое состояние по маршруту, требуемая производительность и режим работы.","Материалы, уплотнения, требования к герметичности, охлаждению, размещению и автоматике."],
    approach:["Сначала проверяем конкретный хладагент и состояние среды во всех характерных точках процесса.","Отделяем задачу переноса газа от работы с жидкой фазой: схема всасывания и допустимый режим подтверждаются для выбранного оборудования.","Согласуем материалы газового тракта, уплотнения, охлаждение и безопасные рабочие границы.","Определяем, нужен отдельный компрессор, бустер либо модуль с арматурой, КИП и управлением."],
    constraints:["Совместимость не переносится автоматически с одного хладагента на другой, особенно для смесей и сред с различными требованиями к материалам.","Работа с жидкой фазой не заявляется по умолчанию: допустимое состояние на входе подтверждается для конкретного исполнения.","Давление, производительность, герметичность и требования безопасности фиксируются после инженерной проверки исходных данных."],
    supply:["Компрессор или бустер под подтверждённый хладагент и режим.","Охлаждение, арматура и КИП — в согласованных границах проекта.","При необходимости — модуль для подключения к фасовочной или сервисной системе.","Схема подключения и перечень параметров, которые контролируются при эксплуатации."],
    equipmentIds:[],articleIds:["different-gases-different-performance","bar-g-and-bar-a","continuous-vs-intermittent"],
  },
'''
idx = solutions.rfind("\n];")
if idx < 0:
    raise RuntimeError("solutions array closing marker not found")
solutions_path.write_text(solutions[:idx] + insert + solutions[idx:], encoding="utf-8")

# Customer-facing H1/CTA overrides.
replace_once(
    "src/lib/solution-hero.ts",
    '  "equipment-integration": {\n    title: "Нужно встроить компрессор в оборудование?",\n    summary: "Подберём компрессор и необходимую комплектацию под габариты, газовые подключения, питание, охлаждение, управление и сервисный доступ вашей установки.",\n    cta: "Подобрать компрессор для встраивания",\n  },',
    '  "equipment-integration": {\n    title: "Нужно встроить компрессор в оборудование?",\n    summary: "Подберём компрессор и необходимую комплектацию под габариты, газовые подключения, питание, охлаждение, управление и сервисный доступ вашей установки.",\n    cta: "Подобрать компрессор для встраивания",\n  },\n  "pet-high-pressure-air": {\n    title: "Нужно стабильное высокое давление для выдува ПЭТ?",\n    summary: "Проработаем безмасляный контур от существующего источника воздуха до выдувного автомата: требуемый расход, дожим, подготовку, буферизацию и управление по фактическому циклу линии.",\n    cta: "Рассчитать систему для ПЭТ",\n  },\n  "refrigerant-transfer-compression": {\n    title: "Нужно перекачать или фасовать хладагент?",\n    summary: "Подберём компрессор или бустер после проверки конкретного хладагента, фазового состояния, температур, давлений, требуемой производительности и материалов газового тракта.",\n    cta: "Отправить данные по хладагенту",\n  },',
)

# Reuse approved principle artwork with distinct semantic asset IDs; add task-specific process diagrams.
replace_once(
    "src/content/visuals.ts",
    '  sceneAsset("solution-process-gas", "process-gas", "Компрессор и оборудование процесса для технологического газа или смеси"),',
    '  sceneAsset("solution-process-gas", "process-gas", "Компрессор и оборудование процесса для технологического газа или смеси"),\n  sceneAsset("solution-pet", "supply", "Компрессорная система и оборудование линии выдува ПЭТ — принцип проектной комплектации"),\n  sceneAsset("solution-refrigerant", "transfer", "Перенос хладагента между источником и приёмной системой с помощью компрессора или бустера"),',
)
replace_once(
    "src/content/visuals.ts",
    '  {\n    id: "process-gas", title: "От исходных условий к подаче газа", layout: "flow",',
    '  {\n    id: "process-pet", title: "Контур высокого давления для выдува ПЭТ", layout: "flow",\n    steps: [\n      { id: "source", label: "Источник воздуха", detail: "Существующая сеть или отдельный источник", icon: "source" },\n      { id: "preparation", label: "Подготовка", detail: "По требованиям линии", icon: "dryer" },\n      { id: "compressor", label: "Безмасляный дожим", detail: "Под фактический цикл потребления", icon: "compressor" },\n      { id: "receiver", label: "Буфер", detail: "Объём определяется расчётом", icon: "receiver", optional: true },\n      { id: "machine", label: "Выдувной автомат", icon: "machine" },\n    ], caption: "Давление, расход, подготовка воздуха и объём буфера определяются требованиями конкретной линии; схема не задаёт фиксированную комплектацию.",\n  },\n  {\n    id: "process-refrigerant", title: "Перекачка хладагента между системами", layout: "flow",\n    steps: [\n      { id: "source", label: "Источник / контур", icon: "source" },\n      { id: "conditions", label: "Проверка среды", detail: "Состав, температура, давление и фаза", icon: "conditions" },\n      { id: "compressor", label: "Компрессор / бустер", icon: "compressor" },\n      { id: "cooling", label: "Охлаждение", detail: "Если требуется режимом", icon: "cooling", optional: true },\n      { id: "storage", label: "Приёмная ёмкость / фасовка", icon: "storage" },\n    ], caption: "Допустимый режим работы и совместимость подтверждаются для конкретного хладагента и выбранного исполнения оборудования.",\n  },\n  {\n    id: "process-gas", title: "От исходных условий к подаче газа", layout: "flow",',
)

# Refrigerants are a verified commercial direction but not automatically an Oil-Free claim.
replace_once(
    "src/app/solutions/[slug]/page.tsx",
    '  const projectReview = solution.id === "hydrogen-compression" || solution.id === "oxygen-compression";\n  return <>',
    '  const projectReview = solution.id === "hydrogen-compression" || solution.id === "oxygen-compression";\n  const oilFreeSolution = !projectReview && solution.id !== "refrigerant-transfer-compression";\n  const briefIntake = projectReview || solution.id === "pet-high-pressure-air" || solution.id === "refrigerant-transfer-compression";\n  return <>',
)
replace_once(
    "src/app/solutions/[slug]/page.tsx",
    '<CommercialHero eyebrow={projectReview ? "Проектное рассмотрение" : "Безмасляное сжатие / подбор под задачу"} title={publicTitle} summary={publicSummary} visualId={solution.heroVisualId} action={<Link className="button" href={projectReview ? `${rfqHref}&intake=brief` : rfqHref}>{hero?.cta ?? (projectReview ? "Обсудить применимость оборудования" : "Подобрать компрессор")} →</Link>} />',
    '<CommercialHero eyebrow={projectReview ? "Проектное рассмотрение" : oilFreeSolution ? "Безмасляное сжатие / подбор под задачу" : "Подбор под задачу"} title={publicTitle} summary={publicSummary} visualId={solution.heroVisualId} action={<Link className="button" href={briefIntake ? `${rfqHref}&intake=brief` : rfqHref}>{hero?.cta ?? (projectReview ? "Обсудить применимость оборудования" : "Подобрать компрессор")} →</Link>} />',
)
replace_once(
    "src/app/solutions/[slug]/page.tsx",
    '    {!projectReview && <section className="container prose"><ContentSection title="Безмасляное сжатие"><p>В основных решениях Lanfor для технологических газов масло не подаётся в камеру сжатия компрессора. Требования к чистоте всей системы, материалам и подготовке среды подтверждаются отдельно для конкретного процесса.</p><Link className="text-link" href="/knowledge/oil-free-compression/">Подробнее о безмасляном сжатии <span aria-hidden="true">→</span></Link></ContentSection></section>}',
    '    {oilFreeSolution && <section className="container prose"><ContentSection title="Безмасляное сжатие"><p>В основных решениях Lanfor для технологических газов масло не подаётся в камеру сжатия компрессора. Требования к чистоте всей системы, материалам и подготовке среды подтверждаются отдельно для конкретного процесса.</p><Link className="text-link" href="/knowledge/oil-free-compression/">Подробнее о безмасляном сжатии <span aria-hidden="true">→</span></Link></ContentSection></section>}',
)
replace_once(
    "src/app/solutions/[slug]/page.tsx",
    '<article className="prose">\n      <ContentSection title="Задача"><p>{solution.intent}</p></ContentSection>',
    '<article className="prose">\n      <ContentSection title="Задача"><p>{solution.intent}</p></ContentSection>\n      {solution.id === "pet-high-pressure-air" && <ContentSection title="Система считается от выдувного автомата"><p>Параметры старых проектов и типовые диапазоны не переносятся на новую линию автоматически. В расчёт берём требования изготовителя автомата, фактический цикл, доступный источник воздуха и ограничения площадки.</p></ContentSection>}\n      {solution.id === "refrigerant-transfer-compression" && <ContentSection title="Сначала — точный хладагент и состояние среды"><p>Название семейства хладагентов недостаточно для выбора оборудования. Нужны точное обозначение среды, состав смеси, температуры, давления и ожидаемая фаза по маршруту перекачки.</p></ContentSection>}',
)
replace_once(
    "src/app/solutions/[slug]/page.tsx",
    '<articleIds:["what-is-in-compressor-skid","air-vs-water-cooling"],',
    '<articleIds:["what-is-in-compressor-skid","air-vs-water-cooling"],',
) if False else None
replace_once(
    "src/app/solutions/[slug]/page.tsx",
    '<article className="prose">',
    '<article className="prose">',
) if False else None
replace_once(
    "src/app/solutions/[slug]/page.tsx",
    '<RfqPanel href={projectReview ? `${rfqHref}&intake=brief` : rfqHref} sourcePage={`/solutions/${solution.slug}/`} title={projectReview ? "Обсудить применимость оборудования" : "Подберём компрессор для вашей задачи"} />',
    '<RfqPanel href={briefIntake ? `${rfqHref}&intake=brief` : rfqHref} sourcePage={`/solutions/${solution.slug}/`} title={projectReview ? "Обсудить применимость оборудования" : solution.id === "pet-high-pressure-air" ? "Рассчитаем систему для вашей линии" : solution.id === "refrigerant-transfer-compression" ? "Проверим задачу по вашему хладагенту" : "Подберём компрессор для вашей задачи"} />',
)

# Server acceptance for both new routes and the Oil-Free boundary.
test_path = ROOT / "tests/e2e/pet-refrigerants.spec.ts"
test_path.write_text(r'''import { expect, test } from "@playwright/test";

const noHorizontalOverflow = async (page: import("@playwright/test").Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);

test("PET solution is public, Oil-Free and uses brief RFQ", async ({ page }) => {
  await page.goto("/solutions/oil-free-high-pressure-air-for-pet/");
  await expect(page.getByRole("heading", { level: 1, name: "Нужно стабильное высокое давление для выдува ПЭТ?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Безмасляное сжатие" })).toBeVisible();
  const cta = page.getByRole("link", { name: /Рассчитать систему для ПЭТ/ }).first();
  await expect(cta).toHaveAttribute("href", /intake=brief/);
  await expect(page.getByText("Контур высокого давления для выдува ПЭТ")).toBeVisible();
});

test("refrigerant solution does not make an automatic Oil-Free claim", async ({ page }) => {
  await page.goto("/solutions/refrigerant-transfer-compression/");
  await expect(page.getByRole("heading", { level: 1, name: "Нужно перекачать или фасовать хладагент?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Безмасляное сжатие" })).toHaveCount(0);
  await expect(page.getByText("Перекачка хладагента между системами")).toBeVisible();
  const cta = page.getByRole("link", { name: /Отправить данные по хладагенту/ }).first();
  await expect(cta).toHaveAttribute("href", /intake=brief/);
});

test("PET and refrigerant solution pages do not overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/solutions/oil-free-high-pressure-air-for-pet/", "/solutions/refrigerant-transfer-compression/"]) {
    await page.goto(path);
    expect(await noHorizontalOverflow(page)).toBe(true);
  }
});
''', encoding="utf-8")

# Unit-level guardrails: historical directions are present without copying old numeric envelopes/SKUs.
unit_path = ROOT / "tests/issue-14-solutions.test.ts"
unit_path.write_text(r'''import { describe, expect, it } from "vitest";
import { solutions } from "../src/content/solutions";

const pet = solutions.find((item) => item.id === "pet-high-pressure-air");
const refrigerant = solutions.find((item) => item.id === "refrigerant-transfer-compression");

describe("Issue 14 PET and refrigerant directions", () => {
  it("publishes both historical Lanfor directions as solution intents", () => {
    expect(pet?.slug).toBe("oil-free-high-pressure-air-for-pet");
    expect(refrigerant?.slug).toBe("refrigerant-transfer-compression");
  });

  it("does not copy old public product codes or numeric envelopes into the new solution records", () => {
    const text = JSON.stringify([pet, refrigerant]);
    expect(text).not.toMatch(/PET-C|RF-C|С-0000074|С-0000030/);
    expect(text).not.toMatch(/25.?40|8.?30|2.?90/);
  });

  it("keeps the refrigerant direction free of an unverified Oil-Free product claim", () => {
    const text = JSON.stringify(refrigerant).toLowerCase();
    expect(text).not.toContain("безмаслян");
    expect(text).not.toContain("oil-free");
  });
});
''', encoding="utf-8")

print("Issue #14 PET/refrigerant patch applied")
