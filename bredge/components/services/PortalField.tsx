"use client";

import { useEffect, useRef } from "react";

/**
 * The light behind the portal hero (after the portal reference): coloured
 * light streaks curving in from the left and converging on the tile, and a dense,
 * ragged ribbon of lime data points leaving it to the right, laced with fine
 * links so it reads as a wireframe tangle.
 *
 * Cutting through the ribbon with the mouse (as on the trail hero): points
 * near the cursor are thrown outward, their links drop and they scatter as
 * stars, then spring back and join up again. Each point carries its own
 * offset, velocity and "broken" amount.
 *
 * The tile sits at (0.5w, `cy` × h), or on the hero's [data-portal-tile].
 * Draws only while on screen; ~30fps when calm, full rate while points
 * recover. Reduced motion: one still frame, no cutting. Mouse only.
 */

type P = { u: number; r: number; ph: number; s: number; a: number; b: number; ox: number; oy: number; vx: number; vy: number; br: number; jx: number; jy: number };

const hexA = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`;
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export function PortalField({ className, cy: cy0 = 0.4 }: { className?: string; cy?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true, last = 0;
    let cy = cy0;
    const t0 = performance.now();
    let pts: P[] = [];
    // Rays are drawn once per resize at half size, so they come out soft.
    const rayCanvas = document.createElement("canvas");
    const rctx = rayCanvas.getContext("2d");

    const build = () => {
      const rand = rng(11);
      const count = w < 700 ? 800 : 1900;
      pts = Array.from({ length: count }, () => {
        // Most points hug the centre line; a few stray wide.
        const g = (rand() + rand() + rand() + rand() - 2) / 2;
        const ang = rand() * Math.PI * 2, rr = 0.4 + rand() * 0.6;
        return { u: rand(), r: g, ph: rand() * Math.PI * 2, s: 0.6 + rand() * 1.1, a: 0, b: 0, ox: 0, oy: 0, vx: 0, vy: 0, br: 0, jx: Math.cos(ang) * rr, jy: Math.sin(ang) * rr };
      });
      pts.sort((p, q) => p.u - q.u);
      const n = pts.length;
      pts.forEach((p, i) => {
        p.a = Math.min(n - 1, i + 1 + Math.floor(rand() * 3));
        p.b = Math.min(n - 1, i + 2 + Math.floor(rand() * 7));
      });
    };

    // Light streaks (after the light-streak reference): curved strands that
    // fan out wide to the left and gather into a white-hot point at the tile,
    // red through orange and amber with pink and a few blue strands.
    type Streak = { x0: number; y0: number; qx: number; qy: number; col: string; wd: number; al: number; dash: number; gap: number; sp: number; ph: number };
    const STREAK_COLS = ["#ff3b2f", "#ff5a36", "#ff7a3d", "#ff9a48", "#ffb45a", "#ff6b8e", "#e8452c", "#3d9bff", "#58b8ff"];
    let streaks: Streak[] = [];
    const drawRays = () => {
      if (!rctx) return;
      const rw = Math.max(1, Math.round(w / 2)), rh = Math.max(1, Math.round(h / 2));
      rayCanvas.width = rw; rayCanvas.height = rh;
      const ex = w / 2 - 22, ey = cy * h;              // the tile's left edge, full-size coordinates
      const rand = rng(5);
      const Lx = ex + 40;                               // run off the left edge
      streaks = Array.from({ length: 150 }, (_, i) => {
        const k = i / 149;
        // Spread at the far end, biased downward as in the reference.
        const y0 = ey + (k - 0.4) * h * 0.5 + (rand() - 0.5) * h * 0.03;
        const x0 = ex - Lx;
        // Bend: strands hug together near the tile, then fan out.
        const qx = ex - Lx * (0.3 + rand() * 0.15), qy = ey + (y0 - ey) * (0.08 + rand() * 0.1);
        const ci = rand() < 0.12 ? 7 + Math.floor(rand() * 2) : Math.floor(rand() * 7);
        return { x0, y0, qx, qy, col: STREAK_COLS[ci], wd: 0.6 + Math.pow(rand(), 2) * 3, al: 0.12 + rand() * 0.35, dash: 60 + rand() * 240, gap: 200 + rand() * 600, sp: 0.6 + rand() * 0.9, ph: rand() * 1000 };
      });
      rctx.clearRect(0, 0, rw, rh);
      rctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
      rctx.globalCompositeOperation = "lighter";
      rctx.lineCap = "round";
      // Soft out-of-focus glow pass, then the sharp strands.
      for (const pass of [0, 1]) {
        for (const st of streaks) {
                    const g = rctx.createLinearGradient(st.x0, st.y0, ex, ey);
          const al = pass === 0 ? st.al * 0.1 : st.al;
          g.addColorStop(0, "rgba(0,0,0,0)");
          g.addColorStop(0.25, hexA(st.col, al * 0.55));
          g.addColorStop(0.8, hexA(st.col, al));
          g.addColorStop(1, `rgba(255,248,235,${Math.min(1, al * 1.4)})`);
          rctx.strokeStyle = g;
          rctx.lineWidth = pass === 0 ? st.wd * 6 + 4 : st.wd;
          rctx.beginPath(); rctx.moveTo(st.x0, st.y0); rctx.quadraticCurveTo(st.qx, st.qy, ex, ey); rctx.stroke();
        }
      }
      // White-hot core where they meet.
      const core = rctx.createRadialGradient(ex, ey, 0, ex, ey, Math.min(w, h) * 0.08);
      core.addColorStop(0, "rgba(255,255,255,.75)");
      core.addColorStop(0.3, "rgba(160,215,255,.18)");
      core.addColorStop(1, "rgba(160,215,255,0)");
      rctx.fillStyle = core; rctx.fillRect(0, 0, w, h);
      rctx.setTransform(1, 0, 0, 1, 0, 0);
    };


    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height; dpr = Math.min(1.5, window.devicePixelRatio || 1);
      // Follow the tile if the hero marks one, so rays and stream meet it.
      const tile = canvas.parentElement?.querySelector<HTMLElement>("[data-portal-tile]");
      if (tile) { const b = tile.getBoundingClientRect(); cy = (b.top + b.height / 2 - r.top) / (h || 1); }
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      build();
      drawRays();
    };

    // Stream geometry: u (0..1) runs from the tile to past the right edge.
    const X0 = () => w / 2 + 28;
    const span = () => w / 2 + 40;
    const pos = (p: P, t: number) => {
      const x = X0() + p.u * span();
      const k = x - X0();
      const amp = Math.min(h * 0.024, 18) * (0.8 + p.u * 0.9);
      const wave = Math.sin(k * 0.016 - t * 1.3 + p.ph * 0.1) * amp * 0.4 + Math.sin(k * 0.057 + t * 2) * amp * 0.25;
      const jitter = Math.sin(t * p.s * 3 + p.ph) * amp * 0.16;
      return [x + p.ox, cy * h + wave + p.r * amp + jitter + p.oy];
    };

    let energy = 0;
    const step = (dt: number) => {
      energy = 0;
      for (const p of pts) {
        p.u += dt * 0.04;
        if (p.u > 1) { p.u -= 1; p.ox = p.oy = p.vx = p.vy = p.br = 0; }
        if (p.br < 0.002 && Math.abs(p.ox) + Math.abs(p.oy) + Math.abs(p.vx) + Math.abs(p.vy) < 0.05) { p.ox = p.oy = p.vx = p.vy = p.br = 0; continue; }
        p.vx = p.vx * 0.86 - p.ox * 0.035;
        p.vy = p.vy * 0.86 - p.oy * 0.035;
        p.ox += p.vx; p.oy += p.vy;
        p.br *= 0.972;
        energy++;
      }
    };

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, y0 = cy * h;
      ctx.globalCompositeOperation = "lighter";

      // Rays, with a slow breathing shimmer.
      ctx.globalAlpha = 0.85 + 0.15 * Math.sin(t * 0.8);
      ctx.drawImage(rayCanvas, 0, 0, w, h);
      ctx.globalAlpha = 1;
      // Bright pulses running along the strands towards the tile.
      ctx.lineCap = "round";
      const ex = w / 2 - 22;
      for (let i = 0; i < streaks.length; i += 3) {
        const st = streaks[i];
        ctx.strokeStyle = st.col; ctx.globalAlpha = Math.min(1, st.al * 0.8); ctx.lineWidth = Math.max(0.8, st.wd * 0.8);
        ctx.setLineDash([st.dash, st.gap]);
        ctx.lineDashOffset = -(st.ph + t * 260 * st.sp);
        ctx.beginPath(); ctx.moveTo(st.x0, st.y0); ctx.quadraticCurveTo(st.qx, st.qy, ex, y0); ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Halo and a faint vertical flare at the tile.
      const halo = ctx.createRadialGradient(cx, y0, 0, cx, y0, Math.min(w, h) * 0.2);
      halo.addColorStop(0, "rgba(190,240,140,.2)");
      halo.addColorStop(0.35, "rgba(190,240,140,.05)");
      halo.addColorStop(1, "rgba(190,240,140,0)");
      ctx.fillStyle = halo; ctx.fillRect(0, 0, w, h);
      const fl = ctx.createLinearGradient(cx, y0 - h * 0.14, cx, y0 + h * 0.14);
      fl.addColorStop(0, "rgba(255,255,255,0)"); fl.addColorStop(0.5, "rgba(255,255,255,.3)"); fl.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = fl; ctx.fillRect(cx - 0.5, y0 - h * 0.14, 1, h * 0.28);

      // Stream: links between whole points, then points (stars when broken).
      const n = pts.length;
      const X = new Float32Array(n), Y = new Float32Array(n);
      const spread = Math.min(w, h) * 0.035;
      for (let i = 0; i < n; i++) {
        const p = pts[i], [x, y] = pos(p, t);
        X[i] = x + p.jx * spread * p.br; Y[i] = y + p.jy * spread * p.br;
      }
      const maxD2 = 30 * 30;
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = "rgba(176,232,122,.3)";
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const p = pts[i];
        if (p.br > 0.25) continue;
        for (const j of [p.a, p.b]) {
          if (pts[j].br > 0.25) continue;
          const dx = X[j] - X[i], dy = Y[j] - Y[i];
          if (dx * dx + dy * dy > maxD2) continue;
          ctx.moveTo(X[i], Y[i]); ctx.lineTo(X[j], Y[j]);
        }
      }
      ctx.stroke();
      for (let i = 0; i < n; i++) {
        const p = pts[i];
        // Fade in leaving the tile, fade out at the right edge.
        const fade = Math.min(1, p.u * 20) * Math.min(1, (1 - p.u) * 5);
        const tw = 0.6 + 0.4 * Math.sin(t * 3 * p.s + p.ph);
        const bright = p.s > 1.45;
        ctx.globalAlpha = Math.min(1, fade * (tw * 0.85 + p.br * 0.6));
        ctx.fillStyle = p.br > 0.5 || bright ? "#eaffd6" : "#a6e36f";
        const s = (bright ? 1.7 : 1.15) * (1 + p.br * 0.8);
        ctx.fillRect(X[i] - s / 2, Y[i] - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      if (energy > 0 || now - last > 33) { step(dt); last = now; draw((now - t0) / 1000); }
      raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (!raf && !reduce) { last = performance.now(); raf = requestAnimationFrame(loop); } };

    resize();
    draw(0);
    kick();
    const ro = new ResizeObserver(() => { resize(); draw((performance.now() - t0) / 1000); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); });
    io.observe(canvas);

    // The cut: points near the cursor are thrown outward and along the
    // stroke, and break into stars.
    const host = canvas.parentElement;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let px = 0, py = 0, has = false;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const mvx = has ? x - px : 0, mvy = has ? y - py : 0;
      px = x; py = y; has = true;
      const R = Math.min(w, h) * 0.13, R2 = R * R, t = (performance.now() - t0) / 1000;
      const speed = Math.min(1, Math.hypot(mvx, mvy) / 40);
      for (const p of pts) {
        const [qx, qy] = pos(p, t);
        const dx = qx - x, dy = qy - y, d2 = dx * dx + dy * dy;
        if (d2 > R2) continue;
        const d = Math.sqrt(d2) || 1, f = 1 - d / R;
        const kk = f * (2.2 + speed * 6);
        p.vx += (dx / d) * kk + mvx * f * 0.18;
        p.vy += (dy / d) * kk + mvy * f * 0.18;
        p.br = Math.max(p.br, Math.min(1, f * 1.6));
      }
      kick();
    };
    const onLeave = () => { has = false; };
    if (host && fine && !reduce) { host.addEventListener("pointermove", onMove, { passive: true }); host.addEventListener("pointerleave", onLeave); }

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      if (host) { host.removeEventListener("pointermove", onMove); host.removeEventListener("pointerleave", onLeave); }
    };
  }, [cy0]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
