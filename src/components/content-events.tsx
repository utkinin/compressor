"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { withBasePath } from "@/lib/preview";

type ViewEvent = "solution_view" | "gas_view" | "equipment_view" | "document_view";

export function ContentView({ event, id }: { event: ViewEvent; id: string }) {
  useEffect(() => { track(event, { entity_id: id }); }, [event, id]);
  return null;
}

export function DocumentAction({ href, id, access, cad = false, children }: { href: string; id: string; access: "public" | "request"; cad?: boolean; children: ReactNode }) {
  const onClick = () => {
    if (access === "public") track("document_download", { entity_id: id });
    else if (cad) track("cad_request", { entity_id: id });
  };
  return access === "public"
    ? <a className="button" href={withBasePath(href)} download onClick={onClick}>{children}</a>
    : <Link className="button" href={href} onClick={onClick}>{children}</Link>;
}
