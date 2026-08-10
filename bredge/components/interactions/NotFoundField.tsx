"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { trackOnce } from "../../lib/analytics";

// Cell coordinates spelling "404" on a grid. 1 = filled cell.
const GLYPHS = [
  // rows x cols per char; assembled into a single matrix
  "111 0 111 0 111",
  "101 0 101 0 101",
  "101 0 111 0 101",
  "101 0 001 0 101",
  "111 0 111 0 111",
].map((r) => r.replace(/ /g, ""));

type Cell = { x: number; y: number };

export function NotFoundField() {
  const rootRef = useRef<HTMLDivElement>(null);
  const recordRef = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<"idle" | "matching" | "amber" | "unmatched">("idle");

  const cells = useMemo<Cell[]>(() => {
    const out: Cell[] = [];
    GLYPHS.forEach((row, y) => { [...row].forEach((c, x) => { if (c === "1") out.push({ x, y }); }); });
    return out;
  }, []);
  const cols = GLYPHS[0].length;
  const rows = GLYPHS.length;

  useEffect(() => { trackOnce("404_view", { page_path: typeof window !== "undefined" ? location.pathname : "" }); }, []);

  // Pointer-driven cell displacement (desktop) + gentle record attraction/lag.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return; // touch handled separately

    let raf = 0;
    let px = -9999, py = -9999;
    const cellEls = Array.from(root.querySelectorAll<HTMLElement>(".nf-cell"));
    const rec = recordRef.current;
    let rx = 0, ry = 0; // current record offset

    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      px = e.clientX - r.left; py = e.clientY - r.top;
    };
    const onLeave = () => { px = -9999; py = -9999; };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);

    const tick = () => {
      // displace nearby matrix cells
      for (const el of cellEls) {
        const cx = el.offsetLeft + el.offsetWidth / 2;
        const cy = el.offsetTop + el.offsetHeight / 2;
        const dx = cx - px, dy = cy - py;
        const dist = Math.hypot(dx, dy);
        const radius = 90;
        if (dist < radius) {
          const f = (1 - dist / radius) * 10;
          el.style.transform = `translate(${(dx / (dist || 1)) * f}px, ${(dy / (dist || 1)) * f}px)`;
        } else {
          el.style.transform = "";
        }
      }
      // record drifts toward pointer with heavy lag (restrained attraction)
      if (rec && phase === "idle") {
        const r = root.getBoundingClientRect();
        const homeX = r.width * 0.5, homeY = r.height * 0.86;
        const tx = px > -9000 ? (px - homeX) * 0.06 : 0;
        const ty = py > -9000 ? (py - homeY) * 0.06 : 0;
        rx += (tx - rx) * 0.08; ry += (ty - ry) * 0.08;
        rec.style.transform = `translate(calc(-50% + ${rx.toFixed(1)}px), calc(-50% + ${ry.toFixed(1)}px))`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); root.removeEventListener("pointermove", onMove); root.removeEventListener("pointerleave", onLeave); };
  }, [phase]);

  function attemptMatch() {
    if (phase !== "idle") return;
    setPhase("matching");
    window.setTimeout(() => setPhase("amber"), 420);
    window.setTimeout(() => setPhase("unmatched"), 760);
    window.setTimeout(() => setPhase("idle"), 2200); // gently reset, replayable
  }

  return (
    <div ref={rootRef} className={`nf-field nf-${phase}`}>
      <div className="nf-matrix" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }} aria-hidden="true">
        {cells.map((c) => (
          <span key={`${c.x}-${c.y}`} className="nf-cell" style={{ gridColumn: c.x + 1, gridRow: c.y + 1 }} />
        ))}
      </div>

      <button
        ref={recordRef}
        type="button"
        className="nf-record"
        onClick={attemptMatch}
        aria-label="Attempt to match the unmatched record"
      >
        <span className="nf-record-label">{phase === "unmatched" ? "UNMATCHED · 404" : phase === "amber" ? "NO MATCH…" : phase === "matching" ? "MATCHING…" : "UNMATCHED"}</span>
        <span className="nf-record-cells"><i /><i /><i /></span>
      </button>

      <p className="nf-meta" aria-hidden="true">lookup(page_id) → 0 matches</p>
    </div>
  );
}
