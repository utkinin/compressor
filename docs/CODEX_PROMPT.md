# Master prompt for Codex

You are continuing the Lanfor Gas Systems website in this repository.

## Read first
1. `AGENTS.md`
2. `docs/MASTER_SPEC.md`
3. `docs/CATALOG_IMPLEMENTATION.md`
4. `docs/EQUIPMENT_MIGRATION.md`
5. `docs/IMPLEMENTED_CONTENT_MODEL.md`
6. `docs/QUANTITATIVE_EVIDENCE.md`
7. `docs/V21_IMPLEMENTATION.md`
8. `docs/HERO_V3_ZERO_SCROLL.md`
9. `docs/HERO_V3_IMPLEMENTATION_CHECKLIST.md`
10. GitHub Issue #6: `PR #2 — Visual System v2: заменить тёмные чертежи на product-first графику`
11. GitHub Issue #8: `PR #3 — Hero v3: zero-scroll боли на главной + one-pain hero на Solutions`

## Current active tasks
Complete Issue #6 visual-system migration and integrate Issue #8 as the final homepage/solution hero behavior.

Do not treat Issue #8 as permission to restore the old dark schematic style. Where the two issues overlap, Issue #8 refines homepage information architecture while Issue #6 remains the source of truth for visual language.

Do not return another concept/design plan. Implement the code.

## Final homepage rule
The homepage is NOT a single-pain nitrogen landing page.

Keep broad H1:
`Компрессоры и бустеры для технологических газов`

Within the first viewport, without scrolling, expose the main customer pain paths:
- pressure after N₂ generator;
- laser gas supply;
- helium recovery;
- CO₂ / other process gas compression;
- compressor integration.

Use the light product-first `home-compressor-system` visual on the right. The pain navigator and primary CTA must be visible above the fold on a typical 1366×768 viewport.

Dedicated Solution pages should use problem-led H1s per Issue #8.

## Core visual rule

**PRODUCT FIRST → APPLICATION → PROCESS → ENGINEERING DETAIL**

Current dark `TechnicalDiagram` / pseudo-CAD visuals must stop being the default hero and commercial-page visual language.

## Non-negotiable public-content guardrails
- No UNIGY in public UI, metadata, JSON-LD, alt text or indexable output.
- No OEM wording in public customer-facing copy.
- No supplier/source family names or vendor model numbers as Lanfor products.
- Do not invent Lanfor SKUs or product series.
- Do not publish unsupported pressure, flow, power, lifetime, certification or performance claims.
- No fake document/download pages.
- No developer-language in public UI (`staging`, `repository`, `source family`, `family envelope`, etc.).
- Prefer customer language: compressor, booster, gas, inlet pressure, outlet pressure, flow, duty.

## Visual execution requirements
- Separate `HeroVisual`, `ProcessVisual` and `EngineeringDiagram` responsibilities.
- Use light, product-first visual containers for commercial pages.
- Create centralized visual asset registry/manifest and asset slots under `/public/images/visuals/`.
- Do not solve the task by recoloring the old SVGs.
- Do not use dark blueprint placeholders when final image assets are missing.
- Keep labels/callouts in HTML/SVG rather than baking Russian text into raster artwork.
- Check 1440 / 1366 / 1280 / 1024 / 768 / 390 layouts.
- Preserve the current customer-side content architecture except for the explicit Hero v3 zero-scroll changes.

## Required implementation order
1. Visual System v2 foundation/components/asset registry from Issue #6.
2. Hero v3 homepage zero-scroll pain navigator from Issue #8.
3. Problem-led hero on the five target Solution pages from Issue #8.
4. Home task-card visuals.
5. Equipment hub.
6. Nitrogen compressor and nitrogen booster pages.
7. Nitrogen-after-generator solution visual/process details.
8. Laser-cutting visual/process details.
9. Helium recovery visual/process details.
10. Remaining He / CO₂ / SF₆ / other process-gas equipment visuals.
11. Equipment integration and supply-format progression.
12. Knowledge visuals.
13. Legacy `TechnicalDiagram` cleanup.
14. Update visual-system documentation.

## Analytics
Implement/preserve:
- `hero_view`
- `hero_primary_cta_click`
- `hero_secondary_cta_click`
- `hero_pain_click`

`hero_pain_click` must include pain, position and source_page.

Do not automatically switch the homepage to another single pain based only on an arbitrary 4–8 week window; report actual sample sizes and RFQ attribution.

## Acceptance criteria
Run the actual project equivalents of:

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run test:e2e`
- `npm run preview:build`
- `npm run preview:test`

Final result must satisfy:
- 1366×768 homepage shows broad H1, primary CTA, 4+ pain paths and product visual without scrolling;
- 390px homepage surfaces pain paths before long explanatory content;
- no dynamic/session-based homepage H1 substitution;
- five target Solution pages use their specific problem-led H1s;
- no legacy dark diagram as hero on major commercial pages;
- no legacy dark diagram in Equipment cards;
- no legacy dark diagram as default Solution visual;
- distinct visual treatment for different tasks;
- mobile visuals remain understandable without zooming;
- visual assets do not imply unsupported technical capabilities;
- public output remains free of UNIGY/OEM/vendor model leakage;
- build/test suite passes.

## Final report
Return:
1. homepage before/after summary;
2. 1366×768 and 390px hero QA;
3. pain navigator implementation and analytics event;
4. Solution hero changes;
5. migration table PAGE / OLD VISUAL / NEW VISUAL / STATUS;
6. new/changed components;
7. visual asset manifest;
8. remaining `TechnicalDiagram` usages and rationale;
9. responsive QA results;
10. performance/image payload impact where measurable;
11. build/typecheck/lint/test/e2e/preview results.

Do not add unrelated CMS/backend work before Issues #6 and #8 are complete.
