"use client";

import { useEffect, useRef } from "react";

/* "Experience brought forward" — organisations Bredge team members have worked
 * with. Typographic marks (no recreated logos). One behaviour everywhere:
 * desktop rows are SCROLL-LINKED (opposing directions, translated by the real
 * measured overflow so every name is revealed during the section's passage);
 * reduced-motion and tablet/mobile fall back to a fully-readable static grid. */

/* All 16 organisations are preserved. Membership is balanced BY WIDTH across the
 * two rows (the longest name lives in B, the shortest in A) so both tracks
 * overflow by a comparable amount at every desktop width — which is what lets
 * the two rows reveal in genuine, gap-free opposing motion instead of one long
 * row sweeping while a short row sits still. */
const ROW_A = ["Moniepoint", "Pedabo", "SWCA Environmental Consultants", "WECTEC Staffing Services", "UVM — University of Vermont", "TriWest Healthcare Alliance", "Nutrafol", "Aella"];
const ROW_B = ["Westinghouse", "CoventBridge", "CHCP — College of Health Care Professions", "Penn Foster", "Connected.co", "Fullscript", "Tillster", "Sedgwick"];

const DISCLAIMER = "Company names and marks reflect prior experience of individual Bredge team members and do not imply endorsement or a current client relationship with The Bredge.";

export function ExperienceRows() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mq = window.matchMedia("(min-width: 801px) and (prefers-reduced-motion: no-preference)");

    const a = root.querySelector<HTMLElement>(".xp-row-a .xp-track");
    const b = root.querySelector<HTMLElement>(".xp-row-b .xp-track");
    const rowA = a?.parentElement;
    const rowB = b?.parentElement;
    let raf = 0;

    const clear = () => { if (a) a.style.transform = ""; if (b) b.style.transform = ""; };

    const update = () => {
      raf = 0;
      if (!mq.matches) { clear(); return; }        // static grid handles small screens / reduced motion
      if (!a || !b || !rowA || !rowB) return;
      // real overflow beyond the visible row (font-metrics accurate, recomputed live)
      const overA = Math.max(0, a.scrollWidth - rowA.clientWidth);
      const overB = Math.max(0, b.scrollWidth - rowB.clientWidth);
      const r = root.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 as the section enters from the bottom → 1 as it leaves past the top
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      // Row A: reveal the end as you scroll down. Row B: opposite (starts at its end, returns to its start).
      a.style.transform = `translate3d(${(-p * overA).toFixed(1)}px,0,0)`;
      b.style.transform = `translate3d(${(-(1 - p) * overB).toFixed(1)}px,0,0)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    mq.addEventListener?.("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mq.removeEventListener?.("change", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={ref} className="xp section-wrap" aria-label="Team experience">
      <p className="eyebrow">TEAM EXPERIENCE</p>
      <h2>Experience brought forward.</h2>
      <p className="xp-intro">Our team brings experience from organisations including:</p>

      <div className="xp-rows">
        <div className="xp-row xp-row-a"><div className="xp-track">{ROW_A.map((n) => <span key={n}>{n}</span>)}</div></div>
        <div className="xp-row xp-row-b"><div className="xp-track">{ROW_B.map((n) => <span key={n}>{n}</span>)}</div></div>
      </div>

      <p className="xp-note">{DISCLAIMER}</p>
    </section>
  );
}
