# Visual System V2 — миграция production UI

Действующий документ визуальной системы от 24 октября 2026 года. Прежние `IMAGE_PLAN.md` и `IMPLEMENTED_IMAGE_PLAN.md` отмечены deprecated. Коммерческая архитектура v2.1, существующие canonical URLs, инженерные ограничения и справочный статус SF₆ сохраняются; меняются визуальные слои и UI-композиция.

## A. Migration

Исходная версия — `aa9e780`. Инвентаризация выполнена по frozen Git source и работающей production-сборке до изменений. Найдены 7 импортов и 7 JSX callsites `TechnicalDiagram`, одна декларация компонента — 15 символьных упоминаний в `src`. Через шаблоны это давало 32 содержательные страницы и 5 карточек Equipment: **37 rendered instances** на канонических страницах. Справочный SF₆ уже обходил компонент. Отдельный тёмный HTML process-блок главной не входит в число JSX-вызовов.

Миграционная карта включает 57 страниц/групп. `REPLACE` означает замену главного изображения или визуального слота; полезные подробные объяснения остаются ниже по странице как отдельный инженерный слой.

| PAGE | CURRENT COMPONENT / OLD VISUAL | NEW VISUAL ID | ACTION / STATUS |
| --- | --- | --- | --- |
| `/` | Home HTML aside.v21-process: Dark source→compressor→consumer block in hero | `home-compressor-system + process-home + supply-compressor-to-system` | REPLACE; PASS |
| `/equipment/` | EquipmentCards / TechnicalDiagram: 5 compact dark SVG equipment cards | `equipment-range + category images` | REPLACE; PASS |
| `/solutions/` | EntityCard: Text-only cards | `solution application images` | REPLACE; PASS |
| `/knowledge/` | KnowledgeVisual / text previews: Six shared-style diagrams; remaining previews text | `article-specific editorial thumbnails` | REPLACE; PASS |
| `/gases/nitrogen/` | GasPage / TechnicalDiagram: Dark gas flow SVG | `equipment-nitrogen-compressor / process-nitrogen-after-generator` | REPLACE; PASS |
| `/gases/helium/` | GasPage / TechnicalDiagram: Dark gas flow SVG | `equipment-helium-compressor / process-helium-recovery` | REPLACE; PASS |
| `/gases/hydrogen/` | GasPage / TechnicalDiagram: Dark gas flow SVG | `solution-hydrogen / process-gas` | REPLACE; PASS |
| `/gases/oxygen/` | GasPage / TechnicalDiagram: Dark gas flow SVG | `solution-oxygen / process-gas` | REPLACE; PASS |
| `/gases/carbon-dioxide/` | GasPage / TechnicalDiagram: Dark gas flow SVG | `equipment-co2-compressor / process-co2` | REPLACE; PASS |
| `/gases/process-gas/` | GasPage / TechnicalDiagram: Dark gas flow SVG | `equipment-process-gas / process-gas` | REPLACE; PASS |
| `/solutions/nitrogen-booster-after-generator/` | SolutionPage / TechnicalDiagram: Dark universal SVG selected by diagram kind | `solution-nitrogen-after-generator / process-nitrogen-after-generator` | REPLACE; PASS |
| `/solutions/nitrogen-pressure-boosting/` | SolutionPage / TechnicalDiagram: Dark universal SVG selected by diagram kind | `solution-nitrogen-pressure-boosting / process-nitrogen-after-generator` | REPLACE; PASS |
| `/solutions/nitrogen-for-laser-cutting/` | SolutionPage / TechnicalDiagram: Dark universal SVG selected by diagram kind | `solution-laser / process-laser` | REPLACE; PASS |
| `/solutions/helium-compression/` | SolutionPage / TechnicalDiagram: Dark universal SVG selected by diagram kind | `solution-helium-compression / process-gas` | REPLACE; PASS |
| `/solutions/helium-recovery/` | SolutionPage / TechnicalDiagram: Dark universal SVG selected by diagram kind | `solution-helium-recovery / process-helium-recovery` | REPLACE; PASS |
| `/solutions/hydrogen-compression/` | SolutionPage / TechnicalDiagram: Dark universal SVG selected by diagram kind | `solution-hydrogen / process-gas` | REPLACE; PASS |
| `/solutions/co2-compression/` | SolutionPage / TechnicalDiagram: Dark universal SVG selected by diagram kind | `solution-co2 / process-co2` | REPLACE; PASS |
| `/solutions/oxygen-compression/` | SolutionPage / TechnicalDiagram: Dark universal SVG selected by diagram kind | `solution-oxygen / process-gas` | REPLACE; PASS |
| `/solutions/process-gas-compressor/` | SolutionPage / TechnicalDiagram: Dark universal SVG selected by diagram kind | `solution-process-gas / process-gas` | REPLACE; PASS |
| `/solutions/oil-free-gas-booster/` | SolutionPage / TechnicalDiagram: Dark universal SVG selected by diagram kind | `solution-clean-gas / process-gas` | REPLACE; PASS |
| `/solutions/compressor-skid/` | SolutionPage / TechnicalDiagram: Dark universal SVG selected by diagram kind | `solution-supply / process-supply` | REPLACE; PASS |
| `/solutions/equipment-integration/` | SolutionPage / TechnicalDiagram: Dark universal SVG selected by diagram kind | `solution-integration / process-integration` | REPLACE; PASS |
| `/solutions/gas-transfer-recovery/` | SolutionPage / TechnicalDiagram: Dark universal SVG selected by diagram kind | `solution-transfer / process-transfer` | REPLACE; PASS |
| `/solutions/buffer-receiver-charging/` | SolutionPage / TechnicalDiagram: Dark universal SVG selected by diagram kind | `solution-buffer / process-buffer` | REPLACE; PASS |
| `/equipment/nitrogen-compressors/` | PublicEquipmentPage / TechnicalDiagram: Dark compressor SVG | `equipment-nitrogen-compressor / process-gas` | REPLACE; PASS |
| `/equipment/nitrogen-boosters/` | PublicEquipmentPage / TechnicalDiagram: Dark compressor SVG | `equipment-nitrogen-booster / process-nitrogen-after-generator` | REPLACE; PASS |
| `/equipment/helium-compressors/` | PublicEquipmentPage / TechnicalDiagram: Dark compressor SVG | `equipment-helium-compressor / process-gas` | REPLACE; PASS |
| `/equipment/co2-compressors/` | PublicEquipmentPage / TechnicalDiagram: Dark compressor SVG | `equipment-co2-compressor / process-co2` | REPLACE; PASS |
| `/equipment/sf6-compressors/` | PublicEquipmentPage: Text specialist reference | `equipment-sf6-compressor` (справочный вход, без product/RFQ-предложения) | REPLACE; PASS |
| `/equipment/process-gas-compressors/` | PublicEquipmentPage / TechnicalDiagram: Dark compressor SVG | `equipment-process-gas / process-gas` | REPLACE; PASS |
| `/cases/nitrogen-generator-to-process/` | CasePage / TechnicalDiagram: Related solution diagram reused as primary visual | `solution-nitrogen-after-generator / process-nitrogen-after-generator` | REPLACE; PASS |
| `/cases/helium-test-loop/` | CasePage / TechnicalDiagram: Related solution diagram reused as primary visual | `solution-helium-recovery / process-helium-recovery` | REPLACE; PASS |
| `/cases/compressor-integration/` | CasePage / TechnicalDiagram: Related solution diagram reused as primary visual | `solution-integration / process-integration` | REPLACE; PASS |
| `/engineering/how-to-select-nitrogen-booster/` | EngineeringGuidePage / TechnicalDiagram: Dark default SVG | `solution-nitrogen-after-generator / process-nitrogen-after-generator` | REPLACE; PASS |
| `/engineering/working-point-checklist/` | EngineeringGuidePage / TechnicalDiagram: Dark default SVG | `knowledge-five-parameters / process-five-parameters` | REPLACE; PASS |
| `/engineering/skid-integration-checklist/` | EngineeringGuidePage / TechnicalDiagram: Dark default SVG | `solution-integration / process-integration` | REPLACE; PASS |
| `/about/` | AboutPage / TechnicalDiagram: Dark integration diagram | `solution-integration + light process-integration` | REPLACE; PASS |
| `/industries/laser-cutting/` | Текстовые пути газоснабжения без предметного изображения | `solution-laser / process-laser` | REPLACE; PASS |
| `/knowledge/how-to-select-nitrogen-booster/` | KnowledgeVisual where mapped; article text/table: Inline explanatory SVG or no topic image | `knowledge-nitrogen-selection / knowledge-detail-how-to-select-nitrogen-booster` | REPLACE; PASS |
| `/knowledge/normal-and-actual-flow/` | KnowledgeVisual where mapped; article text/table: Inline explanatory SVG or no topic image | `knowledge-flow-conditions` | REPLACE; PASS |
| `/knowledge/bar-g-and-bar-a/` | KnowledgeVisual where mapped; article text/table: Inline explanatory SVG or no topic image | `knowledge-pressure-reference` | REPLACE; PASS |
| `/knowledge/oil-free-compression/` | KnowledgeVisual where mapped; article text/table: Inline explanatory SVG or no topic image | `knowledge-oil-free` | REPLACE; PASS |
| `/knowledge/compressor-vs-booster/` | KnowledgeVisual where mapped; article text/table: Inline explanatory SVG or no topic image | `knowledge-compressor-booster` | REPLACE; PASS |
| `/knowledge/what-to-specify-for-gas-compressor/` | KnowledgeVisual where mapped; article text/table: Inline explanatory SVG or no topic image | `knowledge-five-parameters / knowledge-detail-what-to-specify-for-gas-compressor` | REPLACE; PASS |
| `/knowledge/booster-vs-source/` | KnowledgeVisual where mapped; article text/table: Inline explanatory SVG or no topic image | `knowledge-booster-source / knowledge-detail-booster-vs-source` | REPLACE; PASS |
| `/knowledge/pressure-after-nitrogen-generator/` | KnowledgeVisual where mapped; article text/table: Inline explanatory SVG or no topic image | `knowledge-generator-pressure` | REPLACE; PASS |
| `/knowledge/continuous-vs-intermittent/` | KnowledgeVisual where mapped; article text/table: Inline explanatory SVG or no topic image | `knowledge-duty-cycle` | REPLACE; PASS |
| `/knowledge/why-a-receiver/` | KnowledgeVisual where mapped; article text/table: Inline explanatory SVG or no topic image | `knowledge-receiver` | REPLACE; PASS |
| `/knowledge/air-vs-water-cooling/` | KnowledgeVisual where mapped; article text/table: Inline explanatory SVG or no topic image | `knowledge-cooling` | REPLACE; PASS |
| `/knowledge/different-gases-different-performance/` | KnowledgeVisual where mapped; article text/table: Inline explanatory SVG or no topic image | `knowledge-gas-properties` | REPLACE; PASS |
| `/knowledge/how-working-point-is-calculated/` | KnowledgeVisual where mapped; article text/table: Inline explanatory SVG or no topic image | `knowledge-multistage / knowledge-detail-how-working-point-is-calculated` | REPLACE; PASS |
| `/knowledge/what-is-in-compressor-skid/` | KnowledgeVisual where mapped; article text/table: Inline explanatory SVG or no topic image | `knowledge-system-components / knowledge-detail-what-is-in-compressor-skid` | REPLACE; PASS |
| `/knowledge/co2-phase-and-compression/` | KnowledgeVisual where mapped; article text/table: Inline explanatory SVG or no topic image | `knowledge-co2-conditions` | REPLACE; PASS |
| `/knowledge/helium-recovery-principles/` | KnowledgeVisual where mapped; article text/table: Inline explanatory SVG or no topic image | `knowledge-helium-recovery / knowledge-detail-helium-recovery-principles` | REPLACE; PASS |
| `/knowledge/why-process-gas-compressors-need-task-specific-selection/` | KnowledgeVisual where mapped; article text/table: Inline explanatory SVG or no topic image | `knowledge-task-specific / knowledge-detail-why-process-gas-compressors-need-task-specific-selection` | REPLACE; PASS |
| `/knowledge/sf6-compressor-service-life/` | KnowledgeVisual where mapped; article text/table: Inline explanatory SVG or no topic image | `knowledge-sf6-life / knowledge-detail-sf6-compressor-service-life` | REPLACE; PASS |
| `/knowledge/compressors-for-gas-mixtures/` | KnowledgeVisual where mapped; article text/table: Inline explanatory SVG or no topic image | `knowledge-gas-mixtures / knowledge-detail-compressors-for-gas-mixtures` | REPLACE; PASS |

