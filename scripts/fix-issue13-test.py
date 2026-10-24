from pathlib import Path

path = Path("tests/issue-13.test.ts")
text = path.read_text(encoding="utf-8")
old = '    expect(JSON.stringify(GAS_FIELDS)).not.toMatch(/recovery/i);'
new = '''    const publicFieldText = Object.values(GAS_FIELDS)\n      .flat()\n      .flatMap((field) => [field.label, field.help ?? ""])\n      .join(" ");\n    expect(publicFieldText).not.toMatch(/\\brecovery\\b/i);'''
if text.count(old) != 1:
    raise RuntimeError(f"Expected exactly one public-copy assertion, found {text.count(old)}")
path.write_text(text.replace(old, new, 1), encoding="utf-8")
