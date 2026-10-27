/* Drawn cover art for insight cards that don't have a rendered image yet.
 * One distinct motif per article, flat shapes in the clay palette, set in the
 * right half of a 2:1 strip (same grammar as the Resources covers). */

const CREAM = "#eee8da";
const LIME = "#c6f0a8";
const FAINT = "rgba(238,232,218,.32)";

const ART: Record<string, React.ReactNode> = {
  // Three seats, the first hire chosen.
  "when-to-hire-a-data-team": (
    <g>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${116 + i * 26} ${i === 1 ? 28 : 34})`}>
          <rect x="0" y="0" width="18" height="22" rx="4" fill={i === 1 ? LIME : FAINT} />
          <rect x="-2" y="22" width="22" height="7" rx="3" fill={i === 1 ? LIME : FAINT} />
          <rect x="1" y="29" width="3" height="12" fill={i === 1 ? LIME : FAINT} />
          <rect x="14" y="29" width="3" height="12" fill={i === 1 ? LIME : FAINT} />
        </g>
      ))}
    </g>
  ),
  // A warehouse, half built, one brick still to place.
  "before-you-build-a-data-warehouse": (
    <g>
      <path d="M118 46 L148 26 L178 46" fill="none" stroke={CREAM} strokeWidth="2.5" strokeLinejoin="round" strokeDasharray="0" />
      {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => (r === 0 && c > 1 ? null : <rect key={`${r}${c}`} x={122 + c * 13 + (r % 2 ? 6 : 0)} y={74 - r * 9} width="11" height="7" rx="1.5" fill={CREAM} />)))}
      <rect x="168" y="76" width="11" height="7" rx="1.5" fill={LIME} transform="rotate(-12 173 79)" />
    </g>
  ),
  // Many records joining into one customer.
  "one-customer-view": (
    <g fill="none" stroke={FAINT} strokeWidth="2" strokeLinecap="round">
      {[22, 40, 58, 76].map((y) => <path key={y} d={`M120 ${y} C146 ${y} 150 50 172 50`} />)}
      {[22, 40, 58, 76].map((y) => <circle key={`c${y}`} cx="116" cy={y} r="4" fill={CREAM} stroke="none" />)}
      <circle cx="178" cy="50" r="9" fill={LIME} stroke="none" />
    </g>
  ),
  // Monthly calendar page with a turning gear.
  "automate-monthly-reporting": (
    <g>
      <rect x="116" y="22" width="44" height="54" rx="5" fill="none" stroke={CREAM} strokeWidth="2.5" />
      <rect x="116" y="22" width="44" height="11" rx="4" fill={CREAM} />
      {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={122 + c * 9} y={40 + r * 10} width="5" height="5" rx="1" fill={r === 2 && c === 3 ? LIME : FAINT} />))}
      <g transform="translate(178 66)">
        {[0, 45, 90, 135].map((a) => <rect key={a} x="-2.5" y="-13" width="5" height="26" rx="1.5" fill={LIME} transform={`rotate(${a})`} />)}
        <circle r="8" fill={LIME} /><circle r="3.5" fill="#1e3726" />
      </g>
    </g>
  ),
  // A slow loading ring, nearly stalled.
  "power-bi-slow": (
    <g fill="none" strokeLinecap="round">
      <circle cx="150" cy="50" r="24" stroke={FAINT} strokeWidth="5" />
      <path d="M150 26 A24 24 0 0 1 172 41" stroke={LIME} strokeWidth="5" />
      {[0, 1, 2].map((i) => <rect key={i} x={140 + i * 8} y={58 - i * 6} width="5" height={8 + i * 6} rx="1.5" fill={CREAM} stroke="none" />)}
    </g>
  ),
  // A spreadsheet with one clean stripe wiped across it.
  "excel-cleaning-automation": (
    <g>
      {[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={118 + c * 16} y={24 + r * 13} width="14" height="11" rx="1.5" fill={r === 1 ? LIME : FAINT} transform={r !== 1 && (r + c) % 3 === 0 ? `rotate(${(c % 2 ? 8 : -8)} ${125 + c * 16} ${29 + r * 13})` : undefined} />))}
    </g>
  ),
  // A gauge reading high, with a tick.
  "is-our-data-reliable": (
    <g fill="none" strokeLinecap="round">
      <path d="M124 66 A26 26 0 0 1 176 66" stroke={FAINT} strokeWidth="6" />
      <path d="M124 66 A26 26 0 0 1 168 48" stroke={LIME} strokeWidth="6" />
      <path d="M150 66 L166 50" stroke={CREAM} strokeWidth="3" />
      <circle cx="150" cy="66" r="4" fill={CREAM} stroke="none" />
      <path d="M176 22 l5 5 l9 -10" stroke={LIME} strokeWidth="3" strokeLinejoin="round" />
    </g>
  ),
  // A fork: report screen one way, database the other.
  "power-bi-warehouse-or-both": (
    <g>
      <path d="M118 50 H136 C148 50 148 30 160 30 M136 50 C148 50 148 70 160 70" fill="none" stroke={CREAM} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="164" y="20" width="24" height="18" rx="3" fill={CREAM} />
      {[0, 1, 2].map((i) => <rect key={i} x={169 + i * 6} y={32 - i * 4} width="4" height={3 + i * 4} rx="1" fill="#1e3726" />)}
      <ellipse cx="176" cy="63" rx="11" ry="4" fill={LIME} />
      <rect x="165" y="63" width="22" height="13" fill={LIME} />
      <ellipse cx="176" cy="76" rx="11" ry="4" fill={LIME} />
    </g>
  ),
  // A row of daily partitions; only the last three are read.
  "incremental-models-at-scale": (
    <g>
      {Array.from({ length: 7 }).map((_, i) => <rect key={i} x={114 + i * 11} y={34} width="8" height="32" rx="1.5" fill={i >= 4 ? LIME : FAINT} />)}
      <path d="M158 74 h31" stroke={CREAM} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M158 70 v8 M189 70 v8" stroke={CREAM} strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  // A database streaming ordered changes into a box.
  "change-data-capture": (
    <g>
      <ellipse cx="128" cy="34" rx="12" ry="4.5" fill={CREAM} />
      <rect x="116" y="34" width="24" height="30" fill={CREAM} />
      <ellipse cx="128" cy="64" rx="12" ry="4.5" fill={CREAM} />
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={150 + i * 8} cy="50" r="2.6" fill={i === 3 ? LIME : FAINT} />)}
      <rect x="178" y="38" width="16" height="24" rx="3" fill={LIME} />
    </g>
  ),
  // Two versions on a timeline, one event belonging to each.
  "customer-history-scd2": (
    <g>
      <rect x="114" y="34" width="38" height="10" rx="3" fill={FAINT} />
      <rect x="152" y="34" width="40" height="10" rx="3" fill={LIME} />
      <path d="M114 64 H192" stroke={CREAM} strokeWidth="2" strokeLinecap="round" />
      <circle cx="132" cy="64" r="4" fill={CREAM} />
      <circle cx="172" cy="64" r="4" fill={LIME} />
      <path d="M152 28 V70" stroke={CREAM} strokeWidth="1.5" strokeDasharray="3 3" />
    </g>
  ),
  // Three currencies combining into one group figure.
  "multi-entity-consolidation": (
    <g>
      {[[122, 30], [122, 50], [122, 70]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7" fill={i === 1 ? CREAM : FAINT} />)}
      {[30, 50, 70].map((y) => <path key={y} d={`M131 ${y} C150 ${y} 152 50 168 50`} fill="none" stroke={FAINT} strokeWidth="2" strokeLinecap="round" />)}
      <circle cx="178" cy="50" r="11" fill={LIME} />
      <path d="M174 50 h8 M178 46 v8" stroke="#1e3726" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  // One invoice spike (faint) against steady monthly bars.
  "saas-metrics-from-stripe": (
    <g>
      <rect x="116" y="22" width="8" height="54" rx="1.5" fill={FAINT} />
      {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={132 + i * 10} y={58 - i * 3} width="7" height={18 + i * 3} rx="1.5" fill={LIME} />)}
      <path d="M114 78 H194" stroke={CREAM} strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  // Three small layers: sources, one store, one report.
  "first-reporting-stack": (
    <g>
      {[0, 1, 2].map((i) => <rect key={i} x={118 + i * 12} y="66" width="9" height="9" rx="2" fill={FAINT} />)}
      <rect x="128" y="46" width="34" height="12" rx="3" fill={CREAM} />
      <rect x="138" y="22" width="44" height="16" rx="3" fill={LIME} />
      <path d="M145 33 l5 -4 l5 3 l7 -6" fill="none" stroke="#1e3726" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  // A refresh arrow broken by a gap.
  "power-bi-refresh-failed": (
    <g fill="none" strokeLinecap="round">
      <path d="M128 50 A22 22 0 1 1 150 72" stroke={CREAM} strokeWidth="5" />
      <path d="M150 72 l-8 -6 M150 72 l-8 6" stroke={CREAM} strokeWidth="4" />
      <circle cx="176" cy="30" r="9" fill={LIME} stroke="none" />
      <path d="M176 25 v6 M176 35 v0.5" stroke="#1e3726" strokeWidth="2.5" />
    </g>
  ),
  // A pipe with a meter on it.
  "reduce-fivetran-costs": (
    <g>
      <rect x="114" y="44" width="80" height="12" rx="6" fill={FAINT} />
      <circle cx="154" cy="50" r="15" fill={CREAM} />
      <path d="M154 50 L163 41" stroke="#1e3726" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="182" y="40" width="12" height="20" rx="3" fill={LIME} />
    </g>
  ),
  // Three licence cards, one highlighted.
  "power-bi-licensing-small-business": (
    <g>
      {[0, 1, 2].map((i) => <rect key={i} x={116 + i * 24} y={30 + i * 6} width="20" height="30" rx="3" fill={i === 0 ? LIME : FAINT} />)}
      <rect x="120" y="68" width="60" height="5" rx="2.5" fill={CREAM} />
    </g>
  ),
  // A gauge in the red zone with a hand held up.
  "fabric-capacity-throttling": (
    <g fill="none" strokeLinecap="round">
      <path d="M120 70 A30 30 0 0 1 180 70" stroke={FAINT} strokeWidth="7" />
      <path d="M165 44 A30 30 0 0 1 180 70" stroke={LIME} strokeWidth="7" />
      <path d="M150 70 L172 52" stroke={CREAM} strokeWidth="3" />
      <circle cx="150" cy="70" r="4" fill={CREAM} stroke="none" />
    </g>
  ),
  // Two ledgers plugging into a chart.
  "connect-quickbooks-xero-to-power-bi": (
    <g>
      <rect x="114" y="26" width="22" height="18" rx="3" fill={CREAM} />
      <rect x="114" y="56" width="22" height="18" rx="3" fill={FAINT} />
      <path d="M136 35 C150 35 150 50 162 50 M136 65 C150 65 150 50 162 50" fill="none" stroke={CREAM} strokeWidth="2" />
      <rect x="164" y="34" width="28" height="32" rx="3" fill={LIME} />
      {[0, 1, 2].map((i) => <rect key={i} x={169 + i * 7} y={58 - i * 6} width="4" height={4 + i * 6} rx="1" fill="#1e3726" />)}
    </g>
  ),
  // Two columns of rows, matched by ticks.
  "warehouse-migration-parity": (
    <g>
      {[0, 1, 2, 3].map((i) => <rect key={`a${i}`} x="116" y={24 + i * 13} width="26" height="9" rx="2" fill={CREAM} />)}
      {[0, 1, 2, 3].map((i) => <rect key={`b${i}`} x="166" y={24 + i * 13} width="26" height="9" rx="2" fill={i === 2 ? FAINT : LIME} />)}
      <text x="154" y="82" textAnchor="middle" fill={CREAM} fontSize="14">=</text>
    </g>
  ),
  // A rising bridge of bars.
  "investor-ready-arr": (
    <g>
      <rect x="116" y="46" width="12" height="30" rx="2" fill={CREAM} />
      <rect x="132" y="34" width="10" height="12" rx="2" fill={LIME} />
      <rect x="146" y="28" width="10" height="6" rx="2" fill={LIME} />
      <rect x="160" y="28" width="10" height="8" rx="2" fill={FAINT} />
      <rect x="176" y="36" width="12" height="40" rx="2" fill={CREAM} />
    </g>
  ),
  // A sleeping warehouse: a box with a moon.
  "warehouse-platform-costs": (
    <g>
      <rect x="118" y="40" width="44" height="34" rx="4" fill={FAINT} />
      <path d="M118 40 L140 26 L162 40" fill="none" stroke={CREAM} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M184 30 a10 10 0 1 0 8 14 a8 8 0 0 1 -8 -14 z" fill={LIME} />
    </g>
  ),
  // A dependency chain with the slow link marked.
  "speed-up-dbt-runs": (
    <g>
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={122 + i * 22} cy={50 + (i % 2 ? -10 : 10)} r="7" fill={i === 2 ? LIME : CREAM} />)}
      <path d="M122 60 L144 40 L166 60 L188 40" fill="none" stroke={FAINT} strokeWidth="2" />
    </g>
  ),
  // A shopping bag and three diverging lines.
  "shopify-payouts-xero-ga4-revenue": (
    <g>
      <rect x="116" y="36" width="28" height="30" rx="4" fill={LIME} />
      <path d="M123 36 a7 7 0 0 1 14 0" fill="none" stroke={LIME} strokeWidth="2.5" />
      {[28, 44, 60].map((y, i) => <path key={y} d={`M146 50 L186 ${y}`} stroke={i === 1 ? CREAM : FAINT} strokeWidth="2" strokeLinecap="round" />)}
    </g>
  ),
  // An upgrade arrow over stacked layers.
  "dbt-fusion-upgrade": (
    <g>
      {[0, 1, 2].map((i) => <rect key={i} x="122" y={64 - i * 12} width="44" height="8" rx="2" fill={i === 2 ? LIME : FAINT} />)}
      <path d="M180 66 V30 M172 38 L180 30 L188 38" fill="none" stroke={CREAM} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  // A handshake dot linked to a card.
  "crm-closed-won-vs-stripe": (
    <g>
      <circle cx="128" cy="50" r="12" fill={CREAM} />
      <path d="M123 50 l4 4 l7 -8" fill="none" stroke="#1e3726" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M142 50 H160" stroke={FAINT} strokeWidth="2" strokeDasharray="3 3" />
      <rect x="162" y="38" width="30" height="24" rx="3" fill={LIME} />
      <rect x="162" y="44" width="30" height="4" fill="#1e3726" />
    </g>
  ),
  // Rows of a record set, one row erased to a dashed outline, and the key that unlocked it struck through.
  "gdpr-deletion-requests-data-warehouse": (
    <g>
      {[0, 1, 2, 3].map((i) => (i === 2
        ? <rect key={i} x="114" y={24 + i * 13} width="46" height="9" rx="2" fill="none" stroke={LIME} strokeWidth="1.5" strokeDasharray="3 2.5" />
        : <rect key={i} x="114" y={24 + i * 13} width="46" height="9" rx="2" fill={FAINT} />))}
      <circle cx="176" cy="44" r="7" fill="none" stroke={CREAM} strokeWidth="2.5" />
      <path d="M176 51 V72 M176 62 h6 M176 68 h4" fill="none" stroke={CREAM} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M164 74 L190 34" stroke={LIME} strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
};

export function InsightCover({ slug }: { slug: string }) {
  const art = ART[slug];
  if (!art) return null;
  return <svg viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet" focusable="false">{art}</svg>;
}
