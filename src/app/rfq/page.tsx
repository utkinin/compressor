import { RfqForm } from "@/components/rfq-form";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getRfqConfiguration } from "@/lib/rfq/config";
import { GAS_OPTIONS, initialRfqSelection, sanitizeRfqContext } from "@/lib/rfq/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Подобрать безмасляный компрессор или бустер",
  "Опишите задачу для N₂, He, SF₆, CO₂ или другого технологического газа. Газ, требуемые давление, расход и режим помогут уточнить оборудование и комплектацию.",
  "/rfq",
);

export const dynamic = "force-dynamic";

export default async function RfqPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const initialGas = GAS_OPTIONS.find((option) => option.value === query.gas)?.value;
  const initialRequest = sanitizeRfqContext(query);
  const selection = initialRfqSelection(initialGas, initialRequest.equipment);
  const formKey = [selection.gas, initialRequest.solution, initialRequest.equipment, initialRequest.document].join(":");
  const configuration = getRfqConfiguration();
  const mode = configuration.staging ? "staging" : configuration.enabled ? "live" : "disabled";
  return (
    <>
      <div className="container"><Breadcrumbs items={[{ label: "Инженерный запрос", href: "/rfq" }]} /></div>
      <div className="container rfq-page-intro">
        <p className="eyebrow">Engineering request / RFQ</p>
        <h1>Подберём компрессор для вашей задачи</h1>
        <p>Расскажите о газе, источнике и потребителе. Укажите известные давления, расход и режим работы — инженер уточнит подходящий компрессор или бустер и необходимую комплектацию.</p>
      </div>
      <div className="container rfq-page-body"><RfqForm key={formKey} mode={mode} initialGas={selection.gas} initialRequest={initialRequest} /></div>
    </>
  );
}
