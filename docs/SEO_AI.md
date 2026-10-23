# SEO + AI retrieval implementation notes

Исторический документ / отчёт предыдущего прохода. Текущая публичная таксономия оборудования, граница private source data и правила публикации определяются [CATALOG_IMPLEMENTATION](CATALOG_IMPLEMENTATION.md), [EQUIPMENT_MIGRATION](EQUIPMENT_MIGRATION.md) и [IMPLEMENTED_CONTENT_MODEL](IMPLEMENTED_CONTENT_MODEL.md). Прежние public family pages, ProductGroup и проверки числа страниц не являются текущими требованиями.

## What matters
1. Crawl/index eligibility.
2. Canonical intent pages.
3. Original engineering information.
4. Important facts as visible text/HTML.
5. Strong internal entity links.
6. Fast response and low JS dependence.
7. Structured data that matches the visible page.
8. Search-specific AI crawler access where desired.

## What not to overclaim
- There is no special Google “GEO schema”.
- `llms.txt` is not a Google ranking signal.
- Massive AI-generated pages can become scaled-content spam.
- Schema does not compensate for weak or generic content.

## Page template checklist
- unique title/H1
- one intent
- short answer/introduction above the fold
- technical table
- constraints / “when it does not solve the task”
- architecture diagram
- source/verification note where appropriate
- related gas/application/product links
- RFQ CTA carrying page context
- canonical
- JSON-LD

## Search clusters
### Transactional
- безмасляный компрессор азота
- бустер азота после генератора
- компрессор азота высокого давления
- компрессор гелия / возврат гелия
- безмасляный компрессор водорода
- компрессор CO2 / возврат CO2
- компрессор технологических газов
- oil-free gas booster

### Problem-led
- не хватает давления после генератора азота
- просадка давления азота лазерная резка
- как вернуть гелий в контур
- как дожать технологический газ
- компрессор для чистого газа без масла

### Spec-led
Create pages only when actual verified products cover the intersection. Do not create arbitrary `gas × pressure × flow` page permutations.
