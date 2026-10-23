# Content model — public equipment and private engineering

This is the current conceptual contract. The original family-first catalogue design has been superseded by [IMPLEMENTED_CONTENT_MODEL](IMPLEMENTED_CONTENT_MODEL.md), [EQUIPMENT_MIGRATION](EQUIPMENT_MIGRATION.md) and [CATALOG_IMPLEMENTATION](CATALOG_IMPLEMENTATION.md).

## Public equipment direction

An equipment entry describes what the customer buys and what it is for. It is not a source-series page or an invented house SKU.

`id, slug, title, summary, editorialState, kind, gas, rfqGas, applications[], inputs[], approach[], configurations[], options[], verifiedCapabilities[], solutionIds[], articleIds[], diagram`

The six directions cover nitrogen compressors, nitrogen boosters, helium, CO₂, SF₆ and other process gases. Distinct intent, useful content and a meaningful RFQ path justify a page; keyword permutations do not.

## Public solution

`id, slug, title, summary, editorialState, intent, gasIds[], inputs[], approach[], constraints[], supply[], equipmentIds[], articleIds[], diagram`

A solution explains the complete process task. The nitrogen supply system for laser cutting remains a Solution, linked to equipment without becoming a duplicate equipment entry.

## Private engineering registry

Source model, source series, raw datasheet fields and capability envelopes belong in `src/content/internal/`. One public direction may have several candidate source models; a source model may participate in several directions. Candidate relationships and raw gas lists do not approve compatibility.

Source models retain their data, source notes and verification status internally. A gas/configuration-specific engineering confirmation is separate from a family envelope. Source identities and envelopes are not exported in the public ContentSnapshot or imported by public templates.

Only applicable evidence and human approval can support definitive public capabilities. A verification label or document title alone is insufficient. Source names, source URLs and unverified numerical ranges must not become public Product entities.

## Other public entities

- Gas: symbol, tasks, source conditions, features, limitations, scheme, FAQ, related solution/equipment IDs.
- Document: one real compressor questionnaire with an interactive form and a real text file. Remove public records for unavailable datasheets, manuals, drawings, CAD/STEP and certificates. Potential documentation is requested in an equipment-page block, not through placeholder pages. Internal catalogue material stays internal.
- Case: real project with approval or an explicitly labelled typical engineering scenario; no invented customer/results.
- KnowledgeArticle: informational intent, substantive body, related entities and editorial review; not copied equipment-page text.

## Navigation and Knowledge publication

Public navigation is «Оборудование», «Решения», «Технологические газы», «База знаний», «О компании», «Контакты», with the separate «Подобрать компрессор» CTA. Documents and News do not get navigation items while their real public collections are insufficient.

The first Knowledge cluster has six substantive intents:

1. Какие данные нужны для подбора компрессора.
2. Почему компрессор для технологического газа подбирают под конкретную задачу.
3. Из чего состоит комплектная компрессорная система.
4. От чего зависит срок службы компрессора SF₆.
5. Как подобрать бустер азота по давлению и расходу.
6. Компрессоры для газовых смесей и сложных технологических газов.

New research follows fact extraction, claim/evidence review, intent/overlap assessment, CREATE / UPDATE / MERGE / REJECT, original writing, engineering review and relevant internal links. Future topics remain an internal backlog until complete. A public article is not a literal translation or a placeholder.

## News

`News` is a separate typed entity extending the shared editorial identity:

`id, slug, title, summary, editorialState, kind: lanfor-event, organization: Lanfor Gas Systems, eventType, eventDate, published, updated, verification, sections[{title, paragraphs[]}], gasIds[], equipmentIds[], solutionIds[]`

Event types cover real equipment releases, deliveries, projects, testing, certificates, exhibitions, product updates, new directions and significant company events. External reporting is research context, not a Lanfor event.

The collection is initially empty. `publicNews()` requires confirmed verification, editorial approval, the approver's identity, an HTTPS source locator with a specific section/reference, valid dates and substantive nonempty content. Unapproved records do not generate routes or About cards. `/news/[slug]/` has no fabricated fallback and returns 404 when no publishable record exists. The About News section is absent until there is a confirmed public record; no empty News hub or menu item is created.

`ContentSnapshot` includes `news` as a typed empty collection. News templates use only the publication-filtered collection, visible event text and NewsArticle structured data; internal confirmation details are not page copy.

## RFQ

`id, receivedAt, gas, details, inlet, outlet, flow, duty, dutyDetails, contact, consent, attribution, requestContext, delivery state`

The intake uses gas, inlet pressure, required outlet pressure, flow and duty. Units and reference conditions remain explicit. It returns a preliminary human-readable equipment option requiring engineering confirmation; it does not expose a source model or promise automatic exact selection.

Metadata, canonical links, structured data, sitemap, related content and generated output follow public entities only. Registry-derived safety checks stop publication when a private source designation leaks.
