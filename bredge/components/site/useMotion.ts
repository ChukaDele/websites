"use client";

import { useEffect, type RefObject } from "react";

type GSAP = typeof import("gsap")["default"];
type ST = typeof import("gsap/ScrollTrigger")["ScrollTrigger"];

export const DESKTOP_MOTION = "(min-width: 1001px) and (prefers-reduced-motion: no-preference)";
export const ANY_MOTION = "(prefers-reduced-motion: no-preference)";

/**
 * Shared GSAP lifecycle: loads gsap + ScrollTrigger lazily, runs `setup`
 * inside a gsap.matchMedia scope (so breakpoint / reduced-motion changes
 * tear down and rebuild cleanly), and refreshes ScrollTrigger once the
 * deferred bundle resolves. `setup` may return its own cleanup.
 */
export function useMotion(
  scopeRef: RefObject<HTMLElement | null>,
  setup: (ctx: { gsap: GSAP; ScrollTrigger: ST; root: HTMLElement }) => void | (() => void),
  query: string = DESKTOP_MOTION,
) {
  useEffect(() => {
    const root = scopeRef.current;
    if (!root) return;

    let disposed = false;
    let matchMedia: { revert: () => void } | undefined;
    let loaded = false;
    const mq = window.matchMedia(query);

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
      mm.add(query, () => {
        const cleanup = setup({ gsap, ScrollTrigger, root });
        ScrollTrigger.refresh();
        return cleanup;
      });
    };

    if (mq.matches) void load();
    const onChange = (event: MediaQueryListEvent) => { if (event.matches) void load(); };
    mq.addEventListener("change", onChange);

    return () => {
      disposed = true;
      mq.removeEventListener("change", onChange);
      matchMedia?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
