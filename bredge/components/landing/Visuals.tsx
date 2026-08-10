"use client";

import { useEffect, useRef } from "react";

const saasStats = [["MRR", "$428.6K", "+8.4%"], ["Activation", "42.7%", "+3.1 pts"], ["Gross retention", "91.8%", "+1.4 pts"], ["Expansion MRR", "$38.2K", "+11.6%"]];
const cfoStats = [["Closing cash", "$1.42m", "+$126k"], ["Cash runway", "14.8 mo", "+1.2 mo"], ["Overdue AR", "$86.2k", "12 accts"], ["Collections rate", "94.1%", "+2.6 pts"]];

function Badge() { return <p className="demo-badge">REFERENCE BUILD · SYNTHETIC DATA</p>; }

export function PipelineDemo() {
  const sources = ["Product API", "Billing", "CRM", "Support", "Finance.xlsx"];
  const records = [1842, 1731, 1809, 1795, 1764];
  return <div className="pipeline-demo" aria-label="Synthetic data pipeline reference build"><div className="pipeline-sources">{sources.map((source, index) => <div key={source} className={`pipeline-source source-${index}`}><i /><span>{source}</span><small data-count={records[index]}>{records[index].toLocaleString()} records</small></div>)}</div><div className="pipeline-core"><div className="pipeline-column"><span>INGESTION</span><b>Python<br />loaders</b></div><div className="pipeline-column warehouse"><span>WAREHOUSE</span><b>PostgreSQL</b><small>customer_model</small></div><div className="pipeline-column"><span>QUALITY</span><b>6 checks<br />passed</b></div></div><div className="pipeline-output"><p>SEMANTIC MODEL</p><b>One reliable view</b><span>Metrics defined · Exceptions traceable · Ready to decide</span></div><Badge /></div>;
}

function SaaSDashboard() { return <div className="dashboard saas-dashboard"><div className="dashboard-top"><div><small>REFERENCE BUILD · SYNTHETIC DATA</small><h3>Growth Overview</h3></div><span>Last 90 days ▾</span></div><div className="metric-row">{saasStats.map(([label, value, delta]) => <div key={label}><small>{label}</small><b>{value}</b><em>{delta}</em></div>)}</div><div className="dashboard-body"><div className="growth-chart"><div className="chart-title">Revenue momentum <span>+18.2%</span></div><div className="chart-grid" /><div className="chart-line chart-line-one" /><div className="chart-line chart-line-two" /><div className="chart-dot" /></div><div className="funnel"><small>CONVERSION FUNNEL</small>{[["Visited", "100"], ["Activated", "42.7"], ["Paid", "28.4"]].map(([label, value]) => <div key={label}><span>{label}</span><b>{value}%</b></div>)}</div></div><div className="dashboard-bottom"><div className="cohort"><small>COHORT RETENTION</small><div>{Array.from({ length: 35 }, (_, index) => <i key={index} style={{ opacity: Math.max(0.14, 0.9 - (index % 7) * 0.11 - Math.floor(index / 7) * 0.05) }} />)}</div></div><div className="risk-list"><small>CHURN RISK · NEEDS ATTENTION</small><p><b>Horizon Labs</b><span>High</span></p><p><b>Velocity HQ</b><span>Medium</span></p><p><b>Monument Co.</b><span>Medium</span></p></div></div></div>; }
function CFODashboard() { return <div className="dashboard cfo-dashboard"><div className="dashboard-top"><div><small>REFERENCE BUILD · SYNTHETIC DATA</small><h3>Cash &amp; Control</h3></div><span>Q3 forecast ▾</span></div><div className="metric-row">{cfoStats.map(([label, value, delta]) => <div key={label}><small>{label}</small><b>{value}</b><em>{delta}</em></div>)}</div><div className="dashboard-body"><div className="cash-chart"><div className="chart-title">Cash forecast <span>Next 13 weeks</span></div><div className="cash-bars">{[44, 56, 48, 62, 66, 58, 72, 64, 78, 84, 76, 88].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div></div><div className="action-list"><small>PRIORITY ACTIONS</small><p><i /> Follow up: 12 overdue invoices <b>Today</b></p><p><i /> Review July margin variance <b>Thu</b></p><p><i /> Approve forecast scenario <b>Fri</b></p></div></div><div className="aging"><small>RECEIVABLES AGING</small>{[["Current", "62%"], ["1-30 days", "21%"], ["31-60 days", "11%"], ["60+ days", "6%"]].map(([label, value]) => <p key={label}><span>{label}</span><i><b style={{ width: value }} /></i><strong>{value}</strong></p>)}</div></div>; }

/* Reference Work — ONE controlled scroll scene. A single sticky viewport
 * (.reference-sticky) owns the screen while the three cards transition inside it
 * (active rises, previous recedes). The enhancement is toggled by JS (.rw-enhanced)
 * only when the viewport can host it (width >= 1001 AND height >= 720 AND motion
 * allowed) — otherwise the cards fall back to natural vertical flow. Because there
 * is exactly ONE sticky element bounded by the stage height, it releases cleanly
 * before Invisible 90% pins: no competing scroll systems, no zoom overlap. */
export function ReferenceDashboards() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const cards = Array.from(stage.querySelectorAll<HTMLElement>(".reference-case"));
    if (!cards.length) return;
    const mq = window.matchMedia("(min-width: 1001px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)");
    let raf = 0;

    const setActive = (idx: number) => {
      cards.forEach((c, i) => {
        c.classList.toggle("is-active", i === idx);
        c.classList.toggle("is-prev", i < idx);
        c.classList.toggle("is-next", i > idx);
      });
    };
    const disable = () => {
      stage.classList.remove("rw-enhanced");
      cards.forEach((c) => c.classList.remove("is-active", "is-prev", "is-next"));
    };
    const update = () => {
      raf = 0;
      if (!mq.matches) { disable(); return; }
      stage.classList.add("rw-enhanced");
      const rect = stage.getBoundingClientRect();
      const scrollable = stage.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(scrollable, 1));
      const p = scrollable > 0 ? scrolled / scrollable : 0;
      setActive(Math.min(cards.length - 1, Math.max(0, Math.floor(p * cards.length))));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.visualViewport?.addEventListener("resize", onScroll);
    mq.addEventListener?.("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.visualViewport?.removeEventListener("resize", onScroll);
      mq.removeEventListener?.("change", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="reference-work" ref={stageRef}>
      <div className="reference-sticky">
        <article className="reference-case"><div className="case-copy"><Badge /><span>WORK 01</span><h3>SaaS Growth Command Centre</h3><p>A decision surface for activation, retention, expansion and churn, built around the questions product, growth and customer teams need answered every week.</p><small>Product analytics · Cohorts · Retention · Customer health · BI pattern</small><b>Full case study coming soon</b></div><SaaSDashboard /></article>
        <article className="reference-case cfo-case"><div className="case-copy"><Badge /><span>WORK 02</span><h3>CFO Control Room</h3><p>A finance view designed to answer the questions that matter: where cash is moving, who owes the business money and what needs action now.</p><small>Cash flow · AR / DSO · Profitability · Variance · Forecasting</small><b>Full case study coming soon</b></div><CFODashboard /></article>
        <article className="reference-case pipeline-case"><div className="case-copy"><Badge /><span>WORK 03</span><h3>From Five Systems to One Source of Truth</h3><p>The work most dashboards hide: resolving customer identity, reconciling totals, building the model and testing the numbers before they reach leadership.</p><small>Python · SQL · PostgreSQL · Reconciliation · Governance</small><b>Full case study coming soon</b></div><PipelineDemo /></article>
      </div>
    </div>
  );
}
