"use client";

import { useEffect } from "react";

export function PageMotion() {
  useEffect(() => {
    if (window.matchMedia("(max-width: 1000px), (prefers-reduced-motion: reduce)").matches) return;

    let cleanup = () => {};
    let cancelled = false;

    const start = async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const context = gsap.context(() => {
        gsap.to(".system-globe", { rotation: 6, transformOrigin: "50% 50%", duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1 });
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
      });

      // Mirrors the HeroMorph fix: this bundle loads async, so scroll-triggered
      // reveals measured against a mid-scroll layout can start with the wrong offsets.
      ScrollTrigger.refresh();

      cleanup = () => context.revert();
    };

    void start();
    return () => { cancelled = true; cleanup(); };
  }, []);

  return null;
}
