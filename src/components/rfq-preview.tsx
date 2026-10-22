import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RfqPreviewForm } from "@/components/rfq-preview-form";

/** Static GitHub Pages uses the same engineering flow without a delivery backend. */
export function RfqPreview() {
  return <>
    <div className="container"><Breadcrumbs items={[{ label: "Инженерный запрос", href: "/rfq" }]} /></div>
    <div className="container rfq-page-intro">
      <p className="eyebrow">Engineering request / RFQ</p>
      <h1>Начните с рабочей точки</h1>
      <p>Газ + P₁ + P₂ + Q + режим. Проверьте весь сценарий инженерного запроса. Эта версия на GitHub Pages демонстрирует интерфейс и не принимает заявки.</p>
    </div>
    <div className="container rfq-page-body">
      <Suspense fallback={<p className="notice">Подготовка демонстрационной формы…</p>}><RfqPreviewForm /></Suspense>
    </div>
  </>;
}
