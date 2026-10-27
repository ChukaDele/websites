"use client";

import { whenMedia } from "../site/motion-gate";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, Check, ChartLineUp, Coins, Cube, FlowArrow, UserCircle, type Icon } from "@phosphor-icons/react";

/**
 * "The questions each team actually asks." (Second Direction)
 *
 * After the Calendly "suite" reference, sitting straight on the page
 * background: a vertical rail of team tabs; the active tab is joined to
 * a tinted panel that holds a line about that team, the call button, and the
 * areas we report on. On the right, the team's three questions as a stack.
 *
 * Scroll drives it. The section holds still (pinned) while the page scrolls
 * through four stretches, one per team: Finance, Product, Revenue,
 * Operations. Within each stretch the three questions tick off one by one,
 * "Reconciling sources" turning into "One reconciled source", so scrolling is
 * what reconciles them. Scrolling back reverses it. Clicking a tab scrolls to
 * that team's stretch.
 *
 * The questions follow the widget-carousel reference: one question open in
 * the middle, the next as a pill below, the previous as a pill above, so the
 * stack moves the same way as the page. Each step the pill below rises and
 * opens, and the open card closes into the pill above. Inside the open card, three systems give three different
 * answers; when it resolves, that question's own answer comes into focus
 * (balances, aging, a funnel, a variance, a watchlist) with a one-line result.
 *
 * Motion, each with a job:
 *  - The carousel steps with scroll (spatial: where each question goes).
 *  - A card resolving: pending fades out, the tick pops in (transitions, so
 *    reversing on scroll back is smooth).
 *  - Tab change: highlight slides, tint eases, copy and cards deal in.
 * Small screens, short screens and reduced motion: no pin; tabs are clicked,
 * and the ticks land on a short timer (instantly under reduced motion).
 */

// q: the question. who: the person who asks it. why: what the answer covers.
// viz: the answer itself, in the form that question needs (each card differs).
// from: the systems reconciled to get it. answer: the one-line result.
type Row = [label: string, value: number, shown: string];
type Viz =
  | { kind: "bars"; rows: Row[]; max?: number }
  | { kind: "funnel"; rows: Row[] }
  | { kind: "diverge"; rows: Row[] }
  | { kind: "list"; rows: Array<[label: string, status: "risk" | "watch" | "ok", shown: string]> };
type Question = { q: string; who: string; why: string; viz: Viz; from: string; answer: string };
type Team = { name: string; icon: Icon; questions: Question[]; details: string; tint: string; accent: string };

