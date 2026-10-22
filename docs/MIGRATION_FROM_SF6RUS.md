# Migration from sf6rus.ru

## Goal
Move the process-gas vertical without creating duplicate-content islands or losing existing intent signals.

## Launch domain
Recommended architecture: separate deployment under a Lanfor-owned gas identity. Keep the code domain-agnostic through `NEXT_PUBLIC_SITE_URL`.

Shortlist to check at registrar/DNS before production:
- `gas.lanfor.ru` — strongest brand continuity; can be a completely separate deployment.
- `lanforgas.ru` — clean dedicated domain if available and desired.

Do not choose a keyword-stuffed domain. The content graph matters more than the domain phrase.

## URL mapping examples
- `/products/0000066/` → new `/` or `/solutions` bridge, depending on final content
- `/product/0000029` → `/solutions/nitrogen-boosting` and/or a real verified N2 product page
- helium page → `/gases/helium` plus verified product family page
- hydrogen page → `/gases/hydrogen` plus verified product page
- CO2 page → `/gases/carbon-dioxide` plus verified product page
- PET page → later dedicated solution page if kept in scope

## SEO migration rule
When the replacement page is materially equivalent and ready, use a 301 from the old URL to the exact new canonical URL. Do not keep two full copies live on different domains.

Keep a short “Technological gases” bridge on sf6rus.ru with a concise explanation and link to the new project. The detailed content lives on the new site.

## Content migration order
1. N2 system / N2-B logic
2. process-gas module page
3. helium
4. CO2
5. hydrogen
6. oxygen
7. PET / air only if it remains strategically in the same vertical

## Cleanup before migration
- remove inherited SF6-only statements from tech-gas pages
- separate marketing names from OEM family/source data
- add source and verification state internally
- normalize pressure/flow units and reference conditions
- replace numeric URLs with human-readable slugs
- preserve useful text by rewriting it around the new canonical intent, not copy-pasting entire legacy pages
