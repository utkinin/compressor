"use client";

import { useEffect } from "react";

export function AttributionCapture() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("lanfor-attribution")) return;
      const query = new URLSearchParams(location.search);
      const utm: Record<string, string> = {};
      for (const key of ["source", "medium", "campaign", "term", "content"]) {
        const value = query.get(`utm_${key}`);
        if (value) utm[key] = value.slice(0, 200);
      }
      let referrer = "";
      if (document.referrer) {
        const previous = new URL(document.referrer);
        referrer = `${previous.origin}${previous.pathname}`.slice(0, 500);
      }
      sessionStorage.setItem("lanfor-attribution", JSON.stringify({ landingPage: location.pathname, ...(referrer ? { referrer } : {}), ...(Object.keys(utm).length ? { utm } : {}) }));
    } catch {
      // Browser storage is optional; the RFQ still works without attribution.
    }
  }, []);
  return null;
}
