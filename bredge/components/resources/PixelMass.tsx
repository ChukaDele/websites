"use client";

import { useEffect, useRef } from "react";

/**
 * A field of square pixels (after the pixel-landscape reference): a dark
 * mass sweeps in from the bottom and right with a ragged stepped edge and a
 * few stray pixels; the light cells along its edge carry tiny counts of their
 * dark neighbours, as in a minesweeper board. The cell under the cursor
 * lights up and fades as you move off it, and the mass slowly shifts, one
 * edge cell at a time, so the counts change with it.
 *
 * Keep-clear zones: any element in the hero marked [data-pixel-clear], and
 * the strip behind the nav, keep the cells behind them light. Draws only on change and only while on screen.
 * Reduced motion: still, no hover glow.
 */

function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const LIGHT = "#ffffff";
const DARK = "#141816";
const NUM = "#8a8f8b";
const GLOW = [176, 236, 126];

export function PixelMass({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, cell = 24, cols = 0, rows = 0;
    let dark = new Uint8Array(0), clear = new Uint8Array(0), heat = new Float32Array(0);
    let raf = 0, visible = true, timer = 0;

    // Smooth value noise on a coarse lattice, so the mass has a landscape.
    const lattice = (seed: number, gw: number, gh: number) => {
      const r = rng(seed), g = new Float32Array((gw + 2) * (gh + 2));
      for (let i = 0; i < g.length; i++) g[i] = r();
      return (x: number, y: number) => {
        const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
        const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
        const at = (a: number, b: number) => g[Math.min(gh + 1, Math.max(0, b)) * (gw + 2) + Math.min(gw + 1, Math.max(0, a))];
        return (at(xi, yi) * (1 - sx) + at(xi + 1, yi) * sx) * (1 - sy) + (at(xi, yi + 1) * (1 - sx) + at(xi + 1, yi + 1) * sx) * sy;
      };
    };

    const measureClear = () => {
      clear = new Uint8Array(cols * rows);
      // The strip behind the nav stays light.
      for (let y = 0; y * cell < 84 && y < rows; y++) for (let x = 0; x < cols; x++) clear[y * cols + x] = 1;
      const host = canvas.parentElement;
      if (!host) return;
      const cr = canvas.getBoundingClientRect();
      host.querySelectorAll<HTMLElement>("[data-pixel-clear]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const pad = cell * 0.6;
        const c0 = Math.max(0, Math.floor((r.left - cr.left - pad) / cell)), c1 = Math.min(cols - 1, Math.ceil((r.right - cr.left + pad) / cell));
        const r0 = Math.max(0, Math.floor((r.top - cr.top - pad) / cell)), r1 = Math.min(rows - 1, Math.ceil((r.bottom - cr.top + pad) / cell));
        for (let y = r0; y <= r1; y++) for (let x = c0; x <= c1; x++) clear[y * cols + x] = 1;
      });
    };

    const build = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height; dpr = Math.min(1.5, window.devicePixelRatio || 1);
      cell = Math.max(16, Math.round(Math.min(w, 1800) / 54));
      cols = Math.ceil(w / cell); rows = Math.ceil(h / cell);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      dark = new Uint8Array(cols * rows); heat = new Float32Array(cols * rows);
      measureClear();
      const big = lattice(9, 8, 6), fine = lattice(21, 24, 16), stray = rng(33);
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const u = x / cols, v = y / rows;
        // Darker towards the bottom and the right; the landscape on top.
        const bias = v * 1.05 + u * 0.55 - 0.95;
        const n = big(u * 8, v * 6) * 0.75 + fine(u * 24, v * 16) * 0.35 - 0.55;
        let on = bias + n * 0.9 > 0;
        if (!on && stray() < 0.012 && bias > -0.45) on = true;     // stray pixels above the edge
        if (on && stray() < 0.015) on = false;                        // and a few holes
        dark[y * cols + x] = on && !clear[y * cols + x] ? 1 : 0;
      }
    };

    const count = (x: number, y: number) => {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const xx = x + dx, yy = y + dy;
        if (xx >= 0 && yy >= 0 && xx < cols && yy < rows && dark[yy * cols + xx]) n++;
      }
      return n;
    };

    const draw = () => {
      raf = 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = LIGHT; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = DARK;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (dark[y * cols + x]) ctx.fillRect(x * cell, y * cell, cell + 0.5, cell + 0.5);
      // Neighbour counts on the light cells along the edge.
      ctx.fillStyle = NUM;
      ctx.font = `${Math.max(7, Math.round(cell * 0.3))}px ui-monospace, Menlo, monospace`;
      ctx.textBaseline = "top";
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        if (dark[i] || clear[i]) continue;
        const n = count(x, y);
        if (n) ctx.fillText(String(n), x * cell + cell * 0.14, y * cell + cell * 0.12);
      }
      // Cursor glow.
      let hot = false;
      for (let i = 0; i < heat.length; i++) {
        const k = heat[i];
        if (k < 0.02) { heat[i] = 0; continue; }
        hot = true;
        const x = (i % cols) * cell, y = Math.floor(i / cols) * cell;
        ctx.fillStyle = `rgba(${GLOW[0]},${GLOW[1]},${GLOW[2]},${(k * 0.9).toFixed(3)})`;
        ctx.fillRect(x, y, cell, cell);
        heat[i] = k * 0.9;
      }
      if (hot && visible) raf = requestAnimationFrame(draw);
    };
    const kick = () => { if (!raf && visible) raf = requestAnimationFrame(draw); };

    // The mass shifts: flip one edge cell at a time, keeping its overall size.
    const morph = () => {
      if (!visible) return;
      for (let tries = 0; tries < 40; tries++) {
        const x = Math.floor(Math.random() * cols), y = Math.floor(Math.random() * rows), i = y * cols + x;
        if (clear[i]) continue;
        const n = count(x, y);
        if (dark[i] && n >= 2 && n <= 5 && Math.random() < 0.5) { dark[i] = 0; break; }
        if (!dark[i] && n >= 3 && n <= 6) { dark[i] = 1; break; }
      }
      kick();
    };

    // The heading and copy are server-rendered text; the pixel field is decoration,
    // so it is built only after the first paint, when the browser is idle.
    let ro: ResizeObserver | undefined, io: IntersectionObserver | undefined;
    let started = false, idleId = 0, paintRaf = 0;
    const start = () => {
      if (started) return;
      started = true;
      build();
      draw();
      ro = new ResizeObserver(() => { build(); kick(); });
      ro.observe(canvas);
      io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); });
      io.observe(canvas);
      if (!reduce) timer = window.setInterval(morph, 140);
    };
    paintRaf = requestAnimationFrame(() => {
      if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(start, { timeout: 1200 });
      else idleId = window.setTimeout(start, 200);
    });
    const host = canvas.parentElement;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - r.left) / cell), y = Math.floor((e.clientY - r.top) / cell);
      if (x < 0 || y < 0 || x >= cols || y >= rows) return;
      heat[y * cols + x] = 1;
      kick();
    };
    if (host && fine && !reduce) host.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf); cancelAnimationFrame(paintRaf); clearInterval(timer); ro?.disconnect(); io?.disconnect();
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId); else clearTimeout(idleId);
      if (host) host.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
