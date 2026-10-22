# Content model v1

## Gas
`slug, symbol, name, aliases[], composition_notes, engineering_notes[], applications[]`

## Application / Solution
`slug, intent, title, problem, pains[], architecture[], required_inputs[], related_gases[], related_products[], related_articles[]`

## ProductFamily
`slug, brand, series, compressor_type, transmission, cooling[], source, verification_status`

### ProductGasSpec
This is a separate relation because one family may have different operating envelopes for different gases/configurations.
`product_id, gas_id, p1_min/max, p1_reference, p2_min/max, p2_reference, flow_min/max, flow_unit, flow_reference_conditions, power_min/max, leak_rate, duty, notes, source_document_id, verified_at`

## Document
`title, file_type, access_level, product_id?, solution_id?, revision, issued_at, source, verification_status, url/storage_key`

## Case
`title, industry, gas, problem, before, solution_architecture, product_ids[], result_facts[], images[], approval_status`

## KnowledgeArticle
`title, slug, question_intent, answer_summary, body, sources[], related_entities[], author/reviewer, reviewed_at`

## RFQRequest
`id, created_at, source_url, utm, gas, gas_composition, p1, p1_ref, p2, p2_ref, q, q_unit, q_reference, duty, second_pass_fields, contact, attachment_ids, crm_id, status`

Important: keep `ProductFamily` and `ProductGasSpec` separate. A single generic capacity range across all gases is physically misleading.
