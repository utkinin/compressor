import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, ContentSection, EntityCard, PageIntro, RfqPanel } from "@/components/content-page";
import { engineeringGuides } from "./guides";

export const metadata = pageMetadata("Инженерный подбор газового узла", "Практический маршрут от исходных данных до рабочей точки, схемы и согласованных границ компрессорного skid.", "/engineering/");

export default function EngineeringPage() {
  return <>
    <Breadcrumbs items={[{ label: "Инжиниринг", href: "/engineering/" }]} />
    <PageIntro eyebrow="Engineering / как строится подбор" title="Сначала расчётная задача. Затем оборудование." summary="Согласуем газ, диапазон рабочих точек и интерфейсы площадки. На этой основе выбираются конструкция, ступени, охлаждение и обвязка. Каталожный максимум не заменяет расчёт." action={<Link className="button" href="/rfq/?source=%2Fengineering%2F">Задать рабочую точку →</Link>} />
    <section className="container section"><div className="content-grid">{engineeringGuides.map((guide) => <EntityCard key={guide.slug} title={guide.title} summary={guide.summary} href={`/engineering/${guide.slug}/`} />)}</div></section>
    <div className="container detail-layout"><article className="prose"><ContentSection title="Последовательность инженерного этапа"><ol><li><strong>Собрать исходные данные.</strong> Газ и состав, P₁/P₂/Q с единицами, температуры, режим и площадка.</li><li><strong>Проверить применимость.</strong> Материалы, герметичность, безопасность, фазовое состояние и условия охлаждения.</li><li><strong>Согласовать схему.</strong> Ступени, буферы, арматура, КИП, защита и интерфейсы управления.</li><li><strong>Определить комплектность.</strong> Граница поставки, документация, проверки и условия предложения.</li></ol></ContentSection><ContentSection title="Что не является подтверждённым подбором"><p>Ответ формы RFQ, схема на сайте и значение максимального давления семейства. Подтверждение требует расчётной рабочей точки и согласованного технического предложения на конкретное исполнение.</p><Link href="/knowledge/" className="link-arrow">Разобраться с величинами и режимами →</Link></ContentSection></article><RfqPanel sourcePage="/engineering/" /></div>
  </>;
}
