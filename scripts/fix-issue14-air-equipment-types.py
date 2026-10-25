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
    "src/app/knowledge/[slug]/page.tsx",
    '  if (primaryEquipment) { rfqParams.set("equipment", primaryEquipment.id); rfqParams.set("gas", primaryEquipment.rfqGas); }',
    '  if (primaryEquipment) { rfqParams.set("equipment", primaryEquipment.id); if (primaryEquipment.rfqGas) rfqParams.set("gas", primaryEquipment.rfqGas); else rfqParams.set("intake", "integration"); }',
)
replace_once(
    "tests/content.test.ts",
    '      expect(identifiers.gases.has(item.rfqGas)).toBe(true);',
    '      if (item.rfqGas) expect(identifiers.gases.has(item.rfqGas)).toBe(true);',
)

print("Optional RFQ gas consumers aligned")
