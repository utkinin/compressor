import Link from "next/link";
import { type Equipment, type ContentSnapshot, publicProperties } from "@/content";
import { absoluteUrl } from "@/lib/seo";
import { Breadcrumbs, BulletList, ContentSection, Procurement, RelatedLinks, RfqPanel, PageIntro } from "@/components/content-page";
import { TechnicalDiagram } from "@/components/technical-diagram";
import { ContentView } from "@/components/content-events";
import { JsonLd } from "@/components/json-ld";
import { EquipmentConfiguration, EquipmentSelection, equipmentActionLabel, equipmentRfqHref } from "@/components/equipment-catalog";

export function PublicEquipmentPage({ equipment, content }: { equipment: Equipment; content: ContentSnapshot }) {
  const path = `/equipment/${equipment.slug}/`;
  const rfqHref = equipmentRfqHref(equipment);
  const capabilities = publicProperties(equipment.verifiedCapabilities);
  const solutions = equipment.solutionIds.flatMap((id) => content.solutions.filter((solution) => solution.id === id));
  const articles = equipment.articleIds.flatMap((id) => content.articles.filter((article) => article.id === id));
  const gasPages = content.gases.filter((gas) => equipment.gasIds.includes(gas.id));
  const documentationQuery = new URLSearchParams({ gas: equipment.rfqGas, equipment: equipment.id, document: "technical-documentation", source: path });
  return <>
    <ContentView event="equipment_view" id={equipment.id} />
    <Breadcrumbs items={[{ label: "Оборудование", href: "/equipment/" }, { label: equipment.title, href: path }]} />
    <PageIntro eyebrow="Оборудование / подбор по назначению" title={equipment.title} summary={equipment.summary} action={<Link className="button" href={rfqHref}>{equipmentActionLabel(equipment)} <span aria-hidden="true">→</span></Link>} />
    <section className="container equipment-detail-hero"><TechnicalDiagram kind={equipment.diagram} title={`Принципиальная схема: ${equipment.title}`} /></section>
    <div className="container detail-layout equipment-detail"><article className="prose">
      <ContentSection title="Что это и для каких задач"><p>{equipment.technology}</p><BulletList items={equipment.applications} /></ContentSection>
      <EquipmentSelection rfqHref={rfqHref} />
      <ContentSection title="Что уточним для вашего процесса"><BulletList items={equipment.inputs} /></ContentSection>
      <ContentSection title="Как выбирается компрессор"><ol>{equipment.approach.map((step) => <li key={step}>{step}</li>)}</ol></ContentSection>
      <div className="equipment-preliminary"><strong>Предварительный вариант оборудования</strong><p>По газу, P₁, P₂, расходу и режиму форма подготовит описание задачи и предварительный тип оборудования. Исполнение уточняется после расчёта; требуется инженерное подтверждение.</p><Link className="button" href={rfqHref}>Указать параметры <span aria-hidden="true">→</span></Link></div>
      <EquipmentConfiguration configurations={equipment.configurations} options={equipment.options} />
      {capabilities.length ? <ContentSection title="Подтверждённые параметры исполнения"><div className="table-wrap"><table className="data-table"><thead><tr><th scope="col">Параметр</th><th scope="col">Значение и условия</th><th scope="col">Основание</th></tr></thead><tbody>{capabilities.map((property) => <tr key={property.label}><th scope="row">{property.label}</th><td>{property.value}</td><td>{property.source?.url ? <a href={property.source.url} rel="noopener noreferrer">{property.source.title}</a> : property.source?.title}{property.source?.page ? `, раздел / стр. ${property.source.page}` : ""}</td></tr>)}</tbody></table></div><p>Конкретные параметры подтверждаются после расчёта для газа, условий всасывания и режима работы.</p></ContentSection> : null}
      <ContentSection title="Что проверяется до предложения"><BulletList items={equipment.checks} /><p>Название направления описывает назначение оборудования. Газовая совместимость, давление, производительность, чистота и требования безопасности подтверждаются для конкретного исполнения.</p></ContentSection>
      <RelatedLinks title="Решения для технологических задач" items={solutions.map((solution) => ({ title: solution.title, href: `/solutions/${solution.slug}/` }))} />
      <RelatedLinks title="Разобраться в параметрах" items={articles.map((article) => ({ title: article.title, href: `/knowledge/${article.slug}/` }))} />
      <RelatedLinks title="Подробнее о газе" items={gasPages.map((gas) => ({ title: gas.title, href: `/gases/${gas.slug}/` }))} />
      <ContentSection title="Документация"><p>Техническая документация предоставляется для выбранного исполнения оборудования.</p><p>Возможные документы:</p><BulletList items={["Технические характеристики.", "Габаритный чертёж.", "Руководство по эксплуатации.", "Документы соответствия.", "CAD/STEP — при наличии."]} /><p>Состав документации согласуем для конкретного оборудования и комплектации.</p><Link className="button" href={`/rfq/?${documentationQuery.toString()}`}>Запросить документацию <span aria-hidden="true">→</span></Link></ContentSection>
      <Procurement />
    </article><RfqPanel href={rfqHref} sourcePage={path} title="Подберём исполнение по вашим параметрам" /></div>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: equipment.title, description: equipment.summary, url: absoluteUrl(path), inLanguage: "ru-RU", about: { "@type": "Thing", name: equipment.title } }} />
  </>;
}
