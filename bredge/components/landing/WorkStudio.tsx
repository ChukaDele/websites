"use client";
/* eslint-disable @next/next/no-img-element */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { BookOpenText, ChartLineUp, FileSql, Coins, Compass, Database, FlowArrow, MagnifyingGlass, PaperPlaneTilt, Plus, type Icon } from "@phosphor-icons/react";
import { lazyPreview, preloadPreviews } from "./lazyPreview";
import { ParticleField } from "./ParticleField";
import { DesktopLink } from "./DesktopLink";
import { usePhoneKpiFit } from "./PhoneFilters";

// Each build's live preview is its own chunk (see lazyPreview).
const PipelineRun = lazyPreview(() => import("./PipelineRun").then((m) => m.PipelineRun));
const CFOBoard = lazyPreview(() => import("./Dashboards").then((m) => m.CFOBoard));
const SaaSGrowthBoard = lazyPreview(() => import("./Dashboards").then((m) => m.SaaSGrowthBoard));
const ModelPreview = lazyPreview(() => import("./InvisibleQuery").then((m) => m.ModelPreview));

/**
 * "We can't show you a client's dashboard. So we built our own." (Second Direction)
 *
 * After the FormSpace reference: the reference builds shown inside an app
 * window on the dark stream backdrop. A sidebar lists the builds, grouped,
 * with a search that really filters them. The main pane has a title bar
 * (build name, a "Synthetic data" badge, the call button), the live build
 * itself.
 *
 * Walkthrough: on wide, tall-enough screens the window holds still while the
 * page scrolls through one stretch per build; within a stretch the main pane
 * glides through anything taller than the window. Clicking
 * a build jumps to its stretch. Elsewhere (phones, short screens, reduced
 * motion) it is click-only and the pane scrolls normally.
 */

export type Build = {
  id: string;
  group: string;
  name: string;
  icon: Icon;
  summary: string;
  answers: string;
  sources: string[];
  stack: string;
  // The tools this kind of build is delivered in: the client's own, not ours.
  tools: string[];
  Preview: React.ComponentType;
};

export const BUILDS: Build[] = [
  // CFO first: the build every segment engaged with (simulated visitor panel, 21 Oct 2026).
  {
    id: "cfo",
    group: "Dashboards",
    name: "CFO Dashboard",
    icon: Coins,
    summary: "Where the cash is, who owes you, and what needs chasing today.",
    answers: "How much cash do we have, how many months does it last at current burn, who owes us, and are we on budget?",
    sources: ["Bank feeds", "Billing", "Accounting"],
    stack: "Cash · Runway · Net and gross burn · DSO · DPO · Budget variance · 13-week forecast",
    tools: ["Power BI", "Tableau", "Excel", "Xero"],
    Preview: CFOBoard,
  },
  {
    id: "saas",
    group: "Dashboards",
    name: "SaaS Growth Dashboard",
    icon: ChartLineUp,
    summary: "Activation, retention and churn risk, in the form product and growth teams ask for it every Monday.",
    answers: "Is growth coming from new customers or the ones we keep (NRR, GRR), and how fast does sales spend pay back?",
    sources: ["Product events", "Billing", "CRM"],
    stack: "MRR movements · NRR · GRR · Quick ratio · CAC payback · Cohorts · ARR",
    tools: ["Power BI", "Tableau", "Looker", "Excel"],
    Preview: SaaSGrowthBoard,
  },
  {
    id: "pipeline",
    group: "Pipelines",
    name: "Customer 360 pipeline",
    icon: FlowArrow,
    summary: "8,941 records from five systems matched at 96.3%, exceptions held for review, every check tested before a chart sees it.",
    answers: "Five systems give five customer counts. Which one is right?",
    sources: ["Product API", "Billing", "CRM", "Support", "Finance.xlsx"],
    stack: "Python · SQL · PostgreSQL · Identity resolution · Match rate · Data tests · Lineage",
    tools: ["Python", "PostgreSQL", "Snowflake", "dbt"],
    Preview: PipelineRun,
  },
  {
    id: "model",
    group: "Pipelines",
    name: "Customer health model",
    icon: FileSql,
    summary: "The dashboard is the last 10%. Before a number reaches a chart it gets modelled, reconciled and tested. Here’s one being built, step by step: profile, resolve, reconcile, define, test, operate.",
    answers: "How healthy is each customer, month by month, and can we trust the number?",
    sources: ["Identity map", "Billing", "Product events"],
    stack: "SQL · PostgreSQL · Customer-month grain · Incremental build · Data tests",
    tools: ["PostgreSQL", "BigQuery", "Snowflake", "dbt"],
    Preview: ModelPreview,
  },
];