// tint: the panel colour. accent: a deeper shade of it for the label and ticks.
// Figures are synthetic and match the reference dashboards further down.
const TEAMS: Team[] = [
  { name: "Finance", icon: Coins, questions: [
    { q: "Where is our cash?", who: "CFO", why: "Bank, billing and accounting balances, matched every morning.",
      viz: { kind: "bars", rows: [["Operating", 812, "£812k"], ["Payroll", 296, "£296k"], ["Reserve", 242, "£242k"], ["Payments float", 70, "£70k"]] },
      from: "Matching bank, billing and ledger", answer: "£1.42m across 4 accounts, matched at 07:00" },
    { q: "Who owes us?", who: "Finance lead", why: "Overdue invoices by customer and age, from one ledger.",
      viz: { kind: "bars", rows: [["Current", 140.6, "£140.6k"], ["1-30 days", 47.6, "£47.6k"], ["31-60 days", 24.9, "£24.9k"], ["60+ days", 13.6, "£13.6k"]] },
      from: "Matching billing and the ledger", answer: "£86.2k overdue, 3 invoices to chase today" },
    { q: "What moved against plan?", who: "FP&A", why: "Actuals against budget, with each variance explained.",
      viz: { kind: "diverge", rows: [["Revenue", 0.6, "+0.6%"], ["Gross margin", -0.4, "-0.4%"], ["Operating costs", -1.1, "-1.1%"], ["EBITDA", -4.9, "-4.9%"]] },
      from: "Matching actuals to the budget model", answer: "Costs ran 1.1% over; each variance has a reason" },
  ], details: "Cash flow · Receivables · Profitability · Forecasting · Budget control", tint: "#d3ebc4", accent: "#3c6a2c" },
  { name: "Product", icon: Cube, questions: [
    { q: "What drives activation?", who: "Head of Product", why: "The first-week actions that predict a customer stays.",
      viz: { kind: "funnel", rows: [["Signed up", 100, "100%"], ["Connected data", 71, "71%"], ["Invited a teammate", 52, "52%"], ["Activated", 42.7, "42.7%"]] },
      from: "Joining product events to accounts", answer: "Inviting a teammate is the step that predicts staying" },
    { q: "Who might churn?", who: "Customer success", why: "Accounts with falling usage, flagged before renewal.",
      viz: { kind: "list", rows: [["Horizon Labs", "risk", "Usage down 38%"], ["Velocity HQ", "watch", "Champion left"], ["Monument Co.", "watch", "Renews in 21 days"], ["Atlas Freight", "ok", "Usage up 12%"]] },
      from: "Joining usage, billing and CRM", answer: "3 accounts flagged weeks before renewal" },
    { q: "Where can we expand?", who: "Growth", why: "Accounts hitting plan limits or adding seats.",
      viz: { kind: "bars", max: 100, rows: [["Northwind Labs", 96, "96% of seats"], ["Atlas Freight", 91, "91% of seats"], ["Juniper Health", 84, "84% of seats"], ["Velocity HQ", 62, "62% of seats"]] },
      from: "Joining seats, usage and plan", answer: "2 accounts at their plan limit, ready to talk" },
  ], details: "Funnels · Cohorts · Retention · Feature adoption · Customer health", tint: "#f0e9b6", accent: "#6f5f0e" },
  { name: "Revenue", icon: ChartLineUp, questions: [
    { q: "Where is pipeline leaking?", who: "CRO", why: "Stage-to-stage conversion, by segment and source.",
      viz: { kind: "funnel", rows: [["Lead", 100, "100%"], ["Qualified", 46, "46%"], ["Demo", 31, "31%"], ["Won", 9, "9%"]] },
      from: "Matching CRM stages to billing", answer: "Biggest leak: lead to qualified, 54% lost" },
    { q: "Which accounts are growing?", who: "Account management", why: "Net revenue change per account, month on month.",
      viz: { kind: "diverge", rows: [["Atlas Freight", 2.1, "+£2.1k"], ["Northwind Labs", 1.6, "+£1.6k"], ["Juniper Health", 0.4, "+£0.4k"], ["Horizon Labs", -0.9, "-£0.9k"]] },
      from: "Matching invoices to accounts", answer: "3 accounts growing, 1 shrinking this month" },
    { q: "What actually converts?", who: "Marketing", why: "Channels traced from first touch to paid.",
      viz: { kind: "bars", rows: [["Referral", 14.2, "14.2%"], ["Webinar", 8.6, "8.6%"], ["Search", 5.1, "5.1%"], ["Paid social", 1.8, "1.8%"]] },
      from: "Tracing first touch through to paid", answer: "Referrals convert 8 times better than paid social" },
  ], details: "Funnel performance · Segmentation · Attribution · Forecasting · Customer economics", tint: "#f6d8bc", accent: "#97501d" },
  { name: "Operations", icon: FlowArrow, questions: [
    { q: "Where are the bottlenecks?", who: "COO", why: "Queue times at every step, worst first.",
      viz: { kind: "bars", rows: [["Approval", 18, "18 h"], ["Quality check", 9, "9 h"], ["Picking", 4, "4 h"], ["Dispatch", 2, "2 h"]] },
      from: "Joining timestamps across systems", answer: "Approval holds work for 18 hours on average" },
    { q: "What is off-SLA?", who: "Support lead", why: "Tickets and orders past target, as they happen.",
      viz: { kind: "list", rows: [["Orders past target", "risk", "12"], ["Tickets over 24 hours", "watch", "7"], ["Refunds over 5 days", "watch", "3"], ["Returns over 7 days", "ok", "0"]] },
      from: "Watching orders, tickets and refunds", answer: "22 items past target, owners already told" },
    { q: "What should we fix first?", who: "Ops lead", why: "Issues ranked by what they cost the business.",
      viz: { kind: "bars", rows: [["Late shipments", 18.4, "£18.4k / mo"], ["Manual re-keying", 9.7, "£9.7k / mo"], ["Refund delays", 4.2, "£4.2k / mo"], ["Stock-outs", 3.1, "£3.1k / mo"]] },
      from: "Costing each issue from finance data", answer: "Fixing late shipments saves £18.4k a month" },
  ], details: "Process performance · Capacity · SLA monitoring · Exception management", tint: "#cde6dc", accent: "#2d6656" },
];

