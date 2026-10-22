# Типизированный контент и RFQ

`src/content/types.ts` задаёт normalized entity types. Все сущности содержат id, slug, title, summary, editorialState. Состояния: draft → review → approved → published. Все написанные при этой задаче материалы остаются review.

Экспорты `src/content/index.ts`: gases, solutions, equipment, articles, industries, cases, documents, contentRepository. Связи заданы ID, а не хэштегами. Репозиторий отделяет content storage от шаблонов; новый CMS-адаптер должен вернуть тот же typed snapshot.

Граф: Gas → Task/Solution → WorkingPoint/RFQ → EquipmentFamily → Industry → Document → Case → KnowledgeArticle. Task — intent solution entity, WorkingPoint — валидируемый объект RFQ. Страницы и related links используют явные связи. Контент не генерирует комбинации город×давление×газ.

Document.access: public — реальный файл; request — запрос доступности/подготовки, без fake download; internal — не включается в hub и sitemap. Публично доступен собственный текстовый опросный лист. Наличие request entity не означает, что CAD/сертификат уже выдан производителем.

RFQ schema находится в `src/lib/rfq/schema.ts`: gas, inlet/outlet {value,unit,reference?}, flow {value,unit,reference?}, duty/dutyDetails, details по газу, contact, consent, attribution и requestContext. bar(g)/bar(a) различаются; MPa требует pressure reference. Nm3/h, m3/h и l/min требуют условий приведения/измерения. kg/h хранится без неявного пересчёта в объём. Нормализация давления для предварительного сравнения использует 1.01325 bar атмосферного давления; локальное значение уточняет инженер.

Сервер добавляет RFQ id, receivedAt, consentRecordedAt, consentVersion. Idempotency key не равен ID CRM; стабильный ID передаётся получателю для дедупликации. Ответ раскрывает только идентификатор и состояние доставки, без контактных данных.