const GROUPS: string[] = ["Dashboards", "Pipelines"];

// The client's tools each build is delivered in, shown by their own marks.
export const TOOL_LOGOS: Record<string, { src: string; wordmark?: boolean }> = {
  "Power BI": { src: "/logos/tools/powerbi.svg" },
  Tableau: { src: "/logos/tools/tableau.png", wordmark: true },
  Looker: { src: "/logos/tools/looker.svg" },
  Excel: { src: "/logos/tools/excel.svg" },
  Xero: { src: "/logos/tools/xero.svg" },
  Python: { src: "/logos/tools/python.svg" },
  PostgreSQL: { src: "/logos/tools/postgresql.svg" },
  Snowflake: { src: "/logos/tools/snowflake.svg" },
  BigQuery: { src: "/logos/tools/bigquery.svg" },
  dbt: { src: "/logos/tools/dbt.svg", wordmark: true },
};


// Walkthrough only where the pinned window fits and motion is allowed.
const WALK_QUERY = "(min-width: 901px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)";
const FIT_QUERY = "(min-width: 901px) and (min-height: 600px)";
// Scroll length per build, as a share of the viewport height.
const PER_BUILD = 0.7;
// Where scrolling settles within the walkthrough (0–1): each build's dashboard.
const AT_DASHBOARD = 0.4;


/**
 * The builds window. On the homepage it walks through the reference builds as
 * the page scrolls; on the Work page it holds the full portfolio, grouped, and
 * switches by click (no pin).
 */
