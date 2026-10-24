from pathlib import Path

path = Path("src/components/rfq-brief-form.tsx")
text = path.read_text(encoding="utf-8")
old = '<option value="">Воздух / нужно уточнить</option>{GAS_OPTIONS.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}'
new = '<option value="">{integration ? "Воздух / нужно уточнить" : "Нужно уточнить"}</option>{GAS_OPTIONS.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}'
if text.count(old) != 1:
    raise RuntimeError(f"Expected one integration gas placeholder, found {text.count(old)}")
path.write_text(text.replace(old, new, 1), encoding="utf-8")
