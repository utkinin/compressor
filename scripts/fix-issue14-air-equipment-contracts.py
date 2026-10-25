from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(path: str, old: str, new: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{path}: expected 1 occurrence, got {count}: {old[:140]!r}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")


# Integration-aware RFQ side panel; existing pages keep the current parameter copy.
replace_once(
    "src/components/content-page.tsx",
    'export function RfqPanel({ href = "/rfq/", title = "Подберём компрессор для вашей задачи", sourcePage = "/" }: { href?: string; title?: string; sourcePage?: string }) {',
    'export function RfqPanel({ href = "/rfq/", title = "Подберём компрессор для вашей задачи", sourcePage = "/", variant = "parameters" }: { href?: string; title?: string; sourcePage?: string; variant?: "parameters" | "integration" }) {',
)
replace_once(
    "src/components/content-page.tsx",
    '      <p className="eyebrow">Gas · P₁ · P₂ · Q · режим</p>\n      <h2>{title}</h2>\n      <p>Расскажите, какой газ нужно сжимать, откуда он поступает и что требуется потребителю. Известные давления, расход и режим помогут уточнить подходящее оборудование.</p>\n      <Link className="button" href={contextualHref}>Подобрать компрессор <span aria-hidden="true">→</span></Link>\n      <p className="small-text">Исполнение и параметры подтвердит инженер после расчёта.</p>',
    '      <p className="eyebrow">{variant === "integration" ? "PROJECT · INTERFACES · REPEATABILITY" : "Gas · P₁ · P₂ · Q · режим"}</p>\n      <h2>{title}</h2>\n      <p>{variant === "integration" ? "Опишите машину или установку, функцию компрессорного или вакуумного модуля, известные рабочие параметры, питание, габариты и интерфейсы. Недостающие данные уточним при проработке." : "Расскажите, какой газ нужно сжимать, откуда он поступает и что требуется потребителю. Известные давления, расход и режим помогут уточнить подходящее оборудование."}</p>\n      <Link className="button" href={contextualHref}>{variant === "integration" ? "Передать ТЗ проекта" : "Подобрать компрессор"} <span aria-hidden="true">→</span></Link>\n      <p className="small-text">{variant === "integration" ? "Конфигурацию и интерфейсы подтвердит инженер после проверки исходных данных." : "Исполнение и параметры подтвердит инженер после расчёта."}</p>',
)

# Make common equipment copy technically natural for air/vacuum categories.
replace_once(
    "src/components/public-equipment-page.tsx",
    '  if (equipment.rfqGas) documentationQuery.set("gas", equipment.rfqGas);',
    '  if (equipment.rfqGas) documentationQuery.set("gas", equipment.rfqGas); else documentationQuery.set("intake", "integration");',
)
replace_once(
    "src/components/public-equipment-page.tsx",
    '<ContentSection title={equipment.gas === "vacuum" ? "Безмасляное исполнение" : "Безмасляное сжатие"}><p>{equipment.gas === "vacuum" ? "В безмасляном вакуумном направлении масло не подаётся в рабочую камеру насоса. Чистота и пригодность полного вакуумного тракта зависят также от соединений, фильтрации и условий процесса." : "Для этих направлений масло не подаётся в камеру сжатия компрессора. Чистота газа на выходе при этом зависит также от трубопроводов, арматуры, уплотнений и согласованной подготовки всей системы."}</p>',
    '<ContentSection title={equipment.gas === "vacuum" ? "Безмасляное исполнение" : "Безмасляное сжатие"}><p>{equipment.gas === "vacuum" ? "В безмасляном вакуумном направлении масло не подаётся в рабочую камеру насоса. Чистота и пригодность полного вакуумного тракта зависят также от соединений, фильтрации и условий процесса." : equipment.gas === "air" ? "В безмасляном воздушном направлении масло не подаётся в камеру сжатия компрессора. Качество воздуха на выходе зависит также от входного воздуха, трубопроводов, арматуры и согласованной подготовки всей системы." : "Для этих направлений масло не подаётся в камеру сжатия компрессора. Чистота газа на выходе при этом зависит также от трубопроводов, арматуры, уплотнений и согласованной подготовки всей системы."}</p>',
)
replace_once(
    "src/components/public-equipment-page.tsx",
    '      <ContentSection title="Что проверяется до предложения"><BulletList items={equipment.checks} /><p>Название направления описывает назначение оборудования. Газовая совместимость, давление, производительность, чистота и требования безопасности подтверждаются для конкретного исполнения.</p></ContentSection>',
    '      <ContentSection title="Что проверяется до предложения"><BulletList items={equipment.checks} /><p>{equipment.rfqGas ? "Название направления описывает назначение оборудования. Газовая совместимость, давление, производительность, чистота и требования безопасности подтверждаются для конкретного исполнения." : equipment.gas === "vacuum" ? "Название направления описывает функцию оборудования. Рабочий вакуум, производительность, допустимая среда, режим и требования к защите подтверждаются для конкретного исполнения." : "Название направления описывает функцию оборудования. Давление, производительность, режим, качество воздуха и условия интеграции подтверждаются для конкретного исполнения."}</p></ContentSection>',
)
replace_once(
    "src/components/public-equipment-page.tsx",
    '    </article><RfqPanel href={rfqHref} sourcePage={path} title="Подберём исполнение по вашим параметрам" /></div>',
    '    </article><RfqPanel href={rfqHref} sourcePage={path} title={equipment.rfqGas ? "Подберём исполнение по вашим параметрам" : "Подберём модуль для вашей машины"} variant={equipment.rfqGas ? "parameters" : "integration"} /></div>',
)

# Update substantive-content count after adding three deliberate public categories.
replace_once(
    "tests/content.test.ts",
    '    expect(equipment).toHaveLength(6);',
    '    expect(equipment).toHaveLength(9);',
)

# Legacy test keeps strict contract for legacy gas pages and adds an explicit project-category contract.
replace_once(
    "tests/families-and-legacy.test.ts",
    'const equipmentSlugs = [\n  "nitrogen-compressors", "nitrogen-boosters", "helium-compressors",\n  "co2-compressors", "sf6-compressors", "process-gas-compressors",\n];',
    'const legacyEquipmentSlugs = [\n  "nitrogen-compressors", "nitrogen-boosters", "helium-compressors",\n  "co2-compressors", "sf6-compressors", "process-gas-compressors",\n];\nconst integrationEquipmentSlugs = [\n  "oil-free-piston-compressor-modules", "compact-oil-free-air-systems", "oil-free-vacuum-modules",\n];\nconst equipmentSlugs = [...legacyEquipmentSlugs, ...integrationEquipmentSlugs];',
)
replace_once(
    "tests/families-and-legacy.test.ts",
    '  it("preserves all six equipment URLs without source-model or removed category routes", async () => {',
    '  it("preserves legacy equipment URLs and adds only the three approved integration-category routes", async () => {',
)
replace_once(
    "tests/families-and-legacy.test.ts",
    '      for (const label of ["Что это и для каких задач", "Начнём с 5 основных параметров", "Газ", "Давление на входе P₁", "Требуемое давление P₂", "Расход Q", "Режим работы", "Исполнение и необходимая комплектация", "По необходимости"]) {\n        expect(html).toContain(label);\n      }\n      expect(html.indexOf("Начнём с 5 основных параметров")).toBeLessThan(html.indexOf("Исполнение и необходимая комплектация"));',
    '      for (const label of ["Что это и для каких задач", "Исполнение и необходимая комплектация", "По необходимости"]) expect(html).toContain(label);\n      if (equipment.rfqGas) {\n        for (const label of ["Начнём с 5 основных параметров", "Газ", "Давление на входе P₁", "Требуемое давление P₂", "Расход Q", "Режим работы"]) expect(html).toContain(label);\n        expect(html.indexOf("Начнём с 5 основных параметров")).toBeLessThan(html.indexOf("Исполнение и необходимая комплектация"));\n      } else {\n        expect(html).toContain("Проектный подбор для встраивания");\n        expect(html).toContain("Передать ТЗ проекта");\n        expect(html).not.toContain("Начнём с 5 основных параметров");\n      }',
)
replace_once(
    "tests/families-and-legacy.test.ts",
    '      expect(rfqLinks.map((url) => Object.fromEntries(url.searchParams))).toContainEqual({\n        equipment: equipment.id, gas: equipment.rfqGas, source: `/equipment/${equipment.slug}/`,\n      });',
    '      const contexts = rfqLinks.map((url) => Object.fromEntries(url.searchParams));\n      if (equipment.rfqGas) expect(contexts).toContainEqual({ equipment: equipment.id, gas: equipment.rfqGas, source: `/equipment/${equipment.slug}/` });\n      else expect(contexts).toContainEqual({ equipment: equipment.id, source: `/equipment/${equipment.slug}/`, intake: "integration" });',
)

print("Issue #14 equipment acceptance and RFQ copy aligned")
