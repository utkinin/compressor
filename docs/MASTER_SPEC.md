# Lanfor Gas Systems — Master Specification v1.0

## 1. Purpose
Build a separate B2B website for process-gas compression and clean-process engineering. The site is not a copy of sf6rus.ru and not a generic compressor catalogue. It converts an engineering problem into a structured RFQ and makes verified technical information easy for engineers, procurement teams, specifiers, search engines and AI search systems to retrieve.

## 2. Strategic “5 ones” borrowed from AFARA
The principle is retained; AFARA-specific design details are not.

1. **One product category:** oil-free process-gas compression / boosting modules.
2. **One primary audience:** engineering buyer group at industrial companies and integrators (engineer + specifier + procurement are roles inside one buying group, not three separate sites).
3. **One offer:** give us the working point; we select the compressor/module and integration boundary.
4. **One primary acquisition channel:** high-intent organic search + AI search around gas / task / working point.
5. **One year of concentration:** deepen this vertical before adding unrelated equipment families.

The homepage umbrella may say “engineering solutions for process gases and clean processes”, but v1 navigation must keep compression/boosting dominant. Dry vacuum and broad air-compressor categories are secondary until they have their own validated demand and content.

## 3. Positioning
**Not:** “we sell many compressor models.”

**Position:** “We engineer the compression/boosting functional module around the process working point.”

Primary message:
> Сжимаем технологический газ под рабочую точку процесса.

Supporting message:
> Безмасляные компрессоры, бустеры и skid-модули для N₂, He, H₂, CO₂ и специальных газов — от отдельной машины до интегрированного функционального узла.

## 4. Core information model
Do not build “tag cloud first”. Build an entity graph:

`Gas ↔ Application/Task ↔ WorkingPoint ↔ ProductFamily ↔ Configuration ↔ Industry ↔ Document ↔ Case ↔ KnowledgeArticle`

Every public page must have a place in this graph.

### WorkingPoint (core conversion object)
Mandatory first-pass inputs:
- gas / gas mixture
- P1 + reference (`bar(a)` / `bar(g)`)
- P2 + reference
- Q + unit and reference condition
- duty (`continuous`, `intermittent`, `cyclic`)

Second-pass engineering inputs:
- inlet temperature
- gas composition / purity
- oil contamination requirement
- moisture / dew point requirement where applicable
- ambient / cooling water
- Ex area / electrical classification
- leakage requirement
- buffer/receiver
- control / PLC interface
- supply boundary (machine / package / skid)
- installation constraints

## 5. User journeys
### Engineer
Task → gas/application page → technical HTML → family page → RFQ → docs.

### Specifier/project designer
Task → working envelope → open dimensional data/CAD → specification → project RFQ.

### Procurement
Specific product/requirement → verified specs → documents/commercial boundary → request TQ/TKP.

Do not force a “choose your role” splash screen. The same canonical page contains layers for all roles.

## 6. Site map v1
- `/` — value proposition + 5-parameter selector
- `/solutions` — intent/task hub
- `/solutions/[slug]`
- `/gases/[slug]`
- `/equipment` — family catalogue
- `/equipment/[slug]` — RFQ-ready technical page
- `/engineering` — selection method + docs
- `/documents` — CAD/datasheets/certificates with access policy
- `/knowledge` + `/knowledge/[slug]`
- `/rfq` — full engineering intake
- `/about`
- later: `/cases`, `/compare`, `/analogs`, `/industries/[slug]`

## 7. Content priorities
Launch with fewer deep pages rather than mass-generated thin pages.

Priority landing pages:
1. nitrogen booster after generator
2. high-pressure nitrogen for laser cutting / industrial consumers
3. helium recovery and recompression
4. oil-free process-gas compressor module / OEM skid
5. hydrogen compressor — only with verified engineering/safety data
6. CO2 recompression / recovery — only with verified phase/temperature constraints
7. oxygen — only with explicit verification and controlled language

## 8. Product data rules
- Family ranges are not quoted as guaranteed operating points.
- A model/family page must show source and verification status internally.
- Public definitive claims require `verified` status.
- No fake price `0`; omit `Offer` when price is RFQ-only.
- No fabricated “Class 0” claims. Publish exact certification/test scope only when a source is attached.
- Pressure values require reference where relevant (absolute vs gauge).
- Flow requires unit and reference condition.
- Gas compatibility is configuration-dependent; do not infer universal compatibility from a family name.

## 9. SEO / AI search
### Principles
- Crawlable server-rendered text is primary.
- Important specifications must be HTML, not image/PDF-only.
- Canonical internal linking is generated from the entity graph.
- Structured data mirrors visible content only.
- `Product.additionalProperty` is used for valid technical properties, but schema is not treated as a magic AI ranking factor.
- Do not generate every keyword permutation. Create a page only where intent/content is genuinely distinct.
- `llms.txt` is optional convenience; do not treat it as a Google ranking mechanism.

