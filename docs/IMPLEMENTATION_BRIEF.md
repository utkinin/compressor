Даю Codex **одно большое задание на текущую ветку**. Его задача — не обсуждать архитектуру, а довести v1.1 до полноценного staging-сайта.

Работай **в текущей созданной ветке**. Не создавай новую ветку без необходимости.

# Цель

Довести существующий проект **Lanfor Gas Systems v1.1** из production-oriented scaffold до **реально работающего, визуально законченного B2B staging-сайта**, который можно показать инженеру, интегратору, технологу и закупщику и начать получать квалифицированные RFQ.

Это НЕ очередной этап спецификации.

Главный принцип:

> Не писать новую концепцию. Реализовать существующую.

Главный коммерческий тест:

> Может ли посетитель, пришедший с инженерной задачей, быстро понять компетенцию Lanfor, найти решение по своему газу/процессу и отправить квалифицированный запрос с Gas + P₁ + P₂ + Q + режимом работы?

---

# 0. Сначала изучи репозиторий

Перед изменением кода прочитай полностью:

- `AGENTS.md`
- `README.md`
- `docs/MASTER_SPEC.md`
- `docs/CODEX_PROMPT.md`
- `docs/AUDIT_AND_DECISIONS.md`
- `docs/CONTENT_MODEL.md`
- `docs/DATA_SOURCES.md`
- `docs/SEO_AI.md`
- `docs/ANALYTICS.md`
- `docs/LEGAL_PD_RU.md`
- `docs/IMAGE_PLAN.md`
- `docs/MIGRATION_FROM_SF6RUS.md`
- `docs/SEMANTIC_MATRIX.csv`
- текущий source code и content/data objects.

Считать эти документы источником продуктовых требований.

При противоречии приоритет:

1. `AGENTS.md`
2. `MASTER_SPEC.md`
3. `DATA_SOURCES.md`
4. `LEGAL_PD_RU.md`
5. `SEO_AI.md`
6. остальные документы.

Не возвращаться к старой концепции sf6rus.

---

# 1. Первый gate — проект обязан собираться