## B. Components и content model

- `HeroVisual` читает зарегистрированный visual ID и отвечает за предметное/application/editorial изображение, адаптивный источник, alt, размеры, приоритет загрузки и подпись. Главные изображения светлые; несогласованный или отсутствующий asset не публикуется.
- `CommercialHero` объединяет текст/CTA слева и крупное изображение справа; на телефоне композиция перестраивается без уменьшения машины до чертежа.
- `ProcessVisual` читает отдельный native process spec. Объекты и HTML-подписи остаются крупными; длинные flows переходят в вертикальные шаги на mobile. Сравнение воздуха/азота имеет два равноправных пути, буфер/ресивер отмечаются опциональными там, где это требуется.
- `KnowledgeVisual` — только подробная иллюстрация внутри статьи после основного открытия. Topic cover и thumbnail статьи выбираются отдельно; figures связаны через `figureIds`.

`src/content/visuals.ts` содержит массивы `visualAssets` и `processSpecs`, lookup с fail-closed публикацией и явные размеры. Equipment/Solution/Gas/Case ссылаются на `heroVisualId` и `processVisualId`, статьи — на `heroVisualId` и `figureIds`. Полезные процессы не объявляются raster images: это отдельная редактируемая HTML/SVG-модель.

## C. Legacy

Baseline: 7 production callsites / 37 rendered instances. После миграции recursive scan `src` и integrity tests подтверждают **0 импортов, 0 JSX callsites, 0 деклараций** `TechnicalDiagram`/`DiagramKind`. Старый компонент удалён. Употребления имён `hero`, `nitrogen`, `helium`, `co2`, `integration` в новых ID и тематических URL описывают действующий контент; они не являются зависимостью от прежнего enum. В документации и проверках название старого компонента остаётся только для истории миграции и guard проверки. DOM/generated-output scan и браузерная приёмка подтвердили отсутствие старой фигуры. Удалены 37 неиспользуемых CSS-правил прежней графики; структура CSS проверена парсером PostCSS и production-сборкой.

