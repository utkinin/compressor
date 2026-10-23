# Codex project instructions

This repository is a B2B industrial website for **Lanfor Gas Systems**.

## Product principle
Start with the customer's task and a **compressor or booster** selected from
`gas + inlet pressure + required outlet pressure + flow + duty`.
Then explain necessary options and complete systems as supply variants. Use plain
B2B language in heroes, headings, cards and CTAs. Keep "рабочая точка" inside detailed
technical explanations. Remove private supplier names and internal manufacturer acronyms from the complete repository: code, comments, identifiers, tests, documentation and archives. Use neutral equipment and integration names. Original user uploads outside the project are not source files.

## Public catalogue and private engineering data
- Public equipment names describe **what it is and what it is for**. A direction such as a nitrogen booster is a catalogue entry; a source series or invented house SKU is not.
- Keep three distinct layers: public equipment, process solutions/applications, and the private source/capability registry. A source model must never become a public page automatically.
- The catalogue contains six public directions: nitrogen compressors, nitrogen boosters, helium compressors, CO₂ compressors, SF₆ compressors and other process-gas compressors. Do not create active H₂/O₂ product lines from the source gas list.
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

The Git checkout initially contained no code. The user subsequently supplied the original scaffold archive and documents, reviewed and retained only as sanitized project documentation. The current catalogue decisions are in docs/EQUIPMENT_MIGRATION.md and docs/CATALOG_IMPLEMENTATION.md. Read docs/SOURCE_RECONCILIATION.md and docs/IMPLEMENTATION_BRIEF.md for historical context; the latest user request overrides their former public-family catalogue approach.

Preserve engineering honesty: no unverified performance figures, customers, certificates, stock availability or warranties. Do not publish unapproved concept names as products. The homepage and global metadata gas order is N₂, He, SF₆, CO₂ and other process gases. An SF₆ catalogue direction does not approve a source model, performance range or gas compatibility. Its RFQ remains an individual engineering request. AI-authored content stays in editorial review until approved by a human.

Use strict TypeScript, server components by default, typed content repository and explicit units. Never suppress errors with any, @ts-ignore or broad lint disables. Never log RFQ contact data or commit .env/.local.

Required checks: npm run typecheck, npm run lint, npm test, npm run build, npm run test:e2e. Staging RFQ uses an explicitly disclosed local mock; live collection requires approved legal operator details and configured delivery.