/** The answer to one question, drawn the way that question needs. */
function Answer({ viz }: { viz: Viz }) {
  if (viz.kind === "list") {
    return (
      <ul className="ts-a ts-a-list">
        {viz.rows.map(([label, status, shown], k) => (
          <li key={label} style={{ "--k": k } as React.CSSProperties}><span>{label}</span><em className={`is-${status}`}>{status === "risk" ? "At risk" : status === "watch" ? "Watch" : "OK"}</em><b>{shown}</b></li>
        ))}
      </ul>
    );
  }
  const top = viz.kind === "diverge" ? Math.max(...viz.rows.map(([, v]) => Math.abs(v))) : (viz.kind === "bars" && viz.max) || Math.max(...viz.rows.map(([, v]) => v));
  return (
    <ul className={`ts-a ts-a-${viz.kind}`}>
      {viz.rows.map(([label, v, shown], k) => (
        <li key={label} className={v < 0 ? "is-neg" : undefined} style={{ "--w": Math.abs(v) / top, "--k": k } as React.CSSProperties}>
          <span>{label}</span><span className="ts-a-track"><i /></span><b>{shown}</b>
        </li>
      ))}
    </ul>
  );
}

// Six steps per team: each question arrives (even step), then resolves (odd).
const STEPS = 6;
// Scroll length per team, as a share of the viewport height. Short now that
// scroll only switches the team (the questions play on their own clock).
const PER_TEAM = 0.4;
// Pin only where it fits: wide and tall enough, motion allowed.
const PIN_QUERY = "(min-width: 901px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)";


