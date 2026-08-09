"use client";

import { useEffect, useRef } from "react";

const sources = ["PRODUCT", "BILLING", "CRM", "FINANCE", "SUPPORT"];

/**
 * First-entry reconciliation preloader. Five misaligned source records align,
 * one briefly goes amber and resolves, a green signal passes through, and they
 * converge into one line that expands toward the hero before the overlay lifts.
 *
 * Robustness: only shown when the head script added `.preload-active` (first
 * visit this session, motion allowed). A pure-CSS safety fade guarantees the
 * overlay lifts even if JS/GSAP never runs. Hard max ~1200ms.
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

    // Absolute safety: never let the overlay trap the visitor.
    const safety = window.setTimeout(finish, 1200);

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
      const c = gsap.context(() => {
        const offsets = [-46, 30, -20, 38, -30];
        const tl = gsap.timeline({ defaults: { ease: "power2.out" }, onComplete: finish });
        // records perceptible immediately (misaligned), then align
        tl.fromTo(rows,
          { x: (i: number) => offsets[i] ?? 0, opacity: 0.5, scaleX: 0.92 },
          { x: 0, opacity: 1, scaleX: 1, duration: 0.34, stagger: 0.03 }, 0.06)
          // one relationship stays unresolved → amber → resolves
          .to(q(".pl-record.pending"), { backgroundColor: "#f0bf6c", duration: 0.12 }, 0.42)
          .to(q(".pl-record.pending"), { backgroundColor: "", duration: 0.16 }, 0.6)
          // green signal passes through
          .fromTo(signal, { xPercent: -120, opacity: 0.9 }, { xPercent: 120, opacity: 0.9, duration: 0.34, ease: "power1.inOut" }, 0.56)
          .to(signal, { opacity: 0, duration: 0.1 }, 0.9)
          // converge to one line
          .to(rows, { opacity: 0, y: 0, duration: 0.22 }, 0.72)
          .fromTo(line, { scaleX: 0.2, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.3 }, 0.74)
          // line expands toward the hero, overlay lifts
          .to(line, { scaleX: 1.6, xPercent: 26, duration: 0.34, ease: "power2.in" }, 0.98)
          .to(root, { autoAlpha: 0, duration: 0.28, ease: "power1.in" }, 1.02);
      }, root);
      ctx = c;
    })();

    return () => {
      killed = true;
      window.clearTimeout(safety);
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="preloader" aria-hidden="true">
      <div className="pl-stage">
        <div className="pl-records">
          {sources.map((s, i) => (
            <div key={s} className={`pl-record${i === 2 ? " pending" : ""}`} data-src={s}><i /><i /><i /></div>
          ))}
        </div>
        <div className="pl-line" />
        <div className="pl-signal" />
      </div>
    </div>
  );
}
