"use client";

import { useEffect, useRef } from "react";

/**
 * The pixel edge at the foot of the Services hero: the dark field breaks up
 * into paper-coloured cells that become the page below, and climbs up the
 * right-hand edge. Cells reveal from the
 * bottom up on first view, a few edge cells flip every second (the data
 * settling) and dark cells next to the edge carry a small neighbour count.
 * Hovering a brick eases it to the hero background colour (one or two bricks at a
 * time); it holds while the cursor is there, then eases back to paper. One canvas, drawn only while something
 * is moving; paused off screen; a static frame for reduced motion.
 */

type Cell = { x: number; y: number; on: boolean; a: number; target: number; delay: number; digit: number; tint: number; hold: number; clear: boolean };

const PAPER = "244,241,233";
// Hover tint: the hero background (.sh --sh-bg #050807), so a hovered brick
// goes the same colour as the dark field.
const TINT = "5,8,7";
const HOLD_MS = 700;     // stays green this long after the cursor leaves it
const MAX_LIT = 2;       // never more than two bricks green at once
const NAV_CLEAR = 96;    // no bricks in the top 96px (the header)

// Small deterministic random so the edge is the same on every load and resize.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export function PixelEdge({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cells: Cell[] = [];
    let cols = 0, rows = 0, size = 26, w = 0, h = 0, dpr = 1;
    let raf = 0, idle = 0, visible = true, start = 0, lastFlip = 0;

    const build = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height; dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      size = w < 700 ? 16 : w < 1100 ? 22 : 26;
      cols = Math.ceil(w / size); rows = Math.ceil(h / size);
      const rand = rng(1842);
      const grid: boolean[][] = [];
      for (let c = 0; c < cols; c++) {
        // Edge height per column, in rows from the bottom: two slow waves plus
        // jitter along the foot, rising up the right-hand edge of the hero.
        const u = c / Math.max(1, cols - 1);
        // Only where the copy sits in a left column (900px+); phones keep a flat foot.
        const ramp = w < 900 ? 0 : Math.min(1, Math.max(0, (u - 0.7) / 0.26));
        const eased = ramp * ramp * (3 - 2 * ramp);
        // Climbs to ~84% of the height (clear of the nav), stepping unevenly
        // column to column so it breaks up like the foot instead of a wall.
        const climb = eased * rows * 0.66 + eased * (rand() - 0.5) * rows * 0.22;
        const e = rows * 0.17 + Math.sin(c * 0.33) * rows * 0.052 + Math.sin(c * 0.87 + 1.3) * rows * 0.032 + climb + (rand() - 0.5) * 2;
        grid[c] = [];
        for (let rr = 0; rr < rows; rr++) {
          const d = rr - e; // distance above the edge
          const loose = 1 + ramp * 1.6; // looser break-up on the climb
          const on = d < 0 ? !(d > -1.6 * loose && rand() < 0.22 * loose) : rand() < Math.max(0, 0.5 - d * 0.16 / loose);
          // Keep the nav strip clear so the header stays readable.
          grid[c][rr] = on && Math.floor(h) - (rr + 1) * size >= NAV_CLEAR;
        }
      }
      // Keep-clear zones: anything in the hero marked [data-pixel-clear] (the
      // buttons) gets dark background under it, one brick deep, so the
      // bricks never crowd it.
      const zones = [...(canvas.parentElement?.querySelectorAll<HTMLElement>("[data-pixel-clear]") ?? [])].map((el) => {
        const z = el.getBoundingClientRect();
        return { l: z.left - r.left - size, r: z.right - r.left + size, t: z.top - r.top, b: z.bottom - r.top + size };
      });
      const inZone = (x: number, y: number) => zones.some((z) => x + size > z.l && x < z.r && y + size > z.t && y < z.b);
      for (let c = 0; c < cols; c++) for (let rr = 0; rr < rows; rr++) {
        if (inZone(c * size, Math.floor(h) - (rr + 1) * size)) grid[c][rr] = false;
      }

      cells = [];
      for (let c = 0; c < cols; c++) for (let rr = 0; rr < rows; rr++) {
        let n = 0;
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if ((dx || dy) && grid[c + dx]?.[rr + dy]) n++;
        const on = grid[c][rr];
        const clear = inZone(c * size, Math.floor(h) - (rr + 1) * size);
        cells.push({
          x: c * size, y: Math.floor(h) - (rr + 1) * size, on,
          a: reduce ? (on ? 1 : 0) : 0, target: on ? 1 : 0,
          delay: rr * 26 + rand() * 140,
          digit: !on && !clear && n > 0 && n < 4 && rand() < 0.38 ? n : 0,
          tint: 0, hold: 0, clear,
        });
      }
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t = now - start;
      let moving = false;
      ctx.font = `500 ${Math.round(size * 0.36)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      for (const cell of cells) {
        if (!reduce) {
          const want = t > cell.delay ? cell.target : 0;
          if (Math.abs(cell.a - want) > 0.01) { cell.a += (want - cell.a) * 0.2; moving = true; } else cell.a = want;
        }
        if (cell.a > 0.01) {
          ctx.fillStyle = `rgba(${PAPER},${cell.a})`;
          ctx.fillRect(cell.x, cell.y, size + 0.5, size + 0.5); // overlap a hair so rows never show seams
          // Hover tint: ease in (~250ms) while held, ease out (~600ms) after.
          const wantTint = now < cell.hold ? 1 : 0;
          if (Math.abs(cell.tint - wantTint) > 0.01) { cell.tint += (wantTint - cell.tint) * (wantTint ? 0.16 : 0.08); moving = true; } else cell.tint = wantTint;
          // Keep frames coming until a released brick's hold runs out and it fades;
          // a brick under a resting cursor (Infinity) needs none once green.
          if (cell.hold !== Infinity && cell.hold > now) moving = true;
          if (cell.tint > 0.01) {
            ctx.fillStyle = `rgba(${TINT},${(cell.tint * cell.a).toFixed(3)})`;
            ctx.fillRect(cell.x, cell.y, size + 0.5, size + 0.5);
          }
        } else {
          if (cell.digit && t > cell.delay + 300) {
            ctx.fillStyle = `rgba(${PAPER},0.32)`;
            ctx.fillText(String(cell.digit), cell.x + size / 2, cell.y + size / 2 + 0.5);
          }
        }
      }
      return moving;
    };

    const flip = () => {
      // Toggle two cells that sit on the edge (has both on and off neighbours).
      for (let k = 0; k < 2; k++) {
        const i = Math.floor(Math.random() * cells.length);
        const c = cells[i];
        const row = i % rows;
        if (row < 1 || row >= rows - 1) continue; // never the bottom or top row
        const up = cells[i + 1], down = cells[i - 1]; // same column (cells are column-major)
        if (!c.clear && up.on !== down.on) { c.on = !c.on; c.target = c.on ? 1 : 0; }
      }
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      if (!reduce && now - lastFlip > 1100 && now - start > 1400) { lastFlip = now; flip(); }
      const moving = draw(now);
      if (reduce) return;
      // Frame by frame only while a reveal or fade runs; otherwise wake once
      // for the next edge flip.
      if (moving) raf = requestAnimationFrame(loop);
      else idle = window.setTimeout(kick, 1100);
    };
    const kick = () => { window.clearTimeout(idle); if (!raf) raf = requestAnimationFrame(loop); };

    build();
    start = performance.now();
    if (reduce) draw(start); else kick();

    const ro = new ResizeObserver(() => { build(); if (reduce) draw(performance.now()); else { cells.forEach((c) => { c.a = c.target; }); kick(); } });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); });
    io.observe(canvas);

    // Hover: the brick under the mouse goes green; at most two at a time (the
    // oldest lets go first). Mouse only, never for reduced motion.
    const host = canvas.parentElement;
    let lastIdx = -1;
    const lit: Cell[] = [];
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !cells.length) return;
      const r = canvas.getBoundingClientRect();
      const px = e.clientX - r.left, py = e.clientY - r.top;
      if (py < 0 || px < 0 || px > w) return;
      const col = Math.floor(px / size), row = Math.floor((Math.floor(h) - py) / size);
      const idx = col * rows + row;
      if (idx === lastIdx || row < 0 || row >= rows) return;
      lastIdx = idx;
      const now = performance.now();
      // The brick just left keeps its green for HOLD_MS, then lets go.
      const prev = lit[lit.length - 1];
      if (prev && prev.hold === Infinity) prev.hold = now + HOLD_MS;
      const c = cells[idx];
      if (!c || !c.on) { kick(); return; }
      c.hold = Infinity; // stays green while the cursor rests on it
      const at = lit.indexOf(c);
      if (at >= 0) lit.splice(at, 1);
      lit.push(c);
      while (lit.length > MAX_LIT) { const old = lit.shift(); if (old) old.hold = now; }
      kick();
    };
    const hoverable = !reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onLeave = () => { const prev = lit[lit.length - 1]; if (prev && prev.hold === Infinity) prev.hold = performance.now() + HOLD_MS; lastIdx = -1; kick(); };
    if (hoverable && host) { host.addEventListener("pointermove", onMove, { passive: true }); host.addEventListener("pointerleave", onLeave); }

    return () => {
      if (host) { host.removeEventListener("pointermove", onMove); host.removeEventListener("pointerleave", onLeave); }
      cancelAnimationFrame(raf); window.clearTimeout(idle); ro.disconnect(); io.disconnect();
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
