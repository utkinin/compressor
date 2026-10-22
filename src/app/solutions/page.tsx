import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, ContentSection, EntityCard, PageIntro, RfqPanel } from "@/components/content-page";

export const metadata = pageMetadata("Решения для компрессии технологических газов", "Подбор компрессора для дожатия после генератора, подачи в процесс, возврата газа и заполнения ресивера.", "/solutions/");

export default async function SolutionsPage() {
  const { solutions } = await contentRepository.getSnapshot();
  return <>
    <Breadcrumbs items={[{ label: "Решения", href: "/solutions/" }]} />
    <PageIntro eyebrow="От задачи к подбору компрессора" title="Какой компрессор нужен вашему процессу?" summary="Компрессор подбирается по условиям процесса: откуда поступает газ, какое давление требуется потребителю и как меняется нагрузка. Выберите ближайший сценарий — он поможет собрать данные для расчёта." />
    <section className="container section"><div className="content-grid">{solutions.map((solution) => <EntityCard key={solution.id} title={solution.title} summary={solution.summary} href={`/solutions/${solution.slug}/`} />)}</div></section>
    <div className="container detail-layout"><div className="prose"><ContentSection title="Что является результатом подбора"><p>Компрессор с согласованными параметрами, необходимая комплектация и границы поставки. После проверки газа, температур, давления, расхода и режима инженер определяет ступенчатость, охлаждение, привод, обвязку и управление.</p><p>Без расчёта и исходных документов нельзя обещать точную производительность модели или универсальную применимость семейства.</p></ContentSection></div><RfqPanel sourcePage="/solutions/" /></div>
  </>;
}
