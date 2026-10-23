import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { isStaticPreview, withBasePath } from "@/lib/preview";
import { getRfqConfiguration } from "@/lib/rfq/config";
import { Breadcrumbs, PageIntro } from "@/components/content-page";
import { ContentView } from "@/components/content-events";
import { RfqForm } from "@/components/rfq-form";

export async function generateStaticParams() {
  const { documents } = await contentRepository.getSnapshot();
  return documents.filter((item) => item.access === "public").map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { documents } = await contentRepository.getSnapshot();
  const document = documents.find((item) => item.slug === slug && item.access === "public");
  return document ? pageMetadata(document.title, document.summary, `/documents/${document.slug}/`) : {};
}

export default async function DocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { documents } = await contentRepository.getSnapshot();
  const document = documents.find((item) => item.slug === slug && item.access === "public");
  if (!document) notFound();
  if (!isStaticPreview) await connection();
  const configuration = getRfqConfiguration();
  const mode = isStaticPreview ? "preview" : configuration.staging ? "staging" : configuration.enabled ? "live" : "disabled";
  return <>
    <ContentView event="document_view" id={document.id} />
    <Breadcrumbs items={[{ label: "Опросный лист", href: `/documents/${document.slug}/` }]} />
    <PageIntro eyebrow="Параметры для подбора" title={document.title} summary={document.summary} />
    <div className="container questionnaire-intro prose">
      <p>Начните с пяти основных параметров: газ, давление на входе P₁, требуемое давление P₂, расход Q и режим работы. Неизвестные дополнительные требования можно отметить отдельно.</p>
      <p>После заполнения вы сможете скопировать данные, скачать заполненный опросный лист или распечатать его без указания контактов. Для отправки запроса заполните контактные данные и отдельное согласие.</p>
      <p>{document.href && <a href={withBasePath(document.href)} download>Скачать пустой опросный лист (.txt)</a>} · <Link href="/equipment/">Посмотреть оборудование</Link></p>
    </div>
    <div className="container rfq-page-body"><RfqForm mode={mode} initialRequest={{ document: document.id }} questionnaire /></div>
  </>;
}
