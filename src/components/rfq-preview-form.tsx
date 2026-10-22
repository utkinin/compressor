"use client";

import { useSearchParams } from "next/navigation";
import { RfqForm } from "@/components/rfq-form";
import { GAS_OPTIONS } from "@/lib/rfq/schema";

export function RfqPreviewForm() {
  const query = useSearchParams();
  const initialGas = GAS_OPTIONS.find((option) => option.value === query.get("gas"))?.value;
  const initialRequest: { solution?: string; equipment?: string; document?: string } = {};
  for (const key of ["solution", "equipment", "document"] as const) {
    const value = query.get(key);
    if (value && /^[a-z0-9-]{1,150}$/.test(value)) initialRequest[key] = value;
  }
  const formKey = [initialGas ?? "n2", initialRequest.solution, initialRequest.equipment, initialRequest.document].join(":");
  return <RfqForm key={formKey} mode="preview" initialGas={initialGas} initialRequest={initialRequest} />;
}
