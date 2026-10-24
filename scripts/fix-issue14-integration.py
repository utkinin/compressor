from pathlib import Path

# Keep the ordinary brief-form placeholder unchanged; only the integration
# variant may explicitly mention air as a possible medium.
path = Path("src/components/rfq-brief-form.tsx")
text = path.read_text(encoding="utf-8")
old = '<option value="">Воздух / нужно уточнить</option>{GAS_OPTIONS.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}'
new = '<option value="">{integration ? "Воздух / нужно уточнить" : "Нужно уточнить"}</option>{GAS_OPTIONS.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}'
if text.count(old) != 1:
    raise RuntimeError(f"Expected one integration gas placeholder, found {text.count(old)}")
path.write_text(text.replace(old, new, 1), encoding="utf-8")

# Brief and integration variants use the same secure component and therefore
# the same field IDs. Never mount both variants at once: duplicate IDs break
# labels, accessibility and existing strict browser locators.
path = Path("src/components/rfq-intake.tsx")
text = path.read_text(encoding="utf-8")
old = '''    <div hidden={intake !== "parameters"}><RfqForm mode={mode} initialGas={initialGas} initialRequest={initialRequest} /></div>
    <div hidden={intake !== "brief"}><BriefRfqForm mode={mode} initialGas={initialGas} initialRequest={initialRequest} /></div>
    <div hidden={intake !== "integration"}><BriefRfqForm mode={mode} initialGas={initialGas} initialRequest={initialRequest} variant="integration" /></div>'''
new = '''    <div hidden={intake !== "parameters"}><RfqForm mode={mode} initialGas={initialGas} initialRequest={initialRequest} /></div>
    {intake === "brief" && <BriefRfqForm mode={mode} initialGas={initialGas} initialRequest={initialRequest} />}
    {intake === "integration" && <BriefRfqForm mode={mode} initialGas={initialGas} initialRequest={initialRequest} variant="integration" />}'''
if text.count(old) != 1:
    raise RuntimeError(f"Expected one brief/integration mount block, found {text.count(old)}")
path.write_text(text.replace(old, new, 1), encoding="utf-8")

# Copy was intentionally improved after the first acceptance draft.
path = Path("tests/e2e/integrators.spec.ts")
text = path.read_text(encoding="utf-8")
old = 'Проектные и повторяемые поставки вместо розничного каталога'
new = 'Проектные и повторяемые поставки для оборудования и машин'
if text.count(old) != 1:
    raise RuntimeError(f"Expected one old integrator heading assertion, found {text.count(old)}")
path.write_text(text.replace(old, new, 1), encoding="utf-8")
