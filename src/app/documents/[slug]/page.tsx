import { notFound } from "next/navigation";
import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, ContentSection, PageIntro, RelatedLinks } from "@/components/content-page";
import { ContentView, DocumentAction } from "@/components/content-events";

export async function generateStaticParams() { const { documents } = await contentRepository.getSnapshot(); return documents.filter((item) => item.access !== "internal").map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { documents } = await contentRepository.getSnapshot();
  const document = documents.find((item) => item.slug === slug && item.access !== "internal");
  return document ? pageMetadata(document.title, document.summary, `/documents/${document.slug}/`) : {};
}

export default async function DocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { documents, equipment, gases } = await contentRepository.getSnapshot();
  const document = documents.find((item) => item.slug === slug && item.access !== "internal");
  if (!document || document.access === "internal") notFound();
  const downloadable = document.access === "public" && Boolean(document.href);
  return <>
    <ContentView event="document_view" id={document.id} />
    <Breadcrumbs items={[{ label: "Документы", href: "/documents/" }, { label: document.title, href: `/documents/${document.slug}/` }]} />
    <PageIntro eyebrow={`${document.type} / ${downloadable ? "открытый доступ" : "по запросу"}`} title={document.title} summary={document.summary} />
    <div className="container detail-layout"><article className="prose">
      <ContentSection title={downloadable ? "Как использовать документ" : "Как получить подходящий документ"}>
        {downloadable ? <p>Это собственный опросный лист Lanfor для сбора исходных данных. Заполняйте известные значения с единицами; неизвестные параметры отмечайте отдельно. Лист помогает поставить задачу и не является расчётом или паспортом оборудования.</p> : <><p>В запросе укажите газ, давления, расход, режим и тип компрессора и цель документа. Инженер проверит наличие и применимость материала для выбранной конфигурации.</p><p>Файл не выдан за существующий публичный download. Доступность, актуальная версия и возможность передачи документа должны быть согласованы. Сертификаты, CAD и расчётные листы относятся к конкретному исполнению.</p></>}
        <DocumentAction href={downloadable && document.href ? document.href : `/rfq/?document=${document.id}&source=${encodeURIComponent(`/documents/${document.slug}/`)}`} id={document.id} access={downloadable ? "public" : "request"} cad={document.type === "CAD" || document.type === "STEP"}>{downloadable ? "Скачать опросный лист (.txt)" : "Запросить документ"} →</DocumentAction>
      </ContentSection>
      <ContentSection title="Что приложить к запросу"><p>Состав газа, давления на входе и выходе с указанием bar(g) или bar(a), расход с единицами и условиями приведения, температуру и режим работы. Для компоновки дополнительно нужны доступное место и интерфейсы площадки.</p></ContentSection>
      <RelatedLinks title="Связанные классы оборудования" items={equipment.filter((item) => document.equipmentIds.includes(item.id)).map((item) => ({ title: item.title, href: `/equipment/${item.slug}/` }))} />
      <RelatedLinks title="Газовые требования" items={gases.filter((item) => document.gasIds.includes(item.id)).map((item) => ({ title: item.title, href: `/gases/${item.slug}/` }))} />
    </article><aside className="rfq-panel"><p className="eyebrow">Комплект поставки</p><h2>Сначала исполнение. Затем документ.</h2><p>Габариты, подключения, разрешительная документация и условия эксплуатации должны соответствовать согласованному узлу. Документ на другое исполнение не заменяет проверку.</p></aside></div>
  </>;
}
