# Lanfor Gas Systems v1.1 — staging handoff

Актуальный последующий проход: [EDITORIAL_TECHNICAL_REPORT](EDITORIAL_TECHNICAL_REPORT.md). Он обновляет коммерческий язык, приоритет газов и правила публичной проекции; записи ниже описывают исходную передачу версии.

22 октября 2026 года. Работа выполнена в существующей ветке `work`, без новой рабочей ветки/worktree. Первоначально checkout был пуст; переданный позднее оригинальный scaffold сверён и сохранён. Полная сверка: [SOURCE_RECONCILIATION](SOURCE_RECONCILIATION.md).

## Реализовано

- Русский SSR-сайт: главная, решения, газы, оборудование, отрасли, инжиниринг, knowledge, типовые сценарии, документы, RFQ, подход Lanfor, контакты и отдельные legal pages.
- 6 газов, 14 решений, 5 инженерных категорий и 5 исходных manufacturer families UNIGY, 16 статей, 11 отраслей, 3 типовых сценария, 9 типов документов. Публичный опросник существует как реальный TXT; остальные документы запрашиваются, без fake download.
- Главная со всеми одиннадцатью блоками, инженерным hero и RFQ CTA. Десять собственных адаптивных SVG-схем, доступное мобильное меню, видимый focus и reduced motion.
- Типизированный normalized content repository; отдельный ProductGasSpec контракт; editorial states; семантические связи и закупочные блоки. Данные из original seed сохранены с исходным статусом.
- Полный пятишаговый RFQ с газовыми вопросами, явными единицами/базами давления и предварительным классом решения. Конкретная модель автоматически не обещается.
- Серверный API с валидацией, durable idempotency/outbox, retry/fallback adapters, honeypot, rate limit, bounded body, Origin check, private files, server consent timestamp и отсутствием PII в logs.
- Metadata/canonical/sitemap/robots, видимые breadcrumbs, Article/FAQ и минимальные ProductGroup для реальных family identities. Нет вымышленных Offer, цен, отзывов и availability. Девять старых URL имеют конечные canonical переходы.
- Отдельный GitHub Pages export под `/compressor`, browser-only demo RFQ, .nojekyll/404, приватные конфигурации и API исключены. Подготовлен штатный Pages workflow.

## Проверено

| Проверка | Фактический результат |
| --- | --- |
| npm install / последующий npm ci | Зависимости установлены из npm с проверкой lockfile integrity, без отключения TLS |
| npm run typecheck | Успешно; strict TypeScript, skipLibCheck=false |
| npm run lint | Успешно, 0 warnings |
| npm test | 62 passed, 0 failed, 0 skipped, 4 файла |
| npm run build | Успешная production-сборка; 97 prerender outputs и динамические API/RFQ/legal/contacts |
| npm run test:e2e | 20 passed, 0 failed, 0 skipped; production server, системный Chromium |
| npm run preview:build | Успешный независимый export: 100 HTML-файлов, 102 prerender outputs с metadata routes |
| npm run preview:test | 15 passed, 0 failed, 0 skipped; 132 URL страниц/ссылок/ассетов проверены локально, все HTTP200 |
| GitHub Actions run 39778491521 | completed/success: обе сборки,62 unit,20 server browser,15 static browser и deploy |
| python3 scripts/verify-public-preview.py | Внешний сайт:100 HTML/133 HTTPS URL, все 200, H1/canonical соответствуют export |
| Публичный Chromium через HTTPS | Desktop home1440/mobile RFQ390, CO₂ prefill, validation/consent/full demo;0POST/API/PII/storage/cookies/errors |
| bash scripts/setup.sh, повторный запуск | Успешно; существующий .env.local побайтно сохранён |
| npm run rfq:outbox | Успешная безопасная staging-сводка без отправки и без payload в logs |
| npm audit --omit=dev | 0 vulnerabilities |
| npm audit | 5 high dev-only записей одной upstream цепочки braces; подробности ниже |

