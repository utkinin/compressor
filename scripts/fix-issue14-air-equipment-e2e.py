from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(path: str, old: str, new: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{path}: expected 1 occurrence, got {count}: {old[:140]!r}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")


# Scope the project CTA assertion to main content so the global header RFQ cannot satisfy the locator.
replace_once(
    "tests/e2e/integrator-equipment.spec.ts",
    '    const cta = page.getByRole("link", { name: /Подобрать|Обсудить/ }).first();',
    '    const cta = page.locator("main").getByRole("link", { name: /Подобрать|Обсудить|Передать ТЗ проекта/ }).first();',
)

# The catalog now deliberately contains five process-gas cards plus three integration-module cards.
replace_once(
    "tests/e2e/site.spec.ts",
    '  await expect(page.locator("main h1")).toHaveText("Безмасляные компрессоры и бустеры для технологических газов");\n  await expect(page.locator(".equipment-catalog-card")).toHaveCount(5);',
    '  await expect(page.locator("main h1")).toHaveText("Безмасляные компрессоры, бустеры и модули для оборудования");\n  await expect(page.locator(".equipment-catalog-card")).toHaveCount(8);',
)

print("Issue #14 integrator equipment E2E acceptance aligned")
