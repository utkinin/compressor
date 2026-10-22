import { analyticsEvents } from "@/lib/analytics";
import { ANALYTICS_FRAME_CSP } from "@/lib/analytics-security";

export const dynamic = "force-dynamic";

/** No RFQ data, parent URL or parent referrer is available in this opaque sandbox. */
export function GET() {
  const ga = process.env.NEXT_PUBLIC_GA4_ID || "";
  const ym = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID);
  const configuration = JSON.stringify({
    ga: /^G-[A-Z0-9]+$/.test(ga) ? ga : null,
    ym: Number.isSafeInteger(ym) && ym > 0 ? ym : null,
    events: analyticsEvents,
  }).replace(/</g, "\\u003c");
  const body = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Analytics adapter</title></head><body><script>
"use strict";
const config = ${configuration};
const allowedKeys = new Set(["step","gas","field","entity_id","path","solution","equipment","document","unit","delivery","code","mode"]);
const safeUrl = location.origin + "/analytics/events";
if (config.ga) {
  window.dataLayer = [];
  window.gtag = function() { window.dataLayer.push(arguments); };
  gtag("js", new Date());
  gtag("config", config.ga, {send_page_view:false, page_location:safeUrl, page_referrer:"", client_id:crypto.randomUUID(), allow_google_signals:false, allow_ad_personalization_signals:false});
  const ga = document.createElement("script"); ga.async=true; ga.src="https://www.googletagmanager.com/gtag/js?id="+config.ga; document.head.append(ga);
}
if (config.ym) {
  window.ym = function() { (window.ym.a=window.ym.a||[]).push(arguments); }; window.ym.l=Date.now();
  ym(config.ym,"init",{defer:true,clickmap:false,trackLinks:false,webvisor:false,accurateTrackBounce:false,disableCookies:true});
  const ymScript=document.createElement("script"); ymScript.async=true; ymScript.src="https://mc.yandex.ru/metrika/tag.js"; document.head.append(ymScript);
}
window.addEventListener("message", function(event) {
  if(event.source!==parent || !event.data || !config.events.includes(event.data.name)) return;
  const props={};
  for(const [key,value] of Object.entries(event.data.properties||{})) {
    if(!allowedKeys.has(key)) continue;
    if(typeof value==="string" && /^[a-zA-Z0-9_./:\\-]{1,160}$/.test(value)) props[key]=value;
    else if((typeof value==="number" && Number.isFinite(value)) || typeof value==="boolean") props[key]=value;
  }
  if(config.ga) gtag("event",event.data.name,{...props,page_location:safeUrl,page_referrer:""});
  if(config.ym) ym(config.ym,"reachGoal",event.data.name,props);
});
</script></body></html>`;
  return new Response(body, { headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": ANALYTICS_FRAME_CSP,
  } });
}
