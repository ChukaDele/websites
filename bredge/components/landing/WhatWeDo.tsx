"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "What we actually do." (Second Direction)
 *
 * After the Data Center reference, in dark mode (matched to the hero): a
 * hairline frame, two bands.
 *  Top     Two-tone headline.
 *  Bottom  Left: a short lead, the call button, and the five capabilities
 *          as an accordion. Right: a dot terrain with a floating card for the
 *          open capability. The terrain reshapes per capability.
 *
 * The card names the stage the open capability belongs to (connect,
 * reconcile or report).
 *
 * Motion, each with a job:
 *  - Entrance (once): headline, then the working half, settle in sequence.
 *  - The accordion advances on its own while the section is on screen and
 *    nobody is pointing at it; a hairline shows the time left. Clicking a
 *    capability stops it.
 *  - On change, the card stays put and only its rows cross-fade, staggered,
 *    so the eye stays anchored. The terrain eases into its new shape.
 * Reduced motion: no auto-advance, no movement, a still terrain.
 */

// stage: which of the three stages (connect, reconcile, report) it belongs to.
export type WwdItem = { name: string; text: string; covers?: string; stage?: number; wave: [number, number, number, number] };

// wave: [ridge frequency, ridge height, swell frequency, swell height]
const DEFAULT_ITEMS: WwdItem[] = [
  { name: "Data foundations", stage: 0, text: "Get your data into one place, on a schedule, without anyone babysitting it.", covers: "Pipelines · Warehouses · APIs · SQL · Python · Transformation · Data modelling", wave: [1.6, 0.9, 0.7, 0.5] },
  { name: "Analytics", stage: 2, text: "Work out why a number moved, not just that it moved.", covers: "KPI frameworks · Funnel analysis · Cohorts · Segmentation · Root-cause analysis", wave: [2.4, 0.6, 1.1, 0.8] },
  { name: "BI & reporting", stage: 2, text: "Dashboards people open more than once.", covers: "Power BI · Executive reporting · Operational dashboards · Self-service analytics", wave: [1.1, 1.2, 0.5, 0.35] },
  { name: "Data quality & governance", stage: 1, text: "Make the important numbers defined, traceable and testable.", covers: "Reconciliation · Metric definitions · Quality tests · Data lineage · Documentation", wave: [3.0, 0.45, 1.4, 0.6] },
  { name: "Automation & data ops", stage: 0, text: "Something is watching the pipeline at 6am so you don’t find out at 10.", covers: "Scheduled reporting · Refresh monitoring · Automated workflows · Runbooks · Ongoing improvements", wave: [1.9, 0.75, 0.9, 0.9] },
];

// The stage each capability belongs to, shown on the card.
const DEFAULT_STAGES = ["Connect", "Reconcile", "Report"];

type WhatWeDoProps = {
  items?: WwdItem[];
  stages?: string[];
  /** Headline: the muted first part, then the rest. */
  heading?: [string, string];
  /** Text beside the headline; empty for none. */
  mc?: string;
  /** Lead and call button above the list; null for none. */
  lead?: [string, string] | null;
  /** Card row labels: [what it does, what it covers, third row label, third row text]; null shows just the text. */
  rows?: [string, string, string, string] | null;
  sectionId?: string;
  /** Black and white: true black ground, greyscale terrain and card. */
  mono?: boolean;
};

