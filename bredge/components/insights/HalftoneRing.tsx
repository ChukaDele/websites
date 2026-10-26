"use client";

import { useEffect, useRef } from "react";

/**
 * A large ring drawn in halftone dots (after the Selecta reference): a torus
 * standing up and facing us, leaning back a little, rising out of the bottom
 * edge, shaded by a light
 * from the upper left and printed as a dot screen, with a faint dot ground
 * around it. It rocks slowly and leans a little towards the cursor; moving
 * the mouse through it scatters the dots near the cursor, which spring back
 * into place (each dot has its own offset and velocity).
 *
 * Rendered by ray-marching a torus on a coarse grid, one dot per cell, ~30fps
 * and only while on screen. Reduced motion: one still frame.
 */

const INK = "20,22,21";

export function HalftoneRing({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, cell = 7, raf = 0, visible = true, last = 0;
    const t0 = performance.now();
    let tx = 0, ty = 0, lx = 0, ly = 0;
    let cols = 0, rows = 0;
    let ox = new Float32Array(0), oy = new Float32Array(0), vx = new Float32Array(0), vy = new Float32Array(0);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height; dpr = Math.min(2, window.devicePixelRatio || 1);
      cell = Math.max(5, Math.round(w / 190));
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      cols = Math.ceil(w / cell); rows = Math.ceil(h / cell);
      const n = cols * rows;
      ox = new Float32Array(n); oy = new Float32Array(n); vx = new Float32Array(n); vy = new Float32Array(n);
    };

    // Torus in its own frame: ring in the x–z plane, major R, minor r.
    const R = 1, rr = 0.27;
    const sdf = (x: number, y: number, z: number) => {
      const q = Math.hypot(x, z) - R;
      return Math.hypot(q, y) - rr;
    };

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      // Orientation: tilted towards us, rocking, plus the cursor lean.
      const tilt = Math.PI / 2 - 0.38 + Math.sin(t * 0.25) * 0.05 + ly * 0.2;   // ring stands up, facing us, leaning back a little
      const yaw = Math.sin(t * 0.18) * 0.12 + lx * 0.35;
      const ct = Math.cos(tilt), st = Math.sin(tilt), cy = Math.cos(yaw), sy = Math.sin(yaw);
      // Camera: orthographic-ish, ring centre sits near the bottom edge.
      // Wide ring, its top just under the copy, cropped by the bottom edge.
      const scale = w * 0.4;
      const ringX = w * 0.5, ringY = h * 0.06 + (R + rr) * scale * Math.sin(tilt);
      const L = [-0.5, 0.75, 0.45], ll = Math.hypot(...L);
      const lxn = L[0] / ll, lyn = L[1] / ll, lzn = L[2] / ll;

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const px = i * cell + cell / 2, py = j * cell + cell / 2;
          // Ray in view space, then into the ring's frame (undo yaw, tilt).
          const rx = (px - ringX) / scale, ry = -(py - ringY) / scale;
          let hit = false, nx = 0, ny = 0, nz = 0;
          // March along -z from z = 2 in view space.
          let z = 2;
          for (let k = 0; k < 28; k++) {
            // view -> ring frame
            const ax = rx * cy - z * sy, az = rx * sy + z * cy;
            const by = ry * ct - az * st, bz = ry * st + az * ct;
            const d = sdf(ax, by, bz);
            if (d < 0.004) {
              hit = true;
              const e = 0.01;
              const gx = sdf(ax + e, by, bz) - sdf(ax - e, by, bz);
              const gy = sdf(ax, by + e, bz) - sdf(ax, by - e, bz);
              const gz = sdf(ax, by, bz + e) - sdf(ax, by, bz - e);
              // ring frame normal -> view frame
              const n1y = gy * ct + gz * st, n1z = -gy * st + gz * ct;
              nx = gx * cy + n1z * sy; nz = -gx * sy + n1z * cy; ny = n1y;
              const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
              break;
            }
            z -= Math.max(d, 0.01);
            if (z < -2) break;
          }
          let dark: number;
          if (hit) {
            const diff = Math.max(0, nx * lxn + ny * lyn + nz * lzn);
            const rim = Math.pow(1 - Math.max(0, nz), 2);
            dark = Math.min(1, 0.95 - diff * 0.75 + rim * 0.15);
            // A little grain so the screen reads as print.
            dark += (Math.sin(i * 12.9898 + j * 78.233) * 43758.5453 % 1) * 0.12;
          } else {
            // Faint ground of dots, denser towards the ring.
            dark = 0.05;
          }
          if (dark <= 0.02) continue;
          const rad = (cell / 2) * Math.sqrt(Math.min(1, dark)) * 0.95;
          ctx.fillStyle = `rgba(${INK},${hit ? 0.92 : 0.35})`;
          const k = j * cols + i;
          ctx.beginPath(); ctx.arc(px + ox[k], py + oy[k], rad, 0, Math.PI * 2); ctx.fill();
        }
      }
    };

    // Springs pull every scattered dot home.
    let energy = 0;
    const step = () => {
      energy = 0;
      for (let k = 0; k < ox.length; k++) {
        if (!ox[k] && !oy[k] && !vx[k] && !vy[k]) continue;
        vx[k] = vx[k] * 0.84 - ox[k] * 0.06; vy[k] = vy[k] * 0.84 - oy[k] * 0.06;
        ox[k] += vx[k]; oy[k] += vy[k];
        if (Math.abs(ox[k]) + Math.abs(oy[k]) + Math.abs(vx[k]) + Math.abs(vy[k]) < 0.05) { ox[k] = oy[k] = vx[k] = vy[k] = 0; continue; }
        energy++;
      }
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      lx += (tx - lx) * 0.06; ly += (ty - ly) * 0.06;
      step();
      // Full rate while dots are flying, ~30fps when calm.
      if (energy > 0 || now - last > 33) { last = now; draw((now - t0) / 1000); }
      raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (!raf && !reduce) raf = requestAnimationFrame(loop); };

    resize(); draw(0); kick();
    const ro = new ResizeObserver(() => { resize(); draw((performance.now() - t0) / 1000); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); });
    io.observe(canvas);

    const host = canvas.closest("section");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let mx = 0, my = 0, has = false;
    const onMove = (e: PointerEvent) => {
      const r = (host ?? canvas).getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5);
      ty = ((e.clientY - r.top) / r.height - 0.5);
      // Scatter: push dots near the cursor outward and along the movement.
      const c = canvas.getBoundingClientRect();
      const x = e.clientX - c.left, y = e.clientY - c.top;
      const dmx = has ? x - mx : 0, dmy = has ? y - my : 0;
      mx = x; my = y; has = true;
      if (y < -40 || y > h + 40) return;
      const R0 = Math.max(60, w * 0.07), speed = Math.min(1, Math.hypot(dmx, dmy) / 30);
      const i0 = Math.max(0, Math.floor((x - R0) / cell)), i1 = Math.min(cols - 1, Math.ceil((x + R0) / cell));
      const j0 = Math.max(0, Math.floor((y - R0) / cell)), j1 = Math.min(rows - 1, Math.ceil((y + R0) / cell));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const k = j * cols + i;
        const dx = i * cell + cell / 2 + ox[k] - x, dy = j * cell + cell / 2 + oy[k] - y, d = Math.hypot(dx, dy);
        if (d > R0) continue;
        const f = 1 - d / R0, kick = f * (1.6 + speed * 6);
        vx[k] += (dx / (d || 1)) * kick + dmx * f * 0.25;
        vy[k] += (dy / (d || 1)) * kick + dmy * f * 0.25;
      }
      kick();
    };
    const onLeave = () => { has = false; };
    if (host && fine && !reduce) { host.addEventListener("pointermove", onMove, { passive: true }); host.addEventListener("pointerleave", onLeave); }

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      if (host) { host.removeEventListener("pointermove", onMove); host.removeEventListener("pointerleave", onLeave); }
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
