from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def replace_once(path: str, old: str, new: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{path}: expected 1 occurrence, got {count}: {old[:100]!r}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")

# Integrator CTAs enter a tailored UI while reusing the hardened brief server payload.
replace_once("src/app/integrators/page.tsx", "?intake=brief&solution=equipment-integration", "?intake=integration&solution=equipment-integration")
replace_once("src/app/page.tsx", "/rfq/?intake=brief&solution=equipment-integration&source=%2F", "/rfq/?intake=integration&solution=equipment-integration&source=%2F")

replace_once(
    "src/app/rfq/page.tsx",
    '  const intake = query.intake === "brief" ? "brief" : "parameters";',
    '  const intake = query.intake === "integration" ? "integration" : query.intake === "brief" ? "brief" : "parameters";',
)

replace_once(
    "src/components/rfq-intake.tsx",
    'export type RfqFormMode = "preview" | "staging" | "live" | "disabled";\n\nexport function RfqIntake({ mode, initialGas, initialRequest, initialIntake = "parameters" }: {\n  mode: RfqFormMode; initialGas?: Gas; initialRequest?: RfqRequestContext; initialIntake?: "parameters" | "brief";\n}) {',
    'export type RfqFormMode = "preview" | "staging" | "live" | "disabled";\nexport type RfqIntakeKind = "parameters" | "brief" | "integration";\n\nexport function RfqIntake({ mode, initialGas, initialRequest, initialIntake = "parameters" }: {\n  mode: RfqFormMode; initialGas?: Gas; initialRequest?: RfqRequestContext; initialIntake?: RfqIntakeKind;\n}) {',
)
replace_once(
    "src/components/rfq-intake.tsx",
    '        <button type="button" aria-pressed={intake === "brief"} onClick={() => setIntake("brief")}>Описать задачу или приложить ТЗ</button>\n      </div>\n    </section>\n    <div hidden={intake !== "parameters"}><RfqForm mode={mode} initialGas={initialGas} initialRequest={initialRequest} /></div>\n    <div hidden={intake !== "brief"}><BriefRfqForm mode={mode} initialGas={initialGas} initialRequest={initialRequest} /></div>',
    '        <button type="button" aria-pressed={intake === "brief"} onClick={() => setIntake("brief")}>Описать задачу или приложить ТЗ</button>\n        <button type="button" aria-pressed={intake === "integration"} onClick={() => setIntake("integration")}>Интеграция в оборудование</button>\n      </div>\n    </section>\n    <div hidden={intake !== "parameters"}><RfqForm mode={mode} initialGas={initialGas} initialRequest={initialRequest} /></div>\n    <div hidden={intake !== "brief"}><BriefRfqForm mode={mode} initialGas={initialGas} initialRequest={initialRequest} /></div>\n    <div hidden={intake !== "integration"}><BriefRfqForm mode={mode} initialGas={initialGas} initialRequest={initialRequest} variant="integration" /></div>',
)

# Tailor the existing secure brief form rather than creating a second upload/API implementation.
replace_once(
    "src/components/rfq-brief-form.tsx",
    'export function BriefRfqForm({ mode, initialGas, initialRequest = {} }: { mode: RfqFormMode; initialGas?: Gas; initialRequest?: RfqRequestContext }) {',
    'export function BriefRfqForm({ mode, initialGas, initialRequest = {}, variant = "brief" }: { mode: RfqFormMode; initialGas?: Gas; initialRequest?: RfqRequestContext; variant?: "brief" | "integration" }) {',
)
replace_once(
    "src/components/rfq-brief-form.tsx",
    '  const [description, setDescription] = useState("");\n  const [model, setModel] = useState("");',
    '  const integration = variant === "integration";\n  const [description, setDescription] = useState("");\n  const [model, setModel] = useState("");\n  const [projectStage, setProjectStage] = useState("");\n  const [plannedQuantity, setPlannedQuantity] = useState("");',
)
replace_once(
    "src/components/rfq-brief-form.tsx",
    '  function event(name: string, delivery?: string) { if (mode !== "preview") track(name, { mode, code: "brief", ...(delivery ? { delivery } : {}) }); }',
    '  function event(name: string, delivery?: string) { if (mode !== "preview") track(name, { mode, code: integration ? "integration" : "brief", ...(delivery ? { delivery } : {}) }); }',
)
replace_once(
    "src/components/rfq-brief-form.tsx",
    '    const candidate = {\n      intake: "brief", description, ...(model.trim() ? { model } : {}), ...(gas ? { gas } : {}), attachmentCount: files.length,',
    '    const integrationDetails = integration && description.trim() ? [`Стадия проекта: ${projectStage || "не указана"}`, `Планируемая повторяемость / количество: ${plannedQuantity.trim() || "не указано"}`, "", description].join("\\n") : description;\n    const candidate = {\n      intake: "brief", description: integrationDetails, ...(model.trim() ? { model } : {}), ...(gas ? { gas } : {}), attachmentCount: files.length,',
)
replace_once(
    "src/components/rfq-brief-form.tsx",
    '      <h2 className="rfq-title" ref={heading} tabIndex={-1}>Опишите задачу или приложите ТЗ</h2>\n      <p>Расскажите, откуда поступает газ, для какого оборудования он нужен и что требуется изменить. Давление и расход можно уточнить позже.</p>',
    '      <h2 className="rfq-title" ref={heading} tabIndex={-1}>{integration ? "Передайте ТЗ проекта" : "Опишите задачу или приложите ТЗ"}</h2>\n      <p>{integration ? "Опишите машину или систему, функцию компрессорного узла и ограничения по интеграции. Давление, расход и точную конфигурацию можно уточнить при проработке." : "Расскажите, откуда поступает газ, для какого оборудования он нужен и что требуется изменить. Давление и расход можно уточнить позже."}</p>',
)
replace_once(
    "src/components/rfq-brief-form.tsx",
    '<div className="field"><label htmlFor="brief-description">Задача и известные параметры</label><textarea id="brief-description" rows={6} maxLength={12000} value={description} onChange={e => { changed(); setDescription(e.target.value); }} aria-invalid={Boolean(errors.description)} aria-describedby="brief-description-help brief-description-error" /><span className="rfq-help" id="brief-description-help">Достаточно описания, модели установки или приложенного документа. Неизвестные P₁, P₂ и Q уточним при проработке.</span>{error("description")}</div>',
    '<div className="field"><label htmlFor="brief-description">{integration ? "Машина, функция узла и известные параметры" : "Задача и известные параметры"}</label><textarea id="brief-description" rows={6} maxLength={12000} value={description} onChange={e => { changed(); setDescription(e.target.value); }} aria-invalid={Boolean(errors.description)} aria-describedby="brief-description-help brief-description-error" /><span className="rfq-help" id="brief-description-help">{integration ? "Укажите среду, функцию узла, известные P₁ / P₂ / Q, режим, питание или привод, охлаждение, габариты и интерфейсы — только то, что уже известно." : "Достаточно описания, модели установки или приложенного документа. Неизвестные P₁, P₂ и Q уточним при проработке."}</span>{error("description")}</div>',
)
replace_once(
    "src/components/rfq-brief-form.tsx",
    '<div className="field-row"><div className="field"><label htmlFor="brief-model">Модель вашего станка или установки <span className="rfq-optional">(при наличии)</span></label><input id="brief-model" value={model} maxLength={300} onChange={e => { changed(); setModel(e.target.value); }} aria-invalid={Boolean(errors.model)} />{error("model")}</div><div className="field"><label htmlFor="brief-gas">Газ <span className="rfq-optional">(если известен)</span></label><select id="brief-gas" value={gas} onChange={e => { changed(); setGas(e.target.value as Gas | ""); }}><option value="">Нужно уточнить</option>{GAS_OPTIONS.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}</select></div></div>',
    '<div className="field-row"><div className="field"><label htmlFor="brief-model">{integration ? "Модель машины или установки" : "Модель вашего станка или установки"} <span className="rfq-optional">(при наличии)</span></label><input id="brief-model" value={model} maxLength={300} onChange={e => { changed(); setModel(e.target.value); }} aria-invalid={Boolean(errors.model)} />{error("model")}</div><div className="field"><label htmlFor="brief-gas">Газ <span className="rfq-optional">(если известен)</span></label><select id="brief-gas" value={gas} onChange={e => { changed(); setGas(e.target.value as Gas | ""); }}><option value="">Воздух / нужно уточнить</option>{GAS_OPTIONS.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}</select></div></div>\n      {integration && <div className="field-row"><div className="field"><label htmlFor="brief-project-stage">Стадия проекта</label><select id="brief-project-stage" value={projectStage} onChange={e => { changed(); setProjectStage(e.target.value); }}><option value="">Нужно уточнить</option><option value="Концепт">Концепт</option><option value="Прототип">Прототип</option><option value="Испытания">Испытания</option><option value="Серия">Серия</option><option value="Замена существующего узла">Замена существующего узла</option></select></div><div className="field"><label htmlFor="brief-planned-quantity">Планируемое количество / повторяемость <span className="rfq-optional">(при наличии)</span></label><input id="brief-planned-quantity" value={plannedQuantity} maxLength={200} onChange={e => { changed(); setPlannedQuantity(e.target.value); }} placeholder="Например: опытный образец, затем 20 машин в год" /></div></div>}',
)

# Acceptance for the dedicated project-intake route.
test_path = ROOT / "tests/e2e/integrators.spec.ts"
test_text = test_path.read_text(encoding="utf-8")
test_text = test_text.replace('/intake=brief/', '/intake=integration/')
test_text += '''\n\ntest("integration intake asks project-stage and repeatability context", async ({ page }) => {\n  await page.goto("/rfq/?intake=integration&solution=equipment-integration&source=%2Fintegrators%2F");\n  await expect(page.getByRole("heading", { name: "Передайте ТЗ проекта" })).toBeVisible();\n  await expect(page.getByLabel("Стадия проекта")).toBeVisible();\n  await expect(page.getByLabel(/Планируемое количество/)).toBeVisible();\n  await expect(page.getByText("Интеграция в оборудование", { exact: true })).toBeVisible();\n});\n'''
test_path.write_text(test_text, encoding="utf-8")

print("Issue #14 integration intake patch applied")
