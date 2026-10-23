import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RfqPreviewForm } from "@/components/rfq-preview-form";

/** Static GitHub Pages uses the same engineering flow without a delivery backend. */
export function RfqPreview() {
  return <>
    <div className="container"><Breadcrumbs items={[{ label: "Инженерный запрос", href: "/rfq" }]} /></div>
    <div className="container rfq-page-intro">
      <p className="eyebrow">Подбор оборудования</p>
      <h1>Начните с параметров или описания задачи</h1>
      <p>Укажите газ, известные давления, расход и режим или опишите задачу и выберите файл. Эта демонстрация работает в браузере без отправки заявок и загрузки файлов.</p>
    </div>
    <div className="container rfq-page-body">
      <Suspense fallback={<p className="notice">Подготовка демонстрационной формы…</p>}><RfqPreviewForm /></Suspense>
    </div>
  </>;
}
