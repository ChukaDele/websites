"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, ChartLineUp, CurrencyDollar, Funnel, Lightning, Megaphone, Target, Warning, type Icon } from "@phosphor-icons/react";
import { useInView, Count, Delta, Chip, Slicer, Topbar, useAlerts, useToast, Bars, type BarDatum, FilterChip, type About } from "../landing/Dashboards";
import { marketingMeta } from "./meta";
import { FilterBar } from "../landing/PhoneFilters";

/**
 * IQ Marketing Performance, rebuilt from a four-page Power BI report:
 * Overview, Funnel, Channels and Audience. Printed totals are used as given.
 * The monthly trend and the engagement scatter were read off the original
 * charts by eye, so they only set the shape and are labelled "about".
 * Synthetic data, 12 months (January to December, year not stated).
 */

// Defined in ./meta so the Work page can list this board without loading it.
export { marketingMeta };

const ABOUT: About = {
  question: "Which channels, campaign types and audiences earn back their marketing spend, and where does the funnel leak?",
  built: [
    "One revenue and spend definition across 55,555 campaigns",
    "The funnel from impression to conversion, step by step",
    "ROI and acquisition cost for every channel, campaign type and audience",
    "A watch list of campaigns that spend more than they return",
  ],
  defs: [
    ["Attribution", "Single-touch: each campaign's revenue is credited to its own channel and campaign type, as recorded in the source. No multi-touch or view-through credit, so channels that assist early in the journey are understated."],
    ["Spend (acquisition cost)", "Total campaign spend: media plus agency and production. The source does not split them."],
    ["ROI", "(Revenue - spend) / spend. 195.45% means each $1 of spend returned $2.95 of revenue. Revenue, not profit, so this is before cost of goods."],
    ["ROAS", "Revenue / spend, shown as revenue per $1 spent. ROAS = 1 + ROI."],
    ["CAC", "Spend / conversions. The source does not separate new from repeat customers, so this is cost per conversion rather than strict new-customer CAC."],
    ["Funnel stages", "Impression: ad shown. Click: ad clicked (CTR = clicks / impressions). Lead: a form or sign-up after the click. Conversion: a purchase. Each step rate is on the step before. No MQL/SQL split in this data."],
    ["Unprofitable campaign", "A campaign whose revenue is below its spend (ROI below 0%)."],
    ["Periods", "January to December of one year (the year is not stated in the source). Month-on-month changes compare December with November."],
  ],
  sources: "Synthetic data in USD, 12 months. Totals are as printed in the source; the monthly trend and engagement chart are read from it and approximate.",
};

/* ───────── data (printed values unless marked "shape only") ───────── */

const TOTAL = { campaigns: 55555, revenue: 28_656_364_282, roi: 195.45, cac: 169.03, cost: 9_699_124_862 };
// Printed figures with no row-level data behind them in the export.
const TOP_CHANNEL = { name: "Instagram", roi: 198.02 };
const UNPROFITABLE_SHARE = 23.8; // % of campaigns with ROI below 0%
const WORST_ROI = -97; // single worst campaign, printed rounded to a whole %

type CampaignType = { name: string; campaigns: number; revenue: number; roi: number; cac: number; itc: number; ctl: number; ltc: number };
const TYPES: CampaignType[] = [
  { name: "Social Media", campaigns: 11114, revenue: 5_751_837_620, roi: 197.21, cac: 166.89, itc: 8.54, ctl: 40.13, ltc: 55.02 },
  { name: "Influencer", campaigns: 11134, revenue: 5_769_064_044, roi: 194.93, cac: 169.15, itc: 8.55, ctl: 39.95, ltc: 55.19 },
  { name: "SEO", campaigns: 11079, revenue: 5_698_831_847, roi: 196.08, cac: 169.29, itc: 8.46, ctl: 40.23, ltc: 54.76 },
  { name: "Email", campaigns: 11112, revenue: 5_685_161_788, roi: 193.22, cac: 169.70, itc: 8.49, ctl: 40.11, ltc: 55.14 },
  { name: "Paid Ads", campaigns: 11116, revenue: 5_751_468_983, roi: 195.84, cac: 170.16, itc: 8.51, ctl: 39.81, ltc: 54.99 },
];
const TYPE_OPTS = ["All", ...TYPES.map((t) => t.name)] as const;

