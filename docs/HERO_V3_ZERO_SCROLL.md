# Hero v3 — zero-scroll pain recognition

## Decision

Do NOT turn the homepage into a single-pain N₂ landing page.

The homepage must remain the broad Lanfor Gas Systems entry point, while making the main customer problems visible inside the first viewport without scrolling.

Dedicated solution pages may and should use a single-pain hero.

## Why

- The current homepage is the corporate/commercial entry point for multiple intents: nitrogen boosting, laser gas supply, helium recovery, CO₂/process gases, equipment integration.
- N₂ is a strategic priority, but not yet proven to be the dominant homepage intent.
- A single N₂ H1 on `/` risks making users with He/CO₂/laser/general compressor intent think they landed on the wrong site.
- The recently approved Visual System v2 is product-first and light; do not reintroduce a dark blueprint/diagnostic-SVG hero as the primary visual.

## Homepage hero structure

Desktop target: the complete commercial proposition and all major pain paths must fit in a typical 1366×768 first viewport.

### Left column

Eyebrow:
`БЕЗМАСЛЯНЫЕ КОМПРЕССОРЫ И БУСТЕРЫ · ТЕХНОЛОГИЧЕСКИЕ ГАЗЫ`

H1:
`Компрессоры и бустеры для технологических газов`

Lead:
`Нужно повысить давление газа, вернуть его в процесс или подать в оборудование? Подберём компрессор или бустер по газу, P₁, P₂, расходу и режиму работы.`

Primary CTA:
`Подобрать компрессор`

Secondary CTA:
`Отправить ТЗ или параметры`

Then, still above the fold:

### `С какой задачей вы пришли?`

Show compact pain links/cards, visible without interaction:

1. `Не хватает давления после генератора N₂`
   → `/solutions/nitrogen-booster-after-generator/`

2. `Нужен газ для лазерного станка`
   → `/solutions/nitrogen-for-laser-cutting/`

3. `Нужно вернуть гелий в процесс`
   → `/solutions/helium-recovery/`

4. `Нужно сжать CO₂ или другой газ`
   → `/solutions/process-gas-compressor/`

5. `Нужно встроить компрессор в оборудование`
   → `/solutions/equipment-integration/`

These are not large cards. They must behave like a compact pain navigator within the hero.

Recommended desktop layout: 2×2 compact cards + one full-width/text link for integration, or 5 concise chips/tiles if the viewport remains readable.

The first N₂ item may receive a small visual priority because it is the current commercial validation priority, but it must not visually suppress the other intents.

## Right column

Use the Visual System v2 `home-compressor-system` product visual.

The hero visual is equipment, not a diagnostic schematic.

Allowed small HTML overlay/chips:
`Газ · P₁ · P₂ · Q · Режим`

No dark blueprint background.
No before/after red/green diagram as the primary homepage visual.
No embedded Russian text inside raster imagery.

## Mobile

Order:
1. H1
2. lead
3. primary CTA
4. pain navigator
5. secondary CTA / parameters if space permits
6. product visual

The user must see at least the first 3–4 pain paths before a long scroll.

Do not shrink a desktop 2×2 matrix into unreadable micro-cards. Use vertically stacked compact rows.

## Dedicated solution pages — use single-pain hero

The one-pain concept belongs here.

### Nitrogen after generator
H1: `Не хватает давления после генератора азота?`
Lead: `Подберём бустер под фактическое давление и производительность источника, требуемое давление и режим работы. Бустер повышает давление, но не создаёт дополнительный газ.`
CTA: `Рассчитать дожатие азота`

Visual: clean application visual + simple process flow below.
Do not use unsupported example pressures.

### Laser cutting
H1: `Нужен газ для лазерного станка?`
Lead must remain neutral between compressed air and N₂ and be grounded in machine requirements.
CTA: `Подобрать систему для лазера`

### Helium recovery
H1: `Нужно вернуть гелий в процесс?`
Do not use emotional consumer wording like `Теряем дорогой газ — гелий?` as the canonical H1.
CTA: `Рассчитать возврат гелия`

### CO₂ / process gases
H1: `Нужно сжать CO₂ или другой технологический газ?`
CTA: `Отправить параметры газа`

### Integration
H1: `Нужно встроить компрессор в оборудование?`
Do not use private supplier terminology publicly.
CTA: `Подобрать компрессор для встраивания`

## Diagnostic graphics on solution pages

A before/after visual is allowed as a secondary explanatory graphic where it genuinely helps.

However:
- light background;
- maximum 3–4 objects;
- no P&ID density;
- no fake gauges;
- no unsupported pressures/flows;
- no red/green-only meaning (accessibility);
- pair color with icon/label/state.

For N₂, a useful visual is:
`Источник N₂ → недостаточно давления → бустер → требуемое давление у потребителя`

But the visual must not imply that booster increases source gas production.

## SEO

Homepage keeps broad H1 and metadata around process-gas compressors/boosters.

Each solution URL owns its narrow pain/search intent.

Do not dynamically change homepage H1 based on session, referrer, cookies or JS.

## Analytics

Add or preserve:

- `hero_view`
- `hero_primary_cta_click`
- `hero_secondary_cta_click`
- `hero_pain_click`

`hero_pain_click` payload:

```ts
{
  pain: "nitrogen" | "laser" | "helium" | "co2" | "integration",
  position: number,
  source_page: "/"
}
```

Do not automatically change homepage default based only on a 4–8 week calendar window. Traffic may be too small.

Use data only after a meaningful sample. At minimum report:
- homepage sessions;
- pain-link clicks by intent;
- RFQ starts by landing page;
- RFQ completions by landing page;
- assisted RFQs after pain-link navigation.

For low traffic, supplement analytics with the 15-second comprehension test.

## 15-second comprehension test

Show only the first viewport to 5–10 target users/engineers.
Ask:
1. What does this company sell?
2. Which of your tasks could it solve?
3. What would you click next?

Success criteria:
- question 1 answered correctly by at least 80%;
- target users can identify their pain path without scrolling;
- CTA/action is obvious.

## Acceptance criteria

Homepage at 1366×768:
- broad H1 visible;
- primary CTA visible;
- at least four customer pain paths visible without scroll;
- product visual visible;
- no dark blueprint primary visual.

Homepage at 390px:
- H1/lead/CTA readable;
- pain paths appear before long explanatory content;
- no horizontal overflow.

Solution pages:
- use their specific pain H1;
- do not require homepage navigation to understand the offer;
- retain customer-language wording;
- no private supplier terminology/private supplier terminology/vendor names;
- no unsupported technical numbers.

This document supersedes any proposal that makes `/` a single-pain nitrogen landing page or restores a dark diagnostic SVG as the homepage hero.