Browser acceptance проверяет 360/390/768/1440 px, основные разделы и family page, отсутствие overflow/runtime errors/битых ассетов, keyboard navigation, шесть газовых branches, P₂≤P₁, отдельное согласие и фактическую staging-отправку. Проверены sitemap, canonical, JSON-LD, provenance, отсутствие публичного SF₆-направления и неизвестные 404.

Static acceptance дополнительно проверяет все 100 HTML, basePath, девять aliases и реальные browser-переходы, документы, demo RFQ без API/POST/утечки контактов в URL или browser storage, отсутствие cookies/analytics, сброс demo после reload, запрет traversal и приватных/API путей.

Analytics privacy проверена с перехваченными SDK в настоящем sandbox iframe: parent URL/form недоступны, referrer пуст, whitelist очищает поля и query. Настоящие vendor counters без выданных ID не тестировались. Скриншоты: `.local/screenshots/` и `.local/screenshots/preview/`; desktop/mobile просмотрены.

## Routes

Основные hubs: `/`, `/solutions/`, `/gases/`, `/equipment/`, `/industries/`, `/engineering/`, `/knowledge/`, `/cases/`, `/documents/`, `/rfq/`, `/about/`, `/contacts/`, `/legal/`.

Ключевые сценарии:

- `/solutions/nitrogen-booster-after-generator/`
- `/solutions/nitrogen-for-laser-cutting/`
- `/solutions/helium-recovery/`
- `/solutions/hydrogen-compression/`
- `/solutions/oxygen-compression/`
- `/solutions/co2-compression/`
- `/solutions/compressor-skid/`
- `/gases/nitrogen/`, `/gases/helium/`, `/gases/hydrogen/`, `/gases/oxygen/`, `/gases/carbon-dioxide/`, `/gases/process-gas/`
- `/equipment/oil-free-reciprocating/`, `/equipment/of2-of8-dp/`, `/equipment/of2-of8-dz/`, `/equipment/of8-of30-dp/`, `/equipment/of30-of500-dp/`, `/equipment/of60-of200-dp/`
- `/knowledge/normal-and-actual-flow/`, `/knowledge/bar-g-and-bar-a/`, `/knowledge/booster-vs-source/`
- `/engineering/working-point-checklist/`, `/documents/process-gas-questionnaire/`
- `/legal/privacy/`, `/legal/consent/`, `/legal/cookies/`

Полная реализованная матрица: IMPLEMENTED_SEMANTIC_MATRIX.csv. Исходная матрица не перезаписана генератором и остаётся SEMANTIC_MATRIX.csv. В Pages каждый адрес получает `/compressor` prefix; Next Link, native downloads, canonical и schema согласованы.

## RFQ

Gas → P₁ → P₂ → Q → режим → review → контакты и отдельный consent. MPa требует явной базы, bar(g) и bar(a) не смешиваются; сравнение предварительно приводится к абсолютному давлению с обозначенным атмосферным допущением. P₂ — на выходе узла, потери до потребителя уточняются отдельно. Расход хранится вместе с единицей и reference conditions; массовый расход не пересчитывается без расчёта.

POST /api/rfq требует JSON и Idempotency-Key. Сервер добавляет id/receivedAt/consentRecordedAt/версию согласия, сохраняет запись атомарно до доставки, не возвращает контактные данные. Повтор с тем же ключом/данными сохраняет ID; иной payload с тем же ключом получает конфликт. Удалённый получатель обязан дедуплицировать стабильный envelope.id/Idempotency-Key — доставка at least once.

HTTPS CRM adapter делает до трёх попыток с timeout/backoff, поддерживает отдельный fallback endpoint и явно включаемую локальную очередь. Redirects запрещены. Ошибка доставки не изображается успехом. Worker: `NODE_ENV=production npm run rfq:outbox`; live scheduler отдельно настраивает владелец хостинга.

В текущем серверном staging заявки с вымышленными данными сохраняются локально под .local/rfq, без внешней доставки. В GitHub Pages нет API и сохранения вообще: тот же flow заканчивается честным DEMO-результатом в памяти страницы. Эти результаты не называются отправкой инженеру.

## Data provenance

