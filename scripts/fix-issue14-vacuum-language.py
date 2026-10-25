from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / "src/content/equipment.ts"
text = path.read_text(encoding="utf-8")
replacements = {
    "Рабочая точка, режим и комплектация подтверждаются по задаче оборудования.": "Требуемый вакуум, режим и комплектация подтверждаются по задаче оборудования.",
    "Требуемое остаточное давление или диапазон вакуума в рабочей точке.": "Требуемое остаточное давление или диапазон вакуума в оборудовании.",
}
for old, new in replacements.items():
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"Expected one occurrence, got {count}: {old}")
    text = text.replace(old, new, 1)
path.write_text(text, encoding="utf-8")
print("Vacuum customer-facing language refined")
