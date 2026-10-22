"""Verify the published Pages files over HTTPS without sending form data."""

from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, urldefrag
from urllib.request import Request, urlopen
import json
import re

SITE = "https://utkinin.github.io/compressor/"
EXPORT = Path(__file__).resolve().parent.parent / ".local/github-pages"


class Page(HTMLParser):
    def __init__(self, body):
        super().__init__()
        self.links = set()
        self.canonical = None
        self.heading = []
        self.in_heading = False
        self.copy = []
        self.hidden = False
        self.metadata = {}
        self.feed(body)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "h1":
            self.in_heading = True
        if tag in {"script", "style"}:
            self.hidden = True
        if tag == "meta":
            key = attrs.get("name") or attrs.get("property")
            if key in {"description", "og:title", "og:description"}:
                self.metadata[key] = attrs.get("content")
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs.get("href")
        for name in ("href", "src"):
            if attrs.get(name):
                self.links.add(attrs[name])

    def handle_endtag(self, tag):
        if tag == "h1":
            self.in_heading = False
        if tag in {"script", "style"}:
            self.hidden = False

    def handle_data(self, value):
        if self.in_heading:
            self.heading.append(value)
        if not self.hidden:
            self.copy.append(value)

    @property
    def h1(self):
        return re.sub(r"\s+", " ", " ".join(self.heading)).strip()

    @property
    def text(self):
        return re.sub(r"\s+", " ", " ".join(self.copy)).strip()


def read(url):
    with urlopen(Request(url, headers={"User-Agent": "Lanfor-Public-Acceptance/1.1"}), timeout=30) as response:
        if response.status != 200 or not response.geturl().startswith(SITE):
            raise RuntimeError(f"Unexpected response for {url}")
        return response.read(), response.headers.get_content_type()


if not (EXPORT / "index.html").exists():
    raise SystemExit("Run npm run preview:build before checking the public site")

expected = {}
for file in EXPORT.rglob("*.html"):
    relative = file.relative_to(EXPORT).as_posix()
    route = "" if relative == "index.html" else relative.removesuffix("index.html")
    expected[urljoin(SITE, route)] = Page(file.read_text())

resources = set()
results = []


def verify_page(item):
    url, local = item
    body, content_type = read(url)
    if content_type != "text/html":
        raise RuntimeError(f"Expected HTML: {url}")
    remote = Page(body.decode("utf-8"))
    if remote.h1 != local.h1 or remote.canonical != local.canonical:
        raise RuntimeError(f"Published heading/canonical differs from tested source: {url}")
    if remote.text != local.text or remote.metadata != local.metadata:
        raise RuntimeError(f"Published copy/metadata differs from tested source: {url}")
    links = set()
    for href in remote.links:
        absolute = urldefrag(urljoin(url, href))[0]
        parsed = urlsplit(absolute)
        if parsed.netloc == urlsplit(SITE).netloc and not parsed.query:
            if not absolute.startswith(SITE):
                raise RuntimeError(f"Link escaped the project base path: {absolute}")
            links.add(absolute)
    return url, len(body), links


with ThreadPoolExecutor(max_workers=6) as pool:
    for url, size, links in pool.map(verify_page, expected.items()):
        results.append({"url": url, "bytes": size, "status": 200})
        resources.update(links)
    for url, (body, _) in zip(sorted(resources - expected.keys()), pool.map(read, sorted(resources - expected.keys()))):
        results.append({"url": url, "bytes": len(body), "status": 200})

report = {"site": SITE, "html_pages": len(expected), "https_urls": len(results), "all_passed": True, "results": results}
report_file = EXPORT.parent / "public-verification.json"
report_file.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print(f"Published HTTPS verified: {len(expected)} HTML pages, {len(results)} total URLs; headings, canonicals and resources match.")