export function WhatWeDo({
  items: ITEMS = DEFAULT_ITEMS,
  stages: STAGES = DEFAULT_STAGES,
  heading = ["What we", "actually do."],
  mc = "Every number traces back to a source and a written definition. When systems disagree, the gap becomes a ticket, not an average. We test before anything is presented, and document it well enough that you could replace us.",
  lead = ["From the raw data to the number in the meeting.", "Five capabilities, delivered by the same senior team. We work with whatever you already have."],
  rows = ["What it does", "What it covers", "Handed over with", "Documentation, tests and runbooks, so your team can run it without us."],
  sectionId = "services",
  mono = false,
}: WhatWeDoProps = {}) {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [entered, setEntered] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveRef = useRef<number[]>([...ITEMS[0].wave]);
  const targetRef = useRef<number[]>([...ITEMS[0].wave]);

  // Track visibility: the entrance plays once, and the auto-advance only
  // runs while the section is actually on screen.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(([e]) => {
      setInView(e.isIntersecting);
      if (e.isIntersecting) setEntered(true);
    }, { threshold: 0.2 });
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => { targetRef.current = [...ITEMS[active].wave]; }, [ITEMS, active]);

  // The dot terrain. Runs only while on screen.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = false;
    let w = 0, h = 0;
    const COLS = 150, ROWS = 72;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      const wv = waveRef.current, tg = targetRef.current;
      for (let i = 0; i < 4; i++) wv[i] += (tg[i] - wv[i]) * 0.04;
      const [f1, a1, f2, a2] = wv;
      ctx.clearRect(0, 0, w, h);
      for (let r = 0; r < ROWS; r++) {
        const z = r / (ROWS - 1);             // 0 far, 1 near
        const persp = 0.35 + z * 0.65;
        const baseY = h * (0.02 + z * 1.08);
        for (let c = 0; c < COLS; c++) {
          const u = c / (COLS - 1);
          const x = w / 2 + (u - 0.5) * w * (0.7 + persp * 0.9);
          const ridge = Math.sin(u * Math.PI * f1 * 2 + z * 3 + t * 0.35) * a1;
          const swell = Math.sin(z * Math.PI * f2 * 2 - u * 2.2 + t * 0.22) * a2;
          const lift = (ridge + swell + 1.6) * (1 - u * 0.35);   // higher on the left, like the reference dunes
          const y = baseY - lift * h * 0.2 * persp;
          const k = Math.min(1, Math.max(0, lift / 3));
          const size = (0.9 + persp * 2.1) * (0.75 + k * 0.6);
          ctx.globalAlpha = 0.4 + persp * 0.55;
          ctx.fillStyle = mono
            ? (k > 0.66 ? "#f1f1ef" : k > 0.5 ? "#b9b9b6" : k > 0.32 ? "#6e6e6b" : "#3a3a38")
            : (k > 0.66 ? "#b6ef9d" : k > 0.5 ? "#90d26f" : k > 0.32 ? "#4f8a3c" : "#2a4a2f");
          ctx.fillRect(x - size / 2, y - size / 2, size, size);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      draw(now / 1000);
      if (visible && !reduce) raf = requestAnimationFrame(loop);
    };

    resize();
    draw(0);
    const ro = new ResizeObserver(() => { resize(); draw(performance.now() / 1000); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduce) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    // Under reduced motion, still settle the terrain when the selection changes.
    let settle = 0;
    if (reduce) settle = window.setInterval(() => draw(0), 400);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.clearInterval(settle); };
  }, [mono]);

  const item = ITEMS[active];
  const pick = (i: number) => { setAuto(false); setActive(i); };
  // The timer hairline is the clock: when its animation ends, advance.
  // Under reduced motion the CSS removes it, so nothing advances.
  const advance = () => setActive((i) => (i + 1) % ITEMS.length);
  const paused = !inView || hovered;

  return (
    <section ref={rootRef} id={sectionId} className={`tq${mono ? " is-mono" : ""}${entered ? " is-in" : ""}${paused ? " is-paused" : ""}`} aria-labelledby="tq-title">
      <div className="tq-frame">

        <div className={`tq-band tq-top${mc ? "" : " is-solo"}`}>
          <h2 id="tq-title" className="tq-h2"><span>{heading[0]}</span> {heading[1]}</h2>
          {mc && <p className="tq-mc">{mc}</p>}
        </div>

        <div className="tq-band tq-main" onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)} onFocus={() => setHovered(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovered(false); }}>
          <div className="tq-side">
            {lead && (
              <div className="tq-lead">
                <h3>{lead[0]}</h3>
                <p>{lead[1]}</p>
                <a className="tq-button" href="/schedule">Book a 30-minute call</a>
              </div>
            )}

            <div className="tq-acc">
              {ITEMS.map((t, i) => (
                <div key={t.name} className={`tq-item${i === active ? " is-open" : ""}`}>
                  <button type="button" aria-expanded={i === active} aria-controls={`tq-panel-${i}`} onClick={() => pick(i)}>
                    <span>{t.name}</span>
                    {i === active && auto && <span className="tq-timer" key={active} aria-hidden="true" onAnimationEnd={advance} />}
                  </button>
                  <div className="tq-panel" id={`tq-panel-${i}`} role="region" aria-label={t.name}>
                    <div><p>{t.text}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="tq-visual">
            <canvas ref={canvasRef} className="tq-canvas" aria-hidden="true" />
            <div className="tq-card">
              <div className="tq-card-head">
                <span className="tq-swap" key={item.name}>{item.name}</span>
                {item.stage !== undefined && STAGES[item.stage] && <span className="tq-stage">{STAGES[item.stage]}</span>}
              </div>
{rows ? (
                <dl className="tq-card-body" key={item.name} aria-live="polite">
                  <div className="tq-row" style={{ "--i": 0 } as React.CSSProperties}>
                    <dt>{rows[0]}</dt>
                    <dd>{item.text}</dd>
                  </div>
                  {item.covers && (
                    <div className="tq-row" style={{ "--i": 1 } as React.CSSProperties}>
                      <dt>{rows[1]}</dt>
                      <dd className="tq-tags">{item.covers.split(" · ").map((d) => <span key={d}>{d}</span>)}</dd>
                    </div>
                  )}
                  <div className="tq-row" style={{ "--i": 2 } as React.CSSProperties}>
                    <dt>{rows[2]}</dt>
                    <dd>{rows[3]}</dd>
                  </div>
                </dl>
              ) : (
                <div className="tq-card-body is-plain" key={item.name} aria-live="polite">
                  <p className="tq-row">{item.text}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
