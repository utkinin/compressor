# Stage A gap matrix

Status is measured against PR #5 review blockers before the Visual System / Hero v3 rollout.

| Gate | Previous state | Current branch state | Verification required |
|---|---|---|---|
| `/about/` H1 | Generic/incorrect | `О компании Lanfor Gas Systems` | build + browser H1 check |
| `/gases/` H1 | Generic | `Компрессоры для технологических газов: подбор по газу` | build + browser H1 check |
| Contacts | Env/demo fallback | Public phone, address, hours from `siteConfig` | browser + schema check |
| Header phone | Missing | Clickable `tel:` link added | desktop/mobile QA |
| Footer contacts | Missing; questionnaire prominent | Phone/address/hours + RFQ; questionnaire removed from primary footer column | desktop/mobile QA |
| Organization JSON-LD | Missing phone/address/hours | telephone + PostalAddress + OpeningHoursSpecification | generated HTML check |
| Brief RFQ consent | Submit physically enabled | button and submit handler guarded by `!consent` | unit/e2e |
| Detailed RFQ consent | Submit physically enabled | button and submit handler guarded by `!consent` | unit/e2e |
| Production origin | Placeholder fallback | `https://lanfor-gas.ru` | generated canonical check |
| Homepage pain recognition | Scenarios below fold | Hero v3 pain navigator above fold | 1366×768 + 390px QA |
| Priority solution hero | Category titles | Problem-led H1 override for 5 priority solutions | single-H1/browser QA |
| Priority solution graphics | dark `TechnicalDiagram` | separate application `HeroVisual` + registry-driven light `ProcessVisual` | visual/mobile QA |

Stage A is not closed until CI/build/browser checks are green on the branch merged to `work`.
