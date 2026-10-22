"use client";

import { track } from "@/lib/analytics";

export function ContactAction({ kind, value }: { kind: "email" | "phone"; value: string }) {
  const href = kind === "email" ? `mailto:${value}` : `tel:${value.replace(/[^+0-9]/g, "")}`;
  return <a href={href} onClick={() => { track("contact_click", { mode: kind }); track(kind === "email" ? "email_click" : "phone_click"); }}>{value}</a>;
}
