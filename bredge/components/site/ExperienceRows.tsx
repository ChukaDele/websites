"use client";

import { useEffect, useRef } from "react";

/* "Experience brought forward" — organisations Bredge team members have worked
 * with. Typographic marks (no recreated logos). Mobile base is an open two-column
 * composition; desktop adds a restrained opposing horizontal drift tied to scroll
 * (≤6% travel, not an infinite marquee). Reduced motion / mobile = static. */

const ROW_A = ["Moniepoint", "Pedabo", "SWCA Environmental Consultants", "CHCP — College of Health Care Professions", "WECTEC Staffing Services", "UVM — University of Vermont", "TriWest Healthcare Alliance", "Nutrafol"];
const ROW_B = ["Westinghouse", "CoventBridge", "Penn Foster", "Connected.co", "Fullscript", "Tillster", "Sedgwick", "Aella"];

const DISCLAIMER = "Company names and marks reflect prior experience of individual Bredge team members and do not imply endorsement or a current client relationship with The Bredge.";

export function ExperienceRows({ motion = false }: { motion?: boolean }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!motion) return;
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 800px)").matches) return; // mobile = static

    const a = root.querySelector<HTMLElement>(".xp-row-a .xp-track");
    const b = root.querySelector<HTMLElement>(".xp-row-b .xp-track");
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = root.getBoundingClientRect();
      const vh = window.innerHeight;
      // progress -1..1 as the section passes through the viewport
      const p = Math.max(-1, Math.min(1, (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2)));
      const travel = 6; // percent, max
      if (a) a.style.transform = `translate3d(${(-p * travel).toFixed(2)}%,0,0)`;
      if (b) b.style.transform = `translate3d(${(p * travel).toFixed(2)}%,0,0)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, [motion]);

  return (
    <section ref={ref} className={`xp section-wrap${motion ? " xp-motion" : ""}`} aria-label="Team experience">
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
