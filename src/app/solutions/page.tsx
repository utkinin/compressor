import Link from "next/link";
import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, ContentSection, EntityCard, PageIntro, RfqPanel } from "@/components/content-page";

export const metadata = pageMetadata("Решения для сжатия и подачи технологических газов", "Дожатие после генератора, газоснабжение оборудования, возврат газа и заполнение ресивера. Подбор компрессора и необходимой комплектации по задаче.", "/solutions/");

export default async function SolutionsPage() {
  const { solutions, industries } = await contentRepository.getSnapshot();
  return <>
    <Breadcrumbs items={[{ label: "Решения", href: "/solutions/" }]} />
    <PageIntro eyebrow="Технологические задачи" title="Решения для сжатия, подачи и возврата газа" summary="Дожатие после генератора, газоснабжение станка, возврат гелия или заполнение ресивера требуют разного оборудования. Выберите свою задачу: определим параметры компрессора и необходимую комплектацию." />
    <section className="container section"><div className="content-grid">{solutions.map((solution) => <EntityCard key={solution.id} title={solution.title} summary={solution.summary} href={`/solutions/${solution.slug}/`} />)}</div></section>
    <section className="container prose content-section" aria-labelledby="solution-industries-title"><h2 id="solution-industries-title">Отрасли и применения</h2><p>Задача компрессора зависит от производственного процесса, требований потребителя и доступного источника газа.</p><ul className="related-links">{industries.map((industry) => <li key={industry.id}><Link href={`/industries/${industry.slug}/`}>{industry.title} →</Link></li>)}</ul></section>
    <div className="container detail-layout"><div className="prose"><ContentSection title="От задачи к составу поставки"><p>Сначала выбираем компрессор по составу газа, давлению на входе, требуемому давлению, расходу и режиму работы. Затем определяем привод, охлаждение, КИП, арматуру, ресивер и управление — в том составе, который нужен вашему процессу.</p><p>Техническое предложение включает согласованные параметры, комплектность, подключения и условия приёмки оборудования.</p></ContentSection></div><RfqPanel sourcePage="/solutions/" /></div>
  </>;
}
