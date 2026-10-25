from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(path: str, old: str, new: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{path}: expected 1 occurrence, got {count}: {old[:120]!r}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")


replace_once(
    "src/lib/rfq/schema.ts",
    '  "buffer-receiver-charging": { title: "Заполнение буфера и ресивера" },\n};',
    '  "buffer-receiver-charging": { title: "Заполнение буфера и ресивера" },\n  "pet-high-pressure-air": { title: "Безмасляный воздух высокого давления для выдува ПЭТ" },\n  "refrigerant-transfer-compression": { title: "Перекачка и фасовка хладагентов" },\n};',
)

replace_once(
    "tests/content.test.ts",
    '    expect(solutions).toHaveLength(14);',
    '    expect(solutions).toHaveLength(16);',
)

replace_once(
    "tests/rfq.test.ts",
    '  it("accepts the fourteen public solutions and only public or requestable documents", () => {\n    expect(Object.keys(RFQ_SOLUTION_CONTEXTS)).toHaveLength(14);',
    '  it("accepts the sixteen public solutions and only public or requestable documents", () => {\n    expect(Object.keys(RFQ_SOLUTION_CONTEXTS)).toHaveLength(16);',
)

print("Issue #14 PET/refrigerant RFQ context aligned")
