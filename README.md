# Lanfor Gas Systems · v1.1 staging

Русский B2B-сайт подбора Oil-Free компрессоров, бустеров, recovery и skid-систем по рабочей точке процесса. Next.js App Router, React, strict TypeScript, SSR-контент, типизированный файловый репозиторий, независимый от CRM RFQ API.

Исходный GitHub checkout был пуст. Реализация создана в существующей ветке work по [заданию пользователя](docs/IMPLEMENTATION_BRIEF.md), затем сверена с переданным пользователем оригинальным scaffold и спецификациями. Оригинальные документы сохранены в docs, ZIP и checksum — в docs/source; различия и принятые решения — [SOURCE_RECONCILIATION](docs/SOURCE_RECONCILIATION.md).

## Запуск

Нужен Node.js 24 (допустим >=22.13 <25), npm и Linux/macOS. Без БД, Docker и внешних ключей.

```bash
npm ci
cp .env.example .env.local # только если файла ещё нет
npm run dev
```

Для production-сборки в staging-режиме:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run start
```

`RFQ_STAGING_MODE=true` означает **локальную демонстрацию**, даже при production-сборке. Используйте вымышленные контактные данные. Заявки не отправляются в CRM. `.local/` и `.env.local` исключены из Git. Настройка без перезаписи существующего `.env.local`: `bash scripts/setup.sh`.

## Приёмка

```bash
npm run test:e2e
```

Playwright проверяет production-сборку в системном Chromium, в том числе размеры 360, 390, 768 и 1440 px. При другом расположении Chromium укажите `PLAYWRIGHT_CHROMIUM_PATH`. На другой машине можно установить Chromium командой `npx playwright install chromium` и указать путь, не отключая проверку TLS или целостности загрузок.

## Работа с RFQ

API: `POST /api/rfq`, JSON и заголовок `Idempotency-Key` (16–128 символов). Полный контракт — [IMPLEMENTED_CONTENT_MODEL](docs/IMPLEMENTED_CONTENT_MODEL.md), тесты — `tests/rfq.test.ts`. Сервер валидирует газ, обе базы давления, расход, динамические параметры и отдельное согласие.

В live-режиме требуются HTTPS `SITE_URL`, утверждённый оператор и тексты ПДн, `RFQ_ENABLED=true`, `RFQ_LEGAL_APPROVED=true`, `RFQ_STAGING_MODE=false` и HTTPS доставка либо явно настроенная локальная очередь. Без них приём закрыт. Требования к размещению, локализации и обработчикам проверяет владелец до реального сбора.

CRM получает стабильный ID в payload и заголовке; получатель обязан дедуплицировать его. При прерывании процесса после удалённого приёма возможна повторная доставка с тем же ID. Для восстановления очереди в настроенной live-среде:

```bash
NODE_ENV=production npm run rfq:outbox
```

Команду следует запускать по расписанию и контролировать её код завершения/сводку. Один постоянный приватный том обязателен. Несколько независимых дисков и эфемерный serverless не поддерживаются этим файловым адаптером; для них нужно подключить общий durable store.

## Честность данных

Исходный seed содержит пять UNIGY draft-семейств и ссылку-название каталога, но сам PDF, страницы, паспорта N2-B и подтверждённые кейсы не предоставлены. Параметры не выдуманы. Материалы находятся в `review`, оборудование — концепции с `draft` provenance; типовые задачи не названы реализованными проектами. Staging закрыт от индексации по умолчанию. Схемы — собственные SVG, без изображений поставщиков и конкурентов.

Полная передача: [STAGING_HANDOFF](docs/STAGING_HANDOFF.md). Стартовая задача уже изолирована: используйте текущий checkout, не создавайте worktree без прямого запроса.

## GitHub Pages preview

```bash
npm run preview:build
npm run preview:test
```

Экспорт строится в изолированной копии, итог — `.local/github-pages`. Основная `.next`, исходники и `.env.local` не меняются. Для `utkinin/compressor` используется `/compressor` basePath; GitHub Pages получает только публичные HTML/CSS/JS/SVG и TXT-опросник. RFQ в preview — браузерная демонстрация: без API, CRM, хранения контактов и аналитики. Серверная staging-форма и публичное статическое preview имеют разные подтверждения.

Workflow `.github/workflows/pages.yml` собирает и публикует preview при push в текущую `work` либо ручном запуске. На GitHub источник Pages должен быть GitHub Actions. Подробности, реальный статус публикации и границы проверки — [PREVIEW](docs/PREVIEW.md).

Текущий редакционный проход: [отчёт](docs/EDITORIAL_TECHNICAL_REPORT.md), [все результаты поиска](docs/EDITORIAL_SEARCH_RESULTS.md), [реестр чисел и evidence](docs/QUANTITATIVE_EVIDENCE.md). Проверка публичного текста: `python3 scripts/audit-public-copy.py` после `npm run preview:build`.
