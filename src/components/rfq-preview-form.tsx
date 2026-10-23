"use client";

import { useSearchParams } from "next/navigation";
import { RfqForm } from "@/components/rfq-form";
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
  const formKey = [selection.gas, initialRequest.solution, initialRequest.equipment, initialRequest.document].join(":");
  return <RfqForm key={formKey} mode="preview" initialGas={selection.gas} initialRequest={initialRequest} />;
}
