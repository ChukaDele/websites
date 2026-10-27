"use client";

import { useEffect } from "react";

/** The primary calls to action that carry the spotlight border. */
export const SPOTLIGHT = ".hero-sd .button, .sh .button, .navq-button, .ws-cta, .hu-cta";

/**
 * Spotlight border on the primary CTAs: a soft light that runs along the
 * button's edge, centred on the cursor. One delegated listener for the whole
 * site writes the pointer position into --mx / --my on the hovered button; the
 * ring itself is CSS (pages.css). Mouse only; skipped with reduced motion.
 */
export function Spotlight() {
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let raf = 0, el: HTMLElement | null = null, x = 0, y = 0;
    const paint = () => {
      raf = 0;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${(x - r.left).toFixed(1)}px`);
      el.style.setProperty("--my", `${(y - r.top).toFixed(1)}px`);
    };
    const move = (e: PointerEvent) => {
      if (!mq.matches || e.pointerType !== "mouse") return;
      el = (e.target as Element | null)?.closest<HTMLElement>(SPOTLIGHT) ?? null;
      if (!el) return;
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    document.addEventListener("pointermove", move, { passive: true });
    return () => { cancelAnimationFrame(raf); document.removeEventListener("pointermove", move); };
  }, []);
  return null;
}
