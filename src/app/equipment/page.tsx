import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, ContentSection, EntityCard, PageIntro, RfqPanel } from "@/components/content-page";

export const metadata = pageMetadata("Газовые компрессоры и бустеры", "Компрессоры и бустеры под заданный газ, давление, расход и режим работы. Дополнительная комплектация — по требованиям проекта.", "/equipment/");

export default async function EquipmentPage() {
  const { equipment, productFamilies } = await contentRepository.getSnapshot();
  return <>
    <Breadcrumbs items={[{ label: "Оборудование", href: "/equipment/" }]} />
    <PageIntro eyebrow="Equipment families" title="Сначала компрессор. Затем комплектация." summary="Начните с газа, давлений, расхода и режима работы. После выбора компрессора определим необходимые опции: поставка возможна от отдельного компрессора до комплектной системы на общей раме." />
    <section className="container section"><div className="content-grid">{equipment.map((family) => <EntityCard key={family.id} title={family.title} summary={family.summary} href={`/equipment/${family.slug}/`} />)}</div></section>
    <section className="container section">
      <header className="section-heading"><div><p className="eyebrow">Исходные семейства / draft</p><h2>Семейства компрессоров: требуется проверка данных</h2></div><p>Пять семейств из предоставленного исходного проекта. Статус draft сохранён: первичная страница каталога и утверждённые расчётные данные пока не приложены.</p></header>
      <div className="content-grid">{productFamilies.map((family) => <EntityCard key={family.id} title={family.title} summary={family.summary} label="draft · проверка первоисточника" href={`/equipment/${family.slug}/`} />)}</div>
    </section>
    <div className="container detail-layout"><div className="prose"><ContentSection title="Как проверяются характеристики"><p>Каталожный диапазон семейства не подтверждает характеристики при ваших условиях. Подбор выполняется с учётом газа, давления на входе, давления нагнетания, расхода, температуры и режима работы.</p><p>Непроверенные диапазоны серий и характеристики концепта N2-B не опубликованы: исходный каталог и утверждённый расчётный лист не предоставлены. Здесь представлены классы решений и условия инженерной проверки.</p></ContentSection></div><RfqPanel sourcePage="/equipment/" /></div>
  </>;
}
