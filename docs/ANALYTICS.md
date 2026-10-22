# Analytics specification

## Event properties
Common: `page_type`, `entity_slug`, `referrer_group`, `utm_source`, `utm_campaign`.
Never send name, email, phone, free-text notes or uploaded filenames to GA/Metрика events.

## Funnel
`landing_view → rfq_start → rfq_generated → rfq_submit → CRM qualified → quote → won/lost`

## Content proof
- `document_open`
- `cad_download`
- `technical_table_expand`
- `related_entity_click`

## KPI hierarchy
Business: gross-margin pipeline sourced by site.
Leading: qualified RFQs, completion rate, SQL rate, quote rate.
Diagnostic: search landing CTR, document use, scroll/engagement.

Do not use “time on site” as a primary success metric.
