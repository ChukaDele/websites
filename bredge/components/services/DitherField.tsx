"use client";

import { useEffect, useRef } from "react";

/**
 * The dithered dot field at the foot of the grid hero (after the reference):
 * a soft light field — dense along the top, falling away to the sides, with
 * a bright slanted beam right of centre — ordered-dithered (4×4 Bayer) into
 * square dots on a fixed grid. The beam drifts slowly and the field shimmers,
 * as a time-lapse. Draws ~30fps only while on screen; reduced motion draws
 * one still frame.
 */

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

export function DitherField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, step = 6, raf = 0, visible = true, last = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height; dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      step = w < 700 ? 5 : w > 1800 ? Math.round(w / 300) : 6; // dots grow on large screens
    };

    // Brightness 0..1 at (u, v) in the field (u across, v down), time t.
    const field = (u: number, v: number, t: number) => {
      // Dense along the top edge, falling away fast and towards the sides.
      const top = Math.exp(-v * 5.2) * (0.98 - Math.abs(u - 0.5) * 0.7);
      // A soft cone rising from the bottom, a little left of centre.
      const cone = Math.max(0, 1 - Math.abs(u - (0.47 + v * 0.05)) / (0.1 + v * 0.3)) * (0.12 + v * 0.26);
      // The beam: a crisp slanted streak right of centre, drifting slowly.
      const sway = Math.sin(t * 0.25) * 0.025;
      const bx = 0.6 + sway + (1 - v) * (0.11 + sway * 0.6);
      const d = (u - bx) / (0.018 + v * 0.04);
      const beam = Math.exp(-d * d) * Math.min(1, (v - 0.12) / 0.15) * 1.5;
      // Dark corners: everything thins out towards the bottom-left and right.
      const edge = 1 - Math.pow(Math.abs(u - 0.52) * 2, 2.4) * 0.75 * (0.4 + v);
      // A slow shimmer so the dots never sit completely still.
      const shimmer = Math.sin(u * 40 + t * 1.3) * Math.sin(v * 30 - t * 0.9) * 0.035;
      return Math.min(1, Math.max(0, (top + cone + Math.max(0, beam)) * edge + shimmer));
    };

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#f2f2ee";
      const size = step * 0.5;
      const cols = Math.ceil(w / step), rows = Math.ceil(h / step);
      for (let j = 0; j < rows; j++) {
        const v = j / rows;
        for (let i = 0; i < cols; i++) {
          const b = field(i / cols, v, t);
          if (b > BAYER[(j & 3) * 4 + (i & 3)]) ctx.fillRect(i * step, j * step, size, size);
        }
      }
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      if (now - last > 33) { last = now; draw(now / 1000); }
      raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (!raf && !reduce) raf = requestAnimationFrame(loop); };

    resize();
    draw(0);
    kick();
    const ro = new ResizeObserver(() => { resize(); draw(performance.now() / 1000); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); });
    io.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
