# Аудит и решения 2026-10-22

Исторический документ / отчёт предыдущего прохода. Текущая публичная таксономия оборудования, граница private source data и правила публикации определяются [CATALOG_IMPLEMENTATION](CATALOG_IMPLEMENTATION.md), [EQUIPMENT_MIGRATION](EQUIPMENT_MIGRATION.md) и [IMPLEMENTED_CONTENT_MODEL](IMPLEMENTED_CONTENT_MODEL.md). Прежние public family pages, ProductGroup и проверки числа страниц не являются текущими требованиями.

Исходное состояние: /workspace/compressor — пустой unborn checkout work, remote GitHub доступен, refs отсутствуют, fetch main сообщает couldn't find remote ref main. Пользователь после этого прямо разрешил создать всё необходимое и передал полное задание. Поэтому исходники созданы; это авторизованная реализация, а не изменение защищённых файлов во время первоначального onboarding.

Стек: Next App Router/React, strict TypeScript, Zod, Vitest, Playwright. TypeScript 6 и ES2024 library нужны для актуальных Next declarations; skipLibCheck=false. React server components по умолчанию, client islands только для меню, RFQ, событий и browser storage. Внешние UI/animation библиотеки не нужны.

Нет инфраструктурного блокера CMS/CRM: контентный файловый адаптер, простой приватный durable outbox. Staging работает без ключей. Live fail closed до необходимых условий. Shared persistent-volume ограничение объявлено, не маскируется под распределённую БД.

Нет supplier данных: вместо фиктивного SKU — инженерные категории и draft provenance. Нет реальных кейсов: только типовые сценарии. Нет утверждённых реквизитов: честные staging legal pages и блокировка live. Это ограничения внешних данных, не незавершённые заглушки интерфейса.

Проверки и фактические результаты фиксируются в STAGING_HANDOFF.md после запуска; сценарии тестов не подменяются банальным возвратом 200.

Дополнительный npm audit: runtime зависимости — 0 vulnerabilities; полный audit обнаружил 5 high dev-only записей в цепочке Next ESLint plugin → fast-glob → micromatch → braces (GHSA-vfj7-8cjw-p6xm). По registry установлен последний braces 3.0.3 и ESLint plugin 16.4.2, исправленного релиза на момент проверки нет. Force fix предлагает несовместимое понижение Next ESLint config до 14.2.35; оно не применялось. Риск относится к обработке недоверенных glob-шаблонов инструментом разработки, не к RFQ runtime. До исправления upstream не используйте внешние шаблоны в lint tooling.
