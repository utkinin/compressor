# Оригинальные инженерные визуалы

Все production visuals собственные: React SVG в src/components/technical-diagram.tsx, знак и favicon из геометрических элементов. Внешние изображения, supplier assets и чужие фотографии не использовались. Runtime image generation не нужен: задание прямо требует оригинальные SVG-схемы.

Единое семейство схем: hero (процессный skid), small (малый Oil-Free узел), medium (модуль), large (skid), nitrogen (генератор→booster→ресивер→потребитель), helium (recovery loop), hydrogen (контроль H₂), co2 (проверка фазы), instrumentation (КИП/клапаны/охлаждение), integration (границы интеграции).

Схемы иллюстрируют логику процесса, не являются монтажными чертежами, P&ID, паспортом или изображением реального поставленного оборудования. Responsive viewBox, доступные title/description, без неподтверждённых размерных/производительных параметров.
