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

        gsap.from(".outcome-card", { y: 28, autoAlpha: 0, stagger: 0.08, duration: 0.48, ease: "power3.out", scrollTrigger: { trigger: ".outcome-grid", start: "top 78%", once: true } });
        gsap.from(".reference-case", { y: 34, autoAlpha: 0, stagger: 0.11, duration: 0.5, ease: "power3.out", scrollTrigger: { trigger: ".reference-work", start: "top 74%", once: true } });
        gsap.from(".diagnostic", { y: 38, autoAlpha: 0, duration: 0.55, ease: "power3.out", scrollTrigger: { trigger: ".diagnostic", start: "top 76%", once: true } });

        // This bundle loads async: refresh so triggers measured mid-scroll
        // pick up the real layout offsets.
        ScrollTrigger.refresh();

        return () => {
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
