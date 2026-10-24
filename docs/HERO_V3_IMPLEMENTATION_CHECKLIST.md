# Hero v3 implementation checklist

This checklist is subordinate to `HERO_V3_ZERO_SCROLL.md` and `VISUAL_SYSTEM_V2`/Issue #6.

## Homepage
- Keep broad H1: `Компрессоры и бустеры для технологических газов`.
- Replace long descriptive lead with concise pain-oriented lead.
- Keep `Подобрать компрессор` as primary CTA.
- Keep `Отправить ТЗ или параметры` as secondary CTA.
- Insert compact `С какой задачей вы пришли?` pain navigator inside the hero, not below the fold.
- Pain links: N₂ after generator, laser, helium recovery, CO₂/process gas, equipment integration.
- Keep the new light product-first visual on the right.
- Remove the old dark process card from hero-primary role.
- Put the simple source → compressor/booster → consumer explanation below the hero.

## Solution pages
- Add specific pain-led hero per solution.
- Use clean application visual as primary visual.
- Keep process/before-after as secondary explanatory graphic only.
- No unsupported numeric examples.
- No dark blueprint hero.

## Analytics
- Add `hero_pain_click` event.
- Preserve hero CTA events.
- Store pain, position, source_page.

## QA
- 1366×768: broad H1 + CTA + 4+ pain links + product visual visible without scroll.
- 390px: pain paths appear before long explanatory content.
- no horizontal overflow.
- no dynamic H1 substitution.
- no OEM/UNIGY/vendor nomenclature.
