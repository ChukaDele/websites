"use client";

import { useEffect, useRef } from "react";

/* "Where we've worked" — organisations Bredge team members have worked with.
 * Typographic marks (no recreated logos). One behaviour everywhere: desktop rows
 * are SCROLL-LINKED (opposing directions, translated by the real measured
 * overflow so every name is revealed during the section's passage);
 * reduced-motion and tablet/mobile fall back to a fully-readable static grid. */

/* Prior experience of individual Bredge team members — text marks, not a logo
 * wall (a logo wall would imply a commercial/endorsement relationship this
 * section deliberately does not claim). Display names are the exact approved
 * forms: no acronym+full-name duplication, no invented Ltd/Inc/LLC suffixes.
 * Trimmed from 16 to 8: sixteen names behind a legal disclaimer read as borrowed
 * credibility, eight recognisable ones read as an honest CV. Split BY WIDTH
 * across the two rows so, where the track still overflows, both reveal at a
 * comparable rate; where it doesn't, `.xp-row` drops its edge mask (see
 * `no-overflow` below) so a stationary first name is never clipped by the fade. */
const ROW_A = ["TriWest Healthcare Alliance", "Sedgwick", "Moniepoint", "Nutrafol"];
const ROW_B = ["University of Vermont", "Westinghouse", "Penn Foster", "Fullscript"];

const DISCLAIMER = "These are places Bredge team members have worked. They aren’t clients and this isn’t an endorsement.";

function TeamTrack({ names }: { names: string[] }) {
  return (
    <div className="xp-track">
      {names.map((name) => <span key={name}>{name}</span>)}
      {names.map((name) => <span key={`${name}-repeat`} aria-hidden="true">{name}</span>)}
    </div>
  );
}

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

    const clear = () => {
      if (a) a.style.transform = "";
      if (b) b.style.transform = "";
      rowA?.classList.remove("no-overflow");
      rowB?.classList.remove("no-overflow");
    };

    const update = () => {
      raf = 0;
      if (!mq.matches) { clear(); return; }        // static grid handles small screens / reduced motion
      if (!a || !b || !rowA || !rowB) return;
      // real overflow beyond the visible row (font-metrics accurate, recomputed live)
      const overA = Math.max(0, a.scrollWidth - rowA.clientWidth);
      const overB = Math.max(0, b.scrollWidth - rowB.clientWidth);
      // With a short list the track may not overflow at all. It then sits at x=0
      // forever, so the row's leading edge-fade would permanently half-erase the
      // first name — drop the mask rather than ship a clipped word.
      rowA.classList.toggle("no-overflow", overA < 1);
      rowB.classList.toggle("no-overflow", overB < 1);
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
    <section ref={ref} className="xp section-wrap" aria-label="Where the team has worked">
      <h2>Where we’ve worked.</h2>

      <div className="xp-rows">
        <div className="xp-row xp-row-a"><TeamTrack names={ROW_A} /></div>
        <div className="xp-row xp-row-b"><TeamTrack names={ROW_B} /></div>
      </div>

      <p className="xp-note">{DISCLAIMER}</p>
    </section>
  );
}
