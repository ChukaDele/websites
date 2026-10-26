"use client";

import { useEffect, useRef } from "react";

/**
 * Long-exposure light trails (after the light-streaks reference): concentric
 * arcs come in from the upper left, run across the top and sweep down the
 * right side, in emerald, green and teal with mint highlights; soft wide
 * out-of-focus bands sit behind sharp thin ones, glowing where they bunch
 * (additive blending). Short bright dashes travel along them so the field
 * reads as motion.
 *
 * Cutting through them with the mouse (as the homepage particle field does):
 * the trails near the cursor break into stars that are thrown outward and
 * along the stroke, then spring back and join up into lines again. Each
 * trail is a chain of points with its own small spring (offset, velocity,
 * "broken" amount); broken points draw as stars, whole runs draw as lines.
 *
 * Draws ~30fps at rest, full rate while anything is recovering, only while
 * on screen. Reduced motion: one still frame, no cutting. Mouse only.
 */

type Trail = { a: number; w: number; hue: string; alpha: number; speed: number; dash: number; gap: number; phase: number };

function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// Emerald through teal to a near-white mint, as in the reference.
const COLORS = ["#06392c", "#08816a", "#0fbf95", "#12e0cf", "#1fe26a", "#3dff86", "#b8ffe4"];
const COUNT = 180;   // trails
const N = 96;        // points per trail

