"use client";

import { useEffect, useRef } from "react";
import { Picture } from "./Picture";

/**
 * The footer's giant "bredge" with an info sticker, after the reference's
 * certification badge: an emblem on the left, one line about the team on the
 * right. It is information, not a button, so nothing on it is clickable.
 *
 * Mouse: the sticker is hidden until the pointer enters the word, then rises
 * in and glides after the cursor, floating just above and right of it (eased
 * each frame, tilting slightly with its speed). It leaves when the pointer
 * does. Touch screens and reduced motion: it sits in place, always visible.
 */
export function FooterMark() {
  const markRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mark = markRef.current, pos = posRef.current;
    if (!mark || !pos) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let raf = 0, x = 0, y = 0, tx = 0, ty = 0, tilt = 0, active = false;

    const frame = () => {
      raf = 0;
      const dx = tx - x, dy = ty - y;
      x += dx * 0.2;
      y += dy * 0.2;
      // Tilt with horizontal speed, around the sticker's resting angle.
      tilt += (Math.max(-5, Math.min(5, dx * 0.06)) - tilt) * 0.18;
      pos.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
      if (active || Math.abs(dx) + Math.abs(dy) + Math.abs(tilt) > 0.3) raf = requestAnimationFrame(frame);
    };
    const target = (e: PointerEvent, snap = false) => {
      const r = mark.getBoundingClientRect();
      const w = pos.offsetWidth, h = pos.offsetHeight;
      // The sticker floats just above and right of the cursor, kept on screen
      // (not boxed into the word, which is often only partly in view).
      const cx = e.clientX - r.left, cy = e.clientY - r.top;
      tx = Math.max(12, Math.min(r.width - w - 12, cx + 18));
      ty = Math.max(12 - r.top, Math.min(window.innerHeight - r.top - h - 12, cy - h - 18));
      if (snap) { x = tx; y = ty + 18; }
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const enter = (e: PointerEvent) => { if (!mq.matches) return; active = true; mark.classList.add("is-on"); target(e, true); };
    const move = (e: PointerEvent) => { if (active) target(e); };
    const leave = () => { active = false; mark.classList.remove("is-on"); };

    const sync = () => {
      mark.classList.toggle("is-follow", mq.matches);
      // Leaving follow mode: drop the cursor position so it rests in place.
      if (!mq.matches) { active = false; mark.classList.remove("is-on"); pos.style.transform = ""; }
    };
    sync();
    mq.addEventListener("change", sync);
    mark.addEventListener("pointerenter", enter);
    mark.addEventListener("pointermove", move);
    mark.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", sync);
      mark.removeEventListener("pointerenter", enter);
      mark.removeEventListener("pointermove", move);
      mark.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div className="sf-mark" ref={markRef}>
      <p className="sf-word" aria-hidden="true">bredge</p>
      <div className="sf-sticker-pos" ref={posRef} aria-hidden="true">
        <div className="sf-sticker">
          <div className="sf-emblem">
            <span className="sf-emblem-top">Data team</span>
            <span className="sf-emblem-b"><Picture src="/brand/bredge-logo-preloader.png" responsive={false} avif={false} alt="" /></span>
            <i />
            <span className="sf-emblem-name">The Bredge</span>
          </div>
          <div className="sf-sticker-text">
            <p>The experienced data team you hire by the project or by the month.</p>
            <i />
          </div>
        </div>
      </div>
    </div>
  );
}