Выполни:

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
```

Если какой-либо script отсутствует — добавь разумный минимальный script.

Исправь все ошибки TypeScript, Next.js, React, ESLint и production build.

Не обходить ошибки через:

- `any`,
- массовые `eslint-disable`,
- `@ts-ignore`,
- отключение проверок,
- `skipLibCheck` как способ спрятать собственные ошибки,
- удаление функциональности.

После завершения все доступные проверки должны проходить.

---

# 2. Не менять позиционирование

Главный продукт:

**Oil-Free compression / boosting / recovery / compressor skid systems for process gases.**

Основная формула:

> **Сжимаем технологический газ под рабочую точку процесса.**

Допустимая расширенная формулировка:

> Безмасляные компрессоры, бустеры и функциональные модули для N₂, He, H₂, O₂, CO₂ и специальных газов — от отдельного компрессора до skid-системы с охлаждением, КИП, обвязкой и автоматикой.

Мы НЕ строим:

- магазин компрессоров;
- агрегатор оборудования;
- каталог китайских моделей;
- сайт «всё для всех газов»;
- продолжение sf6rus;
- общий сайт промышленного воздуха;
- маркетплейс.

Продукт Lanfor:

> **подобранный функциональный компрессорный узел под рабочую точку процесса.**

---

# 3. Целевая аудитория

Главный сценарий проектировать под:

- интегратора;
- изготовителя оборудования;
- проектировщика;
- технолога;
- главного механика;
- инженера;
- службу эксплуатации;
- промышленного закупщика.

Интерфейс должен одинаково хорошо отвечать на два вопроса:

### Инженер:
> Подойдёт ли это технически?

### Закупщик:
> Что входит в поставку, какие документы есть, какой следующий шаг?

---

# 4. Полностью закончить информационную архитектуру

Обязательные разделы:

```text
/
├── solutions/
├── gases/
├── equipment/
├── industries/
├── engineering/
├── knowledge/
├── cases/
├── documents/
├── rfq/
├── about/
├── contacts/
└── legal/
```

Не создавать пустые SEO-страницы.

Каждая опубликованная страница должна иметь собственную полезность.

---

# 5. Главная страница

Сделать визуально и коммерчески законченной.

## Первый экран

Надзаголовок:

`PROCESS GAS · OIL-FREE · BOOSTING · SKID`

H1:

**Сжимаем технологический газ под рабочую точку процесса**

Подзаголовок должен объяснять:

- Oil-Free;
- компрессор / booster / skid;
- подбор под Gas + P₁ + P₂ + Q;
- интеграцию в существующий процесс.

CTA №1:

**Подобрать решение**

CTA №2:

**Смотреть типовые задачи**

Справа должна быть собственная инженерная визуализация:

```text
Источник газа
↓
P₁
↓
Oil-Free compressor / booster
↓
охлаждение
↓
буфер / ресивер
↓
P₂ / Q
↓
технологический процесс
```

Не использовать абстрактные stock-фото заводов как главный визуал.

---

# 6. Структура главной после hero

Сделать блоки:

1. **Начните с рабочей точки**
   - Gas
   - P₁
   - P₂
   - Q
   - режим

2. **Типовые задачи**
   - дожатие после генератора азота;
   - повышение давления технологического газа;
   - подача газа в оборудование;
   - возврат / recovery газа;
   - заполнение буфера / ресивера;
   - Встраивание компрессора;
   - skid-система;
   - специальные процессы.

3. **Газы**

4. **Типы оборудования**

5. **Как выглядит инженерный подбор**

6. **Что может входить в skid**

7. **Отрасли / применения**

8. **Документы и инженерные материалы**

9. **Кейсы / типовые рабочие точки**

10. **Knowledge / инженерные ответы**

11. финальный RFQ CTA.

---

# 7. Газы

Публичное ядро:

- N₂
- He
- H₂
- O₂
- CO₂
- process gas / gas mixtures

**SF₆ не выводить как публичное направление этого сайта.**

SF₆ может существовать только:

- в source provenance;
- в исходном каталоге;
- во внутренних данных;
- в migration notes.

Не строить новый сайт вокруг элегаза.

---

# 8. Для каждого газа сделать полноценную страницу

Структура:

1. что обычно требуется от компрессии этого газа;
2. какие задачи решаем;
3. какие исходные данные нужны;
4. технологические особенности;
5. ограничения;
6. типовые схемы;
7. связанные solution pages;
8. подходящие equipment families;
9. FAQ;
10. RFQ CTA.

Например для N₂:

- после PSA / membrane generator;
- из магистрали;
- из cryogenic source;
- буферизация;
- laser cutting;
- pressure stabilization;
- Equipment manufacturers.

Для He:

- compression;
- recovery;
- leak-sensitive systems;
- balloon / testing / manufacturing, если технически подтверждено.

Для H₂:

- обязательно учитывать состав газа;
- suction pressure;
- discharge pressure;
- Ex-zone;
- материалы;
- leakage requirements;
- cooling.

Для O₂:

- oxygen-compatible design;
- cleanliness;
- обезжиривание;
- материалы;
- отсутствие неподтверждённых обещаний.

Для CO₂:

- inlet temperature;
- pressure;
- gas phase / возможная двухфазность;
- cooling;
- нельзя упрощать подбор только до P₁/P₂/Q.

---

# 9. Solutions — страницы по реальному intent

Создать качественные solution pages минимум для:

- nitrogen booster after generator;
- nitrogen pressure boosting;
- nitrogen for laser cutting;
- helium compression;
- helium recovery;
- hydrogen compression;
- CO₂ compression;
- oxygen compression;
- process gas compressor;
- oil-free gas booster;
- compressor skid;
- Gas compressor for equipment integration;
- gas transfer / gas recovery;
- buffer / receiver charging.

Не делать doorway pages.

Страница должна отвечать на конкретную инженерную задачу.

---

# 10. Equipment

Не превращать каталог в набор SKU.

Архитектура:

```text
Equipment
→ Oil-Free reciprocating compressors
→ Gas boosters
→ Compressor modules
→ Compressor skids
→ Recovery systems
```

Семейства компрессоров показывать как **family envelope**.

Для каждого семейства:

- назначение;
- source;
- source page;
- technology;
- max source envelope;
- cooling;
- drive;
- motor range;
- leakage, только если подтверждено;
- applicable gases, только по источнику;
- status;
- disclaimer.

Обязательный текст по смыслу:

> Каталожный диапазон семейства не является гарантированной рабочей точкой. Подбор выполняется с учётом газа, давления на входе, давления нагнетания, расхода, температуры и режима работы.

---

# 11. Категории достоверности данных

Соблюдать статусы:

```text
engineering-verified
source-transcribed
draft
```

## `engineering-verified`

Можно показывать как подтверждённую характеристику.

## `source-transcribed`

Можно показывать как значение производителя с provenance.

## `draft`

Не выдавать как подтверждённую характеристику.

Нельзя превращать `draft` в факт только потому, что число выглядит правдоподобно.

---

# 12. N2-B

Пока нет паспорта / утверждённого расчётного листа:

**не считать N2-B verified SKU.**

Можно использовать как:

- solution concept;
- Lanfor engineering family;
- пример конфигурации;

но не придумывать точную характеристику, которой нет в источнике.

---

# 13. Сделать нормальный конфигуратор / RFQ

Основной flow:

### Step 1 — Газ
- N₂
- He
- H₂
- O₂
- CO₂
- смесь / другой

### Step 2 — Давление на входе P₁

Поддержать:

- bar(g)
- bar(a)
- MPa
- при необходимости другое

Не смешивать gauge / absolute.

### Step 3 — Давление на выходе P₂

То же.

### Step 4 — Производительность Q

Поддержать:

- Nm³/h
- m³/h
- l/min
- kg/h при применимости

Обязательно явно хранить единицу.

### Step 5 — режим

Например:

- continuous 24/7;
- intermittent;
- duty cycle;
- пиковая нагрузка;
- неизвестно.

---

# 14. Динамические вопросы RFQ

## N₂

Уточнить:

- источник газа;
- purity;
- min/max inlet pressure;
- peak vs average flow.

## H₂

Уточнить:

- состав / purity;
- Ex requirements;
- hazardous area;
- leakage requirements;
- temperature.

## He

Уточнить:

- new gas / recovery;
- inlet pressure;
- desired recovery scheme;
- leakage sensitivity.

## O₂

Уточнить:

- purity;
- oxygen compatibility;
- cleanliness requirements.

## CO₂

Уточнить:

- inlet temperature;
- inlet pressure;
- gas / liquid / uncertain;
- expected operating range.

## Смесь

Уточнить composition.

---

# 15. Результат RFQ

Не делать fake auto-selection вида:

> Вам подходит модель X.

Если расчёт не выполнен.

Правильный результат:

> По введённой рабочей точке определён предварительный класс решения.

Показать:

- Gas;
- P₁;
- P₂;
- Q;
- режим;
- уточняющие параметры;
- предположительный тип оборудования;
- что инженер проверит следующим шагом.

CTA:

**Передать рабочую точку инженеру**

---

# 16. API RFQ

Довести `/api/rfq` до рабочего production-oriented состояния.

Требования:

- server-side validation;
- idempotency key;
- anti-spam;
- rate limit;
- retry;
- webhook abstraction;
- fallback delivery;
- structured payload;
- source page;
- UTM;
- referrer;
- landing page;
- timestamp;
- consent version.

Не писать PII в browser analytics.

Не писать полный RFQ с персональными данными в console/log без необходимости.

---

# 17. CRM

Сделать адаптер.

Не привязывать всю бизнес-логику сайта к конкретной CRM.

Интерфейс:

```ts
sendRfqToCrm(rfq)
```

Настройка через environment variables.

Если CRM endpoint не задан:

- development — сохранять безопасно локально / mock;
- production — fail closed либо documented fallback.

Не терять заявку молча.

---

# 18. 152-ФЗ

Реализовать требования из `LEGAL_PD_RU.md`.

Обязательно:

- отдельный consent checkbox;
- checkbox не отмечен заранее;
- ссылка на политику;
- ссылка на текст согласия;
- версия согласия;
- timestamp;
- отдельные legal pages.

Не смешивать согласие ПДн с рекламными рассылками.

Маркетинговое согласие, если появится, только отдельным checkbox.

---

# 19. Аналитика

Подготовить adapters:

- Яндекс Метрика;
- GA4.

Но не ломать сайт при отсутствии ID.

События минимум:

```text
hero_rfq_click
rfq_start
rfq_step_complete
rfq_validation_error
rfq_submit
rfq_success
rfq_fail

