"use client";

import { useEffect, useState } from "react";
import { deviceGroup, trafficGroup, trackEvent } from "../../lib/analytics";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Cfg = { ga4?: string; clarity?: string; gtm?: string };

function getCfg(): Cfg {
  if (typeof window === "undefined") return {};
  return (window as any).__BREDGE_CFG || {};
}

let loaded = false;
function loadVendors(cfg: Cfg) {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const w = window as any;

  if (cfg.ga4) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${cfg.ga4}`;
    document.head.appendChild(s);
    w.dataLayer = w.dataLayer || [];
    w.gtag = (...args: unknown[]) => { w.dataLayer.push(args); };
    w.gtag("js", new Date());
    w.gtag("config", cfg.ga4, { send_page_view: true, device_group: deviceGroup(), traffic_group: trafficGroup() });
  }

  if (cfg.clarity) {
    (function (c: any, l: Document, a: string, r: string, i: string) {
      c[a] = c[a] || ((...args: unknown[]) => { (c[a].q = c[a].q || []).push(args); });
      const t = l.createElement(r) as HTMLScriptElement; t.async = true; t.src = "https://www.clarity.ms/tag/" + i;
      const y = l.getElementsByTagName(r)[0]; y.parentNode?.insertBefore(t, y);
    })(w, document, "clarity", "script", cfg.clarity);
    try {
      w.clarity("set", "traffic_group", trafficGroup());
      w.clarity("set", "device_group", deviceGroup());
    } catch { /* noop */ }
  }

  if (cfg.gtm) {
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const s = document.createElement("script");
    s.async = true; s.src = `https://www.googletagmanager.com/gtm.js?id=${cfg.gtm}`;
    document.head.appendChild(s);
  }
}

export function Analytics() {
  const [decided, setDecided] = useState(true);

  useEffect(() => {
    let stored: string | null = null;
    try { stored = localStorage.getItem("bredge_consent"); } catch { /* noop */ }
    const isDecided = stored === "granted" || stored === "denied";
    queueMicrotask(() => setDecided(isDecided));
    if (stored === "granted") loadVendors(getCfg());

    // Delegated click tracking (no-ops without consent) — covers CTAs everywhere
    // without wiring onClick into every component.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("/schedule")) trackEvent("schedule_click", { cta_location: location.pathname, device_group: deviceGroup() });
      else if (/^\/services|^\/data-diagnostic/.test(href)) trackEvent("service_cta_click", { service: href, cta_location: location.pathname });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function choose(v: "granted" | "denied") {
    try { localStorage.setItem("bredge_consent", v); } catch { /* noop */ }
    setDecided(true);
    if (v === "granted") loadVendors(getCfg());
  }

  if (decided) return null;
  // Only show the banner if analytics is actually configured (nothing to consent to otherwise).
  const cfg = getCfg();
  if (!cfg.ga4 && !cfg.clarity && !cfg.gtm) return null;

  return (
    <div className="consent" role="dialog" aria-label="Analytics consent">
      <p>We use privacy-friendly analytics to understand how the site is used. Lead form details are never sent to analytics.</p>
      <div className="consent-actions">
        <button type="button" className="button button-small" onClick={() => choose("granted")}>Accept analytics</button>
        <button type="button" className="consent-reject" onClick={() => choose("denied")}>Reject</button>
      </div>
    </div>
  );
}