type Channel = { name: string; revenue: number; cac: number; ctr: number; conv: number };
const CHANNELS: Channel[] = [
  { name: "Instagram", revenue: 4.85e9, cac: 167.03, ctr: 8.54, conv: 55.19 },
  { name: "YouTube", revenue: 4.82e9, cac: 169.26, ctr: 8.50, conv: 55.06 },
  { name: "Google", revenue: 4.79e9, cac: 170.65, ctr: 8.55, conv: 54.85 },
  { name: "WhatsApp", revenue: 4.77e9, cac: 170.23, ctr: 8.47, conv: 54.84 },
  { name: "Email", revenue: 4.73e9, cac: 167.98, ctr: 8.50, conv: 55.13 },
  { name: "Facebook", revenue: 4.69e9, cac: 169.07, ctr: 8.50, conv: 55.04 },
];

type Audience = { name: string; roi: number; revenue: number; cost: number };
const AUDIENCES: Audience[] = [
  { name: "Premium Shoppers", roi: 200.55, revenue: 5_852_284_945, cost: 1_947_169_437 },
  { name: "College Students", roi: 198.19, revenue: 5_786_247_365, cost: 1_940_483_193 },
  { name: "Tier 2 City Customers", roi: 193.32, revenue: 5_701_063_841, cost: 1_943_605_053 },
  { name: "Working Women", roi: 192.90, revenue: 5_743_709_729, cost: 1_960_966_058 },
  { name: "Youth", roi: 192.26, revenue: 5_573_058_402, cost: 1_906_901_121 },
];

// [campaign, spend, revenue]
const PROFITABLE: Array<[string, number, number]> = [
  ["NY-CMP-9726", 101863, 2054229], ["NY-CMP-9620", 67093, 1179090], ["NY-CMP-9605", 59718, 869288],
  ["NY-CMP-9462", 55851, 1987160], ["NY-CMP-9592", 51895, 1736300],
];
const UNPROFITABLE: Array<[string, number, number]> = [
  ["NY-CMP-24680", 293456, 13005], ["NY-CMP-11980", 271759, 12062], ["NY-CMP-55748", 238478, 9972],
  ["NY-CMP-53545", 253685, 9386], ["NY-CMP-16583", 248473, 8920], ["NY-CMP-36224", 239983, 8800],
  ["NY-CMP-14988", 223015, 8732], ["NY-CMP-41110", 209379, 7945], ["NY-CMP-9361", 229995, 7584],
  ["NY-CMP-24406", 183750, 6183],
];

// Shape only: monthly revenue ($bn) and ROI (%), read off the original chart.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const REV_SHAPE = [2.45, 2.55, 2.5, 2.4, 2.55, 0.95, 2.6, 2.55, 2.45, 2.4, 2.52, 2.5];
const ROI_SHAPE = [192, 198.5, 197, 189, 197, 188, 201.5, 197.5, 194.5, 190, 198, 197.9];
const REV_SCALE = TOTAL.revenue / 1e9 / REV_SHAPE.reduce((a, b) => a + b, 0);
const ROI_LO = 184, ROI_HI = 204;

// Shape only: ROI by engagement score bin (0 to 30). The types share one curve until the top bin.
const BINS = [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30];
const CURVE = [0, 0, 50, 100, 150, 200, 300, 400, 550, 750];
const TOP_BIN: Record<string, number> = { Email: 2700, "Paid Ads": 2450, "Social Media": 1100, SEO: 950, Influencer: 850 };
const TYPE_COLOR: Record<string, string> = { Email: "#4b0055", "Paid Ads": "#1f3a2c", "Social Media": "#90d26f", SEO: "#e8c53a", Influencer: "#b9a6d6" };

/* ───────── formatting ───────── */

const bn = (n: number, d = 3) => `$${(n / 1e9).toFixed(d)}bn`;
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const pct2 = (n: number) => `${n.toFixed(2)}%`;
const int = (n: number) => Math.round(n).toLocaleString("en-US");
const roiOf = (spend: number, revenue: number) => (revenue - spend) / spend * 100;
const about = (n: number, step: number) => (Math.round(n / step) * step).toLocaleString("en-US");

type Kpi = { label: string; sub: string; icon: Icon; to: number; f: (n: number) => string; note?: string; delta?: { v: string; down: boolean; note: string; dir?: "up" | "down" } };
const roas = (revenue: number, spend: number) => (spend > 0 ? revenue / spend : 0);

const PAGES = ["Overview", "Funnel", "Channels", "Audience"] as const;

