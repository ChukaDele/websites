"use client";

import { useEffect, useRef } from "react";

const sources = ["PRODUCT", "BILLING", "CRM", "FINANCE", "SUPPORT"];

/**
 * First-entry signature preloader: five disagreeing source records
 * (PRODUCT/BILLING/CRM/FINANCE/SUPPORT) align, one amber exception resolves, a
 * green signal passes across the system, and the geometry collapses into the
 * Bredge mark — which the hero then forms around. ~1.1s, hard safety ≤1.5s.
 *
 * Only runs when the head script added `.preload-active` (first visit this
 * session, motion allowed). A pure-CSS safety fade lifts the overlay even if
 * JS/GSAP never runs. Never traps the visitor.
 */
export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const html = document.documentElement;
    if (!root || !html.classList.contains("preload-active")) return;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      try { sessionStorage.setItem("bredge_preloaded", "1"); } catch { /* ignore */ }
      html.classList.remove("preload-active");
      html.classList.add("preload-done");
      root.style.display = "none";
    };
    const safety = window.setTimeout(finish, 1500);

    let killed = false;
    let ctx: { revert: () => void } | undefined;
    (async () => {
      let gsap;
      try { ({ default: gsap } = await import("gsap")); } catch { finish(); return; }
      if (killed) return;
      const q = gsap.utils.selector(root);
      const rows = q(".pl-record");
      const line = q(".pl-line");
      const signal = q(".pl-signal");
      const exception = q(".pl-record.pending .pl-dot");
      const mark = q(".pl-mark");
      const c = gsap.context(() => {
        const offsets = [-46, 30, -20, 38, -30];
        const tl = gsap.timeline({ defaults: { ease: "power2.out" }, onComplete: finish });
        // ACT 1–3 — records perceptible, misaligned, then align to one grid
        tl.fromTo(rows,
          { x: (i: number) => offsets[i] ?? 0, opacity: 0.45, scaleX: 0.9 },
          { x: 0, opacity: 1, scaleX: 1, duration: 0.36, stagger: 0.035 }, 0.05)
          // one identity remains unresolved (amber)
          .fromTo(exception, { backgroundColor: "#c8cec9" }, { backgroundColor: "#f0bf6c", duration: 0.14 }, 0.40)
          // ACT 4 — green signal passes across the system; the exception resolves
          .fromTo(signal, { xPercent: -130, opacity: 0.9 }, { xPercent: 130, duration: 0.4, ease: "power1.inOut" }, 0.54)
          .to(exception, { backgroundColor: "#90d26f", duration: 0.16 }, 0.66)
          .to(signal, { opacity: 0, duration: 0.1 }, 0.94)
          .fromTo(line, { scaleX: 0.15, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.26 }, 0.72)
          // ACT 5 — geometry collapses into the Bredge mark
          .to(rows, { opacity: 0, y: 6, duration: 0.24, stagger: 0.015 }, 0.82)
          .to(line, { opacity: 0, duration: 0.2 }, 0.86)
          .fromTo(mark, { opacity: 0, scale: 0.66, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.32, ease: "power3.out" }, 0.86)
          // ACT 6 — the mark holds while the overlay lifts into the hero
          .to(root, { autoAlpha: 0, duration: 0.3, ease: "power1.in" }, 1.16);
      }, root);
      ctx = c;
    })();

    return () => { killed = true; window.clearTimeout(safety); ctx?.revert(); };
  }, []);

  return (
    <div ref={rootRef} className="preloader" aria-hidden="true">
      <div className="pl-stage">
        <div className="pl-records">
          {sources.map((s, i) => (
            <div key={s} className={`pl-record${i === 2 ? " pending" : ""}`}>
              <span className="pl-label">{s}</span>
              <span className="pl-dot" />
              <i /><i />
            </div>
          ))}
        </div>
        <div className="pl-line" />
        <div className="pl-signal" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pl-mark" src="/favicon.svg" width={72} height={72} alt="" aria-hidden="true" />
      </div>
    </div>
  );
}
