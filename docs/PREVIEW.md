# Предпросмотр Lanfor на GitHub Pages

Подготовлен отдельный статический экспорт по принципу существующего AFARA preview. Целевой адрес — `https://utkinin.github.io/compressor/`. Локальная сборка и публикация на GitHub — разные результаты: внешний HTTPS нельзя считать проверенным по одному успешному export.

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

Домены `api.github.com` и `utkinin.github.io` сохранены в черновике среды; текущие обращения к API и HTTPS уже проходят. Код отправлен в `work`, workflow запущен. На момент проверки Pages ещё не был включён (GET /pages: 404); попытка штатного создания POST /pages с build_type=workflow получила GitHub 403 Resource not accessible by integration. Нужна настройка владельцем Source=GitHub Actions по ссылке https://github.com/utkinin/compressor/settings/pages. Это ограничение прав интеграции, не отсутствие кода или Git-доступа. Успешный deployment и внешний HTTP 200 фиксируются отдельно после подтверждения.

## Ограничения

Все технические материалы на согласовании. Исходные UNIGY записи draft, каталожный PDF и утверждённые расчёты отсутствуют. Нет обещаний рабочей точки, универсальной совместимости, сертификатов, сроков или реальных заказчиков. Preview noindex, без счётчиков и сохранения атрибуции. Для настоящего RFQ нужен серверный сайт с утверждённой юридической конфигурацией.

## Проверка на GitHub

Run 39777705235: https://github.com/utkinin/compressor/actions/runs/39777705235. Build job успешно выполнил исходные проверки, production build, 20 server browser tests, static export, 15 static browser tests и upload github-pages artifact. Deploy остановился на Configure GitHub Pages: сайт ещё не включён. Это не сбой сборки. После выбора владельцем Source=GitHub Actions можно повторить failed jobs без изменения кода.
