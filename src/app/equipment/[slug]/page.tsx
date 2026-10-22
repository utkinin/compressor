import Link from "next/link";
import { notFound } from "next/navigation";
import { contentRepository, publicProperties, FAMILY_ENVELOPE_DISCLAIMER } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, BulletList, ContentSection, PageIntro, Procurement, RelatedLinks, RfqPanel } from "@/components/content-page";
import { TechnicalDiagram } from "@/components/technical-diagram";
import { ContentView } from "@/components/content-events";
import { ProductFamilyPage } from "@/components/product-family-page";

export async function generateStaticParams() {
  const { equipment, productFamilies } = await contentRepository.getSnapshot();
  return [...equipment, ...productFamilies].map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { equipment, productFamilies } = await contentRepository.getSnapshot();
  const family = [...equipment, ...productFamilies].find((item) => item.slug === slug);
  return family ? pageMetadata(family.title, family.summary, `/equipment/${family.slug}/`) : {};
}

export default async function EquipmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await contentRepository.getSnapshot();
  const originalFamily = content.productFamilies.find((item) => item.slug === slug);
  if (originalFamily) return <ProductFamilyPage family={originalFamily} content={content} />;
  const { equipment, gases, solutions, documents, productFamilies } = content;
  const family = equipment.find((item) => item.slug === slug);
  if (!family) notFound();
  const properties = publicProperties(family.properties);
  const rfqHref = `/rfq/?equipment=${family.id}&source=${encodeURIComponent(`/equipment/${family.slug}/`)}`;
  return <>
    <ContentView event="equipment_view" id={family.id} />
    <Breadcrumbs items={[{ label: "Оборудование", href: "/equipment/" }, { label: family.title, href: `/equipment/${family.slug}/` }]} />
    <PageIntro eyebrow="Класс решения / family envelope" title={family.title} summary={family.summary} action={<Link className="button" href={rfqHref}>Подобрать конфигурацию →</Link>} />
    <section className="container"><TechnicalDiagram kind={family.diagram} title={`Принципиальная компоновка: ${family.title}`} /></section>
    <div className="container detail-layout"><article className="prose">
      <ContentSection title="Технология и назначение"><p>{family.technology}</p><BulletList items={family.scope} /></ContentSection>
      <ContentSection title="Данные и происхождение характеристик">
        <p><strong>Статус источника:</strong> {family.source.status === "draft" ? "draft — исходные технические данные ожидают проверки" : family.source.status === "source-transcribed" ? "source-transcribed — данные переписаны из источника" : "engineering-verified — инженерно подтверждено"}.</p>
        <p><strong>Источник:</strong> {family.source.url ? <a href={family.source.url} rel="noopener noreferrer">{family.source.title}</a> : family.source.title}{family.source.page ? `, страница ${family.source.page}` : ""}.</p>
        {properties.length ? <div className="table-wrap"><table className="data-table"><caption>Параметры с подтверждённым источником</caption><thead><tr><th scope="col">Параметр</th><th scope="col">Значение</th><th scope="col">Основание</th></tr></thead><tbody>{properties.map((property) => <tr key={property.label}><th scope="row">{property.label}</th><td>{property.value}</td><td>{property.status}<br />{property.source?.title}{property.source?.page ? `, стр. ${property.source.page}` : ""}</td></tr>)}</tbody></table></div> : <p className="notice">Числовые параметры не опубликованы: нет исходного документа, позволяющего подтвердить диапазон. Давление, производительность, привод, охлаждение, мощность и утечки проверяются для выбранного исполнения.</p>}
        <p>{FAMILY_ENVELOPE_DISCLAIMER}</p>
      </ContentSection>
      <ContentSection title="Что проверяет инженер"><BulletList items={family.checks} /></ContentSection>
      <RelatedLinks title="Семейства из исходного проекта — draft" items={productFamilies.filter((item) => item.categoryId === family.id).map((item) => ({ title: item.title, href: `/equipment/${item.slug}/` }))} />
      <Procurement />
      <RelatedLinks title="Связанные задачи" items={solutions.filter((item) => item.equipmentIds.includes(family.id)).map((item) => ({ title: item.title, href: `/solutions/${item.slug}/` }))} />
      <RelatedLinks title="Газовые требования для рассмотрения" items={gases.filter((item) => family.gasIds.includes(item.id)).map((item) => ({ title: item.title, href: `/gases/${item.slug}/` }))} />
      <p className="notice">Ссылки на газы описывают инженерные задачи и не являются подтверждением совместимости всего семейства. Допустимость газа, материалы и требования безопасности должны быть согласованы для конкретной конструкции.</p>
      <RelatedLinks title="Запрос документации" items={documents.filter((item) => item.access !== "internal" && item.equipmentIds.includes(family.id)).map((item) => ({ title: item.title, href: `/documents/${item.slug}/` }))} />
    </article><RfqPanel href={rfqHref} sourcePage={`/equipment/${family.slug}/`} title="Согласуем границы узла" /></div>
  </>;
}
