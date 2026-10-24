# Codex project instructions

This repository is a B2B industrial website for **Lanfor Gas Systems**.

## Product principle
Start with the customer's production problem: pressure after a nitrogen generator,
laser gas supply, gas recovery, a known process gas, or integration into equipment.
Then explain the **compressor or booster** selected from
`gas + inlet pressure + required outlet pressure + flow + duty`.
Then explain necessary options and complete systems as supply variants. Use plain
B2B language in heroes, headings, cards and CTAs. Keep "рабочая точка" inside detailed
technical explanations. Remove private supplier names and internal manufacturer acronyms from the complete repository: code, comments, identifiers, tests, documentation and archives. Use neutral equipment and integration names. Original user uploads outside the project are not source files.

## Public catalogue and private engineering data
- Public equipment names describe **what it is and what it is for**. A direction such as a nitrogen booster is a catalogue entry; a source series or invented house SKU is not.
- Keep three distinct layers: public equipment, process solutions/applications, and the private source/capability registry. A source model must never become a public page automatically.
- The commercial catalogue contains five own equipment directions: nitrogen compressors, nitrogen boosters, helium compressors, CO₂ compressors and other process-gas compressors. Keep the existing SF₆ URL as a useful reference to the specialized SF6RUS direction, not as an own commercial line. Do not create active H₂/O₂ product lines from the source gas list.
- Source designations may remain only in `src/content/internal/` and explicitly internal migration/evidence documentation. They are not public names, URLs, metadata, breadcrumbs, related cards, alt text or structured data. Do not import the private registry into public templates or client components.
- Public capability → private source model is a many-to-many engineering relation. Draft candidate links are not approved gas compatibility or an automatic selection result.
- Keep «Система подачи азота для лазерной резки» in Solutions. Equipment offers a compressor or booster; Solutions explains the complete process task.
- Run the registry-derived public-output safety gate before publishing. A source-model leak must fail the build; an allowlist of UI fields is not sufficient by itself.

## Non-negotiables
- Never invent technical values, certificates, delivery terms, pressure ranges or compatible gases.
- A verification label alone is not evidence. Definitive technical statements require a real source record, a retrievable document, a page/section and approval for that gas and execution.
- Draft source values stay in internal engineering content. A public selection explanation may describe required inputs, but must not display a draft envelope or source model as a product specification.
- Do not auto-publish AI-generated technical copy. AI may draft from structured verified data; a human approves publication.
- Preserve one canonical URL per intent. Do not generate thousands of thin keyword permutations.
- No decorative hashtag spam. Tags are a semantic taxonomy used for navigation and internal linking.
- The RFQ flow must remain the primary conversion path.
- General CAD/dimensional files may be public; project-specific P&ID and custom drawings are gated.
- Keep the interface calm, technical, high-contrast and fast. Avoid glossy “tech startup” clichés.

## Architecture
- Next.js App Router, TypeScript, server-rendered content by default.
- Data layer is currently local TypeScript seed data; keep adapters isolated so Directus/Postgres can replace it.
- JSON-LD must reflect visible page content exactly.
- Use semantic HTML and meaningful internal links.
- Use native CSS first; add dependencies only when they remove substantial complexity.

## Current v2.1 precedence
- The user approved the final v2.1 commercial structure. Its current implementation and preserved URLs are documented in docs/V21_IMPLEMENTATION.md and docs/V21_CONTENT_RELOCATION.md. Earlier catalogue/editorial reports remain history when they conflict with v2.1.
- Homepage order is fixed: problem-first hero, five commercial scenarios, five initial parameters, three supply formats, gases, four selection steps, calculation-to-technical-proposal, four to six articles, and RFQ.
- The five commercial scenarios use the existing nitrogen-after-generator, laser-supply, gas-recovery, process-gas and equipment-integration solution URLs. Do not create replacement keyword URLs or unnecessary redirects.
- Keep all useful existing Equipment, Solutions, Knowledge, Industries and calculation-example URLs reachable. Removing a homepage block is a relocation, not permission to delete its content or leave orphan pages.
- Do not show a PET product/category or a numerical nitrogen example before applicable product-data verification. Family ranges are not product specifications and must not be turned into guaranteed operating values.
- The homepage promotes nitrogen, helium, CO₂ and other process gases. SF₆ appears as a separate reference link to https://www.sf6rus.ru/products/0000004/ . Preserve unique local reference/article canonicals; do not set a cross-domain canonical between different content.
- Preserve hydrogen and oxygen URLs, label them «Проектное рассмотрение», and place their gas cards below primary directions. Their presence does not approve an execution or serial product.
- RFQ accepts either known technical parameters or an initial task description/file. Missing pressure or flow must not block the brief path. Both paths require explicit unchecked consent before real submission; retain origin, validation, rate-limit, idempotency, private-storage and delivery safeguards.
- The complete earlier ban on private supplier names and internal manufacturer acronyms remains in force throughout own source, comments, metadata, tests, documentation and archives. A narrower exception in the attached discussion does not override the user's direct ban.
- Implement technical/RFQ safeguards and the commercial homepage/content restructuring as separate reviewable stages. Do not claim a PR exists, a live request was delivered, or a check passed before verifying it.

