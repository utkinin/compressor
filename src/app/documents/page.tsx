import Link from "next/link";
import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, ContentSection, EntityCard, PageIntro } from "@/components/content-page";

export const metadata = pageMetadata("Документы и инженерные материалы", "Опросный лист, datasheet, чертежи, CAD и комплект документов под согласованную конфигурацию газового компрессора.", "/documents/");

export default async function DocumentsPage() {
  const { documents } = await contentRepository.getSnapshot();
  const visibleDocuments = documents.filter((document) => document.access !== "internal");
  return <>
    <Breadcrumbs items={[{ label: "Документы", href: "/documents/" }]} />
    <PageIntro eyebrow="Documentation / procurement" title="Документ должен соответствовать конфигурации." summary="Опросный лист доступен открыто. Паспортные данные, чертежи и CAD запрашиваются для выбранного исполнения: общий файл не заменяет согласованный комплект документации на поставку." />
    <section className="container section"><div className="content-grid">{visibleDocuments.map((document) => <EntityCard key={document.id} title={document.title} summary={document.summary} label={`${document.type} · ${document.access === "public" ? "Открытый доступ" : "По запросу"}`} href={`/documents/${document.slug}/`} />)}</div></section>
    <section className="container prose"><ContentSection title="Что приложить к запросу документа"><p>Укажите задачу, газ, давления, расход и режим, стадию проекта и назначение файла: компоновка, подключение, оценка безопасности или закупка. Для CAD/STEP также нужны требуемый формат и ограничения по интерфейсам.</p><p>Наличие сертификата или разрешительного документа не предполагается по умолчанию. Состав подтверждений согласуется по исполнению, газу и требованиям проекта.</p><Link className="button-secondary" href="/rfq/?document=technical-documentation&source=%2Fdocuments%2F">Запросить документ →</Link></ContentSection></section>
  </>;
}
