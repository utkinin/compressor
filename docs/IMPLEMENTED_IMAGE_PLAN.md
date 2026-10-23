# Оригинальные инженерные визуалы

Исторический документ / отчёт предыдущего прохода. Текущая публичная таксономия оборудования, граница private source data и правила публикации определяются [CATALOG_IMPLEMENTATION](CATALOG_IMPLEMENTATION.md), [EQUIPMENT_MIGRATION](EQUIPMENT_MIGRATION.md) и [IMPLEMENTED_CONTENT_MODEL](IMPLEMENTED_CONTENT_MODEL.md). Прежние public family pages, ProductGroup и проверки числа страниц не являются текущими требованиями.

Все production visuals собственные: React SVG в src/components/technical-diagram.tsx, знак и favicon из геометрических элементов. Внешние изображения, supplier assets и чужие фотографии не использовались. Runtime image generation не нужен: задание прямо требует оригинальные SVG-схемы.

Единое семейство схем: hero (процессный skid), small (малый Oil-Free узел), medium (модуль), large (skid), nitrogen (генератор→booster→ресивер→потребитель), helium (recovery loop), hydrogen (контроль H₂), co2 (проверка фазы), instrumentation (КИП/клапаны/охлаждение), integration (границы интеграции).

Схемы иллюстрируют логику процесса, не являются монтажными чертежами, P&ID, паспортом или изображением реального поставленного оборудования. Responsive viewBox, доступные title/description, без неподтверждённых размерных/производительных параметров.