export function StreakField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true, last = 0;

    const rand = rng(77);
    const trails: Trail[] = Array.from({ length: COUNT }, (_, i) => {
      const k = i / (COUNT - 1);
      const bright = rand();
      return {
        a: k,                                           // position across the band (0 inner, 1 outer)
        w: 0.8 + rand() * (bright > 0.88 ? 5 : 2.4),    // stroke width
        hue: COLORS[Math.min(COLORS.length - 1, Math.floor(Math.pow(bright, 1.6) * COLORS.length))],
        alpha: 0.14 + Math.pow(bright, 1.6) * 0.7,
        speed: 0.25 + rand() * 0.6,
        dash: 40 + rand() * 260,
        gap: 80 + rand() * 420,
        phase: rand() * 1000,
      };
    });

    // Point state, flat arrays: [trail * N + k].
    const M = COUNT * N;
    const bx = new Float32Array(M), by = new Float32Array(M);          // rest position
    const ox = new Float32Array(M), oy = new Float32Array(M);          // offset from rest
    const vx = new Float32Array(M), vy = new Float32Array(M);          // velocity
    const br = new Float32Array(M);                                     // broken amount 0..1
    const jx = new Float32Array(M), jy = new Float32Array(M);          // each star's own spread direction
    for (let i = 0; i < M; i++) { const ang = rand() * Math.PI * 2, r = 0.4 + rand() * 0.6; jx[i] = Math.cos(ang) * r; jy[i] = Math.sin(ang) * r; }

    const glow = document.createElement("canvas");
    const gctx = glow.getContext("2d");

    // Each trail: an arc of a circle centred below and right of centre, so the
    // trails come in from the upper left, run across the top and sweep down
    // the right side (concentric, like the reference). `a` sets the radius.
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height; dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      glow.width = Math.max(1, Math.round(w / 4)); glow.height = Math.max(1, Math.round(h / 4));
      const cx = 0.6 * w, cy = 1.12 * h;
      trails.forEach((tr, ti) => {
        const rad = (0.6 + tr.a * 0.42) * h;                      // a tight bundle, tops from ~0.1h to ~0.5h
        const rx = rad * Math.max(1.15, w / h * 0.78);
        const a0 = Math.PI * 1.0, a1 = Math.PI * 2.05;            // up from the lower left, over the top, down the right
        for (let k = 0; k < N; k++) {
          const ang = a0 + (a1 - a0) * (k / (N - 1));
          const i = ti * N + k;
          bx[i] = cx + Math.cos(ang) * rx;
          by[i] = cy + Math.sin(ang) * rad;
        }
      });
    };

    // Physics: springs pull every point home; the broken amount fades, so
    // stars drift back and reconnect into lines.
    let energy = 0;
    const step = () => {
      energy = 0;
      for (let i = 0; i < M; i++) {
        if (br[i] < 0.002 && Math.abs(ox[i]) < 0.05 && Math.abs(oy[i]) < 0.05 && Math.abs(vx[i]) < 0.02 && Math.abs(vy[i]) < 0.02) {
          if (br[i] || ox[i] || oy[i] || vx[i] || vy[i]) { br[i] = 0; ox[i] = 0; oy[i] = 0; vx[i] = 0; vy[i] = 0; }
          continue;
        }
        vx[i] = vx[i] * 0.86 - ox[i] * 0.035;
        vy[i] = vy[i] * 0.86 - oy[i] * 0.035;
        ox[i] += vx[i]; oy[i] += vy[i];
        br[i] *= 0.972;
        energy++;
      }
    };

    // The cut: points near the cursor are thrown outward and along the stroke.
    let px = 0, py = 0, has = false;
    const cut = (x: number, y: number) => {
      const mvx = has ? x - px : 0, mvy = has ? y - py : 0;
      px = x; py = y; has = true;
      const R = Math.min(w, h) * 0.13, R2 = R * R;
      const speed = Math.min(1, Math.hypot(mvx, mvy) / 40);
      for (let i = 0; i < M; i++) {
        const dx = bx[i] + ox[i] - x, dy = by[i] + oy[i] - y, d2 = dx * dx + dy * dy;
        if (d2 > R2) continue;
        const d = Math.sqrt(d2) || 1, f = 1 - d / R;
        const kick = f * (2.2 + speed * 6);
        vx[i] += (dx / d) * kick + mvx * f * 0.18;
        vy[i] += (dy / d) * kick + mvy * f * 0.18;
        br[i] = Math.max(br[i], Math.min(1, f * 1.6));
      }
    };

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Glow: the band's core, wide strokes at quarter size, scaled up.
      if (gctx) {
        gctx.setTransform(1, 0, 0, 1, 0, 0);
        gctx.clearRect(0, 0, glow.width, glow.height);
        gctx.globalCompositeOperation = "lighter";
        gctx.lineCap = "round";
        // Out-of-focus foreground streaks: wide, soft, coloured bands.
        for (let ti = 0; ti < COUNT; ti += 5) {
          const tr = trails[ti];
          gctx.strokeStyle = tr.hue; gctx.globalAlpha = 0.1 + tr.alpha * 0.5;
          gctx.lineWidth = (Math.min(w, h) * (0.012 + (ti % 3) * 0.012)) / 4;
          gctx.beginPath();
          for (let k = 0; k < N; k += 3) { const i = ti * N + k; const x = (bx[i] + ox[i] * 0.4) / 4, y = (by[i] + oy[i] * 0.4) / 4; if (k) gctx.lineTo(x, y); else gctx.moveTo(x, y); }
          gctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.drawImage(glow, 0, 0, w, h);
      }

      const spread = Math.min(w, h) * 0.035;
      for (let ti = 0; ti < COUNT; ti++) {
        const tr = trails[ti];
        // Lines: whole runs only; a broken point ends the run.
        ctx.beginPath();
        let open = false;
        for (let k = 0; k < N; k++) {
          const i = ti * N + k;
          if (br[i] > 0.22) { open = false; continue; }
          const x = bx[i] + ox[i], y = by[i] + oy[i];
          if (open) ctx.lineTo(x, y); else { ctx.moveTo(x, y); open = true; }
        }
        ctx.strokeStyle = tr.hue;
        ctx.lineWidth = tr.w;
        ctx.setLineDash([]);
        ctx.globalAlpha = tr.alpha * 0.35;
        ctx.stroke();
        ctx.setLineDash([tr.dash, tr.gap]);
        ctx.lineDashOffset = -(tr.phase + t * 120 * tr.speed);
        ctx.globalAlpha = tr.alpha;
        ctx.stroke();

        // Stars: broken points, spread a little each in their own direction.
        for (let k = 0; k < N; k++) {
          const i = ti * N + k, b = br[i];
          if (b < 0.06) continue;
          const x = bx[i] + ox[i] + jx[i] * spread * b, y = by[i] + oy[i] + jy[i] * spread * b;
          const r = (0.6 + tr.w * 0.45) * (0.6 + b * 0.8);
          ctx.globalAlpha = Math.min(1, (tr.alpha + 0.35) * b);
          ctx.fillStyle = b > 0.5 ? "#e9fbd9" : tr.hue;
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }
      }
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
      // As in the reference, the streaks fade to black towards the lower left
      // and are brightest across the top and down the right.
      ctx.globalCompositeOperation = "destination-in";
      const fade = ctx.createLinearGradient(0, h, w * 0.85, h * 0.1);
      fade.addColorStop(0, "rgba(0,0,0,0.05)");
      fade.addColorStop(0.35, "rgba(0,0,0,0.35)");
      fade.addColorStop(0.62, "rgba(0,0,0,1)");
      fade.addColorStop(1, "rgba(0,0,0,1)");
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      step();
      // Full frame rate while stars are out, ~30fps when the field is calm.
      if (energy > 0 || now - last > 33) { last = now; draw(now / 1000); }
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

    // Mouse only; the hero section (the canvas's parent) is the hit area, so
    // the copy and cards on top don't block it.
    const host = canvas.parentElement;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = canvas.getBoundingClientRect();
      cut(e.clientX - r.left, e.clientY - r.top);
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
