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

// Five actual source cards should visually connect into one trusted model.
// A measured SVG layer follows the cards and output, including GSAP transforms,
// instead of using percentages of the unrelated full section.
const DESKTOP_MOTION = "(min-width: 1251px) and (min-height: 720px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

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
        const cards = select<HTMLElement>(".morph-card");
        const chips = select<HTMLElement>(".morph-exception");
        const dots = select<HTMLElement>(".morph-card i");
        const content = stage.querySelector<HTMLElement>(".hero-morph-content");
        const svg = stage.querySelector<SVGSVGElement>(".morph-flow");
        const output = stage.querySelector<HTMLElement>(".morph-result");
        const routes = select<SVGPathElement>(".morph-flow-route");
        const tips = select<SVGPathElement>(".morph-flow-tip");
        const hub = stage.querySelector<SVGCircleElement>(".morph-flow-hub");
        const chapters = select<HTMLElement>(".morph-chapter");

        // All points use the measured sticky content as one coordinate frame.
        // This handles viewport resizing, font changes and transforms while
        // GSAP draws five routes into the reconciled model.
        const measure = () => {
          if (!svg || !content || !output) return;
          // Batch all layout reads before writing SVG attributes. Reading a
          // fresh card rect after each path write caused avoidable reflows
          // during GSAP's scrubbed timeline.
          const panel = content.getBoundingClientRect();
          if (!panel.width || !panel.height) return;
          const target = output.getBoundingClientRect();
          const sourceRects = cards.map((card) => card.getBoundingClientRect());
          const tx = target.left + target.width / 2 - panel.left;
          const ty = target.top + target.height / 2 - panel.top;
          svg.setAttribute("viewBox", `0 0 ${panel.width} ${panel.height}`);
          hub?.setAttribute("cx", tx.toFixed(1));
          hub?.setAttribute("cy", ty.toFixed(1));

          sourceRects.forEach((r, index) => {
            const cx = r.left + r.width / 2 - panel.left;
            const cy = r.top + r.height / 2 - panel.top;
            const dx = tx - cx;
            const dy = ty - cy;
            const length = Math.hypot(dx, dy) || 1;
            const ux = dx / length;
            const uy = dy / length;
            const edge = Math.min(
              (r.width / 2 + 2) / Math.max(Math.abs(ux), .001),
              (r.height / 2 + 2) / Math.max(Math.abs(uy), .001),
            );
            const x1 = cx + ux * edge;
            const y1 = cy + uy * edge;
            // Stop at the visible hub rather than drawing into its centre.
            const x2 = tx - ux * 11;
            const y2 = ty - uy * 11;
            const vx = x2 - x1;
            const vy = y2 - y1;
            const mostlyHorizontal = Math.abs(vx) > Math.abs(vy);
            const c1x = mostlyHorizontal ? x1 + vx * .46 : x1;
            const c1y = mostlyHorizontal ? y1 : y1 + vy * .46;
            const c2x = mostlyHorizontal ? x2 - vx * .46 : x2;
            const c2y = mostlyHorizontal ? y2 : y2 - vy * .46;
            routes[index]?.setAttribute("d",
              `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`);
            // Small arrowheads point toward the shared centre. Keeping them
            // separate from the stroked path avoids premature SVG markers.
            const backX = x2 - ux * 9;
            const backY = y2 - uy * 9;
            const perpX = -uy * 4.5;
            const perpY = ux * 4.5;
            tips[index]?.setAttribute("d",
              `M ${(backX + perpX).toFixed(1)} ${(backY + perpY).toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} L ${(backX - perpX).toFixed(1)} ${(backY - perpY).toFixed(1)}`);
          });
        };
        const setChapter = (progress: number) => {
          const active = progress < .28 ? 0 : progress < .77 ? 1 : 2;
          chapters.forEach((label, index) => label.classList.toggle("is-active", index === active));
        };
        const center = output?.getBoundingClientRect();
        const targets = cards.map((card) => {
          const r = card.getBoundingClientRect();
          const dx = center ? center.left + center.width / 2 - r.left - r.width / 2 : 0;
          const dy = center ? center.top + center.height / 2 - r.top - r.height / 2 : 0;
          return { x: dx * .16, y: dy * .16 };
        });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: "bottom bottom",
            invalidateOnRefresh: true,
            scrub: 0.6,
            // Phase label follows actual scroll progress, not the delayed
            // scrubbed tween. It stays in sync with the visitor's position.
            onUpdate: (self) => setChapter(self.progress),
            onRefresh: () => measure(),
          },
        });

        // ACT 1: the headline remains visible so the arrows have context.
        // Source counts start separated, as they would in five systems.
        // Chapter highlight is controlled by scroll position, never an
        // inline GSAP opacity tween that could keep 01 bright forever.

        // ACT 2: sources physically approach a shared identity and arrows
        // draw from the card edges into that common, measured hub.
        cards.forEach((card, index) => {
          timeline.to(card, {
            x: targets[index].x, y: targets[index].y, rotation: 0,
            scale: .93, duration: .34, ease: "power1.inOut",
          }, .12 + index * .028);
        });
        timeline.to(routes, {
          autoAlpha: .85, strokeDashoffset: 0,
          duration: .34, stagger: .025, ease: "none",
        }, .17);
        timeline.to(tips, { autoAlpha: 1, duration: .08, stagger: .025 }, .43);
        timeline.to(hub, { autoAlpha: 1, duration: .16 }, .42);

        // ACT 3: differences surface before they are reconciled.
        timeline.to(dots, { backgroundColor: "#f0bf6c", duration: .08, stagger: .02 }, .33);
        chips.forEach((chip, index) => {
          timeline.to(chip, { autoAlpha: 1, y: 0, duration: .10, ease: "power2.out" }, .41 + index * .055);
        });

        // ACT 4: resolve exceptions; five inputs now point to the same model.
        timeline.to(chips, { autoAlpha: 0, y: -8, duration: .12, stagger: .03, ease: "power1.in" }, .67);
        timeline.to(dots, { backgroundColor: "#90d26f", duration: .10, stagger: .02 }, .68);
        timeline.to(routes, { stroke: "#b6ef9d", autoAlpha: 1, duration: .1 }, .69);

        // ACT 5: the green reconciled result replaces the convergence hub.
        // Arrows and source cards recede only AFTER the connection is clear.
        timeline.to(cards, { autoAlpha: .18, duration: .2, ease: "power1.inOut" }, .76);
        timeline.to(routes, { autoAlpha: 0, duration: .2 }, .77);
        timeline.to(tips, { autoAlpha: 0, duration: .2 }, .77);
        timeline.to(hub, { autoAlpha: 0, duration: .15 }, .80);
        timeline
          .to(select(".morph-result"), { autoAlpha: 1, y: 0, duration: .24, ease: "power2.out" }, .80)
          .to(select(".morph-decision"), { autoAlpha: 1, y: 0, duration: .20, ease: "power2.out" }, .95);

        // With a scrubbed timeline the onUpdate is called after transforms
        // advance, keeping connections attached during the entire animation.
        timeline.eventCallback("onUpdate", measure);
        measure();
        setChapter(0);
        const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
        if (observer && content) observer.observe(content);
        cards.forEach((card) => observer?.observe(card));
        if (output) observer?.observe(output);
        window.addEventListener("resize", measure, { passive: true });
        const refresh = () => { if (!disposed) { measure(); ScrollTrigger.refresh(); } };
        void document.fonts?.ready?.then(refresh).catch(() => {});
        return () => {
          observer?.disconnect();
          window.removeEventListener("resize", measure);
          stage.classList.remove("morph-enhanced");
        };
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
          <div className="morph-chapters" aria-hidden="true">
            <span className="morph-chapter is-active">01 / Separate sources</span>
            <span className="morph-chapter">02 / Reconcile differences</span>
            <span className="morph-chapter">03 / One trusted model</span>
          </div>
          <div className="morph-exceptions" aria-hidden="true">
            {exceptions.map((label, index) => <p className={`morph-exception exception-${index + 1}`} key={label}>{label}</p>)}
          </div>
        </div>
        <svg className="morph-flow" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          {sources.map(([source]) => (
            <g key={source}>
              <path className="morph-flow-route" pathLength={1} d="M 0 0 L 0 0" />
              <path className="morph-flow-tip" d="M 0 0 L 0 0" />
            </g>
          ))}
          <circle className="morph-flow-hub" r={8} cx={0} cy={0} />
        </svg>
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
        </div>
        <div className="morph-static-flow" aria-hidden="true"><span>↓</span><small>RECONCILE AND VALIDATE</small></div>
        <div className="morph-result"><span>ONE RECONCILED MODEL</span><strong>1,772</strong><small>real customers. 70 exceptions, each one traceable.</small></div>
        <div className="morph-decision"><p>The 111-record gap wasn’t a rounding error. It was duplicate accounts, IDs that never matched, and invoices booked in a different month.</p></div>
      </div>
    </section>
  );
}
