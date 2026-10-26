"use client";

import { useRef } from "react";
import { useRailScroll } from "./useRailScroll";

/**
 * Deliverables as large edge-to-edge panels (after the three-panel
 * reference): lime, near-black and grey in turn, a fine line-art mark top
 * left, the number top right, the title and text at the foot. The section
 * holds while scroll slides the panels right to left (useRailScroll); the
 * page carries on once the last panel is in. Stacks on phones, short
 * screens and reduced motion. Styles: app/services.css (`dr-`).
 */

export type Deliverable = { mark: Mark; title: string; text: string };
export type Mark = "burst" | "bars" | "rings" | "web" | "steps" | "orbit";

const TONES = ["is-lime", "is-dark", "is-grey"] as const;

/* Line-art marks, drawn in the stroke colour of the panel. Coordinates are
   rounded so server and browser render the same strings. */
const r2 = (v: number) => Math.round(v * 100) / 100;

function MarkSvg({ mark }: { mark: Mark }) {
  const c = 32;
  if (mark === "burst") {
    return <>{Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * Math.PI * 2, r0 = 6 + (i % 2) * 3; return <line key={i} x1={r2(c + Math.cos(a) * r0)} y1={r2(c + Math.sin(a) * r0)} x2={r2(c + Math.cos(a) * 28)} y2={r2(c + Math.sin(a) * 28)} />; })}<circle cx={c} cy={c} r={5} /></>;
  }
  if (mark === "bars") {
    return <>{[26, 22, 17, 12, 7].map((wd, i) => <rect key={i} x={c - 26} y={10 + i * 9.5} width={wd * 2} height={6} rx={1} />)}<line x1={c - 28} y1={6} x2={c - 28} y2={58} /></>;
  }
  if (mark === "rings") {
    return <>{[6, 11, 16, 21].map((r) => <g key={r}><circle cx={c - 8} cy={c} r={r} /><circle cx={c + 8} cy={c} r={r} /></g>)}</>;
  }
  if (mark === "web") {
    const pts = Array.from({ length: 7 }, (_, i) => { const a = (i / 7) * Math.PI * 2 - Math.PI / 2; return [r2(c + Math.cos(a) * 26), r2(c + Math.sin(a) * 26)]; });
    return <>{pts.map(([x, y], i) => pts.slice(i + 1).map(([x2, y2], j) => <line key={`${i}-${j}`} x1={x} y1={y} x2={x2} y2={y2} />))}{pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.5} />)}</>;
  }
  if (mark === "steps") {
    return <>{Array.from({ length: 5 }, (_, i) => <rect key={i} x={6 + i * 10} y={50 - i * 10} width={52 - i * 10} height={10} />)}{Array.from({ length: 6 }, (_, i) => <line key={`d${i}`} x1={6 + i * 10} y1={60} x2={6 + i * 10} y2={50 - Math.min(i, 4) * 10} />)}</>;
  }
  return <>{[4, 9, 14, 19, 24, 29].map((r) => <circle key={r} cx={c} cy={c} r={r} />)}<circle cx={c + 18} cy={c - 18} r={3} /></>;
}

export function DeliverableRail({ label, title, items, intro, id }: {
  label: string;
  title: string;
  items: Deliverable[];
  /** Optional paragraph beside the title. */
  intro?: string;
  id?: string;
}) {
  const secRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLOListElement>(null);
  const mode = useRailScroll(secRef, railRef);

  return (
    <section ref={secRef} id={id} className={`dr is-${mode}`} aria-labelledby="dr-title">
      <div className="dr-stage">
        <div className={intro ? "dr-head has-intro" : "dr-head"}>
          <div>
            <p className="dr-k">{label}</p>
            <h2 id="dr-title" className="dr-h2">{title}</h2>
          </div>
          {intro && <p className="dr-intro">{intro}</p>}
        </div>
        <div className="dr-view">
          <ol className="dr-rail" ref={railRef}>
            {items.map((it, i) => (
              <li key={it.title} className={`dr-card ${TONES[i % 3]}`}>
                <svg className="dr-mark" viewBox="0 0 64 64" aria-hidden="true"><MarkSvg mark={it.mark} /></svg>
                <span className="dr-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <h3>{it.title}</h3>
                <p>{it.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
