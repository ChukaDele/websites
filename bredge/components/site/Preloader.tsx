"use client";

import { useEffect, useRef } from "react";

const ROWS = 4;
const COLS = 12;
// Where the "b" mark ends and "redge" begins, as a share of the cropped logo.
const MARK_SHARE = 25.3;

/**
 * First-entry preloader (Second Direction), modelled on the ZettaJoule
 * reference: the Bredge mark draws in through horizontal stripes, slides left
 * while "redge" unrolls out from behind it, holds, breaks back into stripes,
 * then a 4×12 grid of tiles shutters away to reveal the hero. ~2.2s, hard
 * safety at 3.2s. Plays each time the site is opened (new visit or tab, and on reload), not on every page.
 *
 * Runs whenever the head script added `.preload-active` (each time the site
 * is opened, unless the visitor prefers reduced motion). A pure-CSS safety fade lifts the overlay even if
 * JS/GSAP never runs. Never traps the visitor.
 */
export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const html = document.documentElement;
    if (!root || !html.classList.contains("preload-active")) return;

    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowPower = innerWidth <= 700 || matchMedia("(pointer: coarse)").matches
      || (nav.deviceMemory ?? 8) <= 4 || (nav.hardwareConcurrency ?? 8) <= 4;
    if (lowPower) root.classList.add("pl-low");

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
            html.classList.remove("preload-active");
      html.classList.add("preload-done");
      root.style.display = "none";
    };
    const safety = window.setTimeout(finish, 3200);

    let killed = false;
    let ctx: { revert: () => void } | undefined;
    (async () => {
      let gsap;
      try { ({ default: gsap } = await import("gsap")); } catch { finish(); return; }
      if (killed) return;
      const q = gsap.utils.selector(root);
      const logo = q(".pl-logo")[0];
      const mark = q(".pl-mark-layer")[0];
      const word = q(".pl-word-layer")[0];
      const rows = q(".pl-row");

      const c = gsap.context(() => {
        // One progress value drives both halves so the wordmark's left edge
        // always sits exactly at the mark's right edge.
        const slide = { p: 0 };
        const applySlide = () => {
          const rest = (1 - slide.p) * (100 - MARK_SHARE);
          gsap.set(mark, { xPercent: rest });
          word.style.clipPath = `inset(0 0 0 ${MARK_SHARE + rest}%)`;
        };
        applySlide();

        const tl = gsap.timeline({ onComplete: finish });
        // Stylesheets load without blocking the first paint; the overlay holds
        // here until they are applied, so the page never lifts onto unstyled content.
        tl.call(() => {
          if (html.classList.contains("css-ready")) return;
          tl.pause();
          const watch = new MutationObserver(() => {
            if (html.classList.contains("css-ready")) { watch.disconnect(); tl.resume(); }
          });
          watch.observe(html, { attributes: true, attributeFilter: ["class"] });
        }, [], 1.15);
        // 1. The mark draws in as stripes that thicken to solid. This runs in CSS
        //    (pl-draw, inlined in <head>) from the very first paint, so the logo
        //    is on screen before any script. Hand over at its end state.
        logo.style.animation = "none";
        gsap.set(logo, { "--fill": "7px", "--shift": "0px" });
        // 2. The mark slides left; "redge" unrolls out from behind it.
        tl.to(slide, { p: 1, duration: 0.75, ease: "power3.inOut", onUpdate: applySlide }, 0.35)
          // 3. Hold, then the logo breaks back into thin stripes and goes.
          .to(logo, { "--fill": "0px", "--shift": "10px", duration: 0.25, ease: "power2.in" }, 1.25);

        // 4. Exit. Low-power devices wipe one surface; others shutter the tile grid.
        if (lowPower) {
          tl.to(root, { clipPath: "inset(0 0 100% 0)", duration: 0.55, ease: "power3.inOut" }, 1.5);
          return;
        }
        // Alternate rows close toward opposite sides.
        rows.forEach((row, r) => {
          const fromRight = r % 2 === 0;
          tl.to(row.children, {
            scaleX: 0,
            transformOrigin: fromRight ? "0% 50%" : "100% 50%",
            duration: 0.4,
            ease: "power3.inOut",
            stagger: { each: 0.022, from: fromRight ? "end" : "start" },
          }, 1.45 + r * 0.04);
        });
      }, root);
      ctx = c;
    })();

    return () => { killed = true; window.clearTimeout(safety); ctx?.revert(); };
  }, []);

  return (
    <div ref={rootRef} className="preloader" aria-hidden="true">
      <div className="pl-tiles">
        {Array.from({ length: ROWS }, (_, r) => (
          <div key={r} className="pl-row">
            {Array.from({ length: COLS }, (_, c) => <span key={c} />)}
          </div>
        ))}
      </div>
      <div className="pl-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pl-word-layer" src="/brand/bredge-logo-preloader.webp" alt="" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pl-mark-layer" src="/brand/bredge-logo-preloader.webp" alt="" />
      </div>
    </div>
  );
}