export function WorkStudio({ builds = BUILDS, groups = GROUPS, walkthrough = true, heading = ["We can’t show you a client’s dashboard.", "So we built our own."], intro = "Client work is under NDA. These are the same patterns on synthetic data, with the SQL and the tests left visible, so you can judge the thinking instead of the screenshot.", brand = "ReferenceBuilds", sectionId = "work", fit = false, titleAs: Title = "h2", accent = "client’s dashboard." }: {
  builds?: Build[]; groups?: string[]; walkthrough?: boolean; heading?: [string, string]; intro?: string; brand?: string; sectionId?: string;
  /** Fit the whole studio to one screen and scale each dashboard to the pane. */
  fit?: boolean; titleAs?: "h1" | "h2";
  /** Trailing phrase of heading[0] to highlight. */
  accent?: string;
}) {
  const [activeId, setActiveId] = useState(builds[0].id);
  // Deep link: /work?build=saas-analytics opens that build (articles and tools link this way).
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get("build");
    const hit = want && builds.find((b) => b.id === want || b.id === `home-${want}`);
    if (hit) queueMicrotask(() => setActiveId(hit.id));
  }, [builds]);
  const [query, setQuery] = useState("");
  const [walk, setWalk] = useState(false);
  const paneRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<{ start: number; end: number } | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Warm the other builds' chunks once the studio is close, so a click never waits.
  useEffect(() => {
    const win = windowRef.current;
    if (!win) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const warm = () => preloadPreviews(builds.map((b) => b.Preview));
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(warm, { timeout: 2500 });
      else window.setTimeout(warm, 1500);
    }, { rootMargin: "800px 0px" });
    io.observe(win);
    return () => io.disconnect();
  }, [builds]);

  // Scroll-driven walkthrough: pin the window; progress picks the build and
  // scrolls its pane from the dashboard down to the details.
  useEffect(() => {
    const win = windowRef.current;
    if (!win || !walkthrough) return;
    let disposed = false;
    let revert: (() => void) | undefined;
    (async () => {
      let mods;
      try { mods = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]); } catch { return; }
      if (disposed) return;
      const [{ default: gsap }, { ScrollTrigger }] = mods;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add(WALK_QUERY, () => {
        let last = -1;
        // The pane eases toward its target each frame, so wheel steps glide.
        let target = 0, raf = 0;
        const glide = () => {
          raf = 0;
          const pane = paneRef.current;
          if (!pane) return;
          const d = target - pane.scrollTop;
          if (Math.abs(d) < 0.5) { pane.scrollTop = target; return; }
          pane.scrollTop += d * 0.12;
          raf = requestAnimationFrame(glide);
        };
        // Size the window for the walkthrough before the pin measures it.
        const section = win.closest("section");
        section?.classList.add("is-walk");
        const st = ScrollTrigger.create({
          trigger: win,
          start: "top 8px", // the window fills the screen while it walks through the builds
          end: () => `+=${Math.round(window.innerHeight * PER_BUILD * builds.length)}`,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: -2,
          onUpdate: (self) => {
            const p = self.progress * builds.length;
            const idx = Math.min(builds.length - 1, Math.floor(p));
            const local = idx === builds.length - 1 && self.progress >= 1 ? 1 : p - idx;
            if (idx !== last) { last = idx; setActiveId(builds[idx].id); }
            // Hold on the dashboard while it plays in, then glide to the details.
            const pane = paneRef.current;
            if (pane) {
              const t = Math.min(1, Math.max(0, (local - 0.32) / 0.52));
              target = (t * t * (3 - 2 * t)) * (pane.scrollHeight - pane.clientHeight);
              if (!raf) raf = requestAnimationFrame(glide);
            }
          },
        });
        triggerRef.current = st;
        setWalk(true);
        return () => { cancelAnimationFrame(raf); triggerRef.current = null; section?.classList.remove("is-walk"); setWalk(false); };
      });
      revert = () => mm.revert();
      ScrollTrigger.refresh();
    })();
    return () => { disposed = true; revert?.(); };
  }, [walkthrough, builds]);

  // Fit mode: scale the selected dashboard down (never up) so it sits in the
  // pane without scrolling. Below 66% it would be unreadable, so it scrolls instead.
  useEffect(() => {
    const pane = paneRef.current;
    const card = pane?.firstElementChild;
    if (!fit || !pane || !card) return;
    const setZoom = (v: string) => card.setAttribute("style", `--i:0;${v ? `zoom:${v}` : ""}`);
    const mq = window.matchMedia(FIT_QUERY);
    let z = 1, raf = 0;
    const measure = () => {
      raf = 0;
      if (!mq.matches) { if (z !== 1) { z = 1; setZoom(""); } return; }
      const natural = card.getBoundingClientRect().height / z;
      const next = Math.max(0.66, Math.min(1, (pane.clientHeight - 2) / natural));
      if (Math.abs(next - z) < 0.005) return;
      z = next;
      setZoom(z === 1 ? "" : z.toFixed(3));
    };
    const queue = () => { if (!raf) raf = window.setTimeout(measure, 0) as unknown as number; };
    const ro = new ResizeObserver(queue);
    ro.observe(pane); ro.observe(card);
    mq.addEventListener("change", queue);
    measure();
    return () => { clearTimeout(raf); ro.disconnect(); mq.removeEventListener("change", queue); setZoom(""); };
  }, [fit, activeId]);

  // In the walkthrough, picking a build scrolls the page to its stretch.
  // Clicking responds at once: the build switches immediately and the page
  // moves to that build's dashboard stop, so scrolling carries on from there.
  const pick = (id: string) => {
    setActiveId(id);
    const st = triggerRef.current;
    const i = builds.findIndex((b) => b.id === id);
    if (!st || i < 0) return;
    const y = st.start + (st.end - st.start) * ((i + AT_DASHBOARD) / builds.length);
    window.scrollTo({ top: Math.round(y), behavior: "auto" });
  };
  const build = builds.find((b) => b.id === activeId) ?? builds[0];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return builds;
    return builds.filter((b) => `${b.name} ${b.stack} ${b.sources.join(" ")}`.toLowerCase().includes(q));
  }, [query, builds]);

  usePhoneKpiFit(previewRef, build.id);
  const Preview = build.Preview;
  const Glyph = build.icon;

  return (
    <section id={sectionId} className={`ws${walk ? " is-walk" : ""}${walkthrough ? "" : " is-gallery"}${fit ? " is-fit" : ""}`} aria-labelledby={`${sectionId}-title`}>
      {/* The hero's data-line stream, flowing behind the window and off the screen. */}
      <ParticleField className="ws-stream" stream />
      <div className="ws-wrap">
        <header className="ws-intro">
          <Title id={`${sectionId}-title`}>
            {/* "client’s dashboard." takes the muted tone; the rest stays white. */}
            <span>{accent && heading[0].endsWith(accent) ? <>{heading[0].slice(0, -accent.length)}<em className="ws-accent">{accent}</em></> : heading[0]}</span> <span>{heading[1]}</span>
          </Title>
          <p>{intro}</p>
        </header>

        <div className="ws-window" ref={windowRef}>
          {/* Sidebar: the builds */}
          <aside className="ws-side" aria-label="Reference builds">
            <div className="ws-brand">
              <Database size={18} weight="bold" aria-hidden="true" />
              <span>{brand}</span>
            </div>

            <label className="ws-search">
              <MagnifyingGlass size={15} aria-hidden="true" />
              <span className="sr-only">Search the builds</span>
              <input type="search" placeholder="Search builds" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>

            <nav className="ws-groups">
              {groups.map((g) => {
                const items = visible.filter((b) => b.group === g);
                if (!items.length) return null;
                return (
                  <div className="ws-group" key={g}>
                    <p className="ws-group-label">{g}</p>
                    <ul>
                      {items.map((b) => {
                        const I = b.icon;
                        const on = b.id === build.id;
                        return (
                          <li key={b.id}>
                            <button type="button" className={`ws-item${on ? " is-on" : ""}`} aria-pressed={on} onClick={() => pick(b.id)}>
                              <I size={16} weight={on ? "fill" : "regular"} aria-hidden="true" />
                              <span>{b.name}</span>
                              <Plus className="ws-item-plus" size={13} aria-hidden="true" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
              {!visible.length && <p className="ws-empty">No build matches “{query}”. Try “cash” or “SQL”.</p>}
            </nav>

            <ul className="ws-links">
              <li><a href="/how-we-work"><Compass size={16} aria-hidden="true" />How we work</a></li>
              <li><a href="/insights"><BookOpenText size={16} aria-hidden="true" />Insights</a></li>
            </ul>
            <div className="ws-side-foot">
              <span className="ws-avatar" aria-hidden="true">b</span>
              <p><b>The Bredge</b><a href="mailto:hello@thebredge.com">hello@thebredge.com</a></p>
            </div>
          </aside>

          {/* Main pane: the selected build */}
          <div className="ws-main">
            <div className="ws-bar">
              <div className="ws-title">
                <span className="ws-title-icon" aria-hidden="true"><Glyph size={16} weight="bold" /></span>
                <h3 key={build.id}>{build.name}</h3>
                <span className="ws-badge">Synthetic data</span>
              </div>
              <div className="ws-actions">
                <a className="ws-cta" href="/schedule"><PaperPlaneTilt size={15} weight="fill" aria-hidden="true" />Walk through it on a call</a>
              </div>
            </div>

            <div className="ws-pane" key={build.id} ref={paneRef}>
              <section id="ws-preview" className="ws-card ws-rise" style={{ "--i": 0 } as React.CSSProperties} aria-label="Preview">
                <div className="ws-card-head">
                  <p className="ws-ask"><span>Answers</span>{build.answers}</p>
                  <ul className="ws-tools" aria-label={`${build.group === "Dashboards" ? "Works in" : "Runs on"}: ${build.tools.join(", ")}`}>
                    {build.tools.map((t) => {
                      const logo = TOOL_LOGOS[t];
                      return (
                        <li key={t} className={logo.wordmark ? "is-wordmark" : undefined}>
                          <img src={logo.src} alt="" width={logo.wordmark ? 80 : 16} height={16} />
                          {!logo.wordmark && <span>{t}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="ws-preview" ref={previewRef}><Suspense fallback={null}><Preview /></Suspense><DesktopLink build={build.id} /></div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
