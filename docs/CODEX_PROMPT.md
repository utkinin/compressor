# Master prompt for Codex

You are continuing the Lanfor Gas Systems website in this repository.

Read first:
1. `AGENTS.md`
2. `docs/MASTER_SPEC.md`
3. `docs/CONTENT_MODEL.md`
4. `docs/SEO_AI.md`
5. `docs/ANALYTICS.md`

Current state is a functional seed, not production.

## Next implementation tasks
1. Replace local seed data with a repository interface that can use Directus/Postgres without changing page components.
2. Implement faceted equipment filtering only over populated/verified fields.
3. Expand RFQ wizard with gas-specific branch questions and POST to `/api/rfq`.
4. Add server-side CRM webhook adapter with retries, idempotency key and safe logs.
5. Add Yandex Metrika/GA4 adapters behind env flags and the event taxonomy in `docs/ANALYTICS.md`.
6. Add document entities/access levels and public document page.
7. Add Case entity/page template.
8. Add CMS editorial states: draft → technical_review → approved → published.
9. Add tests for JSON-LD/data consistency and RFQ validation.
10. Do not add generic filler pages.

## Acceptance criteria
- `npm run build` passes.
- Every public product page has canonical metadata, visible technical table and matching JSON-LD.
- RFQ works with keyboard/mobile and never pretends to perform an engineering calculation.
- No technical values are added unless present in structured source data.
- Lighthouse/page performance remains high; avoid client JS outside interactive components.
