"use client";

import { useEffect, useRef, useState } from "react";
import { Check, PaperPlaneTilt } from "@phosphor-icons/react";

/**
 * "One partner, across the whole stack": five static capability cards after
 * the reference. White at rest: the title top-left, a small piece of
 * real-looking UI in the middle and the promise at the bottom. The UI is
 * neutral (ink and warm greys) and plays as a time-lapse: one shared tick
 * steps every card through its states, each card offset so they never move
 * together, with short ease-out transitions between states. Mouse enter turns
 * the card dark (glow + grid from `.cr-card`) with the UI floating on it.
 * Loops pause off screen; reduced motion shows the finished state. The UI
 * pieces are illustrative. Styles: app/services.css (`cv-`).
 */

export type Capability = { kind: "engineering" | "analytics" | "bi" | "quality" | "automation"; h: string; line: string; tags: string[]; /** Two-line title; defaults to the kind's. */ title?: [string, string] };

// Titles set on two lines, as in the reference (one colour).
const TITLE: Record<Capability["kind"], [string, string]> = {
  engineering: ["Data", "engineering"],
  analytics: ["Analytics", "that decides"],
  bi: ["BI and", "reporting"],
  quality: ["Data", "quality"],
  automation: ["Reporting", "on autopilot"],
};

const TICK_MS = 1100;
const css = (v: Record<string, string | number>) => v as React.CSSProperties;

/* ── Data engineering: sources sync one after another. ── */
const SOURCES = ["HubSpot", "Stripe", "Xero", "Postgres"];
const ROWS = ["0", "412,880", "918,204", "1,391,577", "1,842,016"];
function Pipeline({ s }: { s: number }) {
  const step = s % 6; // 0–3 syncing source n, 4–5 all done
  return (
    <div className="cv-ui">
      <p className="cv-head"><span>Pipeline run</span><em className={step >= 4 ? "is-done" : undefined}>{step >= 4 ? "Synced" : "Running"}</em></p>
      <ul className="cv-src">
        {SOURCES.map((name, i) => {
          const state = step > i ? "done" : step === i ? "run" : "wait";
          return (
            <li key={name} className={`is-${state}`}>
              <span className="cv-src-mark">{state === "done" ? <Check size={9} weight="bold" /> : null}</span>
              <span className="cv-src-name">{name}</span>
              <span className="cv-src-state">{state === "done" ? "Loaded" : state === "run" ? "Syncing" : "Queued"}</span>
            </li>
          );
        })}
      </ul>
      <p className="cv-foot"><span>Rows</span><b>{ROWS[Math.min(step, 4)]}</b></p>
    </div>
  );
}

/* ── Analytics: a cursor walks the churn line to the latest month. ── */
const CHURN = [3.4, 3.3, 3.5, 3.2, 3.1, 2.7];
const X = (i: number) => 8 + i * 40;
const Y = (v: number) => 12 + (3.6 - v) * 70;
function Churn({ s }: { s: number }) {
  const at = Math.min(s % 8, 5); // walk 0→5, then hold for two ticks
  const pts = CHURN.map((v, k) => `${X(k)},${Y(v)}`).join(" ");
  return (
    <div className="cv-ui">
      <p className="cv-head"><span>Monthly churn</span><em className={at === 5 ? "is-done" : undefined}>{at === 5 ? "−0.4 pts" : "Cohorts"}</em></p>
      <div className="cv-chart">
        <svg viewBox="0 0 216 80" preserveAspectRatio="none">
          <polyline className="cv-line-base" points={pts} />
          <polyline className="cv-line-ink" points={pts} style={css({ "--p": at / 5 })} pathLength={1} />
        </svg>
        <span className="cv-cursor" style={css({ "--x": `${(X(at) / 216) * 100}%`, "--y": `${(Y(CHURN[at]) / 80) * 100}%` })}>
          <i />
          <b>{CHURN[at].toFixed(1)}%</b>
        </span>
      </div>
      <p className="cv-axis"><span>Apr</span><span>Sep</span></p>
    </div>
  );
}

/* ── BI and reporting: the period toggles and the bars redraw. ── */
const PERIODS = ["Week", "Month", "Quarter"];
const SERIES = [
  [42, 58, 50, 66, 61, 74, 88],
  [55, 48, 63, 70, 64, 82, 92],
  [38, 52, 61, 57, 72, 79, 96],
];
function Board({ s }: { s: number }) {
  const p = Math.floor(s / 2) % 3;
  return (
    <div className="cv-ui">
      <p className="cv-head"><span>Board pack</span></p>
      <div className="cv-seg" style={css({ "--p": p })}>
        <i className="cv-seg-pill" />
        {PERIODS.map((label, k) => <span key={label} className={k === p ? "is-on" : undefined}>{label}</span>)}
      </div>
      <div className="cv-bars">
        {SERIES[p].map((h, k) => <i key={k} className={k === 6 ? "is-hi" : undefined} style={css({ "--h": h / 100, "--i": k })} />)}
      </div>
      <p className="cv-foot"><span>Refreshed</span><b>06:00</b></p>
    </div>
  );
}

