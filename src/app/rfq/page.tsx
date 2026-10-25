import { RfqIntake } from "@/components/rfq-intake";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getRfqConfiguration } from "@/lib/rfq/config";
import { GAS_OPTIONS, initialRfqSelection, sanitizeRfqContext } from "@/lib/rfq/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Подобрать безмасляный компрессор или бустер",
  "Опишите задачу для N₂, He, CO₂ или другого технологического газа. Укажите известные параметры или приложите ТЗ и схему для начала подбора.",
  "/rfq",
);

export const dynamic = "force-dynamic";

export default async function RfqPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const initialGas = GAS_OPTIONS.find((option) => option.value === query.gas)?.value;
  const initialRequest = sanitizeRfqContext(query);
  const selection = initialRfqSelection(initialGas, initialRequest.equipment);
  const intake = query.intake === "integration" ? "integration" : query.intake === "brief" ? "brief" : "parameters";
  const formKey = [intake, selection.gas, initialRequest.solution, initialRequest.equipment, initialRequest.document].join(":");
  const configuration = getRfqConfiguration();
  const mode = configuration.staging ? "staging" : configuration.enabled ? "live" : "disabled";
  return (
    <>
      <div className="container"><Breadcrumbs items={[{ label: "Инженерный запрос", href: "/rfq" }]} /></div>
      <div className="container rfq-page-intro">
        <p className="eyebrow">Подбор оборудования</p>
        <h1>Подберём компрессор для вашей задачи</h1>
        <p>Укажите известные параметры или опишите задачу и приложите ТЗ, паспорт, схему либо фото шильды. Неизвестные давление и расход уточним при проработке.</p>
      </div>
      <div className="container rfq-page-body"><RfqIntake key={formKey} mode={mode} initialGas={initialGas} initialRequest={initialRequest} initialIntake={intake} /></div>
    </>
  );
}