## Visual system v2 precedence
- The approved visual migration is documented in docs/VISUAL_SYSTEM_V2.md. Earlier image plans are deprecated and do not mandate SVG-only heroes.
- Start with visible equipment or its application, then explain the process, then show detailed engineering. HeroVisual, ProcessVisual and topic-specific deep figures have separate roles.
- Content entities reference the public visual registry by ID. Keep image dimensions, meaningful alt text, approval, mobile/card sources and concept captions with the asset record.
- Original equipment renders are illustrative layouts, not photographs of approved models, proof of compatibility or delivered projects. Never invent labels, model numbers or performance values inside imagery.
- Product/application images sit on light neutral backgrounds. Keep dark branding for the footer, CTA bands and small accents. Do not restore the removed universal dark diagram component.
- The nine primary homepage content blocks remain; a separate light process band follows the product hero. Preserve scenario links, knowledge filters, existing URLs and honest RFQ behavior during visual changes.
- Hero images load eagerly with high fetch priority and stable dimensions; below-fold images load lazily. Keep image labels editable in HTML/SVG and turn long process flows into vertical mobile steps.
- Run asset integrity and responsive delivery checks as well as build/typecheck/lint/unit/browser checks. Compare measured image payload, LCP and CLS with the saved baseline before claiming performance results.

## Editorial architecture
- Main navigation is Equipment, Solutions, Technological gases, Knowledge, About and Contacts, with a separate compressor-selection CTA. Use «База знаний» as the public Knowledge label.
- No content means no public page. Do not create document, certificate, drawing, model, case, article or news placeholders. The compressor questionnaire is a real interactive tool, not an empty document page.
- Documents currently contains one useful questionnaire. Keep potential documentation as a compact equipment-page request; a dedicated document page requires an actual document. Do not show a Documents navigation item until a real library exists.
- The first Knowledge cluster contains six substantive articles: compressor-selection inputs, task-specific selection, complete-system components, SF₆ compressor service life, nitrogen-booster selection, and gas mixtures. Keep further topics as an internal backlog and check overlap before CREATE / UPDATE / MERGE / REJECT.
- Source research informs original Lanfor articles. Preserve fact/claim extraction, evidence and search-intent decisions internally; do not publish literal translations or unverified claims.
- News is a distinct typed collection for confirmed Lanfor events. Require editorial approval and a source record with an HTTPS locator before publication. External company reporting belongs in article research, not Lanfor news.
- There are no News records initially. Render neither a News navigation item nor an empty News section/page. A nonempty approved collection may appear inside About; every News route uses the same publication gate.
- Public text explains the customer's task and equipment. Keep development status, repository mechanics and internal verification labels out of page copy, metadata and structured data.

## Analytics events
Do not send personal data to analytics. Track only event names, page/intent and anonymous technical selections.

## Definition of done for an equipment direction
1. The public record describes equipment and purpose, with a distinct customer intent rather than a source-model number.
2. The page explains applications, five initial parameters, selection, possible execution and optional equipment without claiming universal availability.
3. Numerical capabilities appear only with applicable evidence and engineering approval. Do not fill a public specification table with draft source envelopes.
4. Use appropriate CollectionPage/ItemList and breadcrumbs. Do not emit Product/ProductGroup for a direction or an unapproved model.
5. Links lead to genuinely relevant Solutions, Knowledge, gas context and RFQ. Preserve one canonical URL per intent.
6. RFQ carries public equipment/solution context and returns only a preliminary human-readable option with engineering confirmation required.
7. Metadata, canonical, sitemap and generated output contain no private source designation. Former source-family routes return 404.


## Current implementation and cloud workflow


Work in this existing checkout and current branch. Cloud tasks are already isolated; do not create worktrees unless explicitly requested.

The Git checkout initially contained no code. The user subsequently supplied the original scaffold archive and documents, reviewed and retained only as sanitized project documentation. The latest commercial decisions are in docs/V21_IMPLEMENTATION.md and docs/V21_CONTENT_RELOCATION.md; docs/EQUIPMENT_MIGRATION.md and docs/CATALOG_IMPLEMENTATION.md describe the earlier migration baseline. Read docs/SOURCE_RECONCILIATION.md and docs/IMPLEMENTATION_BRIEF.md for historical context; the latest user request overrides their former public-family catalogue approach.

Preserve engineering honesty: no unverified performance figures, customers, certificates, stock availability or warranties. Do not publish unapproved concept names as products. The homepage and global metadata prioritize N₂, He, CO₂ and other process gases. SF₆ is referenced through the specialized SF6RUS direction; the preserved local reference URL does not approve an own source model, performance range or gas compatibility. AI-authored content stays in editorial review until approved by a human.

Use strict TypeScript, server components by default, typed content repository and explicit units. Never suppress errors with any, @ts-ignore or broad lint disables. Never log RFQ contact data or commit .env/.local.

Required checks: npm run typecheck, npm run lint, npm test, npm run build, npm run test:e2e. Staging RFQ uses an explicitly disclosed local mock; live collection requires approved legal operator details and configured delivery.
