import { RfqForm } from "@/components/rfq-form";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getRfqConfiguration } from "@/lib/rfq/config";
import { GAS_OPTIONS } from "@/lib/rfq/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Подобрать компрессорный узел — инженерный RFQ",
  "Передайте газ, давление на входе и выходе, расход и режим работы. Уточняющие вопросы для N₂, He, H₂, O₂, CO₂ и газовых смесей.",
  "/rfq",
);

export const dynamic = "force-dynamic";

export default async function RfqPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const initialGas = GAS_OPTIONS.find((option) => option.value === query.gas)?.value;
  const initialRequest: { solution?: string; equipment?: string; document?: string } = {};
  for (const key of ["solution", "equipment", "document"] as const) {
    const value = query[key];
    if (typeof value === "string" && /^[a-z0-9-]{1,150}$/.test(value)) initialRequest[key] = value;
  }
  const configuration = getRfqConfiguration();
  const mode = configuration.staging ? "staging" : configuration.enabled ? "live" : "disabled";
  return (
    <>
      <div className="container"><Breadcrumbs items={[{ label: "Инженерный запрос", href: "/rfq" }]} /></div>
      <div className="container rfq-page-intro">
        <p className="eyebrow">Engineering request / RFQ</p>
        <h1>Начните с рабочей точки</h1>
        <p>Газ + P₁ + P₂ + Q + режим. Пять параметров, с которых начинается подбор функционального компрессорного узла. Конкретную модель, исполнение и состав поставки определяет инженерный расчёт.</p>
      </div>
      <div className="container rfq-page-body"><RfqForm mode={mode} initialGas={initialGas} initialRequest={initialRequest} /></div>
    </>
  );
}
