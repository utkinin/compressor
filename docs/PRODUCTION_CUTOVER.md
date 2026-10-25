# Production cutover — lanfor-gas.ru

## Production domain

Canonical production origin:

`https://lanfor-gas.ru`

`src/config/site.ts` is the public source of truth for the production origin and approved contact data. `src/lib/seo.ts` uses this origin when `SITE_URL` / `NEXT_PUBLIC_SITE_URL` are not explicitly set.

## Preview and production are different modes

GitHub Pages preview remains a noindex staging surface under the repository base path. Do not point canonical production SEO at the GitHub Pages preview URL.

Production deployment must use:

- `SITE_URL=https://lanfor-gas.ru`
- empty root base path (no `/compressor`)
- `SEO_INDEXABLE=true` only after final crawl/QA
- live RFQ delivery only after the approved handler and personal-data operator configuration are set
- analytics IDs only through the existing consent-controlled analytics adapter.

## DNS / hosting gate

Do not add a repository `CNAME` or switch the public domain until the hosting target and DNS records are configured and externally resolvable. The current registration alone does not prove that HTTPS or DNS routing is active.

Cutover acceptance:

1. `https://lanfor-gas.ru/` resolves externally.
2. HTTPS certificate is valid.
3. Root URLs have no `/compressor` base path.
4. Canonical, OpenGraph, sitemap and Organization JSON-LD use `https://lanfor-gas.ru`.
5. `robots.txt` allows indexing only after release approval.
6. No preview/staging banner or developer language in production.
7. RFQ submit reaches the approved live delivery channel.
8. Consent, legal pages and analytics behavior pass browser QA.

## Rollback

Preview must remain independently deployable from `work` so the production domain can be rolled back without losing the staging review surface.