export function MarketingBoard() {
  const [ref, on] = useInView<HTMLDivElement>();
  const [tab, setTab] = useState<string>("Overview");
  const [type, setType] = useState<string>("All");
  const [month, setMonth] = useState<number | null>(null);
  const [stage, setStage] = useState(1);
  const [channel, setChannel] = useState<number | null>(null);
  const [chanMetric, setChanMetric] = useState<"CTR" | "Lead to conversion">("CTR");
  const [revMetric, setRevMetric] = useState<"Revenue" | "CAC">("Revenue");
  const [camps, setCamps] = useState<"Profitable" | "Unprofitable">("Unprofitable");
  const [campSort, setCampSort] = useState<"Spend" | "ROI">("Spend");
  const [campPage, setCampPage] = useState(0);
  const [aud, setAud] = useState<number | null>(null);
  const [hoverPt, setHoverPt] = useState<{ t: string; i: number } | null>(null);
  const [toast, say] = useToast();
  const [alerts, read] = useAlerts([
    { id: "m1", title: "23.80% of campaigns returned less than they cost", when: "Today, 08:30" },
    { id: "m2", title: "NY-CMP-24680 spent $293,456 and returned $13,005", when: "Yesterday" },
    { id: "m3", title: "December revenue 0.65% below November", when: "This week" },
  ]);

  const t = TYPES.find((x) => x.name === type) ?? null;
  const bestType = TYPES.reduce((b, x) => (x.roi > b.roi ? x : b), TYPES[0]);
  const cheapest = CHANNELS.reduce((b, x) => (x.cac < b.cac ? x : b), CHANNELS[0]);
  const dearest = CHANNELS.reduce((b, x) => (x.cac > b.cac ? x : b), CHANNELS[0]);
  const bestConv = CHANNELS.reduce((b, x) => (x.conv > b.conv ? x : b), CHANNELS[0]);

  /* Overview KPIs: all campaigns (December vs November) or one campaign type (vs all). */
  const kpis: Kpi[] = t === null ? [
    { label: "Campaigns", sub: "Jan-Dec, all types", icon: Megaphone, to: TOTAL.campaigns, f: int, delta: { v: "0.63%", down: true, dir: "down", note: "Dec vs Nov" } },
    { label: "Revenue", sub: "Jan-Dec, all campaigns", icon: CurrencyDollar, to: TOTAL.revenue, f: (n: number) => bn(n), delta: { v: "0.65%", down: true, dir: "down", note: "Dec vs Nov" } },
    { label: "ROI", sub: "Jan-Dec, (revenue - spend) / spend", icon: ChartLineUp, to: TOTAL.roi, f: pct2, delta: { v: "0.10 pts", down: true, dir: "down", note: "Dec vs Nov" } },
    { label: "CAC", sub: "spend / conversions, Jan-Dec", icon: Target, to: TOTAL.cac, f: (n: number) => `$${n.toFixed(2)}`, delta: { v: "0.10%", down: false, dir: "down", note: "lower, Dec vs Nov" } },
  ] : [
    { label: "Campaigns", sub: `Jan-Dec, ${t.name}`, icon: Megaphone, to: t.campaigns, f: int, note: `${(t.campaigns / TOTAL.campaigns * 100).toFixed(1)}% of all ${int(TOTAL.campaigns)}` },
    { label: "Revenue", sub: `Jan-Dec, ${t.name}`, icon: CurrencyDollar, to: t.revenue, f: (n: number) => bn(n), note: `${(t.revenue / TOTAL.revenue * 100).toFixed(1)}% of ${bn(TOTAL.revenue)} total` },
    { label: "ROI", sub: `Jan-Dec, ${t.name}`, icon: ChartLineUp, to: t.roi, f: pct2, delta: { v: `${Math.abs(t.roi - TOTAL.roi).toFixed(2)} pts`, down: t.roi < TOTAL.roi, dir: t.roi >= TOTAL.roi ? "up" : "down", note: `${t.roi >= TOTAL.roi ? "above" : "below"} all types (${pct2(TOTAL.roi)})` } },
    { label: "CAC", sub: `cost per conversion, ${t.name}`, icon: Target, to: t.cac, f: (n: number) => `$${n.toFixed(2)}`, delta: { v: `$${Math.abs(t.cac - TOTAL.cac).toFixed(2)}`, down: t.cac > TOTAL.cac, dir: t.cac > TOTAL.cac ? "up" : "down", note: `${t.cac <= TOTAL.cac ? "lower" : "higher"} than all types ($${TOTAL.cac})` } },
  ];

  /* Revenue and ROI by month (shape only). */
  const trend: BarDatum[] = REV_SHAPE.map((r, i) => ({
    key: MONTHS[i], label: MONTHS[i], h: r / Math.max(...REV_SHAPE),
    tip: `about $${(r * REV_SCALE).toFixed(1)}bn · ROI about ${Math.round(ROI_SHAPE[i])}%`, tipLabel: MONTHS_LONG[i],
  }));
  const roiLine = ROI_SHAPE.map((r, i) => `${((i + 0.5) / 12) * 100},${(1 - (r - ROI_LO) / (ROI_HI - ROI_LO)) * 100}`).join(" ");

  const overviewHint = month !== null
    ? month === 5
      ? "June is the outlier: revenue fell to about $1bn, well under half a normal month, while ROI stayed inside its usual 188% to 202% band. The drop came from volume, not from return on spend."
      : `${MONTHS_LONG[month]}: revenue about $${(REV_SHAPE[month] * REV_SCALE).toFixed(1)}bn and ROI about ${Math.round(ROI_SHAPE[month])}%. Every month except June lands between about $2.4bn and $2.6bn.`
    : t === null
      ? `${TOP_CHANNEL.name} is the best channel at ${pct2(TOP_CHANNEL.roi)} ROI and ${bestType.name} the best campaign type at ${pct2(bestType.roi)}. Grow both step by step and watch CAC as spend scales.`
      : `${t.name}: ROI ${pct2(t.roi)}, ${Math.abs(t.roi - TOTAL.roi).toFixed(2)} pts ${t.roi >= TOTAL.roi ? "above" : "below"} the average, at $${t.cac.toFixed(2)} per conversion.`;

  /* Funnel for the selected campaign type. Step rates are printed; shares of impressions follow from them. */
  const funnel = t === null
    ? [
      { l: "Impressions", share: 100, step: 100, n: "about 3bn" },
      { l: "Clicks", share: 8.51, step: 8.51, n: "8.51% of impressions" },
      { l: "Leads", share: 3.41, step: 3.41 / 8.51 * 100, n: "3.41% of impressions" },
      { l: "Conversions", share: 1.87, step: 1.87 / 3.41 * 100, n: "1.87% of impressions" },
    ]
    : (() => {
      const c = t.itc, l = c * t.ctl / 100, v = l * t.ltc / 100;
      return [
        { l: "Impressions", share: 100, step: 100, n: "all impressions" },
        { l: "Clicks", share: c, step: t.itc, n: `${pct2(c)} of impressions` },
        { l: "Leads", share: l, step: t.ctl, n: `${pct2(l)} of impressions` },
        { l: "Conversions", share: v, step: t.ltc, n: `${pct2(v)} of impressions` },
      ];
    })();
  const stepWord = ["", "of impressions are clicked", "of clicks become leads", "of leads convert"];
  const funnelHint = [
    "Every journey starts as an impression. Pick a step to see where volume is lost.",
    `Only ${pct2(funnel[1].step)} of impressions turn into a click, so more than 9 in 10 are lost here. This is the biggest leak: creative, message and targeting matter most.`,
    `About ${Math.round(funnel[2].step)}% of clicks become a lead. Landing pages and forms are the lever at this step.`,
    `About ${Math.round(funnel[3].step)}% of leads convert, the strongest step in the journey. ${bestConv.name} converts best at ${pct2(bestConv.conv)}.`,
  ][stage];

  /* Channel metric list, scaled to the spread so small gaps are visible. */
  const chanVal = (c: Channel) => (chanMetric === "CTR" ? c.ctr : c.conv);
  const chanRows = [...CHANNELS].map((c, i) => ({ c, i })).sort((a, b) => chanVal(b.c) - chanVal(a.c));
  const cMin = Math.min(...CHANNELS.map(chanVal)), cMax = Math.max(...CHANNELS.map(chanVal));

  /* Channels page */
  const chanBars: BarDatum[] = CHANNELS.map((c) => revMetric === "Revenue"
    ? { key: c.name, label: c.name, h: c.revenue / Math.max(...CHANNELS.map((x) => x.revenue)), tip: bn(c.revenue, 2), tipLabel: `${c.name}, revenue` }
    : { key: c.name, label: c.name, h: c.cac / dearest.cac, tip: `$${c.cac.toFixed(2)}`, tipLabel: `${c.name}, cost per conversion` });
  const sel = channel === null ? null : CHANNELS[channel];

  const campList = useMemo(() => {
    const src = camps === "Profitable" ? PROFITABLE : UNPROFITABLE;
    const rows = src.map(([id, spend, revenue]) => ({ id, spend, revenue, roi: roiOf(spend, revenue) }));
    return rows.sort((a, b) => campSort === "Spend" ? b.spend - a.spend : camps === "Profitable" ? b.roi - a.roi : a.roi - b.roi);
  }, [camps, campSort]);
  const campPages = Math.ceil(campList.length / 5);
  const campShown = campList.slice(campPage * 5, campPage * 5 + 5);

  /* Audience page */
  const a = aud === null ? null : AUDIENCES[aud];
  const audKpis: Kpi[] = a === null ? [
    { label: "Revenue", sub: "Jan-Dec, all audiences", icon: CurrencyDollar, to: TOTAL.revenue, f: (n: number) => bn(n), note: "5 audience groups" },
    { label: "Spend", sub: "acquisition cost, Jan-Dec", icon: Target, to: TOTAL.cost, f: (n: number) => bn(n), note: "all audiences" },
    { label: "ROI", sub: "Jan-Dec, all audiences", icon: ChartLineUp, to: TOTAL.roi, f: pct2, note: `range ${pct2(Math.min(...AUDIENCES.map((x) => x.roi)))} to ${pct2(Math.max(...AUDIENCES.map((x) => x.roi)))}` },
    { label: "ROAS", sub: "revenue per $1 spent, Jan-Dec", icon: Funnel, to: roas(TOTAL.revenue, TOTAL.cost), f: (n: number) => `$${n.toFixed(2)}`, note: "ROAS = 1 + ROI" },
  ] : [
    { label: "Revenue", sub: `Jan-Dec, ${a.name}`, icon: CurrencyDollar, to: a.revenue, f: (n: number) => bn(n), note: `${(a.revenue / TOTAL.revenue * 100).toFixed(1)}% of total` },
    { label: "Spend", sub: `acquisition cost, ${a.name}`, icon: Target, to: a.cost, f: (n: number) => bn(n), note: `${(a.cost / TOTAL.cost * 100).toFixed(1)}% of total` },
    { label: "ROI", sub: `Jan-Dec, ${a.name}`, icon: ChartLineUp, to: a.roi, f: pct2, delta: { v: `${Math.abs(a.roi - TOTAL.roi).toFixed(2)} pts`, down: a.roi < TOTAL.roi, dir: a.roi >= TOTAL.roi ? "up" : "down", note: `${a.roi >= TOTAL.roi ? "above" : "below"} all audiences` } },
    { label: "ROAS", sub: `revenue per $1, ${a.name}`, icon: Funnel, to: roas(a.revenue, a.cost), f: (n: number) => `$${n.toFixed(2)}`, delta: { v: `$${Math.abs(roas(a.revenue, a.cost) - roas(TOTAL.revenue, TOTAL.cost)).toFixed(2)}`, down: a.roi < TOTAL.roi, dir: a.roi >= TOTAL.roi ? "up" : "down", note: "vs all audiences" } },
  ];
  const audMax = Math.max(1, ...AUDIENCES.map((x) => x.roi));

  const scatterHint = hoverPt
    ? `${hoverPt.t}, engagement score ${BINS[hoverPt.i]}: ROI about ${about(hoverPt.i === 10 ? TOP_BIN[hoverPt.t] : CURVE[hoverPt.i], 50)}%.`
    : t !== null
      ? `${t.name} reaches about ${about(TOP_BIN[t.name], 50)}% ROI at the top engagement score, against ${pct2(t.roi)} on average.`
      : "Audience ROI sits in a tight band, 192.26% to 200.55%, so scale the best groups rather than move budget between them. Engagement is the stronger signal: at the top score Email and Paid Ads return about 2,450% to 2,700%, against about 850% to 1,100% for the other types.";

  const typeSlicer = <Slicer label="Campaign type" options={TYPE_OPTS} value={type as typeof TYPE_OPTS[number]} onChange={(v) => setType(v)} className="is-small" />;
  const chanChip = sel && <FilterChip label={sel.name} onClear={() => setChannel(null)} />;

  const kpiRow = (items: Kpi[]) => (
    <div className="db-kpis">
      {items.map((c, i) => (
        <article key={c.label} className="db-card db-kpi" style={{ "--i": i } as React.CSSProperties}>
          <header><span>{c.label}<small>{c.sub}</small></span><Chip icon={c.icon} /></header>
          <strong><Count to={c.to} on={on} format={c.f} /></strong>
          {c.delta ? <Delta value={c.delta.v} down={c.delta.down} note={c.delta.note} dir={c.delta.dir} /> : <span className="db-note">{c.note}</span>}
        </article>
      ))}
    </div>
  );

  return (
    <div ref={ref} className={`db pc-mk${on ? " is-on" : ""}`}>
      <Topbar title="IQ Marketing" tabs={PAGES} tab={tab} onTab={setTab} alerts={alerts} onRead={read} about={ABOUT} />

      {tab === "Overview" && (
        <div className="db-page" key="overview">
          <FilterBar>
            {typeSlicer}
            <p className="db-context">{t === null ? <><b>Jan-Dec</b> totals in USD, changes are <b>December vs November</b></> : <><b>{t.name}, Jan-Dec</b> compared with <b>all campaign types</b></>}</p>
          </FilterBar>
          {kpiRow(kpis)}
          <div className="db-row pc-mk-row">
            <article className="db-card db-chart">
              <header>
                <div><span className="db-label">Revenue and ROI by month, all campaigns</span><strong className="db-big db-big-sm">{month === null ? "June dips, every other month holds" : `${MONTHS_LONG[month]} selected`}</strong></div>
                <span className="pc-mk-key"><i className="is-rev" /> Revenue <i className="is-roi" /> ROI</span>
              </header>
              <div className="pc-mk-trend">
                <Bars data={trend} selected={month} onSelect={setMonth} on={on} label="Revenue by month with ROI. Values read from the original chart; click a month for its story." />
                <svg className="pc-mk-roi" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={roiLine} /></svg>
              </div>
              <p className="db-hint"><Lightning size={13} weight="fill" /> {overviewHint}</p>
            </article>

            <article className="db-card">
              <header><div><span className="db-label">By campaign type, Jan-Dec</span><strong className="db-big db-big-sm">Click a type to filter</strong></div>{t && <FilterChip label={t.name} onClear={() => setType("All")} />}</header>
              <div className="pc-mk-types" role="group" aria-label="Performance by campaign type. Pick one to filter the report.">
                <div className="pc-mk-th" aria-hidden="true"><span>Type</span><span>ROI</span><span>Revenue</span><span>CAC</span></div>
                {[...TYPES].sort((x, y) => y.roi - x.roi).map((x) => (
                  <button key={x.name} type="button" aria-pressed={type === x.name} className={type !== "All" && type !== x.name ? "is-dim" : undefined} onClick={() => setType(type === x.name ? "All" : x.name)}>
                    <span><b>{x.name}</b><small>{int(x.campaigns)} campaigns</small></span>
                    <span className="pc-mk-num">{pct2(x.roi)}</span>
                    <span className="pc-mk-num">{bn(x.revenue, 2)}</span>
                    <span className="pc-mk-num">${x.cac.toFixed(2)}</span>
                  </button>
                ))}
              </div>
              <p className="pc-mk-top"><span>Top channel by ROI</span><b>{TOP_CHANNEL.name}</b><em>{pct2(TOP_CHANNEL.roi)}</em></p>
            </article>
          </div>
        </div>
      )}

      {tab === "Funnel" && (
        <div className="db-page" key="funnel">
          <FilterBar>
            {typeSlicer}
            <p className="db-context"><b>Jan-Dec</b>, {t === null ? "all campaign types" : t.name} · USD</p>
          </FilterBar>
          <div className="db-row pc-mk-row">
            <article className="db-card db-funnel">
              <header><div><span className="db-label">Impression to conversion, {t === null ? "all campaigns" : t.name}</span><strong className="db-big">{pct2(funnel[3].share)} of impressions convert</strong></div><span className="db-pill">Bar = kept from the step before</span></header>
              {funnel.map((s, i) => (
                <button key={s.l} type="button" className={`db-stage${stage === i ? " is-sel" : ""}`} style={{ "--v": s.step / 100, "--i": i } as React.CSSProperties} aria-pressed={stage === i} onClick={() => setStage(i)}>
                  <span className="db-stage-top"><span>{s.l}<small className="pc-mk-sub">{i === 0 ? s.n : `${i === 1 || t ? pct2(s.step) : `about ${Math.round(s.step)}%`} ${stepWord[i]}`}</small></span><b>{i === 0 ? "100%" : <Count to={s.share} on={on} format={pct2} />}</b></span>
                  <span className="db-track"><i /></span>
                </button>
              ))}
              <p className="db-hint"><Lightning size={13} weight="fill" /> {funnelHint}</p>
            </article>

            <article className="db-card pc-mk-chan">
              <header>
                <div><span className="db-label">By channel, Jan-Dec</span><strong className="db-big db-big-sm">{chanMetric === "CTR" ? "Clicks per impression" : "Leads that convert"}</strong></div>
                <Slicer label="Channel metric" options={["CTR", "Lead to conversion"] as const} value={chanMetric} onChange={setChanMetric} className="is-small" />
              </header>
              <ul>
                {chanRows.map(({ c, i }) => (
                  <li key={c.name}>
                    <button type="button" aria-pressed={channel === i} className={channel !== null && channel !== i ? "is-dim" : undefined} style={{ "--v": cMax > cMin ? 0.3 + 0.7 * (chanVal(c) - cMin) / (cMax - cMin) : 1 } as React.CSSProperties} onClick={() => setChannel(channel === i ? null : i)}>
                      <span>{c.name}</span><span className="pc-mk-hbar"><i /></span><b>{pct2(chanVal(c))}</b>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="pc-mk-foot">Bars show the gap between channels, not distance from zero.</p>
              <p className="db-hint"><Lightning size={13} weight="fill" /> {sel ? `${sel.name}: ${pct2(sel.ctr)} of impressions click and ${pct2(sel.conv)} of leads convert.` : `Channels sit within ${(cMax - cMin).toFixed(2)} pts of each other, so fix creative and campaigns before moving budget between channels.`}</p>
            </article>
          </div>
        </div>
      )}

      {tab === "Channels" && (
        <div className="db-page" key="channels">
          <FilterBar>
            {chanChip}
            <p className="db-context"><b>Jan-Dec</b>, all {int(TOTAL.campaigns)} campaigns · tiles cover all channels · USD</p>
          </FilterBar>
          {kpiRow([
            { label: "Total spend", sub: "Jan-Dec, all channels", icon: CurrencyDollar, to: TOTAL.cost, f: (n) => bn(n, 2), note: `against ${bn(TOTAL.revenue, 2)} revenue` },
            { label: "Unprofitable campaigns", sub: "Jan-Dec, ROI below 0%", icon: Warning, to: UNPROFITABLE_SHARE, f: (n) => `${n.toFixed(1)}%`, note: `about ${int(Math.round(TOTAL.campaigns * UNPROFITABLE_SHARE / 100 / 100) * 100)} of ${int(TOTAL.campaigns)}` },
            { label: "Worst campaign ROI", sub: "Jan-Dec, single campaign", icon: ChartLineUp, to: WORST_ROI, f: (n) => `${Math.round(n)}%`, note: "best: over 3,400%" },
            { label: "Lowest CAC", sub: "Jan-Dec, by channel", icon: Target, to: cheapest.cac, f: (n) => `$${n.toFixed(2)}`, note: `${cheapest.name}. Highest: ${dearest.name}, $${dearest.cac.toFixed(2)}` },
          ])}
          <div className="db-row pc-mk-row is-chan">
            <article className="db-card db-chart">
              <header>
                <div><span className="db-label">{revMetric === "Revenue" ? "Revenue" : "Cost per conversion"} by channel, Jan-Dec</span><strong className="db-big db-big-sm">{sel ? `${sel.name}: ${bn(sel.revenue, 2)}, $${sel.cac.toFixed(2)} CAC` : "Click a channel to filter"}</strong></div>
                <Slicer label="Channel chart metric" options={["Revenue", "CAC"] as const} value={revMetric} onChange={setRevMetric} className="is-small" />
              </header>
              <Bars data={chanBars} selected={channel} onSelect={setChannel} on={on} label="Channels. Click one to filter." />
              <p className="db-hint"><Lightning size={13} weight="fill" /> {sel ? `${sel.name} earns ${(sel.revenue / TOTAL.revenue * 100).toFixed(1)}% of revenue at $${sel.cac.toFixed(2)} per conversion, ${sel.cac <= TOTAL.cac ? "below" : "above"} the $${TOTAL.cac} average.` : `${cheapest.name} has the lowest CAC at $${cheapest.cac.toFixed(2)} and ${dearest.name} the highest at $${dearest.cac.toFixed(2)}, a ${(((dearest.cac - cheapest.cac) / dearest.cac) * 100).toFixed(1)}% gap. Too small to move budget on alone; test first.`}</p>
            </article>

            <article className="db-card pc-mk-camps">
              <header>
                <Slicer label="Campaign list" options={["Unprofitable", "Profitable"] as const} value={camps} onChange={(v) => { setCamps(v); setCampPage(0); }} className="is-small" />
                <div className="db-sorts">
                  {(["Spend", "ROI"] as const).map((k) => (
                    <button key={k} type="button" className={campSort === k ? "is-on" : undefined} aria-pressed={campSort === k} onClick={() => { setCampSort(k); setCampPage(0); }}>{k}</button>
                  ))}
                </div>
              </header>
              <span className="db-label">{camps === "Profitable" ? "Top 5 by spend with positive ROI" : "10 biggest spenders with negative ROI"}, sorted by {campSort === "Spend" ? "spend" : camps === "Profitable" ? "best ROI" : "worst ROI"}</span>
              <div className="pc-mk-camp" role="table" aria-label={`${camps} campaigns`}>
                <div className="pc-mk-th" role="row"><span role="columnheader">Campaign</span><span role="columnheader">Spend</span><span role="columnheader">Revenue</span><span role="columnheader">ROI</span></div>
                {campShown.map((c) => (
                  <div key={c.id} className="pc-mk-tr" role="row">
                    <span role="cell"><b>{c.id}</b></span>
                    <span role="cell" className="pc-mk-num">{usd(c.spend)}</span>
                    <span role="cell" className="pc-mk-num">{usd(c.revenue)}</span>
                    <span role="cell"><span className={`db-status ${c.roi < 0 ? "is-high" : "is-ok"}`}>{Math.round(c.roi).toLocaleString("en-US")}%</span></span>
                  </div>
                ))}
              </div>
              <footer className="pc-mk-pager">
                {campPages > 1 ? (
                  <>
                    <span>{campPage * 5 + 1}-{Math.min(campList.length, campPage * 5 + 5)} of {campList.length}</span>
                    <button type="button" className="db-pill db-pill-btn" onClick={() => setCampPage((p) => (p + 1) % campPages)}>{campPage + 1 < campPages ? "Next 5" : "First 5"}</button>
                  </>
                ) : <span>{campList.length} campaigns</span>}
                <button type="button" className="db-pill db-pill-btn" onClick={() => say(`${camps} campaigns sent to the budget review (synthetic data)`)}><ArrowUpRight size={13} /> Flag for review</button>
              </footer>
            </article>
          </div>
        </div>
      )}

      {tab === "Audience" && (
        <div className="db-page" key="audience">
          <FilterBar>
            {a && <FilterChip label={a.name} onClear={() => setAud(null)} />}
            <p className="db-context">{a ? <><b>{a.name}, Jan-Dec</b> compared with <b>all audiences</b></> : <><b>Jan-Dec</b>, all audiences</>}</p>
          </FilterBar>
          {kpiRow(audKpis)}
          <div className="db-row pc-mk-row is-aud">
            <article className="db-card">
              <header><div><span className="db-label">ROI by target audience, Jan-Dec</span><strong className="db-big db-big-sm">Click an audience to filter</strong></div></header>
              <ul className="pc-mk-aud">
                {AUDIENCES.map((x, i) => (
                  <li key={x.name}>
                    <button type="button" aria-pressed={aud === i} className={aud !== null && aud !== i ? "is-dim" : undefined} style={{ "--v": x.roi / audMax } as React.CSSProperties} onClick={() => setAud(aud === i ? null : i)}>
                      <span className="pc-mk-aud-top"><span>{x.name}</span><b>{pct2(x.roi)}</b></span>
                      <span className="pc-mk-hbar"><i /></span>
                      <small>{bn(x.revenue, 2)} revenue · {bn(x.cost, 2)} acquisition cost</small>
                    </button>
                  </li>
                ))}
              </ul>
            </article>

            <article className="db-card pc-mk-scatter-card">
              <header><div><span className="db-label">Engagement score vs ROI, by campaign type</span><strong className="db-big db-big-sm">Does engagement predict return?</strong></div></header>
              <div className="pc-mk-scatter" role="img" aria-label="Scatter of ROI against engagement score. ROI rises with engagement; at the top score Email and Paid Ads reach about 2,450 to 2,700 percent." onMouseLeave={() => setHoverPt(null)}>
                {[0, 1000, 2000, 3000].map((g) => <span key={g} className="pc-mk-grid" style={{ "--y": g / 3000 } as React.CSSProperties}><em>{g.toLocaleString("en-US")}%</em></span>)}
                {TYPES.map((x, ti) => BINS.map((b, i) => {
                  const roi = i === 10 ? TOP_BIN[x.name] : CURVE[i] + (ti - 2) * 6;
                  const dim = t !== null && t.name !== x.name;
                  const isHover = hoverPt?.t === x.name && hoverPt.i === i;
                  return (
                    <i
                      key={`${x.name}-${b}`}
                      className={`pc-mk-pt${dim ? " is-dim" : ""}${isHover ? " is-hover" : ""}`}
                      style={{ "--x": (b + (ti - 2) * 0.35) / 31 + 0.016, "--y": Math.max(0, roi) / 3000, "--c": TYPE_COLOR[x.name], "--d": i } as React.CSSProperties}
                      onMouseEnter={() => setHoverPt({ t: x.name, i })}
                    />
                  );
                }))}
                <span className="pc-mk-xlab"><em>0</em><em>Engagement score</em><em>30</em></span>
              </div>
              <div className="db-legend pc-mk-legend" role="group" aria-label="Campaign type. Pick one to highlight it.">
                {TYPES.map((x) => (
                  <button key={x.name} type="button" aria-pressed={type === x.name} className={t !== null && t.name !== x.name ? "is-dim" : undefined} onClick={() => setType(type === x.name ? "All" : x.name)}>
                    <i style={{ background: TYPE_COLOR[x.name] }} />{x.name}
                  </button>
                ))}
              </div>
              <p className="db-hint"><Lightning size={13} weight="fill" /> {scatterHint}</p>
            </article>
          </div>
        </div>
      )}

      {toast}
    </div>
  );
}