### Robots policy v1
Allow search crawlers and search-specific AI crawlers. Block training-only bots by default while allowing OpenAI/Anthropic search bots. Revisit when policy changes.

## 10. Semantic taxonomy (not social hashtags)
Tag dimensions:
- gas: N2, H2, He, CO2, O2, SF6, mixture
- task: boosting, compression, recovery, filling, transfer, stabilization
- process: laser-cutting, inerting, leak-testing, cryogenic, PET, test-stand
- pressure band: ≤20, 21–40, 41–100, 101–200, >200 bar
- flow band: ≤10, 11–30, 31–100, 101–500, >500 Nm3/h
- architecture: standalone, package, skid, OEM-module
- cleanliness: oil-free, low-leakage, special-cleanliness
- industry: machine-building, food/beverage, laboratory, energy, chemical, OEM/integrator

Tags drive filters, related links and CMS queries. Do not expose `#hashtags` in body copy.

## 11. RFQ logic
The configurator is an intake/qualification tool, not an automatic engineering calculator.

### Output
- human-readable RFQ text
- structured JSON payload
- source page / UTM / referring intent
- anonymous analytics events

### Branch questions
- H2: Ex area, composition, leakage requirement, materials review
- O2: oxygen-service cleanliness/material review
- He: leakage, recovery purity, return cycle
- CO2: temperature/phase/process state
- N2: source capacity, peak demand, receiver, purity/dew-point need
- gas mixture: full composition required

## 12. Document access
- `public`: brochure, public datasheet, dimensional drawing, certificates intended for publication
- `contact`: files after email/contact when there is a commercial reason
- `rfq`: project-specific P&ID, custom GA, selection sheet
- `client`: order/project files

Do not gate all CAD. Specifiers leave when basic selection data is unavailable.

## 13. AI-assisted content workflow
AI is a drafting layer over structured verified data.

`structured facts → template context → draft → validation → human approval → publish`

AI may generate:
- descriptions
- FAQs grounded in facts
- metadata
- related-page links
- first draft of knowledge articles from approved source notes

AI may NOT invent:
- numeric values
- certificates
- compatibility
- delivery time
- price
- guarantees
- material compatibility
- safety classifications

No unattended auto-publish in v1.

## 14. Analytics
Core events:
- `solution_view`
- `gas_view`
- `equipment_view`
- `rfq_start`
- `rfq_field_complete`
- `rfq_generated`
- `rfq_submit`
- `document_open`
- `cad_download`
- `contact_click`
- `search_use`

Business dashboard:
- qualified RFQs / month
- RFQ completion rate
- landing page → RFQ start rate
- engineering document use
- source/query group → SQL / quote
- quote value and gross margin by acquisition page after CRM join

Do not optimize for raw traffic.

## 15. Visual direction
Transfer AFARA’s principles, not its fashion aesthetic:
- strong specialization visible in one screen
- one visual hierarchy and one primary CTA
- editorial whitespace
- high-quality real product/process imagery
- restrained motion
- visual proof through diagrams, parameters and installations

Industrial adaptation:
- off-white / steel / deep graphite base
- restrained teal/green process accent
- technical line diagrams + real equipment photography
- no stock “factory worker in helmet” hero
- no black cyberpunk neon
- no huge carousel
- no decorative 3D unrelated to the actual machine

## 16. Image system
Required asset classes:
1. hero: clean isolated compressor/skid, 3/4 view, no visible third-party logos
2. product family: consistent angle/background for comparison
3. process diagram: source → compressor → buffer → consumer
4. application photo: real laser line / gas room / test stand where rights exist
5. detail macro: cylinder/seal/cooler/piping/control panel
6. case proof: installed unit + schematic + 3–5 quantified facts

Every image has descriptive alt text and links to the entity it illustrates. Technical data must not exist only inside an image.

## 17. Build stages
### v1 — Lead engine
- design system
- homepage
- 3 solution pages
- 5 gas pages
- 5 verified/draft product-family templates
- RFQ selector
- docs shell
- knowledge shell
- sitemap/robots/JSON-LD
- analytics events

### v1.1 — Trust
- verified product records
- real datasheets/CAD
- 3–5 cases
- document workflow
- CRM webhook

### v1.2 — Scale
- CMS/Directus + PostgreSQL
- editorial queue
- AI drafting from verified facts
- faceted search when catalogue volume justifies it
- analog/import-substitution matrix only after source verification

## 18. What NOT to build first
- complex blockchain-like hash audit trail
- NLI service for every sentence
- dozens of auto-generated city/keyword pages
- full CPQ pricing engine
- public competitor-comparison matrix without official source packs
- separate “engineer/procurement” duplicate sites
- 100 gated downloads

The first business test is whether the site produces better RFQs from real search intent.