Повторный recursive search выполнен по всему `src` без механического удаления тематических слов:

| TERM | OCCURRENCES | ОСТАВШАЯСЯ РОЛЬ |
| --- | --- | --- |
| `TechnicalDiagram` | 0 | Удалённый компонент, совпадений в production source нет. |
| `technical-diagram` | 0 | Удалённый файл/import path, совпадений нет. |
| `DiagramKind` | 0 | Старый универсальный enum удалён, совпадений нет. |
| `hero` | 316 | Действующие HeroVisual/CommercialHero, content heroVisualId, классы и props героя. |
| `small` | 22 | HTML small, компактные контролы/шрифты и responsive asset suffix; не тип машины. |
| `medium` | 6 | UTM medium и responsive image suffix; не модель или серия оборудования. |
| `large` | 2 | Описание крупных пиктограмм в комментарии и ограничение размера HTTP body; не enum. |
| `nitrogen` | 153 | Существующие азотные URL, IDs, контент и новые изображения. |
| `helium` | 84 | Существующие гелиевые URL, IDs, контент и новые изображения. |
| `hydrogen` | 16 | Сохранённые водородные URL и проектное рассмотрение; не основной коммерческий hero. |
| `co2` | 90 | Существующий CO₂-контент, URL и отдельные изображения. |
| `instrumentation` | 1 | Вторичный объект КИП в светлом process renderer. |
| `integration` | 30 | Действующие страницы, примеры и иллюстрации встраивания. |

