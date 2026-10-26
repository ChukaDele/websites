"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Holds a section on screen while vertical scroll slides its rail right to
 * left; the page carries on once the last item is in. One owner, no
 * pin-spacers: the section's height is the rail's overflow plus one screen
 * (measured live), the stage inside it is sticky, and the rail's transform
 * eases towards the scroll position on rAF so it glides and settles.
 * `onFrame` runs after each transform (e.g. for parallax). Phones, short
 * screens and reduced motion get mode "stack": no hold, natural flow.
 */
export function useRailScroll(
  secRef: RefObject<HTMLElement | null>,
  railRef: RefObject<HTMLElement | null>,
  onFrame?: (rail: HTMLElement) => void,
) {
  const [mode, setMode] = useState<"rail" | "stack">("stack");
  const measureRef = useRef<() => void>(() => {});
  const frameRef = useRef(onFrame);
  useEffect(() => { frameRef.current = onFrame; }, [onFrame]);

  useEffect(() => {
    const sec = secRef.current, rail = railRef.current;
    if (!sec || !rail) return;
    const mq = window.matchMedia("(min-width: 901px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)");
    let raf = 0, distance = 0, x = 0, target = 0;

    const frame = () => {
      raf = 0;
      x += (target - x) * 0.14;
      if (Math.abs(target - x) < 0.3) x = target;
      rail.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
      frameRef.current?.(rail);
      if (x !== target) raf = requestAnimationFrame(frame);
    };
    const update = () => {
      if (!mq.matches) return;
      const top = sec.getBoundingClientRect().top;
      const p = distance ? Math.min(1, Math.max(0, -top / distance)) : 0;
      target = -p * distance;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const measure = () => {
      if (!mq.matches) { sec.style.height = ""; rail.style.transform = ""; return; }
      const view = rail.parentElement as HTMLElement;
      // The rail may start after a left inset; the last item should end on
      // the view's right edge.
      const padL = parseFloat(getComputedStyle(view).paddingLeft) || 0;
      distance = Math.max(0, padL + rail.scrollWidth - view.clientWidth);
      sec.style.height = `${distance + window.innerHeight}px`;
      update();
    };
    const onMode = () => setMode(mq.matches ? "rail" : "stack");
    measureRef.current = measure;

    onMode();
    const ro = new ResizeObserver(measure);
    ro.observe(rail);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    mq.addEventListener("change", onMode);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
      mq.removeEventListener("change", onMode);
      sec.style.height = ""; rail.style.transform = "";
    };
  }, [secRef, railRef]);

  // Measure once the layout for the current mode has been committed.
  useEffect(() => { measureRef.current(); }, [mode]);

  return mode;
}