Engineering-verified характеристик оборудования: **0**. Source-transcribed с доступным документом/страницей: **0**. Исходных UNIGY draft-семейств: **5**. Raw seed побайтно сохранён внутренне; SHA-256 исходного products.ts проверяется тестом. Каталожный PDF не получен, из seed не сделаны подтверждённые working points или универсальная совместимость.

На public family pages — HTML provenance/status table без неподтверждённых числовых envelopes. N2-B остаётся concept draft, не verified SKU. Три случая — Typical engineering scenario, без вымышленных заказчиков. Новые AI-материалы review, не published. Публичная индексация выключена.

## Environment

Полный безопасный пример — .env.example. Реальные значения не входят в Git/preview.

| ENV | Назначение |
| --- | --- |
| RFQ_STAGING_MODE | true принудительно включает локальную демонстрацию даже при production build |
| RFQ_STORE_DIR | Приватный постоянный каталог вне public; текущий .local/rfq |
| RFQ_RETENTION_DAYS | Очистка доставленных/staging копий, по умолчанию 30, пределы 1–90 |
| RFQ_ENABLED / RFQ_LEGAL_APPROVED | Явное разрешение live и подтверждение владельцем правовых условий |
| LEGAL_OPERATOR_NAME / LEGAL_OPERATOR_CONTACT | Утверждённые оператор и канал обращений субъекта |
| RFQ_CRM_ENDPOINT / RFQ_CRM_SECRET | Server-only HTTPS CRM и её credential |
| RFQ_FALLBACK_ENDPOINT / RFQ_FALLBACK_SECRET | Дополнительная HTTPS доставка |
| RFQ_ALLOW_LOCAL_FALLBACK | Явное принятие в durable outbox при сбое внешней доставки |
| RFQ_TRUST_PROXY | Только за proxy, перезаписывающим X-Forwarded-For; иначе общий лимит 20/10min |
| SITE_URL | Канонический origin; для live HTTPS обязателен. NEXT_PUBLIC_SITE_URL поддержан как legacy alias |
| SEO_INDEXABLE | false на staging/preview; включать только после утверждения контента и реального домена |
| CONTACT_EMAIL / CONTACT_PHONE | Публикуемые контакты после утверждения владельцем |
| NEXT_PUBLIC_GA4_ID / NEXT_PUBLIC_YANDEX_METRIKA_ID | Пусто = нет внешних SDK; иначе отдельный visitor opt-in |
| NEXT_TELEMETRY_DISABLED | 1 при сборке/запуске в подготовленной среде |
| PLAYWRIGHT_CHROMIUM_PATH | Путь Chromium, здесь /usr/bin/chromium |
| PREVIEW_BASE_PATH / PREVIEW_SITE_ORIGIN | Overrides для сборщика preview, defaults /compressor и https://utkinin.github.io |
| LANFOR_STATIC_PREVIEW / NEXT_PUBLIC_BASE_PATH | Внутренние build flags, задаются изолированным preview script |

В черновике облачной среды сохранены tested install_script и start_skill. Инструкции используют текущий checkout, не создают worktree и учитывают перезапуск процессов. Дополнительно сохранены api.github.com и utkinin.github.io, не заменяя package-manager presets. Это не означает применения сетевой политики или публикации.

## Integrations

Реально работают: локальный content repository, Next SSR/SSG, private filesystem storage, rate limit/idempotency, локальный staging RFQ, browser-only preview, worker в безопасном режиме, unit/browser checks. CRM/fallback transport проверен тестовыми ответами и сбоями; реальная CRM не подключена. CMS/Directus/Postgres не нужны для staging и не внедрялись.

GA4/Яндекс adapters подготовлены и изолированы от parent document; ID отсутствуют, внешняя аналитика не включена. Реальная атрибуция обращения в серверном варианте сохраняет landing/source/UTM/referrer без добавления PII в события.

Публичное превью размещено: **https://utkinin.github.io/compressor/**. Владелец включил Source=GitHub Actions, после чего [run 39778491521](https://github.com/utkinin/compressor/actions/runs/39778491521) для source `879bc623f78f276683a4274f5b629e10f0d8022e` завершился completed/success, включая build/все проверки/deploy. Проверены100 HTML и133 обычных внешних HTTPSURL: все 200, H1/canonical соответствуют проверенному export. Исходный сбой Configure Pages устранён настройкой владельца; повторной настройки не требуется. Код и последующие отчёты сохранены в origin/work. См. PREVIEW.md.

