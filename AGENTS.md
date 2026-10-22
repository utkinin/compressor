# Codex project instructions

This repository is a B2B industrial website for **Lanfor Gas Systems**.

## Product principle
The site sells an engineering outcome, not a commodity compressor. The core entity is a **working point**:
`gas + inlet pressure + outlet pressure + flow + duty`.

## Non-negotiables
- Never invent technical values, certificates, delivery terms, pressure ranges or compatible gases.
- Use only fields with `verificationStatus: verified` for definitive technical statements.
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

The Git checkout initially contained no code. The user subsequently supplied the original scaffold archive and documents, preserved in docs/source. Read docs/SOURCE_RECONCILIATION.md and the newer user brief docs/IMPLEMENTATION_BRIEF.md. The newer user request overrides earlier seed specifications when they conflict.

Preserve engineering honesty: no unverified performance figures, customers, certificates, stock availability or warranties. N2-B is a draft concept. No public SF₆ direction. AI-authored content stays in editorial review until approved by a human.

Use strict TypeScript, server components by default, typed content repository and explicit units. Never suppress errors with any, @ts-ignore or broad lint disables. Never log RFQ contact data or commit .env/.local.

Required checks: npm run typecheck, npm run lint, npm test, npm run build, npm run test:e2e. Staging RFQ uses an explicitly disclosed local mock; live collection requires approved legal operator details and configured delivery.
