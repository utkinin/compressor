from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def replace_once(path: str, old: str, new: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{path}: expected 1 occurrence, got {count}: {old[:100]!r}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")

# Homepage: add a compact integrator section after the engineering process and before deliverables.
home_anchor = '''    <section className="section v21-deliverables" aria-labelledby="deliverables-title" data-home-section="deliverables"><div className="container">'''
home_block = '''    <section className="section v21-integrators" aria-labelledby="integrators-home-title" data-home-section="integrators"><div className="container integrators-home-layout">
      <div><p className="eyebrow">05 / Для интеграторов и производителей оборудования</p><h2 id="integrators-home-title">Компрессорный модуль как часть вашей машины или системы</h2><p>Подбираем узел не только по давлению и расходу: согласуем питание, охлаждение, габариты, управление и подключения. Фокус — проектные и повторяемые поставки от опытного образца до серии.</p><div className="v21-section-links"><Link href="/integrators/">Интеграторам <span aria-hidden="true">→</span></Link><Link href="/rfq/?intake=brief&solution=equipment-integration&source=%2F">Передать ТЗ на интеграцию <span aria-hidden="true">→</span></Link></div></div>
      <ProcessVisual id="process-integration" />
    </div></section>

    <section className="section v21-deliverables" aria-labelledby="deliverables-title" data-home-section="deliverables"><div className="container">'''
replace_once("src/app/page.tsx", home_anchor, home_block)

# Number the following home sections consistently after adding the integrator stage.
for old, new in [
    ('<p className="eyebrow">05 / Результаты этапов</p>', '<p className="eyebrow">06 / Результаты этапов</p>'),
    ('<p className="eyebrow">06 / Экспертный центр</p>', '<p className="eyebrow">07 / Экспертный центр</p>'),
    ('<p className="eyebrow">07 / Ваша задача</p>', '<p className="eyebrow">08 / Ваша задача</p>'),
]:
    replace_once("src/app/page.tsx", old, new)

# Styling uses existing visual language; process diagram stacks naturally on narrow screens.
css = ROOT / "src/app/home-page.css"
css_text = css.read_text(encoding="utf-8")
addition = '''\n.v21-integrators{background:#f5f7f3}.integrators-home-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,.9fr);gap:2rem;align-items:center}.integrators-home-layout>div{min-width:0}.integrators-home-layout h2{max-width:760px}.integrators-home-layout>div>p:not(.eyebrow){max-width:760px}@media(max-width:900px){.integrators-home-layout{grid-template-columns:1fr}}\n'''
if ".v21-integrators{" not in css_text:
    css.write_text(css_text.rstrip() + addition, encoding="utf-8")

# Home acceptance: 10 sections and shifted indices.
replace_once("tests/support/home-v21.ts", "await expect(sections).toHaveCount(9);", "await expect(sections).toHaveCount(10);")
replace_once(
    "tests/support/home-v21.ts",
    '    "hero", "scenarios", "parameters", "supply", "gases", "engineering", "deliverables", "knowledge", "rfq",',
    '    "hero", "scenarios", "parameters", "supply", "gases", "engineering", "integrators", "deliverables", "knowledge", "rfq",',
)
replace_once("tests/support/home-v21.ts", '  await expect(sections.nth(6)).toContainText("От расчёта до технического предложения");', '  await expect(sections.nth(6)).toContainText("Компрессорный модуль как часть вашей машины или системы");\n  await expect(sections.nth(6).getByRole("link", { name: /Интеграторам/ })).toHaveAttribute("href", new RegExp(`${mount}/integrators/?$`));\n  await expect(sections.nth(7)).toContainText("От расчёта до технического предложения");')
replace_once("tests/support/home-v21.ts", '  expect(await sections.nth(7).locator("h3").count()).toBeGreaterThanOrEqual(4);', '  expect(await sections.nth(8).locator("h3").count()).toBeGreaterThanOrEqual(4);')
replace_once("tests/support/home-v21.ts", '  expect(await sections.nth(7).locator("h3").count()).toBeLessThanOrEqual(6);', '  expect(await sections.nth(8).locator("h3").count()).toBeLessThanOrEqual(6);')
replace_once("tests/support/home-v21.ts", '  await expect(sections.nth(7)).not.toContainText("SF₆");', '  await expect(sections.nth(8)).not.toContainText("SF₆");')
replace_once("tests/support/home-v21.ts", '  await expect(sections.nth(8).getByRole("link", { name: /ТЗ|описание|параметры/ }).first()).toHaveAttribute("href", /intake=brief/);', '  await expect(sections.nth(9).getByRole("link", { name: /ТЗ|описание|параметры/ }).first()).toHaveAttribute("href", /intake=brief/);')

# Existing header test moves from six to seven customer navigation sections.
site = ROOT / "tests/e2e/site.spec.ts"
site_text = site.read_text(encoding="utf-8")
site_text = site_text.replace('test("header exposes six navigation sections, phone and RFQ separately"', 'test("header exposes seven navigation sections, phone and RFQ separately"')
site_text = site_text.replace('["Оборудование", "Решения", "Технологические газы", "База знаний", "О компании", "Контакты"]', '["Оборудование", "Решения", "Интеграторам", "Технологические газы", "База знаний", "О компании", "Контакты"]')
site.write_text(site_text, encoding="utf-8")

print("Issue #14 integrators foundation patch applied")
