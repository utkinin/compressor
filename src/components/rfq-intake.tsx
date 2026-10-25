"use client";

import { useState } from "react";
import { RfqForm } from "@/components/rfq-form";
import { BriefRfqForm } from "@/components/rfq-brief-form";
import type { Gas, RfqRequestContext } from "@/lib/rfq/schema";
import "./rfq-brief.css";

export type RfqFormMode = "preview" | "staging" | "live" | "disabled";
export type RfqIntakeKind = "parameters" | "brief" | "integration";

export function RfqIntake({ mode, initialGas, initialRequest, initialIntake = "parameters" }: {
  mode: RfqFormMode; initialGas?: Gas; initialRequest?: RfqRequestContext; initialIntake?: RfqIntakeKind;
}) {
  const [intake, setIntake] = useState(initialIntake);
  return <div className="rfq-intake">
    <section className="rfq-intake-choice" aria-label="Как вам удобнее начать подбор">
      <h2>Начните с того, что уже известно</h2>
      <p>Можно указать параметры газа или описать задачу и приложить ТЗ, паспорт, схему либо фото шильды. Неизвестные давление и расход не мешают первому обращению.</p>
      <div className="rfq-intake-buttons">
        <button type="button" aria-pressed={intake === "parameters"} onClick={() => setIntake("parameters")}>Указать параметры</button>
        <button type="button" aria-pressed={intake === "brief"} onClick={() => setIntake("brief")}>Описать задачу или приложить ТЗ</button>
        <button type="button" aria-pressed={intake === "integration"} onClick={() => setIntake("integration")}>Интеграция в оборудование</button>
      </div>
    </section>
    <div hidden={intake !== "parameters"}><RfqForm mode={mode} initialGas={initialGas} initialRequest={initialRequest} /></div>
    {intake === "brief" && <BriefRfqForm mode={mode} initialGas={initialGas} initialRequest={initialRequest} />}
    {intake === "integration" && <BriefRfqForm mode={mode} initialGas={initialGas} initialRequest={initialRequest} variant="integration" />}
  </div>;
}
