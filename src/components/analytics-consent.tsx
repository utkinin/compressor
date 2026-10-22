"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AnalyticsProps } from "@/lib/analytics";

const consentKey = "lanfor-analytics-consent-v1";
const gaId = process.env.NEXT_PUBLIC_GA4_ID;
const ymId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID);
const hasAnalytics = Boolean(gaId && /^G-[A-Z0-9]+$/.test(gaId)) || (Number.isSafeInteger(ymId) && ymId > 0);

export function AnalyticsConsent() {
  const [choice, setChoice] = useState<string | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const ready = useRef(false);
  const queue = useRef<{ name: string; properties: AnalyticsProps }[]>([]);

  useEffect(() => {
    let stored: string | null = null;
    try { stored = localStorage.getItem(consentKey); } catch { /* Browser storage is optional. */ }
    window.lanforAnalyticsConsent = stored === "accepted";
    queueMicrotask(() => setChoice(stored || "pending"));
    window.lanforAnalyticsSender = (name, properties) => {
      if (!window.lanforAnalyticsConsent) return;
      const event = { name, properties };
      if (ready.current) frame.current?.contentWindow?.postMessage(event, "*");
      else if (queue.current.length < 30) queue.current.push(event);
    };
    return () => { delete window.lanforAnalyticsSender; window.lanforAnalyticsConsent = false; };
  }, []);

  if (!hasAnalytics) return null;
  function choose(value: string) {
    window.lanforAnalyticsConsent = value === "accepted";
    setChoice(value);
    try { localStorage.setItem(consentKey, value); } catch { /* In-memory preference applies. */ }
    if (value !== "accepted") {
      ready.current = false;
      queue.current = [];
    }
    // React removes the sandbox on decline: SDK timers/queues are destroyed.
  }

  return <>
    {choice === "accepted" && <iframe ref={frame} title="Изолированный адаптер аналитики" hidden aria-hidden="true" tabIndex={-1} sandbox="allow-scripts" referrerPolicy="no-referrer" src="/api/analytics-frame" onLoad={() => {
      ready.current = true;
      for (const event of queue.current) frame.current?.contentWindow?.postMessage(event, "*");
      queue.current = [];
    }} />}
    <aside className="analytics-preferences" aria-label="Настройки аналитики">
      {choice === "pending" ? <><p>С вашего разрешения используем обезличенные события аналитики. Контакты и содержимое формы не передаются. <Link href="/legal/cookies/">Подробнее</Link></p><div className="button-row"><button className="button button-small" onClick={() => choose("accepted")}>Разрешить аналитику</button><button className="button-secondary button-small" onClick={() => choose("declined")}>Продолжить без аналитики</button></div></> : <button className="text-button" onClick={() => { ready.current = false; queue.current = []; setChoice("pending"); }}>Настройки аналитики</button>}
    </aside>
  </>;
}
