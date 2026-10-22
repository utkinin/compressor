"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track } from "@/lib/analytics";

export function TrackedLink({ event, children, ...props }: ComponentProps<typeof Link> & { event: "hero_rfq_click" | "contact_click" | "document_view" | "document_download" | "cad_request" }) {
  return <Link {...props} onClick={() => track(event)}>{children}</Link>;
}
