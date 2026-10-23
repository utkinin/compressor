import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, ContentSection, EntityCard, PageIntro, RfqPanel } from "@/components/content-page";
import { engineeringGuides } from "./guides";

export const metadata = pageMetadata("Подбор компрессора по параметрам газа", "От исходных параметров газа к выбору компрессора, дополнительной комплектации и согласованным границам поставки.", "/engineering/");

export default function EngineeringPage() {
  return <>
    <Breadcrumbs items={[{ label: "Инжиниринг", href: "/engineering/" }]} />
    <PageIntro eyebrow="Подбор оборудования" title="От параметров газа к компрессору" summary="Согласуем состав газа, давления, расход, режим работы и подключения на площадке. На этой основе выбираются конструкция, ступени, охлаждение и обвязка. Каталожный максимум не заменяет расчёт." action={<Link className="button" href="/rfq/?source=%2Fengineering%2F">Отправить параметры →</Link>} />
    <section className="container section"><div className="content-grid">{engineeringGuides.map((guide) => <EntityCard key={guide.slug} title={guide.title} summary={guide.summary} href={`/engineering/${guide.slug}/`} />)}</div></section>
    <div className="container detail-layout"><article className="prose"><ContentSection title="Последовательность инженерного этапа"><ol><li><strong>Собрать исходные данные.</strong> Газ и состав, P₁/P₂/Q с единицами, температуры, режим и площадка.</li><li><strong>Проверить применимость.</strong> Материалы, герметичность, безопасность, фазовое состояние и условия охлаждения.</li><li><strong>Согласовать схему.</strong> Ступени, буферы, арматура, КИП, защита и интерфейсы управления.</li><li><strong>Определить комплектность.</strong> Граница поставки, документация, проверки и условия предложения.</li></ol></ContentSection><ContentSection title="Что вы получите после расчёта"><p>Согласованные параметры компрессора, необходимую комплектацию, подключения и состав поставки. В техническом предложении указываются условия, при которых обеспечиваются требуемые давление и расход.</p><Link href="/knowledge/" className="link-arrow">Материалы о выборе компрессора →</Link></ContentSection></article><RfqPanel sourcePage="/engineering/" /></div>
  </>;
}
