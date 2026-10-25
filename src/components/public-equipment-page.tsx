import Link from "next/link";
import { type Equipment, type ContentSnapshot, publicProperties } from "@/content";
import { absoluteUrl } from "@/lib/seo";
import { Breadcrumbs, BulletList, ContentSection, Procurement, RelatedLinks, RfqPanel } from "@/components/content-page";
import { CommercialHero } from "@/components/commercial-hero";
import { ProcessVisual } from "@/components/process-visual";
import { ContentView } from "@/components/content-events";
import { JsonLd } from "@/components/json-ld";
import { EquipmentConfiguration, EquipmentSelection, equipmentActionLabel, equipmentRfqHref } from "@/components/equipment-catalog";

export function PublicEquipmentPage({ equipment, content }: { equipment: Equipment; content: ContentSnapshot }) {
  const path = `/equipment/${equipment.slug}/`;
  if (equipment.externalReference) {
    const reference = equipment.externalReference;
    const articles = content.articles.filter((article) => equipment.articleIds.includes(article.id));
    return <div data-testid="sf6-specialist-reference">
      <ContentView event="equipment_view" id={equipment.id} />
      <Breadcrumbs items={[{ label: "Оборудование", href: "/equipment/" }, { label: equipment.title, href: path }]} />
      <CommercialHero eyebrow="Специализированное направление" title={equipment.title} summary={equipment.summary} visualId={equipment.heroVisualId} action={<a className="button" href={reference.url} target="_blank" rel="noopener noreferrer">Оборудование и решения для SF₆ — {reference.name} <span aria-hidden="true">↗</span></a>} />
      <article className="container prose section">
        <ContentSection title="Какая задача связана с элегазом"><p>{equipment.technology}</p><p>Перед выбором оборудования уточните, нужно ли перенести газ между объёмами, повысить его давление, восстановить пригодный газ после процесса или обеспечить другую операцию. Требования к подготовке, герметичности и безопасному обращению зависят от состояния среды.</p></ContentSection>
        <ContentSection title="Что подготовить для рассмотрения задачи"><BulletList items={equipment.inputs} /><p>Сведения о составе и примесях, предыдущем применении газа и допустимых потерях помогут определить необходимые проверки. Конкретные параметры и исполнение согласуются по технической документации выбранного оборудования.</p></ContentSection>
        <ContentSection title="Оборудование и решения SF6RUS"><p>Для выбора специализированного оборудования перейдите в направление SF6RUS. В запросе укажите технологическую операцию, известные условия источника и приёмника, состав газа и требования к его дальнейшему использованию.</p><a className="button" href={reference.url} target="_blank" rel="noopener noreferrer">Перейти в SF6RUS <span aria-hidden="true">↗</span></a></ContentSection>
        <RelatedLinks title="Материалы по теме" items={articles.map((article) => ({ title: article.title, href: `/knowledge/${article.slug}/` }))} />
        <Link className="text-link" href="/equipment/">Компрессоры для других технологических газов <span aria-hidden="true">→</span></Link>
      </article>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebPage", name: equipment.title, description: equipment.summary, url: absoluteUrl(path), inLanguage: "ru-RU", about: { "@type": "Thing", name: "Оборудование для работы с SF₆" }, relatedLink: reference.url }} />
    </div>;
  }
  const rfqHref = equipmentRfqHref(equipment);
  const capabilities = publicProperties(equipment.verifiedCapabilities);
  const solutions = equipment.solutionIds.flatMap((id) => content.solutions.filter((solution) => solution.id === id));
  const articles = equipment.articleIds.flatMap((id) => content.articles.filter((article) => article.id === id));
  const gasPages = content.gases.filter((gas) => equipment.gasIds.includes(gas.id));
  const documentationQuery = new URLSearchParams({ equipment: equipment.id, document: "technical-documentation", source: path });
  if (equipment.rfqGas) documentationQuery.set("gas", equipment.rfqGas); else documentationQuery.set("intake", "integration");
  return <>
    <ContentView event="equipment_view" id={equipment.id} />
    <Breadcrumbs items={[{ label: "Оборудование", href: "/equipment/" }, { label: equipment.title, href: path }]} />
    <CommercialHero eyebrow={equipment.rfqGas ? "Оборудование / подбор по назначению" : "Для интеграторов / проектная поставка"} title={equipment.title} summary={equipment.summary} visualId={equipment.heroVisualId} action={<Link className="button" href={rfqHref}>{equipmentActionLabel(equipment)} <span aria-hidden="true">→</span></Link>} />
    <div className="container detail-layout equipment-detail"><article className="prose">
      <ContentSection title="Что это и для каких задач"><p>{equipment.technology}</p><BulletList items={equipment.applications} /></ContentSection>
      <ContentSection title={equipment.gas === "vacuum" ? "Безмасляное исполнение" : "Безмасляное сжатие"}><p>{equipment.gas === "vacuum" ? "В безмасляном вакуумном направлении масло не подаётся в рабочую камеру насоса. Чистота и пригодность полного вакуумного тракта зависят также от соединений, фильтрации и условий процесса." : equipment.gas === "air" ? "В безмасляном воздушном направлении масло не подаётся в камеру сжатия компрессора. Качество воздуха на выходе зависит также от входного воздуха, трубопроводов, арматуры и согласованной подготовки всей системы." : "Для этих направлений масло не подаётся в камеру сжатия компрессора. Чистота газа на выходе при этом зависит также от трубопроводов, арматуры, уплотнений и согласованной подготовки всей системы."}</p><Link className="text-link" href="/knowledge/oil-free-compression/">Подробнее о безмасляном исполнении <span aria-hidden="true">→</span></Link></ContentSection>
      {equipment.rfqGas ? <EquipmentSelection rfqHref={rfqHref} /> : <ContentSection title="Проектный подбор для встраивания"><p>Передайте функцию модуля, известные рабочие параметры, питание, ограничения по габаритам и стадию проекта. Если часть данных ещё неизвестна, форму можно отправить с ТЗ или описанием машины.</p><Link className="button" href={rfqHref}>Передать ТЗ проекта <span aria-hidden="true">→</span></Link></ContentSection>}
      <ContentSection title="Что уточним для вашего процесса"><BulletList items={equipment.inputs} /></ContentSection>
      <ContentSection title="Как выбирается компрессор"><ProcessVisual id={equipment.processVisualId} /><ol>{equipment.approach.map((step) => <li key={step}>{step}</li>)}</ol></ContentSection>
      <div className="equipment-preliminary"><strong>{equipment.rfqGas ? "Предварительный вариант оборудования" : "Интеграция в оборудование"}</strong><p>{equipment.rfqGas ? "По газу, P₁, P₂, расходу и режиму форма подготовит описание задачи и предварительный тип оборудования. Исполнение уточняется после расчёта; требуется инженерное подтверждение." : "Прорабатываем модуль как часть вашей машины: рабочие параметры, питание, охлаждение, габариты, монтаж и управление. Конфигурация фиксируется после инженерной проверки исходных данных."}</p><Link className="button" href={rfqHref}>{equipment.rfqGas ? "Указать параметры" : "Передать данные проекта"} <span aria-hidden="true">→</span></Link></div>
      <EquipmentConfiguration configurations={equipment.configurations} options={equipment.options} />
      {capabilities.length ? <ContentSection title="Подтверждённые параметры исполнения"><div className="table-wrap"><table className="data-table"><thead><tr><th scope="col">Параметр</th><th scope="col">Значение и условия</th><th scope="col">Основание</th></tr></thead><tbody>{capabilities.map((property) => <tr key={property.label}><th scope="row">{property.label}</th><td>{property.value}</td><td>{property.source?.url ? <a href={property.source.url} rel="noopener noreferrer">{property.source.title}</a> : property.source?.title}{property.source?.page ? `, раздел / стр. ${property.source.page}` : ""}</td></tr>)}</tbody></table></div><p>Конкретные параметры подтверждаются после расчёта для газа, условий всасывания и режима работы.</p></ContentSection> : null}
      <ContentSection title="Что проверяется до предложения"><BulletList items={equipment.checks} /><p>{equipment.rfqGas ? "Название направления описывает назначение оборудования. Газовая совместимость, давление, производительность, чистота и требования безопасности подтверждаются для конкретного исполнения." : equipment.gas === "vacuum" ? "Название направления описывает функцию оборудования. Рабочий вакуум, производительность, допустимая среда, режим и требования к защите подтверждаются для конкретного исполнения." : "Название направления описывает функцию оборудования. Давление, производительность, режим, качество воздуха и условия интеграции подтверждаются для конкретного исполнения."}</p></ContentSection>
      <RelatedLinks title="Решения для технологических задач" items={solutions.map((solution) => ({ title: solution.title, href: `/solutions/${solution.slug}/` }))} />
      <RelatedLinks title="Разобраться в параметрах" items={articles.map((article) => ({ title: article.title, href: `/knowledge/${article.slug}/` }))} />
      <RelatedLinks title="Подробнее о газе" items={gasPages.map((gas) => ({ title: gas.title, href: `/gases/${gas.slug}/` }))} />
      <ContentSection title="Документация"><p>Техническая документация предоставляется для выбранного исполнения оборудования.</p><p>Возможные документы:</p><BulletList items={["Технические характеристики.", "Габаритный чертёж.", "Руководство по эксплуатации.", "Документы соответствия.", "CAD/STEP — при наличии."]} /><p>Состав документации согласуем для конкретного оборудования и комплектации.</p><Link className="button" href={`/rfq/?${documentationQuery.toString()}`}>Запросить документацию <span aria-hidden="true">→</span></Link></ContentSection>
      <Procurement />
    </article><RfqPanel href={rfqHref} sourcePage={path} title={equipment.rfqGas ? "Подберём исполнение по вашим параметрам" : "Подберём модуль для вашей машины"} variant={equipment.rfqGas ? "parameters" : "integration"} /></div>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: equipment.title, description: equipment.summary, url: absoluteUrl(path), inLanguage: "ru-RU", about: { "@type": "Thing", name: equipment.title } }} />
  </>;
}
