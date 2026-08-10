"use client";

import { useEffect } from "react";

const DESKTOP_MOTION = "(min-width: 1001px) and (prefers-reduced-motion: no-preference)";

export function PageMotion() {
  useEffect(() => {
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
        loaded = false;
        return;
      }
      const [{ default: gsap }, { ScrollTrigger }] = modules;
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);

      const mm = gsap.matchMedia();
      matchMedia = mm;
      mm.add(DESKTOP_MOTION, () => {
        // Unified refresh: browser zoom / visualViewport changes don't reliably
        // fire a normal window 'resize', so pin distances can go stale. Nudge
        // ScrollTrigger (debounced) so every pinned scene re-measures.
        let rt = 0;
        const nudge = () => { window.clearTimeout(rt); rt = window.setTimeout(() => ScrollTrigger.refresh(), 200); };
        window.visualViewport?.addEventListener("resize", nudge);

        gsap.to(".pipeline-core", { y: -8, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1 });

        const counters = gsap.utils.toArray<HTMLElement>("[data-count]");
        const runCounters = () => counters.forEach((counter) => {
          const target = Number(counter.dataset.count ?? 0);
          const value = { current: 0 };
          gsap.fromTo(value, { current: 0 }, {
            current: target,
            duration: 1.7,
            ease: "power2.out",
            onUpdate: () => { counter.textContent = `${Math.round(value.current).toLocaleString()} records`; },
          });
        });
        ScrollTrigger.create({ trigger: ".pipeline-demo", start: "top 78%", once: true, onEnter: runCounters });

        // Outcome cards: a quiet opacity-only INTRODUCE (no slide) as the reader
        // reaches "start with the decision". Reference Work uses its sticky
        // card-stack as the interaction; Diagnostic reveal removed — no generic
        // fade-up simply because a section entered the viewport.
        gsap.from(".outcome-card", { autoAlpha: 0, stagger: 0.06, duration: 0.4, ease: "power2.out", scrollTrigger: { trigger: ".outcome-grid", start: "top 80%", once: true } });

        // This bundle loads async: refresh so triggers measured mid-scroll
        // pick up the real layout offsets.
        ScrollTrigger.refresh();

        return () => {
          window.visualViewport?.removeEventListener("resize", nudge);
          window.clearTimeout(rt);
          // GSAP reverts inline styles but not textContent overwritten mid count-up.
          counters.forEach((counter) => {
            counter.textContent = `${Number(counter.dataset.count ?? 0).toLocaleString()} records`;
          });
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
    };
  }, []);

  return null;
}