Полный список файлов каждого совпадения сохранён локально: `.local/visual-v2/final/legacy-term-search.json`.

## D. Assets

Реальные approved фотографии оборудования для этого прохода не предоставлены. Использованы специально созданные controlled AI concept renders и оригинальные SVG-иллюстрации. Они не выдаются за фотографию конкретной модели. Для предметных/application renders видна подпись «Иллюстрация компоновки. Исполнение определяется при подборе». Изображение SF₆ намеренно обобщённое, а локальная страница остаётся справочным переходом к SF6RUS.

Для Knowledge подготовлены отдельные mobile/card SVG: уменьшено число мелких подпунктов, увеличены подписи, сохранены смысловые связи и исходное соотношение сторон. Например, семь факторов SF₆ остаются видимыми без указания количества лет; mobile-версия использует подписи 36–42 SVG units вместо мелкого desktop-текста.

Русские подписи находятся в HTML/SVG; их нет внутри растров. Не добавлены модельные обозначения, характеристики, сроки, сертификаты, числовые режимы или обещания совместимости.

Растровые sources — WebP 1800×1200, card variants 720–900 px и mobile variants 900 px. Исходная генерация может иметь меньшую native resolution; изменение размера при подготовке файла не является утверждением о дополнительной исходной детализации. Главный mobile asset 900 px — 50 356 B, desktop source 1800 px — 126 044 B; дополнительно подготовлены 384/600 px candidates для экранов с меньшей плотностью. Выбор через picture/srcset учитывает viewport и DPR, source files высокого разрешения остаются доступными. Основные application card assets — около 14–19 KB, что позволяет показывать разные сценарии без крупного raster payload на каждой карточке.