export function TeamSuite() {
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(0);
  const [entered, setEntered] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const triggerRef = useRef<{ start: number; end: number } | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setEntered(true); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(root);
    return () => io.disconnect();
  }, []);

  // Scroll-driven: pin the shell and map progress to the team only. The
  // question cards play on their own clock (below).
  useEffect(() => {
    const root = rootRef.current;
    const shell = shellRef.current;
    if (!root || !shell) return;
    let disposed = false;
    let revert: (() => void) | undefined;
    const run = async () => {
      let mods;
      try { mods = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]); } catch { return; }
      if (disposed) return;
      const [{ default: gsap }, { ScrollTrigger }] = mods;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add(PIN_QUERY, () => {
        let lastTeam = -1;
        const st = ScrollTrigger.create({
          trigger: shell,
          // Centre it when it fits under the nav; otherwise hold it just below the nav.
          start: () => (shell.offsetHeight + 160 < window.innerHeight ? "center center" : "top 88px"),
          end: () => `+=${Math.round(window.innerHeight * PER_TEAM * TEAMS.length)}`,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: -1,
          onUpdate: (self) => {
            const p = self.progress * TEAMS.length;
            const team = Math.min(TEAMS.length - 1, Math.floor(p));
            if (team !== lastTeam) { lastTeam = team; setActive(team); }
          },
        });
        triggerRef.current = st;
        return () => { triggerRef.current = null; };
      });
      revert = () => mm.revert();
      ScrollTrigger.refresh();
    };
    const stop = whenMedia(PIN_QUERY, () => { void run(); });
    return () => { disposed = true; stop(); revert?.(); };
  }, []);

  // The question cards run as a time-lapse on their own: each question shows
  // its "joining…" state, then its answer, then the next card slides up; after
  // the last answer it starts again. Restarts when the team changes, pauses
  // while the section is off screen, and shows the final state for reduced motion.
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 });
    io.observe(root);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { queueMicrotask(() => setStep(STEPS - 1)); return; }
    const ASKING = 650, ANSWERED = 1500;
    let n = 0, timer = 0;
    queueMicrotask(() => setStep(0));
    const tick = () => {
      n = (n + 1) % STEPS;
      setStep(n);
      timer = window.setTimeout(tick, n % 2 === 1 ? ANSWERED : ASKING);
    };
    timer = window.setTimeout(tick, ASKING);
    return () => window.clearTimeout(timer);
  }, [active, inView]);

  const go = (i: number) => {
    const st = triggerRef.current;
    if (!st) { setActive(i); return; }
    // Land just inside that team's stretch; its questions start playing.
    const y = st.start + (st.end - st.start) * ((i + 0.04) / TEAMS.length);
    window.scrollTo({ top: Math.ceil(y), behavior: "smooth" });
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (active + step + TEAMS.length) % TEAMS.length;
    go(next);
    tabRefs.current[next]?.focus();
  };

  const team = TEAMS[active];
  const lower = team.name === "Operations" ? "ops" : team.name.toLowerCase();

  return (
    <section ref={rootRef} className={`ts${entered ? " is-in" : ""}`} aria-labelledby="ts-title" style={{ "--tint": team.tint, "--accent": team.accent, "--n": active } as React.CSSProperties}>
      <div className="ts-shell" ref={shellRef}>
        <div className="ts-card">
          <h2 id="ts-title" className="ts-h2">The questions each team actually asks.</h2>

          <div className="ts-body">
            <div className="ts-rail" role="tablist" aria-label="Teams" aria-orientation="vertical">
              <span className={`ts-indicator${active === 0 ? " is-first" : ""}`} aria-hidden="true" />
              {TEAMS.map((t, i) => {
                const Glyph = t.icon;
                return (
                  <button
                    key={t.name}
                    ref={(el) => { tabRefs.current[i] = el; }}
                    type="button"
                    role="tab"
                    id={`ts-tab-${i}`}
                    aria-selected={i === active}
                    aria-controls="ts-panel"
                    tabIndex={i === active ? 0 : -1}
                    className={`ts-tab${i === active ? " is-active" : ""}`}
                    onClick={() => go(i)}
                    onKeyDown={onKey}
                  >
                    <Glyph size={26} weight={i === active ? "fill" : "regular"} aria-hidden="true" />
                    <span className="ts-tab-label">{t.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="ts-panel" id="ts-panel" role="tabpanel" aria-labelledby={`ts-tab-${active}`}>
              <div className="ts-copy" key={team.name}>
                <p className="ts-label ts-in" style={{ "--i": 0 } as React.CSSProperties}>{team.name}</p>
                <h3 className="ts-in" style={{ "--i": 1 } as React.CSSProperties}>What {lower} asks every week, answered.</h3>
                <p className="ts-sub ts-in" style={{ "--i": 2 } as React.CSSProperties}>Built from one reconciled source, so {lower} sees the same number as everyone else.</p>
                <div className="ts-foot ts-in" style={{ "--i": 3 } as React.CSSProperties}>
                  <a className="ts-button" href="/schedule">Book a 30-minute call <ArrowRight size={16} weight="bold" aria-hidden="true" /></a>
                  <div className="ts-areas">
                    <p className="ts-areas-label">What we report on</p>
                    <ul className="ts-chips">
                      {team.details.split(" · ").map((d, k) => <li key={d} style={{ "--k": k } as React.CSSProperties}><Check size={12} weight="bold" aria-hidden="true" />{d}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Vertical widget carousel: previous question as a pill above, the
                  current one open in the middle, the next one as a pill below. */}
              <ol className="ts-stack" key={`${team.name}-stack`} aria-label={`${team.name} questions`}>
                {team.questions.map(({ q, who, why, viz, from, answer }, i) => {
                  const cur = Math.floor(step / 2);
                  const resolved = i < cur || (i === cur && step % 2 === 1);
                  const pos = i - cur; // 1 = next (below), 0 = open, -1 = previous (above)
                  const Glyph = team.icon;
                  return (
                    <li
                      key={q}
                      className={`ts-w${resolved ? " is-done" : ""}`}
                      data-pos={pos > 1 ? "far-next" : pos < -1 ? "far-prev" : pos === 1 ? "next" : pos === -1 ? "prev" : "open"}
                      aria-current={pos === 0 ? "step" : undefined}
                    >
                      <div className="ts-w-head">
                        <span className="ts-w-icon" aria-hidden="true"><Glyph size={14} weight="bold" /></span>
                        <b>{q}</b>
                        {resolved && pos !== 0
                          ? <span className="ts-w-tag"><Check size={11} weight="bold" aria-hidden="true" /> Answered</span>
                          : <span className="ts-w-who"><UserCircle size={18} weight="duotone" aria-hidden="true" /><span><small>Asked by</small>{who}</span></span>}
                      </div>
                      <div className="ts-w-body" aria-hidden={pos !== 0}>
                        <p className="ts-w-why">{why}</p>
                        <Answer viz={viz} />
                        <p className="ts-w-status">
                          <span className="ts-pending"><i /><i /><i />{from}</span>
                          <span className="ts-done"><Check size={12} weight="bold" aria-hidden="true" />{answer}</span>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
