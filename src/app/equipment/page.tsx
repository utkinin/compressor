import Link from "next/link";
import { contentRepository } from "@/content";
import { pageMetadata, absoluteUrl } from "@/lib/seo";
import { Breadcrumbs } from "@/components/content-page";
import { CommercialHero } from "@/components/commercial-hero";
import { HeroVisual } from "@/components/hero-visual";
import { EquipmentCards, EquipmentSelection } from "@/components/equipment-catalog";
import { JsonLd } from "@/components/json-ld";

const title = "Компрессоры и бустеры для технологических газов";
const description = "Безмасляные компрессоры и бустеры для азота, гелия, CO₂ и других технологических газов. Подбор по давлению на входе, требуемому давлению, расходу и режиму работы.";

export const metadata = pageMetadata(title, description, "/equipment/");

export default async function EquipmentPage() {
  const { equipment, solutions } = await contentRepository.getSnapshot();
  const directions = equipment.filter((item) => !item.externalReference);
  const references = equipment.filter((item) => item.externalReference);
  const solutionIds = ["nitrogen-for-laser-cutting", "nitrogen-booster-after-generator", "helium-recovery", "gas-transfer-recovery"];
  const applications = solutionIds.flatMap((id) => solutions.filter((solution) => solution.id === id));
  return <>
    <Breadcrumbs items={[{ label: "Оборудование", href: "/equipment/" }]} />
    <CommercialHero eyebrow="Оборудование / назначение и подбор" title={title} summary={description} visualId="equipment-range" action={<Link className="button" href="/rfq/?source=%2Fequipment%2F">Подобрать компрессор <span aria-hidden="true">→</span></Link>} />
    <section className="container equipment-catalog-section" aria-label="Каталог оборудования"><EquipmentCards items={directions} /></section>
    <section className="container content-section" aria-label="Специализированные направления">{references.map((item) => <div className="equipment-reference-panel" key={item.id}><HeroVisual id={item.heroVisualId} variant="card" caption={false} /><div><p className="eyebrow">Специализированное направление</p><h2><Link href={`/equipment/${item.slug}/`}>{item.title}</Link></h2><p>Оборудование для работы с элегазом представлено в специализированном направлении SF6RUS.</p><Link className="text-link" href={`/equipment/${item.slug}/`}>Перейти к справочному разделу <span aria-hidden="true">→</span></Link></div></div>)}</section>
    <section className="section equipment-solutions-section" aria-labelledby="equipment-solutions-title"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">От оборудования к процессу</p><h2 id="equipment-solutions-title">Решения под технологическую задачу</h2></div><p>Компрессор выполняет функцию сжатия. Решение связывает его с источником газа, потребителем, подготовкой и управлением.</p></div>
      <div className="equipment-solutions-grid">{applications.map((solution) => <Link className="equipment-solution-link" href={`/solutions/${solution.slug}/`} key={solution.id}><HeroVisual id={solution.heroVisualId} variant="card" caption={false} /><div><h3>{solution.title}</h3><p>{solution.summary}</p></div><span aria-hidden="true">→</span></Link>)}</div>
      <Link className="text-link" href="/solutions/">Все решения <span aria-hidden="true">→</span></Link>
    </div></section>
    <div className="container section"><EquipmentSelection rfqHref="/rfq/?source=%2Fequipment%2F" /></div>
    <JsonLd data={{
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: absoluteUrl("/equipment/"),
      inLanguage: "ru-RU",
      mainEntity: {
        "@type": "ItemList",
        name: "Компрессоры и бустеры по назначению",
        numberOfItems: directions.length,
        itemListElement: directions.map((item, index) => ({ "@type": "ListItem", position: index + 1, item: { "@type": "WebPage", name: item.title, url: absoluteUrl(`/equipment/${item.slug}/`) } })),
      },
    }} />
  </>;
}
