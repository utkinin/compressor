# Codex project instructions

This repository is a B2B industrial website for **Lanfor Gas Systems**.

## Product principle
Start with the customer's task and a **compressor or booster** selected from
`gas + inlet pressure + required outlet pressure + flow + duty`.
Then explain necessary options and complete systems as supply variants. Use plain
B2B language in heroes, headings, cards and CTAs. Keep "рабочая точка" inside detailed
technical explanations. Remove private supplier names and internal manufacturer acronyms from the complete repository: code, comments, identifiers, tests, documentation and archives. Use neutral equipment and integration names. Original user uploads outside the project are not source files.

## Non-negotiables
- Never invent technical values, certificates, delivery terms, pressure ranges or compatible gases.
- A verification label alone is not evidence. Definitive technical statements require a real source record, a retrievable document, a page/section and approval for that gas and execution.
- `draft` values may appear only in internal/admin content or with an explicit project-selection qualifier.
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

## Analytics events
Do not send personal data to analytics. Track only event names, page/intent and anonymous technical selections.

## Definition of done for a new product page
1. Product/series exists in structured data.
2. Source and verification status are present.
3. Technical table is visible as HTML.
4. Product JSON-LD mirrors visible facts.
5. Links exist to relevant gas, task/application, industry and RFQ page.
6. RFQ carries context from the page.
7. Metadata and canonical are correct.


## Current implementation and cloud workflow


Work in this existing checkout and current branch. Cloud tasks are already isolated; do not create worktrees unless explicitly requested.

The Git checkout initially contained no code. The user subsequently supplied the original scaffold archive and documents, reviewed and retained only as sanitized project documentation. Read docs/SOURCE_RECONCILIATION.md and the newer user brief docs/IMPLEMENTATION_BRIEF.md. The newer user request overrides earlier seed specifications when they conflict.

Preserve engineering honesty: no unverified performance figures, customers, certificates, stock availability or warranties. N2-B is a draft concept. The user-approved homepage and global metadata gas order is N₂, He, SF₆, CO₂ and other process gases; this mention does not approve an SF₆ product specification or expand the RFQ gas model. AI-authored content stays in editorial review until approved by a human.

Use strict TypeScript, server components by default, typed content repository and explicit units. Never suppress errors with any, @ts-ignore or broad lint disables. Never log RFQ contact data or commit .env/.local.

Required checks: npm run typecheck, npm run lint, npm test, npm run build, npm run test:e2e. Staging RFQ uses an explicitly disclosed local mock; live collection requires approved legal operator details and configured delivery.