| VISUAL ID | KIND | PUBLIC FILE | DIMENSIONS | SOURCE BYTES |
| --- | --- | --- | --- | --- |
| `home-compressor-system` | product | `/images/visuals/home/process-gas-compressor-system.webp` | 1800×1200 | 126044 B |
| `equipment-range` | product | `/images/visuals/equipment/range.webp` | 1800×1200 | 126044 B |
| `equipment-nitrogen-compressor` | product | `/images/visuals/equipment/nitrogen-compressor.webp` | 1800×1200 | 116190 B |
| `equipment-nitrogen-booster` | product | `/images/visuals/equipment/nitrogen-booster.webp` | 1800×1200 | 79966 B |
| `equipment-helium-compressor` | product | `/images/visuals/equipment/helium-compressor.webp` | 1800×1200 | 120622 B |
| `equipment-co2-compressor` | product | `/images/visuals/equipment/co2-compressor.webp` | 1800×1200 | 116200 B |
| `equipment-sf6-compressor` | product | `/images/visuals/equipment/sf6-compressor.webp` | 1800×1200 | 18266 B |
| `equipment-process-gas` | product | `/images/visuals/equipment/process-gas-compressor.webp` | 1800×1200 | 130008 B |
| `solution-nitrogen-after-generator` | application | `/images/visuals/solutions/nitrogen-after-generator.webp` | 1800×1200 | 61348 B |
| `solution-laser` | application | `/images/visuals/solutions/laser.webp` | 1800×1200 | 64976 B |
| `solution-helium-recovery` | application | `/images/visuals/solutions/helium-recovery.webp` | 1800×1200 | 68550 B |
| `solution-co2` | application | `/images/visuals/solutions/co2.webp` | 1800×1200 | 86120 B |
| `solution-integration` | application | `/images/visuals/solutions/integration.webp` | 1800×1200 | 73746 B |
| `solution-nitrogen-pressure-boosting` | application | `/images/visuals/solutions/nitrogen-pressure-boosting.svg` | 900×600 | 3241 B |
| `solution-clean-gas` | application | `/images/visuals/solutions/clean-gas.svg` | 900×600 | 4093 B |
| `solution-buffer` | application | `/images/visuals/solutions/buffer.svg` | 900×600 | 3210 B |
| `solution-transfer` | application | `/images/visuals/solutions/transfer.svg` | 900×600 | 3179 B |
| `solution-hydrogen` | application | `/images/visuals/solutions/hydrogen.svg` | 900×600 | 3247 B |
| `solution-oxygen` | application | `/images/visuals/solutions/oxygen.svg` | 900×600 | 3581 B |
| `solution-supply` | application | `/images/visuals/solutions/supply.svg` | 900×600 | 3713 B |
| `solution-helium-compression` | application | `/images/visuals/solutions/helium-compression.svg` | 900×600 | 3316 B |
| `solution-process-gas` | application | `/images/visuals/solutions/process-gas.svg` | 900×600 | 3410 B |
| `supply-compressor-to-system` | infographic | `/images/visuals/solutions/supply-compressor-to-system.svg` | 1200×800 | 4199 B |
| `knowledge-five-parameters` | editorial | `/images/visuals/knowledge/knowledge-five-parameters.svg` | 900×600 | 3221 B |
| `knowledge-booster-source` | editorial | `/images/visuals/knowledge/knowledge-booster-source.svg` | 900×600 | 3904 B |
| `knowledge-multistage` | infographic | `/images/visuals/knowledge/knowledge-multistage.svg` | 900×600 | 8677 B |
| `knowledge-system-components` | infographic | `/images/visuals/knowledge/knowledge-system-components.svg` | 900×600 | 7627 B |
| `knowledge-sf6-life` | infographic | `/images/visuals/knowledge/knowledge-sf6-life.svg` | 900×600 | 3701 B |
| `knowledge-air-vs-nitrogen` | infographic | `/images/visuals/knowledge/knowledge-air-vs-nitrogen.svg` | 900×600 | 4533 B |
| `knowledge-nitrogen-selection` | editorial | `/images/visuals/knowledge/knowledge-nitrogen-selection.svg` | 900×600 | 3952 B |
| `knowledge-flow-conditions` | editorial | `/images/visuals/knowledge/knowledge-flow-conditions.svg` | 900×600 | 3018 B |
| `knowledge-pressure-reference` | editorial | `/images/visuals/knowledge/knowledge-pressure-reference.svg` | 900×600 | 2142 B |
| `knowledge-oil-free` | editorial | `/images/visuals/knowledge/knowledge-oil-free.svg` | 900×600 | 3802 B |
| `knowledge-compressor-booster` | editorial | `/images/visuals/knowledge/knowledge-compressor-booster.svg` | 900×600 | 4618 B |
| `knowledge-generator-pressure` | editorial | `/images/visuals/knowledge/knowledge-generator-pressure.svg` | 900×600 | 3876 B |
| `knowledge-duty-cycle` | editorial | `/images/visuals/knowledge/knowledge-duty-cycle.svg` | 900×600 | 1616 B |
| `knowledge-receiver` | editorial | `/images/visuals/knowledge/knowledge-receiver.svg` | 900×600 | 2200 B |
| `knowledge-cooling` | editorial | `/images/visuals/knowledge/knowledge-cooling.svg` | 900×600 | 2915 B |
| `knowledge-gas-properties` | editorial | `/images/visuals/knowledge/knowledge-gas-properties.svg` | 900×600 | 1774 B |
| `knowledge-co2-conditions` | editorial | `/images/visuals/knowledge/knowledge-co2-conditions.svg` | 900×600 | 4141 B |
| `knowledge-helium-recovery` | editorial | `/images/visuals/knowledge/knowledge-helium-recovery.svg` | 900×600 | 3638 B |
| `knowledge-task-specific` | editorial | `/images/visuals/knowledge/knowledge-task-specific.svg` | 900×600 | 3190 B |
| `knowledge-gas-mixtures` | editorial | `/images/visuals/knowledge/knowledge-gas-mixtures.svg` | 900×600 | 1955 B |
| `knowledge-detail-what-to-specify-for-gas-compressor` | process | `/images/visuals/knowledge/knowledge-detail-what-to-specify-for-gas-compressor.svg` | 900×600 | 2417 B |
| `knowledge-detail-why-process-gas-compressors-need-task-specific-selection` | process | `/images/visuals/knowledge/knowledge-detail-why-process-gas-compressors-need-task-specific-selection.svg` | 900×600 | 2447 B |
| `knowledge-detail-what-is-in-compressor-skid` | process | `/images/visuals/knowledge/knowledge-detail-what-is-in-compressor-skid.svg` | 900×600 | 3604 B |
| `knowledge-detail-sf6-compressor-service-life` | process | `/images/visuals/knowledge/knowledge-detail-sf6-compressor-service-life.svg` | 900×600 | 3713 B |
| `knowledge-detail-how-to-select-nitrogen-booster` | process | `/images/visuals/knowledge/knowledge-detail-how-to-select-nitrogen-booster.svg` | 900×600 | 3142 B |
| `knowledge-detail-compressors-for-gas-mixtures` | process | `/images/visuals/knowledge/knowledge-detail-compressors-for-gas-mixtures.svg` | 900×600 | 2418 B |
| `knowledge-detail-booster-vs-source` | process | `/images/visuals/knowledge/knowledge-detail-booster-vs-source.svg` | 900×600 | 1762 B |
| `knowledge-detail-how-working-point-is-calculated` | process | `/images/visuals/knowledge/knowledge-detail-how-working-point-is-calculated.svg` | 900×600 | 2686 B |
| `knowledge-detail-helium-recovery-principles` | process | `/images/visuals/knowledge/knowledge-detail-helium-recovery-principles.svg` | 900×600 | 3102 B |

