"use client";

import { useSearchParams } from "next/navigation";
import { RfqIntake } from "@/components/rfq-intake";
import { GAS_OPTIONS, initialRfqSelection, sanitizeRfqContext } from "@/lib/rfq/schema";

export function RfqPreviewForm() {
  const query = useSearchParams();
  const initialGas = GAS_OPTIONS.find((option) => option.value === query.get("gas"))?.value;
  const initialRequest = sanitizeRfqContext({
    solution: query.get("solution"),
    equipment: query.get("equipment"),
    document: query.get("document"),
  });
  const selection = initialRfqSelection(initialGas, initialRequest.equipment);
  const intake = query.get("intake") === "brief" ? "brief" : "parameters";
  const formKey = [intake, selection.gas, initialRequest.solution, initialRequest.equipment, initialRequest.document].join(":");
  return <RfqIntake key={formKey} mode="preview" initialGas={initialGas} initialRequest={initialRequest} initialIntake={intake} />;
}
