"use client";

import { useEffect, useRef, useState } from "react";

const CAL_LINK = "dele-oyeleru-chukwuka-mcdavies-qcy0z9/30min";
const CAL_URL = "https://cal.com/dele-oyeleru-chukwuka-mcdavies-qcy0z9/30min";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window { Cal?: any }
}

/** Official Cal.com inline embed, brand-themed, with a real fallback link if
 *  the embed fails to initialise. Prefills name/email/phone from a safe
 *  sessionStorage handoff (never from visible URL params). */
export function CalEmbed() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let prefill: Record<string, string> = {};
    try {
      const raw = sessionStorage.getItem("bredge_schedule_prefill");
      if (raw) {
        const d = JSON.parse(raw) as { name?: string; email?: string; phone?: string };
        if (d.name) prefill.name = d.name;
        if (d.email) prefill.email = d.email;
        if (d.phone) prefill["attendeePhoneNumber"] = d.phone;
        sessionStorage.removeItem("bredge_schedule_prefill");
      }
    } catch { prefill = {}; }

    // Official Cal embed loader (queue shim; rest params to satisfy lint)
    const A = "https://app.cal.com/embed/embed.js";
    const C = window as any;
    const push = (target: any, entry: any) => { target.q.push(entry); };
    C.Cal = C.Cal || function (...ar: any[]) {
      const cal = C.Cal;
      if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; document.head.appendChild(document.createElement("script")).src = A; cal.loaded = true; }
      if (ar[0] === "init") {
        const api: any = (...a: any[]) => push(api, a);
        const namespace = ar[1]; api.q = api.q || [];
        if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; push(cal.ns[namespace], ar); push(cal, ["initNamespace", namespace]); }
        else push(cal, ar);
        return;
      }
      push(cal, ar);
    };

    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const Cal = C.Cal;
        Cal("init", "bredge", { origin: "https://cal.com" });
        Cal.ns.bredge("inline", { elementOrSelector: hostRef.current, calLink: CAL_LINK, layout: "month_view", config: { theme: "light", layout: "month_view", ...prefill } });
        Cal.ns.bredge("ui", { theme: "light", hideEventTypeDetails: false, cssVarsPerTheme: { light: { "cal-brand": "#142321" } } });
      } catch { setFailed(true); }
    });

    // If nothing rendered into the host shortly, show the fallback.
    const t = window.setTimeout(() => {
      if (!cancelled && hostRef.current && hostRef.current.childElementCount === 0) setFailed(true);
    }, 4000);

    return () => { cancelled = true; window.clearTimeout(t); };
  }, []);

  return (
    <div className="cal-wrap">
      <div ref={hostRef} className="cal-inline" style={{ minHeight: 620, width: "100%" }} />
      {failed && (
        <p className="cal-fallback">
          Calendar didn’t load. <a className="text-link" href={CAL_URL} target="_blank" rel="noopener noreferrer">Open the booking page <span className="arrow" aria-hidden="true">↗</span></a>
        </p>
      )}
    </div>
  );
}