Отдельные редактируемые process specs:

| PROCESS ID | LAYOUT | PURPOSE |
| --- | --- | --- |
| `process-home` | flow | От источника газа к потребителю |
| `process-five-parameters` | parameters | Пять исходных параметров для подбора |
| `process-selection` | parameters | Как подбирается оборудование |
| `process-nitrogen-after-generator` | flow | Дожатие азота после источника |
| `process-laser` | comparison | Два варианта газоснабжения лазера |
| `process-helium-recovery` | loop | Возврат гелия в процесс |
| `process-co2` | flow | Сжатие CO₂ с проверкой условий |
| `process-integration` | interfaces | Компрессор в границах вашей установки |
| `process-supply` | progression | От компрессора до комплектной системы |
| `supply-compressor-to-system` | progression | Компрессор → необходимые опции → комплектная система |
| `process-gas` | flow | От исходных условий к подаче газа |
| `process-buffer` | flow | Компрессор, накопление и потребление |
| `process-transfer` | flow | Перенос газа между объёмами |
| `process-multistage` | flow | Последовательное сжатие с охлаждением |

## E. Responsive и ручная visual QA

Проверены **1440 / 1280 / 1024 / 768 / 390**: Home, Equipment, N₂ compressor, N₂ booster, Solutions, N₂ after generator, Laser, Helium recovery, CO₂ equipment, Knowledge, статья о пяти параметрах. Все 55 сочетаний страницы/ширины проходят runtime checks без horizontal overflow, image errors и выхода CTA/process за экран. Просмотрены 10 контактных листов всех 55 fold screenshots и отдельные изображения/процессы в полном размере. Оборудование читается сразу, crop сохраняет основной объект, процессы и подписи остаются светлыми и крупными.

