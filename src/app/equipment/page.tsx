import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, ContentSection, EntityCard, PageIntro, RfqPanel } from "@/components/content-page";

export const metadata = pageMetadata("Компрессоры, бустеры и skid-системы", "Пять классов функциональных газовых узлов: от Oil-Free компрессорного блока до recovery-системы с управлением.", "/equipment/");

export default async function EquipmentPage() {
  const { equipment, productFamilies } = await contentRepository.getSnapshot();
  return <>
    <Breadcrumbs items={[{ label: "Оборудование", href: "/equipment/" }]} />
    <PageIntro eyebrow="Equipment families" title="Не список моделей. Функциональный узел." summary="Формат поставки зависит от задач интеграции: отдельный компрессорный блок, booster, модуль, skid или система возврата газа. Сравнивайте границы ответственности и состав узла, а не только максимальное давление в каталоге." />
    <section className="container section"><div className="content-grid">{equipment.map((family) => <EntityCard key={family.id} title={family.title} summary={family.summary} href={`/equipment/${family.slug}/`} />)}</div></section>
    <section className="container section">
      <header className="section-heading"><div><p className="eyebrow">Исходные семейства / draft</p><h2>UNIGY: проверить под рабочую точку</h2></div><p>Пять семейств из предоставленного исходного проекта. Статус draft сохранён: первичная страница каталога и утверждённые расчётные данные пока не приложены.</p></header>
      <div className="content-grid">{productFamilies.map((family) => <EntityCard key={family.id} title={family.title} summary={family.summary} label="draft · проверка первоисточника" href={`/equipment/${family.slug}/`} />)}</div>
    </section>
    <div className="container detail-layout"><div className="prose"><ContentSection title="Каталожный диапазон и рабочая точка"><p>Каталожный диапазон семейства не является гарантированной рабочей точкой. Подбор выполняется с учётом газа, давления на входе, давления нагнетания, расхода, температуры и режима работы.</p><p>Числовые envelopes UNIGY и характеристики N2-B не опубликованы: исходный каталог и утверждённый расчётный лист не предоставлены. Здесь представлены классы решений и условия инженерной проверки.</p></ContentSection></div><RfqPanel sourcePage="/equipment/" /></div>
  </>;
}
