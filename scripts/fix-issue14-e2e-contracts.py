from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(path: str, old: str, new: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{path}: expected 1 occurrence, got {count}: {old[:160]!r}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")


# The header RFQ is intentionally generic. Integration-category acceptance must target
# the page-level CTA carrying the integration context instead of the first matching link.
replace_once(
    "tests/e2e/integrator-equipment.spec.ts",
    '    const cta = page.getByRole("link", { name: /Подобрать|Обсудить/ }).first();\n    await expect(cta).toHaveAttribute("href", /intake=integration/);',
    '    const cta = page.locator(\'main a[href*="intake=integration"]\').first();\n    await expect(cta).toBeVisible();\n    await expect(cta).toHaveAttribute("href", /intake=integration/);',
)

# The equipment hub now intentionally covers both process-gas equipment and the three
# approved project-integration module categories. Keep the acceptance contract aligned
# with that public IA rather than the previous gas-only H1/card count.
replace_once(
    "tests/e2e/site.spec.ts",
    '  await expect(page.locator("main h1")).toHaveText("Безмасляные компрессоры и бустеры для технологических газов");\n  await expect(page.locator(".equipment-catalog-card")).toHaveCount(5);',
    '  await expect(page.locator("main h1")).toHaveText("Безмасляные компрессоры, бустеры и модули для оборудования");\n  await expect(page.locator(".equipment-catalog-card")).toHaveCount(8);',
)

print("Issue #14 browser acceptance contracts aligned")
