/* Drawn cover strips for resource cards, one distinct motif per tool, until
 * real cover images exist. Flat shapes in the clay palette on deep green,
 * placed in the right half of a 2:1 strip. Decorative only. */

const CREAM = "#eee8da";
const LIME = "#c6f0a8";
const FAINT = "rgba(238,232,218,.32)";

const ART: Record<string, React.ReactNode> = {
  // Coins: three stacks of different heights, one in lime.
  "hire-vs-fractional-data-team-cost": (
    <g>
      {[0, 1, 2].map((i) => <rect key={`a${i}`} x="112" y={74 - i * 9} width="22" height="6" rx="3" fill={CREAM} />)}
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={`b${i}`} x="140" y={74 - i * 9} width="22" height="6" rx="3" fill={LIME} />)}
      {[0, 1, 2, 3].map((i) => <rect key={`c${i}`} x="168" y={74 - i * 9} width="22" height="6" rx="3" fill={FAINT} />)}
    </g>
  ),
  // Fork: one path splitting into three, one outcome chosen.
  "first-data-hire-decision-tree": (
    <g fill="none" stroke={CREAM} strokeWidth="2.5" strokeLinecap="round">
      <path d="M118 50 H138 C152 50 152 26 166 26 H174" />
      <path d="M138 50 H174" />
      <path d="M138 50 C152 50 152 74 166 74 H174" stroke={FAINT} />
      <circle cx="114" cy="50" r="5" fill={CREAM} stroke="none" />
      <circle cx="180" cy="26" r="6" fill={LIME} stroke="none" />
      <circle cx="180" cy="50" r="5" />
      <circle cx="180" cy="74" r="5" stroke={FAINT} />
    </g>
  ),
  // Document: a brief with a folded corner and a lime heading block.
  "data-project-brief-template": (
    <g>
      <path d="M124 16 H162 L176 30 V84 H124 Z" fill="none" stroke={CREAM} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M162 16 V30 H176" fill="none" stroke={CREAM} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="132" y="26" width="22" height="7" rx="2" fill={LIME} />
      {[42, 51, 60, 69].map((y, i) => <rect key={y} x="132" y={y} width={i === 3 ? 22 : 36} height="3" rx="1.5" fill={FAINT} />)}
    </g>
  ),
  // Retention curve: drops, then flattens; the plateau is the point.
  "saas-metrics-definitions": (
    <g fill="none" strokeLinecap="round">
      <path d="M112 18 V80 H188" stroke={FAINT} strokeWidth="2" />
      <path d="M116 24 C130 52 142 58 156 61 S178 63 184 63" stroke={CREAM} strokeWidth="2.5" />
      <path d="M116 63 H184" stroke={FAINT} strokeWidth="1.5" strokeDasharray="3 4" />
      <circle cx="184" cy="63" r="5" fill={LIME} />
    </g>
  ),
  // Table: a dictionary grid with a lime name column.
  "kpi-dictionary-template": (
    <g>
      {[22, 37, 52, 67].map((y, r) => (
        <g key={y}>
          <rect x="112" y={y} width="20" height="9" rx="2" fill={r === 0 ? CREAM : LIME} />
          <rect x="138" y={y + 3} width="22" height="3" rx="1.5" fill={r === 0 ? CREAM : FAINT} />
          <rect x="166" y={y + 3} width={r % 2 ? 14 : 20} height="3" rx="1.5" fill={r === 0 ? CREAM : FAINT} />
        </g>
      ))}
      <path d="M112 33 H186" stroke={FAINT} strokeWidth="1" />
    </g>
  ),
  // Two bars that should match, with the gap marked in lime.
  "revenue-reconciliation-checklist": (
    <g>
      <rect x="124" y="44" width="20" height="38" rx="2" fill={CREAM} />
      <rect x="158" y="44" width="20" height="38" rx="2" fill={CREAM} />
      <rect x="158" y="24" width="20" height="18" rx="2" fill={LIME} />
      <path d="M124 44 H186" stroke={FAINT} strokeWidth="1.5" strokeDasharray="3 4" />
    </g>
  ),
  // Priority matrix: four quadrants, do-first in lime.
  "data-diagnostic-checklist": (
    <g>
      <rect x="118" y="18" width="30" height="30" rx="4" fill={LIME} />
      <rect x="152" y="18" width="30" height="30" rx="4" fill="none" stroke={CREAM} strokeWidth="2" />
      <rect x="118" y="52" width="30" height="30" rx="4" fill="none" stroke={CREAM} strokeWidth="2" />
      <rect x="152" y="52" width="30" height="30" rx="4" fill="none" stroke={FAINT} strokeWidth="2" />
      <circle cx="128" cy="30" r="3" fill="#1e3726" /><circle cx="138" cy="37" r="3" fill="#1e3726" />
      <circle cx="166" cy="31" r="3" fill={CREAM} /><circle cx="131" cy="68" r="3" fill={CREAM} />
    </g>
  ),
  // Clock: hours given back, shown as a lime sector.
  "reporting-automation-map": (
    <g>
      <path d="M150 50 L150 22 A28 28 0 0 1 174.2 64 Z" fill={LIME} />
      <circle cx="150" cy="50" r="28" fill="none" stroke={CREAM} strokeWidth="2.5" />
      <path d="M150 50 V32 M150 50 L162 56" stroke={CREAM} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="150" cy="50" r="3" fill={CREAM} />
    </g>
  ),
  // Warehouse: a stack of discs, only the lime slice is scanned.
  "warehouse-query-cost-estimator": (
    <g fill="none" strokeWidth="2.5">
      <path d="M124 26 V74 A26 8 0 0 0 176 74 V26" stroke={CREAM} />
      <ellipse cx="150" cy="26" rx="26" ry="8" stroke={CREAM} />
      <path d="M124 42 A26 8 0 0 0 176 42" stroke={FAINT} />
      <path d="M124 58 A26 8 0 0 0 176 58 V66 A26 8 0 0 1 124 66 Z" fill={LIME} stroke="none" />
      <path d="M184 58 H192 M184 66 H192" stroke={LIME} strokeLinecap="round" />
    </g>
  ),
  // Incremental: blocks added one at a time, the newest in lime.
  "dbt-incremental-strategy-picker": (
    <g>
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={114 + i * 15} y={70 - i * 10} width="11" height={12 + i * 10} rx="2" fill={i === 4 ? LIME : i === 3 ? CREAM : FAINT} />)}
      <path d="M114 86 H190" stroke={FAINT} strokeWidth="1.5" />
      <path d="M174 22 l6 -6 l6 6" fill="none" stroke={LIME} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  // Freshness: a pipeline timeline in stages, with the SLA line crossing it.
  "data-freshness-sla-calculator": (
    <g>
      <rect x="110" y="44" width="16" height="12" rx="3" fill={FAINT} />
      <rect x="128" y="44" width="22" height="12" rx="3" fill={CREAM} />
      <rect x="152" y="44" width="36" height="12" rx="3" fill={LIME} />
      <path d="M170 28 V72" stroke={CREAM} strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="170" cy="24" r="4" fill={CREAM} />
    </g>
  ),
  // Backfill: a long bar filled in chunks, oldest first, the current chunk in lime.
  "backfill-planner": (
    <g>
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={112 + i * 13} y="44" width="11" height="12" rx="2" fill={i < 3 ? CREAM : i === 3 ? LIME : FAINT} />)}
      <path d="M112 66 H188" stroke={FAINT} strokeWidth="1.5" strokeDasharray="2 4" />
      <path d="M151 30 v8 m-4 -4 l4 4 l4 -4" fill="none" stroke={LIME} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  // Refresh error: a circular refresh arrow broken by a lime warning mark.
  "power-bi-refresh-error-lookup": (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M126 50 A24 24 0 0 1 168 34" stroke={CREAM} strokeWidth="2.5" />
      <path d="M168 24 V34 H158" stroke={CREAM} strokeWidth="2.5" />
      <path d="M174 50 A24 24 0 0 1 132 66" stroke={FAINT} strokeWidth="2.5" />
      <path d="M150 40 V52" stroke={LIME} strokeWidth="3.5" />
      <circle cx="150" cy="60" r="2.5" fill={LIME} stroke="none" />
    </g>
  ),
  // MAR: several pipes into one meter, one pipe much thicker, in lime.
  "fivetran-mar-cost-estimator": (
    <g fill="none" strokeLinecap="round">
      <path d="M110 30 C130 30 132 50 150 50" stroke={FAINT} strokeWidth="2" />
      <path d="M110 50 H150" stroke={LIME} strokeWidth="7" />
      <path d="M110 70 C130 70 132 50 150 50" stroke={FAINT} strokeWidth="2" />
      <circle cx="168" cy="50" r="16" stroke={CREAM} strokeWidth="2.5" />
      <path d="M168 50 L178 42" stroke={CREAM} strokeWidth="2.5" />
    </g>
  ),
  // Licences: a row of people, most faint (viewers), two cream (builders), one lime card.
  "power-bi-licensing-cost-calculator": (
    <g>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i} fill={i < 2 ? CREAM : FAINT}>
          <circle cx={116 + i * 13} cy={42} r="4.5" />
          <rect x={110.5 + i * 13} y={49} width="11" height="12" rx="5" />
        </g>
      ))}
      <rect x="140" y="68" width="30" height="16" rx="3" fill={LIME} />
    </g>
  ),
  // Parity: two columns of rows with matching lime ticks between them.
  "migration-validation-sql-generator": (
    <g>
      {[24, 38, 52, 66].map((y) => <rect key={`l${y}`} x="114" y={y} width="26" height="8" rx="2" fill={CREAM} />)}
      {[24, 38, 52, 66].map((y) => <rect key={`r${y}`} x="160" y={y} width="26" height="8" rx="2" fill={FAINT} />)}
      {[24, 38, 52, 66].map((y) => <path key={`t${y}`} d={`M144 ${y + 4} l3 3 l7 -7`} fill="none" stroke={LIME} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />)}
    </g>
  ),
  // Cohorts: a triangular heat grid, darkest (lime) at the start of each row.
  "arr-bridge-cohort-builder": (
    <g>
      {[0, 1, 2, 3, 4].map((r) => Array.from({ length: 5 - r }, (_, c) => (
        <rect key={`${r}-${c}`} x={114 + c * 14} y={20 + r * 13} width="12" height="11" rx="2" fill={c === 0 ? LIME : c < 2 ? CREAM : FAINT} />
      )))}
    </g>
  ),
  // dbt run: a dependency chain, the critical path in lime.
  "dbt-run-results-analyser": (
    <g fill="none" strokeWidth="2.5" strokeLinecap="round">
      <path d="M118 34 H140 M118 66 H140 M152 34 L170 50 M152 66 L170 50" stroke={FAINT} />
      <path d="M118 50 H140 L170 50 H184" stroke={LIME} />
      {[[114, 34], [114, 50], [114, 66], [146, 34], [146, 50], [146, 66], [176, 50]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4.5" fill={y === 50 ? LIME : CREAM} stroke="none" />)}
    </g>
  ),
};

export function ResourceCover({ slug, bare = false }: { slug: string; /** Just the art, for a caller's own frame. */ bare?: boolean }) {
  const art = ART[slug];
  const svg = art && <svg viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet" focusable="false">{art}</svg>;
  if (bare) return svg || null;
  return <span className="rs-media" aria-hidden="true">{svg}</span>;
}