Новые browser checks проверяют декодирование изображения, реальный local URL, осмысленный alt, зарезервированные dimensions, светлый контейнер, отсутствие legacy dark figure, overflow и выход CTA/process за viewport. Static checks отдельно проверяют responsive `currentSrc` под `/compressor/`. Скриншоты и метрики сохранены в `.local/visual-v2/final/screenshots/`, просмотренные контактные листы — `.local/visual-v2/final/contact-sheets/`. На Home390×844 основное изображение начинается на y391 и имеет высоту232px, primary CTA находится на y766.6 с высотой54px; оба доступны в первом экране. Для этого мобильная композиция ставит изображение после H1, а supporting copy сохраняется ниже CTA.

## F. Performance

Сопоставимые замеры: Lighthouse 13.0.1, localhost production, mobile 390×844, DPR 1, `throttling-method=provided`, performance + accessibility. Это наблюдения локальной тестовой среды, а не production Core Web Vitals пользователей. Перед миграцией raster image payload равен нулю, потому что старые схемы были inline SVG; увеличение image bytes оценивается вместе с LCP/CLS и качеством новой подачи оборудования.

| PAGE | BEFORE PERFORMANCE | BEFORE LCP | BEFORE CLS | BEFORE TRANSFER | BEFORE IMAGE TRANSFER |
| --- | --- | --- | --- | --- | --- |
| Home | 100 | 177.2 ms | 0 | 197 306 B | 0 B |
| Equipment | 100 | 113.9 ms | 0 | 215 368 B | 0 B |
| N₂ booster | 100 | 117.0 ms | 0 | 213 641 B | 0 B |

Baseline reports: `.local/visual-v2/baseline/lighthouse/`. Итоговые показатели и сравнение будут заполнены после сборки. Lazy loading ниже первого экрана, явные aspect ratio/width/height и high fetch priority первого изображения проверяются отдельно; fake measurement не подставляется.

## G. Tests

| CHECK | STATUS |
| --- | --- |
| Source asset/metadata/content-reference integrity | PASS: 7/7 meaningful integrity tests, все 52 asset records разрешаются в реальные локальные файлы; dimensions сверены с WebP/SVG, content refs и optional process components проверены |
| Production build | PASS:86 prerender entries, обязательные source/output/editorial guards |
| Typecheck | PASS: npm run typecheck |
| Lint | PASS: npm run lint, без предупреждений |
| Unit tests | PASS:163 tests,8 files |
| Server browser acceptance | PASS:32/32 в полном локальном наборе; отдельная повторная проверка выбора размеров изображений перед публикацией |
| Static preview browser acceptance | PASS:23/23 в полном локальном наборе; отдельная повторная проверка responsive sources/basePath перед публикацией |
| Public-output/editorial guard | PASS:713 production files,734 isolated static files,554 export text files;89 HTML,0 нарушений,12 допустимых технических терминов |
| Published preview HTTPS check | Требует проверки после публикации |
