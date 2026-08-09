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

// Decorative connectors from each source card toward the reconciled model.
// Coordinates are % of the section, drawn in a non-scaling-stroke SVG layer.
const links = [
  [46, 36],
  [84, 40],
  [57, 68],
  [74, 66],
  [66, 52],
];

const DESKTOP_MOTION = "(min-width: 1001px) and (prefers-reduced-motion: no-preference)";

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
        // The CSS pre-hide expects GSAP to reveal these; if the deferred
        // bundle never arrives, fall back to the static resting layout.
        loaded = false;
        const result = stage.querySelector<HTMLElement>(".morph-result");
        const decision = stage.querySelector<HTMLElement>(".morph-decision");
        if (result) { result.style.opacity = "1"; result.style.transform = "translate(-50%,-42%)"; }
        if (decision) { decision.style.opacity = "1"; decision.style.transform = "none"; }
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
        const select = gsap.utils.selector(stage);
        const cards = select(".morph-card");
        const linkPaths = select<SVGLineElement>(".morph-links line");
        const chips = select(".morph-exception");
        const dots = select(".morph-card i");

        linkPaths.forEach((line) => {
          const length = Math.hypot(
            line.x2.baseVal.value - line.x1.baseVal.value,
            line.y2.baseVal.value - line.y1.baseVal.value,
          ) * 14; // viewBox units are ~1/14th of rendered px; close enough for a dash reveal
          line.style.strokeDasharray = `${length}`;
          line.style.strokeDashoffset = `${length}`;
        });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: "+=135%",
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });

        // ACT 1 — the intro yields; the scattered sources are already alive.
        timeline.to(select(".hero-morph-tease"), { autoAlpha: 0, yPercent: -30, duration: 0.2, ease: "power1.inOut" }, 0);

        // ACT 2 — convergence: deliberate, mechanical, not springy.
        cards.forEach((card, index) => {
          timeline.to(card, { x: (index - 2) * 26, y: index % 2 ? -12 : 12, rotation: 0, scale: 0.86, duration: 0.34, ease: "power1.inOut" }, 0.08 + index * 0.03);
        });

        // ACT 3 — the systems try to agree and can't: links draw, exceptions surface.
        timeline.to(linkPaths, { strokeDashoffset: 0, duration: 0.2, stagger: 0.03, ease: "none" }, 0.3);
        timeline.to(dots, { backgroundColor: "#f0bf6c", duration: 0.08, stagger: 0.02 }, 0.34);
        chips.forEach((chip, index) => {
          timeline.to(chip, { autoAlpha: 1, y: 0, duration: 0.1, ease: "power2.out" }, 0.42 + index * 0.07);
        });

        // ACT 4 — reconciliation: exceptions resolve, sources settle behind.
        timeline.to(chips, { autoAlpha: 0, y: -8, duration: 0.12, stagger: 0.04, ease: "power1.in" }, 0.68);
        timeline.to(dots, { backgroundColor: "#90d26f", duration: 0.1, stagger: 0.02 }, 0.7);
        timeline.to(cards, { autoAlpha: 0.22, duration: 0.2, ease: "power1.inOut" }, 0.72);
        timeline.to(linkPaths, { opacity: 0.2, duration: 0.2, ease: "none" }, 0.72);

        // ACT 5 — one reliable view emerges, calmer than the opening.
        timeline
          .to(select(".morph-result"), { autoAlpha: 1, y: 0, duration: 0.26, ease: "power2.out" }, 0.82)
          .to(select(".morph-decision"), { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" }, 0.96);

        // The pin is measured while this bundle is still loading, so if the
        // user has already scrolled by the time it resolves, refresh the
        // stale start/end measurements.
        ScrollTrigger.refresh();
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
    };
  }, []);

  return (
    <section ref={stageRef} id="story" className="hero-morph" aria-label="The journey from fragmented sources to a trusted decision">
      <svg className="morph-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {links.map(([x, y], index) => (
          <line key={index} x1={x} y1={y} x2={50} y2={52} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="section-wrap hero-morph-content">
        <div className="hero-morph-tease">
          <p className="eyebrow">THE FULL PICTURE</p>
          <h2>Five systems are telling five stories.</h2>
          <p>Product, Billing and CRM disagree — and Support and Finance have versions of their own. Scroll to bring the picture into focus.</p>
        </div>
        <div className="morph-cards" aria-hidden="true">
          {sources.map(([source, count], index) => (
            <div className={`morph-card card-${index + 1}`} key={source}>
              <span>0{index + 1}</span>
              <b>{source}</b>
              <strong>{count}</strong>
              <small>customer records</small>
              <i />
            </div>
          ))}
        </div>
        <div className="morph-exceptions" aria-hidden="true">
          {exceptions.map((label, index) => <p className={`morph-exception exception-${index + 1}`} key={label}>{label}</p>)}
        </div>
        <div className="morph-result"><span>RECONCILED MODEL</span><strong>1 trusted view</strong><small>Definitions, checks and ownership included.</small></div>
        <div className="morph-decision"><span>THE NEXT PAGE</span><p>Now the question can move from “Which number?” to “What should we do?”</p></div>
      </div>
    </section>
  );
}
