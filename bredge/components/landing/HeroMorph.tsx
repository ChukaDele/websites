"use client";

import { useEffect, useRef } from "react";

const sources: Array<[string, string]> = [
  ["Product", "1,842"],
  ["Billing", "1,731"],
  ["CRM", "1,809"],
  ["Support", "1,795"],
  ["Finance", "1,764"],
];

const exceptions = ["IDs don’t match", "Duplicate accounts", "Timing differences"];

// Full-width SVG connectors relied on fixed section percentages while cards
// moved in a different coordinate system. They were never anchored to the
// cards and broke during scroll/zoom. The motion tells the story without them.
const DESKTOP_MOTION = "(min-width: 1001px) and (min-height: 720px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

export function HeroMorph() {
  const stageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let disposed = false;
    let matchMedia: { revert: () => void } | undefined;
    let loaded = false;
    const motionQuery = window.matchMedia(DESKTOP_MOTION);

    const load = async () => {
      if (loaded) return;
      loaded = true;
      let modules;
      try {
        modules = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      } catch {
        // Progressive enhancement: baseline HTML always stays readable.
        // Failed deferred JS must never hide the reconciled result.
        loaded = false;
        stage.classList.remove("morph-enhanced");
        return;
      }
      const [{ default: gsap }, { ScrollTrigger }] = modules;
      if (disposed) return;

      gsap.registerPlugin(ScrollTrigger);

      // gsap.matchMedia owns setup/teardown across breakpoint and
      // reduced-motion changes, so resizing can't strand a stale pin.
      const mm = gsap.matchMedia();
      matchMedia = mm;
      mm.add(DESKTOP_MOTION, () => {
        // CSS owns one bounded sticky viewport. ScrollTrigger maps progress;
        // no dynamically created pin spacer, so short screens, refreshes and
        // resizing cannot leave a blank runway or overlap the next section.
        stage.classList.add("morph-enhanced");
        const select = gsap.utils.selector(stage);
        const cards = select(".morph-card");
        const chips = select(".morph-exception");
        const dots = select(".morph-card i");
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: "bottom bottom",
            invalidateOnRefresh: true,
            scrub: 0.6,
          },
        });

        // ACT 1 — the intro yields; the scattered sources are already alive.
        timeline.to(select(".hero-morph-tease"), { autoAlpha: 0, yPercent: -30, duration: 0.2, ease: "power1.inOut" }, 0);

        // ACT 2 — convergence: deliberate, mechanical, not springy.
        cards.forEach((card, index) => {
          timeline.to(card, { x: (index - 2) * 26, y: index % 2 ? -12 : 12, rotation: 0, scale: 0.86, duration: 0.34, ease: "power1.inOut" }, 0.08 + index * 0.03);
        });

        // ACT 3 — records disagree. Keep annotations inside the same card
        // coordinate system rather than free-floating connectors.
        timeline.to(dots, { backgroundColor: "#f0bf6c", duration: 0.08, stagger: 0.02 }, 0.34);
        chips.forEach((chip, index) => {
          timeline.to(chip, { autoAlpha: 1, y: 0, duration: 0.1, ease: "power2.out" }, 0.42 + index * 0.07);
        });

        // ACT 4 — reconciliation: exceptions resolve, sources settle behind.
        timeline.to(chips, { autoAlpha: 0, y: -8, duration: 0.12, stagger: 0.04, ease: "power1.in" }, 0.68);
        timeline.to(dots, { backgroundColor: "#90d26f", duration: 0.1, stagger: 0.02 }, 0.7);
        timeline.to(cards, { autoAlpha: 0.22, duration: 0.2, ease: "power1.inOut" }, 0.72);

        // ACT 5 — one reliable view emerges, calmer than the opening.
        timeline
          .to(select(".morph-result"), { autoAlpha: 1, y: 0, duration: 0.26, ease: "power2.out" }, 0.82)
          .to(select(".morph-decision"), { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" }, 0.96);

        // Defer only one geometry refresh for fonts/late images.
        const refresh = () => { if (!disposed) ScrollTrigger.refresh(); };
        void document.fonts?.ready?.then(refresh).catch(() => {});
        return () => stage.classList.remove("morph-enhanced");
      });
    };

    if (motionQuery.matches) void load();
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) void load();
    };
    motionQuery.addEventListener("change", onChange);

    return () => {
      disposed = true;
      motionQuery.removeEventListener("change", onChange);
      matchMedia?.revert();
      stage.classList.remove("morph-enhanced");
    };
  }, []);

  return (
    <section ref={stageRef} id="story" className="hero-morph" aria-label="The journey from fragmented sources to a trusted decision">
      <div className="section-wrap hero-morph-content">
        <div className="hero-morph-tease">
          <h2>Five systems. Five customer counts. One board meeting.</h2>
          <p>Product says 1,842. Billing says 1,731. Nobody in the room can tell you which is right, so the meeting becomes an argument about the number instead of a decision about the business.</p>
        </div>
        <div className="morph-cards">
          {sources.map(([source, count], index) => (
            <div className={`morph-card card-${index + 1}`} key={source}>
              <span>0{index + 1}</span>
              <b>{source}</b>
              <strong>{count}</strong>
              <small>customer records</small>
              <i aria-hidden="true" />
            </div>
          ))}
          <div className="morph-exceptions" aria-hidden="true">
            {exceptions.map((label, index) => <p className={`morph-exception exception-${index + 1}`} key={label}>{label}</p>)}
          </div>
        </div>
        <div className="morph-result"><span>ONE RECONCILED MODEL</span><strong>1,772</strong><small>real customers. 70 exceptions, each one traceable.</small></div>
        <div className="morph-decision"><p>The 111-record gap wasn’t a rounding error. It was duplicate accounts, IDs that never matched, and invoices booked in a different month.</p></div>
      </div>
    </section>
  );
}
