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
8. GitHub Issue #6: `PR #2 — Visual System v2: заменить тёмные чертежи на product-first графику`

## Current active task
The current implementation priority is GitHub Issue #6.

Implement it completely. Do not return another concept/design plan. Do not stop after Wave 1 and do not ask for confirmation between waves.

Core visual rule:

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
- Check 1440 / 1280 / 1024 / 768 / 390 layouts.
- Preserve the current customer-side content architecture unless a visual integration change requires a small layout adjustment.

## Required implementation order
1. Home hero and home task cards.
2. Equipment hub.
3. Nitrogen compressor and nitrogen booster pages.
4. Nitrogen-after-generator solution.
5. Laser-cutting solution.
6. Helium recovery solution.
7. Remaining He / CO₂ / SF₆ / other process-gas equipment visuals.
8. Equipment integration and supply-format progression.
9. Knowledge visuals.
10. Legacy `TechnicalDiagram` cleanup.
11. Update visual-system documentation.

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
1. migration table PAGE / OLD VISUAL / NEW VISUAL / STATUS;
2. new/changed components;
3. visual asset manifest;
4. remaining `TechnicalDiagram` usages and rationale;
5. responsive QA results;
6. performance/image payload impact where measurable;
7. build/typecheck/lint/test/e2e/preview results.

Do not add new unrelated CMS/backend work before Issue #6 is complete.
