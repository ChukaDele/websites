/* Mini document thumbnails drawn in SVG, decorative only (aria-hidden).
   Used for deliverables, the diagnostic hero and proof cards. Styles: app/services.css (`sv-doc`). */

export type DocKind = "report" | "list" | "recon" | "map" | "roadmap" | "session";

export function DocThumb({ kind, title, className = "" }: { kind: DocKind; title?: string; className?: string }) {
  return (
    <span className={`sv-doc sv-doc-${kind} ${className}`} aria-hidden="true">
      <span className="sv-doc-bar"><i /><i /><i /></span>
      {title && <b>{title}</b>}
      <svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid meet">
        {kind === "report" && (<>
          <rect x="0" y="2" width="70" height="5" rx="2" className="ink" />
          <rect x="0" y="14" width="120" height="3" rx="1.5" /><rect x="0" y="21" width="112" height="3" rx="1.5" /><rect x="0" y="28" width="96" height="3" rx="1.5" />
          <rect x="0" y="40" width="54" height="34" rx="4" className="lime" />
          <rect x="62" y="42" width="58" height="3" rx="1.5" /><rect x="62" y="49" width="50" height="3" rx="1.5" /><rect x="62" y="56" width="56" height="3" rx="1.5" /><rect x="62" y="63" width="40" height="3" rx="1.5" />
        </>)}
        {kind === "list" && [0, 1, 2, 3, 4].map((r) => (
          <g key={r} transform={`translate(0 ${r * 16})`}>
            <text x="0" y="9">{r + 1}</text>
            <rect x="12" y="3" width={86 - r * 8} height="4" rx="2" />
            <rect x="104" y="1" width="16" height="8" rx="4" className={r < 2 ? "hot" : r < 4 ? "warm" : "lime"} />
          </g>
        ))}
        {kind === "recon" && (<>
          <rect x="0" y="4" width="52" height="30" rx="4" /><rect x="68" y="4" width="52" height="30" rx="4" />
          <text x="26" y="23" textAnchor="middle" className="big">A</text><text x="94" y="23" textAnchor="middle" className="big">B</text>
          <path d="M26 38 V50 H94 V38" className="line" /><path d="M60 50 V58" className="line" />
          <rect x="34" y="58" width="52" height="20" rx="4" className="lime" />
        </>)}
        {kind === "map" && (<>
          <path d="M18 14 L60 40 M18 40 L60 40 M18 66 L60 40 M60 40 L102 22 M60 40 L102 58" className="line" />
          <circle cx="18" cy="14" r="7" /><circle cx="18" cy="40" r="7" /><circle cx="18" cy="66" r="7" className="hot" />
          <circle cx="60" cy="40" r="10" className="lime" /><circle cx="102" cy="22" r="7" /><circle cx="102" cy="58" r="7" className="warm" />
        </>)}
        {kind === "roadmap" && ["Now", "Next", "Later"].map((c, i) => (
          <g key={c} transform={`translate(${i * 42} 0)`}>
            <text x="0" y="8">{c}</text>
            <rect x="0" y="14" width="36" height="14" rx="3" className={i === 0 ? "lime" : undefined} />
            <rect x="0" y="32" width="36" height="14" rx="3" />
            {i < 2 && <rect x="0" y="50" width="36" height="14" rx="3" />}
          </g>
        ))}
        {kind === "session" && (<>
          <rect x="16" y="2" width="88" height="46" rx="4" />
          <polyline points="24,40 40,30 54,34 70,18 86,22 96,12" className="line" />
          <circle cx="30" cy="66" r="8" className="lime" /><circle cx="60" cy="66" r="8" /><circle cx="90" cy="66" r="8" />
        </>)}
      </svg>
    </span>
  );
}

