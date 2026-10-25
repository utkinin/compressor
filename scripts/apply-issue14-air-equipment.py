from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(path: str, old: str, new: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{path}: expected 1 occurrence, got {count}: {old[:120]!r}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")


# Equipment taxonomy: air/vacuum are media/functions, not new process-gas pillars.
replace_once(
    "src/content/types.ts",
    '  gas: GasId | "sf6";',
    '  gas: GasId | "air" | "vacuum" | "sf6";',
)
replace_once(
    "src/content/types.ts",
    '  rfqGas: GasId;',
    '  rfqGas?: GasId;',
)

# Add three public-safe functional directions. Supplier identities and source series stay out of public source/content.
equipment_path = ROOT / "src/content/equipment.ts"
equipment_text = equipment_path.read_text(encoding="utf-8")
if 'id: "oil-free-piston-compressor-modules"' in equipment_text:
    raise RuntimeError("Integrator equipment directions already present")
insert = r'''
  {
    id: "oil-free-piston-compressor-modules", slug: "oil-free-piston-compressor-modules", title: "Безмасляные поршневые компрессорные модули", editorialState: "review",
    heroVisualId: "equipment-range", processVisualId: "process-integration",
    summary: "Компактные безмасляные поршневые модули для встраивания в машины, газогенераторы, лабораторные и испытательные установки. Подбор ведётся по производительности, давлению, режиму, питанию, охлаждению и габаритам.",
    gas: "air", gasIds: [],
    technology: "Поршневой компрессор формирует сжатый воздух без подачи масла в камеру сжатия. Для интеграции важны не только давление и расход, но и питание, охлаждение, монтажное положение, вибрация, подключения и логика управления.",
    applications: [
      "Встраивание источника сжатого воздуха в технологическую машину или стенд.",
      "Подача воздуха в генераторы газов и аналитическое оборудование по требованиям изготовителя системы.",
      "Компактные лабораторные и испытательные установки, где критичны габариты и отсутствие масла в камере сжатия.",
      "Повторяемая поставка согласованного компрессорного модуля для серийного оборудования интегратора.",
    ],
    inputs: [
      "Требуемая производительность и давление воздуха на границе оборудования.",
      "Режим работы: продолжительность включения, цикл, паузы и пиковое потребление.",
      "Доступное электропитание, способ пуска и требования к управлению.",
      "Охлаждение, температура окружающей среды и допустимые ограничения по размещению.",
      "Габариты, монтажное положение, присоединения, шум и вибрация — если они критичны.",
      "Требования к качеству воздуха и дополнительной подготовке после компрессора.",
    ],
    approach: [
      "Сначала фиксируем функцию модуля внутри машины и требуемую точку по давлению и производительности.",
      "Проверяем режим работы и тепловую нагрузку, чтобы не подменять циклическое применение непрерывным режимом.",
      "Согласуем питание, охлаждение, монтаж и управляющие интерфейсы.",
      "После выбора базового модуля определяем, какие функции подготовки воздуха и автоматики действительно нужны проекту.",
    ],
    configurations: [
      "Открытый компрессорный модуль для установки внутри корпуса оборудования.",
      "Модуль с согласованным приводом и охлаждением для самостоятельного монтажа интегратором.",
      "Проектное исполнение на основании или раме с необходимыми подключениями — если это требуется машиной.",
    ],
    options: [
      "Воздушное охлаждение и организация потока воздуха внутри машины.",
      "Входная и выходная фильтрация — по требованиям конкретного процесса.",
      "Датчики, защита, управление и сигналы готовности.",
      "Ресивер, осушка и дополнительная подготовка — только если требуются расчётом и ТЗ.",
    ],
    solutionIds: ["equipment-integration"],
    articleIds: ["oil-free-compression", "continuous-vs-intermittent", "air-vs-water-cooling", "what-is-in-compressor-skid"],
  },
  {
    id: "compact-oil-free-air-systems", slug: "compact-oil-free-air-systems", title: "Компактные безмасляные компрессорные системы", editorialState: "review",
    heroVisualId: "home-compressor-system", processVisualId: "process-supply",
    summary: "Компактные системы для встраивания, где компрессор объединяется с необходимыми функциями управления, охлаждения и подготовки воздуха. Состав определяется интерфейсами и режимом конкретной машины.",
    gas: "air", gasIds: [],
    technology: "Система строится вокруг безмасляного компрессора и может объединять управление, охлаждение, подготовку воздуха и другие функции в одном проектном модуле. Наличие каждого компонента подтверждается для выбранной конфигурации.",
    applications: [
      "Машины и установки, где заказчику нужен готовый воздушный модуль вместо набора разрозненных компонентов.",
      "Газогенераторы и аналитические системы с заданными требованиями к качеству и режиму подачи воздуха.",
      "Транспортное и специальное оборудование, если требуется компактная автономная пневмосистема.",
      "Повторяемые проекты, в которых важны фиксированная компоновка и одинаковые интерфейсы от поставки к поставке.",
    ],
    inputs: [
      "Требуемые давление, производительность и качество сжатого воздуха.",
      "Режим машины, пиковое потребление и допустимое время восстановления давления.",
      "Питание и управляющие сигналы, доступные со стороны оборудования заказчика.",
      "Требования к осушению, фильтрации и накоплению воздуха.",
      "Ограничения по габаритам, монтажу, охлаждению, шуму и сервисному доступу.",
    ],
    approach: [
      "Разделяем обязательные функции и опции: компрессор остаётся ядром, остальная комплектация появляется только по задаче.",
      "Проверяем совместную работу компрессора, управления и подготовки воздуха в заданном цикле.",
      "Фиксируем электрические, пневматические и механические интерфейсы для интеграции.",
      "Для повторяемой поставки сохраняем согласованную конфигурацию и состав документации.",
    ],
    configurations: [
      "Компрессор и управление в компактном модуле.",
      "Компрессорный модуль с необходимой подготовкой воздуха.",
      "Расширенная проектная система с ресивером и дополнительными функциями — если они нужны машине.",
    ],
    options: [
      "Осушка и фильтрация по требуемому качеству воздуха.",
      "Ресивер по циклу потребления и допустимым колебаниям давления.",
      "Контроллер, датчики, блокировки и интерфейсы связи.",
      "Рама, кожух, виброизоляция и сервисные подключения — по ограничениям интеграции.",
    ],
    solutionIds: ["equipment-integration"],
    articleIds: ["oil-free-compression", "what-is-in-compressor-skid", "why-a-receiver", "continuous-vs-intermittent"],
  },
  {
    id: "oil-free-vacuum-modules", slug: "oil-free-vacuum-modules", title: "Безмасляные вакуумные модули", editorialState: "review",
    heroVisualId: "solution-integration", processVisualId: "process-vacuum-integration",
    summary: "Безмасляные вакуумные насосы и модули для встраивания в лабораторные, аналитические и технологические установки. Рабочая точка, режим и комплектация подтверждаются по задаче оборудования.",
    gas: "vacuum", gasIds: [],
    technology: "Вакуумный модуль создаёт требуемое разрежение без подачи масла в рабочую камеру насоса. Для выбора важны требуемый вакуум, производительность, состав откачиваемой среды, цикл, температура и ограничения по интеграции.",
    applications: [
      "Вакуумная функция внутри лабораторного или аналитического оборудования.",
      "Испытательные стенды и технологические машины с повторяющимися циклами откачки.",
      "Компактные системы, где вакуумный насос должен быть встроен в общий корпус и управление.",
      "Проектные и повторяемые поставки согласованного вакуумного модуля производителю оборудования.",
    ],
    inputs: [
      "Требуемое остаточное давление или диапазон вакуума в рабочей точке.",
      "Требуемая производительность и объём системы, который необходимо откачивать.",
      "Состав и температура откачиваемой среды, возможная влага, аэрозоли или конденсат.",
      "Цикл работы, продолжительность откачки, паузы и число запусков.",
      "Питание, охлаждение, габариты, монтаж и управляющие интерфейсы.",
    ],
    approach: [
      "Определяем фактическую вакуумную задачу и объём, а не выбираем насос только по номинальной производительности.",
      "Проверяем допустимость откачиваемой среды и риск конденсации или попадания жидкости.",
      "Согласуем режим, охлаждение, фильтрацию на входе и защиту насоса.",
      "После выбора модуля фиксируем подключения, управление и границы поставки для интегратора.",
    ],
    configurations: [
      "Отдельный безмасляный вакуумный насос для встраивания.",
      "Насосный модуль с приводом, защитой и согласованными подключениями.",
      "Проектная вакуумная система с необходимыми датчиками и буферной ёмкостью — если требуется процессом.",
    ],
    options: [
      "Входной фильтр и защита от переноса загрязнений — по составу среды.",
      "Датчики вакуума, автоматика и защитные блокировки.",
      "Буферная ёмкость, клапаны и трубная обвязка — по циклу установки.",
      "Кожух, виброизоляция и монтажные элементы — по требованиям оборудования.",
    ],
    solutionIds: ["equipment-integration"],
    articleIds: ["oil-free-compression", "continuous-vs-intermittent", "what-is-in-compressor-skid"],
  },
'''
idx = equipment_text.rfind("\n];")
if idx < 0:
    raise RuntimeError("equipment array closing marker not found")
equipment_path.write_text(equipment_text[:idx] + insert + equipment_text[idx:], encoding="utf-8")

# Add a vacuum-specific process figure; compressor-system figures already exist for the two air categories.
replace_once(
    "src/content/visuals.ts",
    '  { id: "process-five-parameters", title: "Пять исходных параметров для подбора", layout: "parameters", callouts: parameters },',
    '  { id: "process-five-parameters", title: "Пять исходных параметров для подбора", layout: "parameters", callouts: parameters },\n  {\n    id: "process-vacuum-integration", title: "Вакуумная функция внутри оборудования", layout: "flow",\n    steps: [\n      { id: "process", label: "Камера / процесс", detail: "Объём и требуемое остаточное давление", icon: "consumer" },\n      { id: "protection", label: "Подготовка потока", detail: "Если требуется по среде", icon: "filter", optional: true },\n      { id: "vacuum", label: "Безмасляный вакуумный модуль", detail: "Под режим и производительность", icon: "compressor" },\n      { id: "control", label: "Контроль и автоматика", detail: "Датчики и блокировки по проекту", icon: "control", optional: true },\n    ], caption: "Состав среды, риск конденсации и допустимость конкретного насоса проверяются до выбора исполнения.",\n  },',
)

# RFQ catalogue can hold equipment contexts without forcing a process-gas selection.
replace_once(
    "src/lib/rfq/schema.ts",
    '} as const satisfies Record<string, { title: string; gas: Gas }>;\n\nexport const RFQ_SOLUTION_CONTEXTS',
    '  "oil-free-piston-compressor-modules": { title: "Безмасляные поршневые компрессорные модули", intake: "integration" },\n  "compact-oil-free-air-systems": { title: "Компактные безмасляные компрессорные системы", intake: "integration" },\n  "oil-free-vacuum-modules": { title: "Безмасляные вакуумные модули", intake: "integration" },\n} as const satisfies Record<string, { title: string; gas?: Gas; intake?: "integration" }>;\n\nexport const RFQ_SOLUTION_CONTEXTS',
)
replace_once(
    "src/lib/rfq/schema.ts",
    'export function equipmentRfqContext(id?: string): { title: string; gas: Gas } | undefined {',
    'export function equipmentRfqContext(id?: string): { title: string; gas?: Gas; intake?: "integration" } | undefined {',
)

# Equipment cards: project categories use medium labels instead of pretending they are a process gas.
replace_once(
    "src/components/equipment-catalog.tsx",
    'const categoryLabels: Record<string, { gas: GasId; task: string; cta: string }> = {',
    'const categoryLabels: Record<string, { gas?: GasId; medium?: string; task: string; cta: string; oilFreeLabel?: string }> = {',
)
replace_once(
    "src/components/equipment-catalog.tsx",
    '  "process-gas-compressors": { gas: "mixtures", task: "Индивидуальное рассмотрение состава", cta: "Отправить параметры газа" },\n};',
    '  "process-gas-compressors": { gas: "mixtures", task: "Индивидуальное рассмотрение состава", cta: "Отправить параметры газа" },\n  "oil-free-piston-compressor-modules": { medium: "Сжатый воздух", task: "Модуль для встраивания", cta: "Подобрать модуль для интеграции" },\n  "compact-oil-free-air-systems": { medium: "Сжатый воздух", task: "Компактная система для машины", cta: "Обсудить интеграцию системы" },\n  "oil-free-vacuum-modules": { medium: "Вакуум", task: "Вакуум внутри оборудования", cta: "Подобрать вакуумный модуль", oilFreeLabel: "Безмасляное исполнение" },\n};',
)
replace_once(
    "src/components/equipment-catalog.tsx",
    '  const query = new URLSearchParams({ gas: equipment.rfqGas, equipment: equipment.id, source: sourcePage });\n  return `/rfq/?${query.toString()}`;',
    '  const query = new URLSearchParams({ equipment: equipment.id, source: sourcePage });\n  if (equipment.rfqGas) query.set("gas", equipment.rfqGas);\n  else query.set("intake", "integration");\n  return `/rfq/?${query.toString()}`;',
)
replace_once(
    "src/components/equipment-catalog.tsx",
    '<ul className="equipment-card-tags" aria-label="Назначение"><li>{label ? <GasBadge gas={label.gas} /> : "Газ"}</li><li>Безмасляное сжатие</li><li>Подбор по параметрам</li></ul>',
    '<ul className="equipment-card-tags" aria-label="Назначение"><li>{label?.gas ? <GasBadge gas={label.gas} /> : label?.medium ?? "Среда по проекту"}</li><li>{label?.oilFreeLabel ?? "Безмасляное сжатие"}</li><li>Подбор по параметрам</li></ul>',
)

# Equipment detail page: project categories use integration intake instead of the 5-parameter gas wizard.
replace_once(
    "src/components/public-equipment-page.tsx",
    '  const documentationQuery = new URLSearchParams({ gas: equipment.rfqGas, equipment: equipment.id, document: "technical-documentation", source: path });',
    '  const documentationQuery = new URLSearchParams({ equipment: equipment.id, document: "technical-documentation", source: path });\n  if (equipment.rfqGas) documentationQuery.set("gas", equipment.rfqGas);',
)
replace_once(
    "src/components/public-equipment-page.tsx",
    '    <CommercialHero eyebrow="Оборудование / подбор по назначению" title={equipment.title} summary={equipment.summary} visualId={equipment.heroVisualId} action={<Link className="button" href={rfqHref}>{equipmentActionLabel(equipment)} <span aria-hidden="true">→</span></Link>} />',
    '    <CommercialHero eyebrow={equipment.rfqGas ? "Оборудование / подбор по назначению" : "Для интеграторов / проектная поставка"} title={equipment.title} summary={equipment.summary} visualId={equipment.heroVisualId} action={<Link className="button" href={rfqHref}>{equipmentActionLabel(equipment)} <span aria-hidden="true">→</span></Link>} />',
)
replace_once(
    "src/components/public-equipment-page.tsx",
    '      <ContentSection title="Безмасляное сжатие"><p>Для этих направлений масло не подаётся в камеру сжатия компрессора. Чистота газа на выходе при этом зависит также от трубопроводов, арматуры, уплотнений и согласованной подготовки всей системы.</p><Link className="text-link" href="/knowledge/oil-free-compression/">Подробнее о безмасляном сжатии <span aria-hidden="true">→</span></Link></ContentSection>\n      <EquipmentSelection rfqHref={rfqHref} />',
    '      <ContentSection title={equipment.gas === "vacuum" ? "Безмасляное исполнение" : "Безмасляное сжатие"}><p>{equipment.gas === "vacuum" ? "В безмасляном вакуумном направлении масло не подаётся в рабочую камеру насоса. Чистота и пригодность полного вакуумного тракта зависят также от соединений, фильтрации и условий процесса." : "Для этих направлений масло не подаётся в камеру сжатия компрессора. Чистота газа на выходе при этом зависит также от трубопроводов, арматуры, уплотнений и согласованной подготовки всей системы."}</p><Link className="text-link" href="/knowledge/oil-free-compression/">Подробнее о безмасляном исполнении <span aria-hidden="true">→</span></Link></ContentSection>\n      {equipment.rfqGas ? <EquipmentSelection rfqHref={rfqHref} /> : <ContentSection title="Проектный подбор для встраивания"><p>Передайте функцию модуля, известные рабочие параметры, питание, ограничения по габаритам и стадию проекта. Если часть данных ещё неизвестна, форму можно отправить с ТЗ или описанием машины.</p><Link className="button" href={rfqHref}>Передать ТЗ проекта <span aria-hidden="true">→</span></Link></ContentSection>}',
)
replace_once(
    "src/components/public-equipment-page.tsx",
    '      <div className="equipment-preliminary"><strong>Предварительный вариант оборудования</strong><p>По газу, P₁, P₂, расходу и режиму форма подготовит описание задачи и предварительный тип оборудования. Исполнение уточняется после расчёта; требуется инженерное подтверждение.</p><Link className="button" href={rfqHref}>Указать параметры <span aria-hidden="true">→</span></Link></div>',
    '      <div className="equipment-preliminary"><strong>{equipment.rfqGas ? "Предварительный вариант оборудования" : "Интеграция в оборудование"}</strong><p>{equipment.rfqGas ? "По газу, P₁, P₂, расходу и режиму форма подготовит описание задачи и предварительный тип оборудования. Исполнение уточняется после расчёта; требуется инженерное подтверждение." : "Прорабатываем модуль как часть вашей машины: рабочие параметры, питание, охлаждение, габариты, монтаж и управление. Конфигурация фиксируется после инженерной проверки исходных данных."}</p><Link className="button" href={rfqHref}>{equipment.rfqGas ? "Указать параметры" : "Передать данные проекта"} <span aria-hidden="true">→</span></Link></div>',
)

# Split the equipment hub so project modules do not dilute the process-gas specialization.
replace_once(
    "src/app/equipment/page.tsx",
    'const title = "Безмасляные компрессоры и бустеры для технологических газов";\nconst description = "Безмасляные компрессоры и бустеры для азота, гелия, CO₂ и других технологических газов. Подбор по давлению на входе, требуемому давлению, расходу и режиму работы.";',
    'const title = "Безмасляные компрессоры, бустеры и модули для оборудования";\nconst description = "Безмасляные компрессоры и бустеры для технологических газов, а также компактные воздушные и вакуумные модули для интеграции в машины и установки. Проектный подбор по рабочим параметрам и интерфейсам.";',
)
replace_once(
    "src/app/equipment/page.tsx",
    '  const directions = equipment.filter((item) => !item.externalReference);\n  const references = equipment.filter((item) => item.externalReference);\n  const solutionIds = ["nitrogen-for-laser-cutting", "nitrogen-booster-after-generator", "helium-recovery", "gas-transfer-recovery"];',
    '  const directions = equipment.filter((item) => !item.externalReference);\n  const gasDirections = directions.filter((item) => Boolean(item.rfqGas));\n  const integrationDirections = directions.filter((item) => !item.rfqGas);\n  const references = equipment.filter((item) => item.externalReference);\n  const solutionIds = ["nitrogen-for-laser-cutting", "nitrogen-booster-after-generator", "helium-recovery", "oil-free-high-pressure-air-for-pet", "refrigerant-transfer-compression"];',
)
replace_once(
    "src/app/equipment/page.tsx",
    '    <CommercialHero eyebrow="Безмасляное сжатие / оборудование и подбор" title={title} summary={description} visualId="equipment-range" action={<Link className="button" href="/rfq/?source=%2Fequipment%2F">Подобрать компрессор <span aria-hidden="true">→</span></Link>} />\n    <section className="container equipment-catalog-section" aria-label="Каталог оборудования"><EquipmentCards items={directions} /></section>',
    '    <CommercialHero eyebrow="Безмасляное сжатие / оборудование и интеграция" title={title} summary={description} visualId="equipment-range" action={<Link className="button" href="/rfq/?source=%2Fequipment%2F">Подобрать компрессор <span aria-hidden="true">→</span></Link>} />\n    <section className="container equipment-catalog-section" aria-labelledby="gas-equipment-title"><div className="section-heading"><div><p className="eyebrow">Технологические газы</p><h2 id="gas-equipment-title">Компрессоры и бустеры по газу и задаче</h2></div><p>Подбор начинается с состава газа, P₁, P₂, расхода и режима работы.</p></div><EquipmentCards items={gasDirections} /></section>\n    <section className="section" aria-labelledby="integration-equipment-title"><div className="container equipment-catalog-section"><div className="section-heading"><div><p className="eyebrow">Для интеграторов</p><h2 id="integration-equipment-title">Модули для встраивания в машины и установки</h2></div><p>Проектируем интерфейсы и комплектацию под оборудование заказчика. Основной сценарий — проектная и повторяемая поставка согласованной конфигурации.</p></div><EquipmentCards items={integrationDirections} sourcePage="/equipment/" /></div></section>',
)

# Link verified public categories from the integrator landing; transport remains a direction without a public category page.
replace_once(
    "src/app/integrators/page.tsx",
    '    title: "Безмасляные поршневые компрессорные модули",\n    text: "Для встраивания в машины, газогенераторы, лабораторные и испытательные установки. Конкретное исполнение подбирается по режиму, питанию, охлаждению, габаритам и интерфейсам.",',
    '    title: "Безмасляные поршневые компрессорные модули",\n    href: "/equipment/oil-free-piston-compressor-modules/",\n    text: "Для встраивания в машины, газогенераторы, лабораторные и испытательные установки. Конкретное исполнение подбирается по режиму, питанию, охлаждению, габаритам и интерфейсам.",',
)
replace_once(
    "src/app/integrators/page.tsx",
    '    title: "Компактные безмасляные компрессорные системы",\n    text: "Компрессор с необходимыми функциями охлаждения, управления, накопления и подготовки воздуха — только в составе, который действительно требуется проекту.",',
    '    title: "Компактные безмасляные компрессорные системы",\n    href: "/equipment/compact-oil-free-air-systems/",\n    text: "Компрессор с необходимыми функциями охлаждения, управления, накопления и подготовки воздуха — только в составе, который действительно требуется проекту.",',
)
replace_once(
    "src/app/integrators/page.tsx",
    '    title: "Безмасляные вакуумные модули",\n    text: "Для технологических, аналитических и лабораторных установок, где вакуумный модуль является частью оборудования интегратора. Параметры и применимость подтверждаются для конкретной задачи.",',
    '    title: "Безмасляные вакуумные модули",\n    href: "/equipment/oil-free-vacuum-modules/",\n    text: "Для технологических, аналитических и лабораторных установок, где вакуумный модуль является частью оборудования интегратора. Параметры и применимость подтверждаются для конкретной задачи.",',
)
replace_once(
    "src/app/integrators/page.tsx",
    '      <div className="integrator-direction-grid">{directions.map((direction, index) => <article key={direction.title} className="integrator-direction-card"><span className="integrator-direction-index" aria-hidden="true">0{index + 1}</span><div><h3>{direction.title}</h3><p>{direction.text}</p></div></article>)}</div>',
    '      <div className="integrator-direction-grid">{directions.map((direction, index) => <article key={direction.title} className="integrator-direction-card"><span className="integrator-direction-index" aria-hidden="true">0{index + 1}</span><div><h3>{"href" in direction ? <Link href={direction.href}>{direction.title}</Link> : direction.title}</h3><p>{direction.text}</p>{"href" in direction && <Link className="text-link" href={direction.href}>Подробнее о направлении <span aria-hidden="true">→</span></Link>}</div></article>)}</div>',
)

# Content tests: preserve legacy-source boundaries while accepting the three new public-safe directions.
replace_once(
    "tests/content.test.ts",
    '  it("preserves five equipment directions and the SF₆ specialist reference without unsupported claims", () => {',
    '  it("preserves process-gas directions, the SF₆ specialist reference and three project-integration directions without unsupported claims", () => {',
)
replace_once(
    "tests/content.test.ts",
    '      ["process-gas-compressors", "Компрессоры для технологических газов"],\n    ]);',
    '      ["process-gas-compressors", "Компрессоры для технологических газов"],\n      ["oil-free-piston-compressor-modules", "Безмасляные поршневые компрессорные модули"],\n      ["compact-oil-free-air-systems", "Компактные безмасляные компрессорные системы"],\n      ["oil-free-vacuum-modules", "Безмасляные вакуумные модули"],\n    ]);',
)
replace_once(
    "tests/content.test.ts",
    '    const publicIds = new Set(equipment.map((item) => item.id));\n    const sourceIds = new Set(sourceModels.map((item) => item.id));',
    '    const publicIds = new Set(equipment.map((item) => item.id));\n    const legacyResearchIds = new Set(["nitrogen-compressors", "nitrogen-boosters", "helium-compressors", "co2-compressors", "sf6-compressors", "process-gas-compressors"]);\n    const sourceIds = new Set(sourceModels.map((item) => item.id));',
)
replace_once(
    "tests/content.test.ts",
    '    expect(equipmentCapabilityLinks.flatMap((link) => link.publicEquipmentIds).sort()).toEqual([...publicIds].sort());',
    '    expect(equipmentCapabilityLinks.flatMap((link) => link.publicEquipmentIds).sort()).toEqual([...legacyResearchIds].sort());',
)
replace_once(
    "tests/content.test.ts",
    '    expect(equipmentCapabilityLinks.find((link) => link.publicEquipmentIds.includes("process-gas-compressors"))?.sourceModelIds).toEqual([]);',
    '    expect(equipmentCapabilityLinks.find((link) => link.publicEquipmentIds.includes("process-gas-compressors"))?.sourceModelIds).toEqual([]);\n    for (const id of ["oil-free-piston-compressor-modules", "compact-oil-free-air-systems", "oil-free-vacuum-modules"]) {\n      expect(publicIds.has(id)).toBe(true);\n      expect(equipmentCapabilityLinks.some((link) => link.publicEquipmentIds.includes(id))).toBe(false);\n    }',
)

# RFQ tests: new integration contexts intentionally have no forced process-gas default.
replace_once(
    "tests/rfq.test.ts",
    '  it("keeps five own equipment contexts aligned and excludes the specialist reference", () => {\n    expect(Object.keys(RFQ_EQUIPMENT_CONTEXTS)).toHaveLength(5);',
    '  it("keeps eight own equipment contexts aligned and excludes the specialist reference", () => {\n    expect(Object.keys(RFQ_EQUIPMENT_CONTEXTS)).toHaveLength(8);',
)
replace_once(
    "tests/rfq.test.ts",
    '    for (const item of equipment.filter((item) => item.id !== "sf6-compressors")) {\n      expect(initialRfqSelection(undefined, item.id).gas).toBe(item.rfqGas);\n      expect(publicRfqContextLabel("equipment", item.id)).toBeTruthy();\n    }',
    '    for (const item of equipment.filter((item) => item.id !== "sf6-compressors")) {\n      if (item.rfqGas) expect(initialRfqSelection(undefined, item.id).gas).toBe(item.rfqGas);\n      else expect(RFQ_EQUIPMENT_CONTEXTS[item.id as keyof typeof RFQ_EQUIPMENT_CONTEXTS]).toMatchObject({ intake: "integration" });\n      expect(publicRfqContextLabel("equipment", item.id)).toBeTruthy();\n    }',
)

# Browser acceptance for the three project categories and their integration RFQ.
e2e = ROOT / "tests/e2e/integrator-equipment.spec.ts"
e2e.write_text(r'''import { expect, test } from "@playwright/test";

const routes = [
  ["/equipment/oil-free-piston-compressor-modules/", "Безмасляные поршневые компрессорные модули"],
  ["/equipment/compact-oil-free-air-systems/", "Компактные безмасляные компрессорные системы"],
  ["/equipment/oil-free-vacuum-modules/", "Безмасляные вакуумные модули"],
] as const;

for (const [path, title] of routes) {
  test(`${title} is a project-integration equipment direction`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    const cta = page.getByRole("link", { name: /Подобрать|Обсудить/ }).first();
    await expect(cta).toHaveAttribute("href", /intake=integration/);
    await expect(page.getByText("Для интеграторов / проектная поставка")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  });
}

test("equipment hub separates process-gas equipment from integrator modules", async ({ page }) => {
  await page.goto("/equipment/");
  await expect(page.getByRole("heading", { name: "Компрессоры и бустеры по газу и задаче" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Модули для встраивания в машины и установки" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Безмасляные поршневые компрессорные модули" }).first()).toBeVisible();
});

test("integrator landing links the three verified public category directions", async ({ page }) => {
  await page.goto("/integrators/");
  for (const [, title] of routes) await expect(page.getByRole("link", { name: title }).first()).toBeVisible();
});
''', encoding="utf-8")

print("Issue #14 integrator equipment patch applied")
