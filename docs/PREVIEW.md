# Предпросмотр Lanfor на GitHub Pages

Исторический документ / отчёт предыдущего прохода. Текущая публичная таксономия оборудования, граница private source data и правила публикации определяются [CATALOG_IMPLEMENTATION](CATALOG_IMPLEMENTATION.md), [EQUIPMENT_MIGRATION](EQUIPMENT_MIGRATION.md) и [IMPLEMENTED_CONTENT_MODEL](IMPLEMENTED_CONTENT_MODEL.md). Прежние public family pages, ProductGroup и проверки числа страниц не являются текущими требованиями.

Последующая ревизия исходников и актуальная проверка публикации: [REPOSITORY_CLEANUP](REPOSITORY_CLEANUP.md). Записи прежних публикаций ниже являются историей проверки.

Публичное превью: **https://utkinin.github.io/compressor/**. Публикация подтверждена 22 октября 2026 года: [run 39778491521](https://github.com/utkinin/compressor/actions/runs/39778491521) — completed/success, source commit `879bc623f78f276683a4274f5b629e10f0d8022e`. Внешний HTTPS, 100 HTML и 133 адреса страниц/ресурсов проверены без cache-busting query; все HTTP200. Это отдельный статический просмотр по принципу AFARA.

## Три режима

| Режим | Заявка | Хранение | Подтверждение |
| --- | --- | --- | --- |
| Серверный staging | POST /api/rfq | Приватный локальный outbox | Сохранено локально, доставка инженеру не настроена |
| Серверный live | POST /api/rfq + настроенная доставка | Постоянный volume и CRM | Доставка либо явная очередь; без настроек приём закрыт |
| GitHub Pages preview | Только состояние вкладки | Форма не пишет контакты в хранилище | Демонстрация пройдена; заявка не отправлена и не сохранена |

В публичном preview используйте вымышленные данные. Сам хостинг обрабатывает обычные запросы к файлам сайта; приложение не передаёт поля формы. Preview не предоставляет работающую CRM, API или канал связи с инженером.

## Повторная сборка

```bash
npm ci
npm run preview:build
npm run preview:test
```

`scripts/build-preview.ts` копирует только source/public/config/manifests в принадлежащий сборщику `.local/preview-build`, использует установленные зависимости и отдельную `.next`. `.env`, Git metadata, runtime RFQ, отчёты и внешние symlinks не копируются. CRM/контакты/analytics ENV не наследуются. Исходный checkout и основная `.next` не переписываются. Exclusive build lock предотвращает одновременное изменение export-каталога.

В копии исключаются API routes и заменяются только явно перечисленные серверные RFQ/legal/contacts entry points. Изменение исходных entry points требует пересмотра transform: скрипт отказывается продолжать при несовпадении ожидаемой структуры. Sitemap/robots экспортируются статически. Основные server routes и бизнес-логика остаются в исходном проекте.

Итог: `.local/github-pages/`, включая `.nojekyll`, `404.html`, canonical страницы и девять legacy aliases. Не копируйте `.next`, `.env`, `.local/rfq` или весь checkout на Pages. `PREVIEW_BASE_PATH` и `PREVIEW_SITE_ORIGIN` переопределяют стандартные `/compressor` и `https://utkinin.github.io`; все имена и origin проверяются.

## Публикация

`.github/workflows/pages.yml` запускается при push в существующую ветку `work` или через workflow_dispatch. Workflow устанавливает lockfile, запускает проверки, собирает статический artifact и передаёт его штатным upload/deploy-pages actions. Обновление не требует новой рабочей ветки или force push.

В настройках `utkinin/compressor` источник Pages должен быть **GitHub Actions**: Settings → Pages → Build and deployment → Source. После изменения источника запустите workflow повторно. Это настройка GitHub-репозитория, не переменная сайта.

При автоматизации API нужны доступ к `api.github.com`, существующая GitHub-аутентификация с подходящими правами и проверка успешного deployment. Для проверки опубликованного сайта нужен HTTPS-доступ к `utkinin.github.io`. Новые секреты не следует вводить в чат.

Домены `api.github.com` и `utkinin.github.io` сохранены в черновике среды, API и HTTPS доступны. Владелец включил Pages Source=GitHub Actions после того, как интеграция получила 403 при первоначальном создании сайта. Теперь обычные push в work обновляют настроенный Pages workflow; повторно включать сайт не требуется.

## Ограничения

Все технические материалы на согласовании. Исходные записи draft, каталожный PDF и утверждённые расчёты отсутствуют. Нет обещаний рабочей точки, универсальной совместимости, сертификатов, сроков или реальных заказчиков. Preview noindex, без счётчиков и сохранения атрибуции. Для настоящего RFQ нужен серверный сайт с утверждённой юридической конфигурацией.

## Проверка на GitHub

Первоначальный run 39777705235 прошёл build/все проверки и остановился только на выключенном Pages. После настройки владельцем run 39778491521 успешно прошёл оба jobs — build и deploy. На GitHub runner повторно прошли typecheck/lint/62 unit/20 server browser/15 static browser и обе сборки. Команда `python3 scripts/verify-public-preview.py` проверила обычные внешние HTTPS-адреса, H1/canonical относительно проверенного export и ресурсы:100 HTML/133 URL, все 200. Отчёт `.local/public-verification.json`. Новые doc-only commits не меняют проверенный пользовательский интерфейс.

Публичный браузер также проверен:1440px главная и390px полный RFQ с CO₂. Обязательные вопросы, сравнение давлений и отдельное согласие работают; финал без POST/API/контактов в сети и без browser storage/cookies. TLS verification не отключалась. Скриншоты и структурированный результат: .local/screenshots/public/.