solution_view
gas_view
equipment_view

document_view
document_download
cad_request

contact_click
email_click
phone_click
```

Главные KPI:

- Qualified RFQ / month;
- Landing → RFQ start;
- RFQ start → submit;
- solution → RFQ;
- gas page → RFQ;
- document → RFQ;
- source/query → SQL;
- SQL → quotation.

Не оптимизировать сайт под vanity traffic.

---

# 20. Entity graph

Не использовать пользовательские хэштеги.

Внутренний граф:

```text
Gas
→ Task
→ WorkingPoint
→ EquipmentFamily
→ Application
→ Industry
→ Document
→ Case
→ KnowledgeArticle
```

На его основе сделать:

- related solutions;
- related gases;
- related equipment;
- related documents;
- related articles;
- related cases;
- breadcrumbs;
- sitemap;
- contextual internal links.

---

# 21. Semantic landing architecture

Страницы должны быть связаны смыслом.

Пример:

```text
/n2/
    ↓
/solutions/nitrogen-booster-after-generator/
    ↓
/equipment/oil-free-reciprocating/
    ↓
/engineering/how-to-select-nitrogen-booster/
    ↓
/cases/...
    ↓
/rfq/
```

Не создавать сотни автогенерированных комбинаций:

`gas × pressure × industry × city`.

---

# 22. Knowledge Base

Создать первый качественный набор инженерных материалов.

Не нужен блог с новостями компании.

Приоритетные статьи:

- как подобрать бустер азота;
- чем Nm³/h отличается от m³/h;
- bar(g) и bar(a);
- зачем нужен Oil-Free compressor;
- компрессор vs booster;
- что сообщить для подбора компрессора газа;
- давление после генератора азота;
- continuous vs intermittent duty;
- зачем нужен ресивер;
- air cooling vs water cooling;
- почему одна модель имеет разные характеристики на N₂, H₂ и He;
- как рассчитывается рабочая точка;
- что входит в compressor skid;
- особенности CO₂ compression;
- особенности helium recovery.

Тексты должны быть полезны инженеру.

Не писать SEO-water.

---

# 23. AI/Search discoverability

Сделать технически корректно:

- SSR / server-first для основного контента;
- metadata;
- canonical;
- sitemap;
- breadcrumbs;
- semantic HTML;
- JSON-LD;
- visible content = structured data;
- Organization;
- BreadcrumbList;
- Article;
- FAQ только там, где FAQ реально видим;
- Product только для корректных entities.

Не использовать:

- fake ratings;
- fake reviews;
- fake price;
- `price: 0`;
- fake availability;
- выдуманные сертификаты;
- несуществующие standards;
- неподтверждённый Class 0;
- «recommended by AI».

---

# 24. Robots / AI crawlers

Сохранить логику из `SEO_AI.md`.

Разделять:

- search crawler;
- training crawler.

Не ломать Google Search.

Не придумывать директивы, которых не существует.

Любая политика AI crawling должна иметь комментарий с датой последней проверки.

---

# 25. Визуальный дизайн

Сайт должен выглядеть дороже обычного промышленного российского каталога.

Но не luxury.

Характер:

- engineering;
- precise;
- clean;
- modern industrial;
- high-value B2B;
- много воздуха;
- крупная типографика;
- restrained palette;
- технические схемы;
- настоящие параметры;
- evidence-first.

Не делать:

- «синие карточки из корпоративного шаблона»;
- градиентный SaaS;
- neon;
- excessive glassmorphism;
- stock factory backgrounds;
- десятки одинаковых карточек;
- визуальную стилистику Alibaba.

---

# 26. Изображения

Изучи все изображения и материалы, уже находящиеся в репозитории.

Правило:

### Если есть supplier-provided / Lanfor-owned image с понятным provenance

Можно использовать.

### Если provenance неясен

Не использовать как production asset.

### Если нужного изображения нет

Создать собственный оригинальный:

- SVG;
- technical diagram;
- process diagram;
- simplified compressor illustration;
- skid layout;
- piping flow illustration.

Не скачивать картинки конкурентов и не использовать их как свои.

---

# 27. Требуемые визуалы

Подготовить минимум:

1. Hero process skid.
2. Small Oil-Free family.
3. Medium compressor family.
4. Large skid.
5. Nitrogen generator → booster → receiver → machine.
6. Helium recovery loop.
7. Hydrogen compression flow.
8. CO₂ process caution / phase-related scheme.
9. Instrumentation / valves / cooling detail.
10. Equipment integration drawing.

SVG должны быть responsive и визуально единообразны.

---

# 28. Industries

Создать только там, где есть логическая связь с продуктом.

Приоритет:

- machine building;
- laser cutting;
- electronics / semiconductor support processes;
- chemical / petrochemical;
- gas production / gas generation;
- industrial gas;
- energy;
- test benches;
- research / laboratory;
- Equipment manufacturers;
- hydrogen systems;
- helium recovery;
- special process plants.

Не утверждать применение, если оно технически не подтверждено.

---

# 29. Cases

Сделать entity и page template.

Если реальных опубликованных кейсов пока недостаточно:

использовать формат:

> **Типовая инженерная задача**

а не выдавать её за реализованный объект.

Явно разделять:

- Real project;
- Reference working point;
- Typical engineering scenario.

Никаких вымышленных заказчиков.

---

# 30. Documents

Сделать полноценный documents hub.

Типы:

- Datasheet;
- Catalogue;
- Manual;
- Drawing;
- CAD;
- STEP;
- Questionnaire;
- Certificate;
- Calculation sheet.

Access level:

```text
public
request
internal
```

Для `request`:

**Запросить документ**

а не fake download.

---

# 31. Procurement layer

На product/solution pages добавить короткий блок для закупщика:

- что можно включить в поставку;
- варианты исполнения;
- документация;
- гарантия — только если подтверждена;
- срок — не выдумывать;
- страна происхождения / производитель — если корректно;
- возможность встраивания компрессора;
- CAD / drawings;
- запрос КП.

Это должно уменьшать число тупиковых запросов.

---

# 32. Контент

Все основные страницы наполнить нормальным русским текстом.

Не оставлять:

- lorem ipsum;
- TODO;
- placeholder text;
- пустые cards;
- `/coming-soon`;
- AI filler.

Если факт нельзя подтвердить:

не придумывать.

Написать полезный текст вокруг подтверждённых данных.

---

# 33. Русский язык

Основной сайт — русский.

Английские термины оставлять там, где они являются промышленными:

- Oil-Free;
- booster;
- skid;
- process gas;
- working point.

Но не превращать русский интерфейс в смесь из случайного английского.

---

# 34. Мобильная версия

Обязательная browser acceptance:

- 360 px
- 390 px
- 768 px
- 1440 px

Проверить минимум:

- home;
- solution;
- gas;
- equipment;
- knowledge;
- RFQ.

Не должно быть:

- horizontal overflow;
- сломанной таблицы;
- слишком мелкого текста;
- кнопок вне viewport;
- sticky элементов, закрывающих форму.

---

# 35. Accessibility

Минимум:

- semantic headings;
- labels;
- keyboard navigation;
- visible focus;
- sufficient contrast;
- alt;
- aria только где действительно требуется;
- reduced-motion support.

RFQ должен полностью работать с клавиатуры.

---

# 36. Performance

Цель:

- минимальный client JS;
- server components по умолчанию;
- image optimization;
- lazy loading ниже fold;
- no unnecessary animation libs;
- no heavy UI framework без необходимости.

Не подключать dependency ради одного компонента.

---

# 37. Security

Проверить:

- input validation;
- output encoding;
- injection;
- rate limiting;
- bot spam;
- unsafe redirects;
- secrets;
- webhook secrets;
- CSP/headers где разумно;
- PII logging.

Не коммитить `.env`.

Добавить `.env.example`.

---

# 38. Tests

Добавить / закончить тесты минимум на:

### RFQ
- valid submission;
- invalid Gas;
- invalid pressure;
- P₂ ≤ P₁;
- unsupported unit;
- dynamic gas questions;
- missing consent;
- duplicate idempotency key.

### Content
- draft property not emitted as verified;
- source provenance displayed;
- SF₆ absent from public gas navigation.

### SEO
- canonical;
- sitemap;
- robots;
- JSON-LD;
- no fake Offer;
- no `price: 0`.

### UI
- core routes return 200;
- RFQ flow completes.

---

# 39. Не строить сейчас

Не реализовывать без реальной необходимости:

- blockchain audit log;
- hash chain;
- NLI verification every sentence;
- complex RFC workflow;
- gigantic competitor database;
- automatic AI publishing;
- automatic generated 1000 SEO pages;
- microservices;
- Kubernetes;
- headless CMS только ради headless CMS.

Сначала рабочий продающий сайт.

---

# 40. CMS / data architecture

Если существующая архитектура уже предусматривает Repository interface — довести её до рабочего состояния.

Контентный слой должен позволять позднее подключить CMS без переписывания страниц.

Но если Directus/Postgres сейчас не нужен для запуска staging:

не превращать его внедрение в многодневный инфраструктурный блокер.

Главное:

- typed content;
- normalized entities;
- source provenance;
- editorial state;
- easy migration.

---

# 41. Editorial state

Для содержимого:

```text
draft
review
approved
published
```

Автоматическая генерация ИИ никогда не должна сразу давать `published`.

---

# 42. Финальная QA-проверка

Перед завершением задачи самостоятельно пройти сайт как:

1. инженер;
2. технолог;
3. интегратор оборудования;
4. закупщик;
5. поисковый crawler;
6. AI-search parser;
7. мобильный пользователь.

Найденные очевидные проблемы исправить.

Не просто перечислять их в отчёте.

---

# 43. Финальный build gate

Повторить:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Все должны пройти.

Если есть Playwright/browser tests — также прогнать.

---

# 44. Что коммитить

Коммиты делать логическими блоками.

Например:

1. `fix: make baseline build pass`
2. `feat: complete entity and content architecture`
3. `feat: build qualified process gas rfq`
4. `feat: complete solution gas and equipment pages`
5. `feat: add technical visuals and document hub`
6. `feat: add analytics seo and legal wiring`
7. `test: add production acceptance coverage`
8. `docs: add staging handoff report`

Не делать один огромный неразборчивый commit, если работа позволяет разделить.

---

# 45. Итоговый отчёт

Создать:

`docs/STAGING_HANDOFF.md`

В нём указать:

## Реализовано

Конкретно.

## Проверено

Команды и результаты.

## Routes

Список ключевых страниц.

## RFQ

Как работает.

## Data provenance

Какие технические данные:

- verified;
- source-transcribed;
- draft.

## Environment

Все нужные ENV variables.

## Integrations

Что реально подключено и что только adapter.

## Legal

Что реализовано технически.

## Images

Источник каждого production visual.

## Known limitations

Только реальные остаточные ограничения.

## Next actions

Только то, что объективно требует:

- доступа;
- реального CRM endpoint;
- production credentials;
- утверждения владельцем;
- новых исходных технических документов.

---

# 46. Definition of Done

Задача выполнена только когда:

- production build проходит;
- сайт визуально закончен;
- отсутствуют пустые важные разделы;
- RFQ полностью проходит;
- газовые branches работают;
- legal consent работает;
- основные solution pages готовы;
- основные gas pages готовы;
- equipment pages готовы;
- документы имеют нормальную модель;
- semantic internal linking работает;
- sitemap/robots/metadata/JSON-LD корректны;
- нет публичного SF₆-направления;
- нет неподтверждённых технических обещаний;
- нет украденных изображений;
- мобильная версия проверена;
- тесты проходят;
- `STAGING_HANDOFF.md` создан.

---

# 47. Правило самостоятельности

Не останавливай работу ради мелких уточнений.

Если информации недостаточно:

1. сначала ищи её в репозитории;
2. затем в source documents;
3. если подтверждения нет — не придумывай;
4. реализуй безопасный `draft/source-transcribed` вариант;
5. внеси точный unresolved item в `STAGING_HANDOFF.md`.

Главная задача — **максимально довести сайт самостоятельно в рамках текущей ветки**.

Не заканчивать ответом «вот что нужно сделать».

**Сделать.**

Это именно то задание, которое я бы сейчас запускал на ветке: **сначала добиться зелёной сборки, затем довести весь пользовательский путь до работающего staging и только после этого отчитываться**.