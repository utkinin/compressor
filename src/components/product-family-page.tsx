import Link from "next/link";
import { type ProductFamily, type ContentSnapshot, FAMILY_ENVELOPE_DISCLAIMER } from "@/content";
import { absoluteUrl } from "@/lib/seo";
import { Breadcrumbs, BulletList, ContentSection, PageIntro, Procurement, RelatedLinks, RfqPanel } from "@/components/content-page";
import { TechnicalDiagram } from "@/components/technical-diagram";
import { ContentView } from "@/components/content-events";
import { JsonLd } from "@/components/json-ld";

export function ProductFamilyPage({ family, content }: { family: ProductFamily; content: ContentSnapshot }) {
  const path = `/equipment/${family.slug}/`;
  const category = content.equipment.find((item) => item.id === family.categoryId);
  const rfqHref = `/rfq/?equipment=${encodeURIComponent(family.id)}&source=${encodeURIComponent(path)}`;
  const relevantSolutions = content.solutions.filter((item) => item.equipmentIds.includes(family.categoryId));
  return <>
    <ContentView event="equipment_view" id={family.id} />
    <Breadcrumbs items={[{ label: "Оборудование", href: "/equipment/" }, ...(category ? [{ label: category.title, href: `/equipment/${category.slug}/` }] : []), { label: family.title, href: path }]} />
    <PageIntro eyebrow="UNIGY / кандидат для инженерного подбора" title={family.title} summary={family.summary} action={<><Link className="button" href={rfqHref}>Проверить рабочую точку →</Link><Link className="button-secondary" href={`/rfq/?document=manufacturer-family-catalogue&equipment=${family.id}&source=${encodeURIComponent(path)}`}>Запросить первоисточник →</Link></>} />
    <section className="container"><TechnicalDiagram kind={family.diagram} title={`Принципиальная иллюстрация класса ${family.title}`} /></section>
    <div className="container detail-layout"><article className="prose">
      <p className="notice"><strong>Статус данных: draft.</strong> Семейство сохранено из предоставленного исходного проекта. Это не подтверждённый SKU и не результат подбора. Исходные диапазоны, применимые газы, привод и охлаждение требуют проверки по документу изготовителя.</p>
      <ContentSection title="Назначение в инженерном подборе">
        <p>{family.technology}</p>
        <p>Сначала проверяется состав газа и рабочая точка, затем конкретное исполнение. Название серии и принадлежность к классу Oil-Free не подтверждают пригодность для H₂, O₂ или другого газа, требования по утечкам либо конкретный класс чистоты.</p>
      </ContentSection>
      <ContentSection title="Источник и технические данные в HTML">
        <div className="table-wrap"><table className="data-table"><caption>Статус полей семейства {family.title}</caption><thead><tr><th scope="col">Поле</th><th scope="col">Публичные данные</th><th scope="col">Статус</th></tr></thead><tbody>
          <tr><th scope="row">Наименование в исходном seed</th><td>{family.title}</td><td>draft</td></tr>
          <tr><th scope="row">Производитель в исходном seed</th><td>{family.brand}</td><td>draft</td></tr>
          <tr><th scope="row">Ссылка на источник в исходном проекте</th><td>{family.sourceNote}</td><td>{family.source.status}</td></tr>
          <tr><th scope="row">Страница первоисточника</th><td>{family.source.page || "Не предоставлена. Требуется каталог изготовителя с номером страницы."}</td><td>draft</td></tr>
          {family.technicalRows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.value}</td><td>{row.status}</td></tr>)}
        </tbody></table></div>
        <p>{FAMILY_ENVELOPE_DISCLAIMER}</p>
        <p>Переписывание seed-значения из одного файла в другой не повышает его достоверность до source-transcribed или engineering-verified. Числовые значения появятся только вместе с проверяемым первоисточником и его областью применимости.</p>
      </ContentSection>
      <ContentSection title="Что требуется для проверки семейства"><BulletList items={family.checks} /></ContentSection>
      <Procurement />
      {category ? <RelatedLinks title="Класс оборудования и границы применения" items={[{ title: category.title, href: `/equipment/${category.slug}/` }]} /> : null}
      <RelatedLinks title="Задачи для инженерного рассмотрения" items={relevantSolutions.map((item) => ({ title: item.title, href: `/solutions/${item.slug}/` }))} />
      <RelatedLinks title="Контекст интеграции" items={content.industries.filter((item) => item.solutionIds.some((id) => relevantSolutions.some((solution) => solution.id === id))).map((item) => ({ title: item.title, href: `/industries/${item.slug}/` }))} />
      <RelatedLinks title="Уточнить требования по газу" items={content.gases.map((item) => ({ title: item.title, href: `/gases/${item.slug}/` }))} />
      <p className="notice">Ссылки на газовые страницы помогают собрать исходные данные. Они не являются списком подтверждённо совместимых газов этого семейства.</p>
      <RelatedLinks title="Документы по выбранному исполнению" items={content.documents.filter((item) => item.access !== "internal" && (item.equipmentIds.includes(family.categoryId) || item.id === "manufacturer-family-catalogue")).map((item) => ({ title: item.title, href: `/documents/${item.slug}/` }))} />
    </article><RfqPanel href={rfqHref} sourcePage={path} title="Проверим семейство под вашу задачу" /></div>
    <JsonLd data={{
      "@context": "https://schema.org",
      "@type": "ProductGroup",
      name: family.title,
      description: family.summary,
      url: absoluteUrl(path),
      productGroupID: family.id,
      brand: { "@type": "Brand", name: family.brand },
      additionalProperty: [{ "@type": "PropertyValue", name: "Статус технических данных", value: family.verificationStatus }],
    }} />
  </>;
}