## Legal

Отдельные policy/consent/cookies страницы, checkbox без предварительной отметки, две ссылки, обязательность и версия согласия на сервере, timestamp, без рекламной подписки. Live закрыт без юридической и delivery-конфигурации. Это техническая реализация, не юридическое заключение о 152-ФЗ.

Private directories/files 0700/0600, без PII в console/analytics. Доставленные/staging копии удаляются по retention при приёме/worker; недоставленные не удаляются молча. Оператор отдельно определяет обработку зависшей очереди и retention в CRM. Место первичной записи/backup, обработчики, документы и сроки до live утверждаются владельцем. Preview legal корректно описывает browser-only режим, без ложного серверного хранения согласия.

## Images

Все visuals собственные: src/components/technical-diagram.tsx (hero/small/medium/large/nitrogen/helium/hydrogen/co2/instrumentation/oem), геометрический знак Lanfor и icon.svg. Нет supplier/конкурентских фото и вымышленных изображений поставленного объекта. Исходный ZIP не содержит пригодных production photos; только images/README. Схемы являются иллюстрациями, не монтажными чертежами или P&ID.

## Known limitations

- GitHub Pages — статический просмотр. Он не обрабатывает реальные RFQ; серверный вариант подготовлен отдельно. Публикация и внешний HTTPS подтверждены.
- Нет утверждённых supplier PDF, расчётов, реальных кейсов и документов исполнения. Статусы не повышались.
- Нет production CRM endpoint, approved operator details и подтверждения локализации хостинга. Реальная доставка/обработка не выдаётся за выполненную.
- Файловый адаптер рассчитан на один persistent shared volume; независимые эфемерные диски/serverless требуют другого store. CRM receiver должен дедуплицировать стабильный ID. Горизонт idempotency зависит от retention доставленных копий.
- Планировщик outbox/retention на реальном хостинге и мониторинг очереди — операция размещения. Недоставленная очередь требует внимания оператора.
- Полный npm audit показывает 5 high dev-only записей одной цепочки Next ESLint plugin → fast-glob → micromatch → braces, GHSA-vfj7-8cjw-p6xm. Последние доступные plugin16.4.2/braces3.0.3 не имеют исправленного релиза; предложенное force downgrade до Next ESLint14 не применялось. Runtime audit чист. Не обрабатывайте недоверенные glob patterns этим lint tooling до upstream исправления.
- Реальные GA/Метрика counters не тестировались без ID; Lighthouse score не заявляется без измерения.

## Next actions

1. Для сохранения подготовленной облачной машины просмотреть и сохранить черновик в настройках среды, затем опубликовать среду. Это отдельно от уже опубликованного GitHub Pages.
2. До live предоставить реальный сервер/домен, утверждённого оператора, тексты и условия обработки/локализации, CRM endpoint и credentials через защищённые настройки.
3. Перед публикацией технических характеристик передать каталог UNIGY с номерами страниц, паспорта/расчёты, подтверждения исполнения и утверждённые кейсы/изображения.

Дальнейшие шаги требуют доступа, credentials, утверждения владельцем или новых исходных документов; они не заменены вымышленными данными.

## Подтверждение внешнего браузера

Реальный публичный адрес проверен Chromium с включённой TLS verification: desktop1440 и mobile390 вернули200; CO₂ query-prefill, обязательные уточнения, P₂≤P₁, отдельное согласие с клавиатуры и полный demo flow работают. Результат явно сообщает, что заявка не отправлена и не сохранена. Зафиксировано0POST/API-запросов,0контактных данных в сетевых запросах,0localStorage/sessionStorage/cookies,0ошибок страницы/HTTP. Evidence: .local/screenshots/public/acceptance-result.json и скриншоты. Использован доверенный CA среды, TLS не отключался; временных записей доверия после проверки нет.