/* ── Data quality: tests run in order, then the count settles. ── */
const TESTS = ["Revenue ties to ledger", "No duplicate customers", "CRM matches billing"];
const PASSED = [0, 42, 84, 126];
function Tests({ s }: { s: number }) {
  const step = s % 5; // 0–2 running test n, 3–4 all passed
  const done = Math.min(step, 3);
  return (
    <div className="cv-ui">
      <p className="cv-head"><span>Tests</span><em className={done === 3 ? "is-done" : undefined}>{PASSED[done]} / 126</em></p>
      <ul className="cv-src cv-tests">
        {TESTS.map((t, i) => {
          const state = step > i ? "done" : step === i ? "run" : "wait";
          return (
            <li key={t} className={`is-${state}`}>
              <span className="cv-src-mark">{state === "done" ? <Check size={9} weight="bold" /> : null}</span>
              <span className="cv-src-name">{t}</span>
            </li>
          );
        })}
      </ul>
      <p className="cv-meter"><i style={css({ "--p": done / 3 })} /></p>
    </div>
  );
}

/* ── Automation: reports arrive on schedule and stack, newest on top. ── */
const SENT = [
  ["Board pack sent", "Mon · 06:00"],
  ["Weekly KPIs sent", "Mon · 06:02"],
  ["Cash report sent", "Mon · 06:04"],
  ["Pipeline review sent", "Mon · 06:05"],
  ["Churn alert cleared", "Mon · 06:07"],
];
function Sent({ s }: { s: number }) {
  return (
    <div className="cv-feed">
      {SENT.map(([title, meta], i) => {
        const slot = (((s - i) % SENT.length) + SENT.length) % SENT.length; // 0 newest
        return (
          <div key={title} className="cv-ui cv-note" data-slot={slot}>
            <span className="cv-note-icon"><PaperPlaneTilt size={14} weight="bold" /></span>
            <span className="cv-note-text"><b>{title}</b><small>{meta}</small></span>
          </div>
        );
      })}
    </div>
  );
}

const VIGNETTE = { engineering: Pipeline, analytics: Churn, bi: Board, quality: Tests, automation: Sent };
// Where each card starts in its loop, and the finished state for reduced motion.
const OFFSET = { engineering: 0, analytics: 2, bi: 1, quality: 3, automation: 0 };
const FINAL = { engineering: 4, analytics: 5, bi: 2, quality: 3, automation: 0 };

export function CapabilityRow({ items }: { items: Capability[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const [tick, setTick] = useState(0);
  const [reduce, setReduce] = useState(false);

  // One shared tick while the row is on screen.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    queueMicrotask(() => setReduce(still));
    if (still) return;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearInterval(timer);
      if (e.isIntersecting) timer = window.setInterval(() => setTick((t) => t + 1), TICK_MS);
    }, { threshold: 0.15 });
    io.observe(root);
    return () => { io.disconnect(); window.clearInterval(timer); };
  }, []);

  // A card turns dark when the mouse enters it (and back when it leaves).
  useEffect(() => {
    const root = ref.current;
    if (!root || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const cards = [...root.querySelectorAll<HTMLElement>(".cr-card")];
    const on = (e: PointerEvent) => { if (e.pointerType === "mouse") (e.currentTarget as HTMLElement).classList.add("is-lit"); };
    const off = (e: PointerEvent) => (e.currentTarget as HTMLElement).classList.remove("is-lit");
    cards.forEach((c) => { c.addEventListener("pointerenter", on); c.addEventListener("pointerleave", off); });
    return () => cards.forEach((c) => { c.removeEventListener("pointerenter", on); c.removeEventListener("pointerleave", off); });
  }, []);

  return (
    <ul className="cv" ref={ref} data-n={items.length} style={{ "--n": items.length } as React.CSSProperties}>
      {items.map((c) => {
        const V = VIGNETTE[c.kind];
        const [a, b] = c.title ?? TITLE[c.kind];
        return (
          <li key={c.kind} className="cr-card cv-card">
            <h3 className="cv-title"><span>{a}</span> <span>{b}</span></h3>
            <div className="cv-art" aria-hidden="true"><V s={reduce ? FINAL[c.kind] : tick + OFFSET[c.kind]} /></div>
            <p className="cv-line">{c.line}</p>
          </li>
        );
      })}
    </ul>
  );
}
