# Аналитика квалифицированных обращений

Адаптер `track` допускает только события из whitelist: hero_rfq_click, rfq_start, rfq_step_complete, rfq_validation_error, rfq_submit, rfq_success, rfq_fail, solution_view, gas_view, equipment_view, document_view, document_download, cad_request, contact_click, email_click, phone_click.

GA4 / Яндекс Метрика подключаются лишь при наличии валидного ID и отдельного opt-in посетителя. Webvisor и автосбор ссылок отключены. При отсутствии ID нет сетевой загрузки счётчиков; отсутствие согласия не блокирует сайт. На staging реальная аналитика не подключена. SDK при opt-in запускаются в отдельном sandbox iframe без same-origin и без referrer; им недоступны форма и исходный URL родителя. GA получает фиксированный page_location адаптера, а события несут только whitelist IDs. Отзыв удаляет iframe и завершает оба SDK. Реальные vendor счётчики без ID не проверялись; изоляция проверяется браузером с перехваченными SDK.

Разрешены контролируемые entity/gas/step/path/unit/mode IDs. Поля контактов, свободный текст, технические значения и URL query не отправляются. Атрибуция обращения хранится отдельно в sessionStorage и payload RFQ: первая landing page, UTM, referrer без query, текущая source page.

KPI: Qualified RFQ/month, landing→RFQ start, start→submit, solution/gas/document→RFQ, source/query→SQL, SQL→quotation. Сайт даёт безопасные события и CRM-ready payload; SQL/quotation требуют фактических статусов в CRM. Дашборд и достигнутые конверсии не выдумываются.
