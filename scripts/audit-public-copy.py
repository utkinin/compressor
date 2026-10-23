"""Audit rendered preview copy separately from legacy URL and internal identifiers."""

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path


class PublicCopy(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.visible = []
        self.metadata = []
        self.script = False
        self.style = False
        self.heading = False
        self.headings = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == "script":
            self.script = True
        if tag == "style":
            self.style = True
        if tag in {"h1", "h2", "h3", "h4"}:
            self.heading = True
        if tag == "meta" and (
            values.get("name") in {"description", "twitter:title", "twitter:description"}
            or values.get("property") in {"og:title", "og:description"}
        ):
            self.metadata.append(values.get("content", ""))
        for name in ("alt", "aria-label", "title", "placeholder"):
            if values.get(name):
                self.metadata.append(values[name])

    def handle_endtag(self, tag):
        if tag == "script":
            self.script = False
        if tag == "style":
            self.style = False
        if tag in {"h1", "h2", "h3", "h4"}:
            self.heading = False

    def handle_data(self, data):
        if not self.script and not self.style:
            self.visible.append(data)
            if self.heading:
                self.headings.append(data)


artifact = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".local/github-pages")
files = sorted(artifact.rglob("*.html"))
if not files:
    raise SystemExit("Run npm run preview:build first")

forbidden = re.compile(
    r"15\s*[→–-]\s*40|500\+|150\+|"
    r"\b(?:staging|repository|vendor|supplier|provenance|draft|engineering-verified|source-supported)\b|"
    r"source[ -]+(?:family|model)|family[ -]+envelope|manufacturer[ -]+family[ -]+catalogue|"
    r"public frontend|configuration entity|working point|компримирован[а-яё]*|"
    r"рабочая точка процесса|согласуем весь узел|кнопка не означает наличие файла|"
    r"готовый паспорт.*?не опубликован|исходный каталог изготовителя|файл не предоставлен в репозиторий",
    re.I,
)
technical_term = re.compile(r"рабоч[а-яё]*\s+точк[а-яё]*", re.I)
review_terms = re.compile(r"рабоч[а-яё]*\s+точк[а-яё]*|уз[её]л|узл[а-яё]*|skid|функциональн[а-яё]*\s+модул[а-яё]*", re.I)
violations = []
occurrences = []
for file in files:
    parser = PublicCopy()
    parser.feed(file.read_text())
    copy = re.sub(r"\s+", " ", " ".join(parser.visible))
    metadata = " ".join(parser.metadata)
    path = str(file.relative_to(artifact))
    logical_path = path if path.endswith("/index.html") else path.removesuffix(".html") + "/index.html"
    for match in re.finditer(r"рабоч[а-яё]*\s+точк[а-яё]*|уз[её]л|узл[а-яё]*|функциональн[а-яё]*\s+модул[а-яё]*", " ".join(parser.headings), re.I):
        violations.append({"path": path, "field": "heading", "term": match.group()})
    for field, value in (("copy", copy), ("metadata/accessibility", metadata)):
        for match in forbidden.finditer(value):
            violations.append({"path": path, "field": field, "term": match.group()})
        for match in technical_term.finditer(value):
            if logical_path != "knowledge/what-to-specify-for-gas-compressor/index.html" or field != "copy":
                violations.append({"path": path, "field": field, "term": match.group()})
        for match in review_terms.finditer(value):
            occurrences.append({"path": path, "field": field, "term": match.group(), "context": value[max(0, match.start() - 90):match.end() + 130]})
    # JSON-LD is public content too. The legacy identifiers and URLs are retained
    # for compatibility; brand/name/headline/description cannot contain suppliers.
    html = file.read_text()
    for raw in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html):
        def inspect(value, key=""):
            if isinstance(value, dict):
                for child_key, child in value.items():
                    inspect(child, child_key)
            elif isinstance(value, list):
                for child in value:
                    inspect(child, key)
            elif isinstance(value, str) and key not in {"url", "@id", "item", "mainEntityOfPage", "productGroupID"}:
                for match in forbidden.finditer(value):
                    violations.append({"path": path, "field": f"JSON-LD {key}", "term": match.group()})
        inspect(json.loads(raw))

report = {"html_pages": len(files), "violations": violations, "technical_occurrences": occurrences}
destination = Path(".local/editorial-server-audit.json" if artifact.as_posix().endswith(".next/server/app") else ".local/editorial-audit.json")
destination.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"html_pages": len(files), "violations": len(violations), "technical_occurrences": len(occurrences), "report": str(destination)}, ensure_ascii=False))
if violations:
    print(json.dumps(violations, ensure_ascii=False, indent=2))
    raise SystemExit(1)
