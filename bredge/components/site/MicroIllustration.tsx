/* Bespoke lightweight data micro-illustrations — one consistent visual
   language for major concepts. Pure SVG, no client JS. Styled via .mi in
   pages.css so they adapt to light/ink sections. */

type Kind = "engineering" | "analytics" | "bi" | "quality" | "automation" | "reconcile";

export function MicroIllustration({ kind, className = "" }: { kind: Kind; className?: string }) {
  return (
    <svg className={`mi ${className}`} viewBox="0 0 160 96" width="160" height="96" role="img" aria-hidden="true">
      {kind === "engineering" && (
        <>
          {/* source A + B + C -> conformed model */}
          <rect x="4" y="10" width="34" height="16" rx="1" />
          <rect x="4" y="40" width="34" height="16" rx="1" />
          <rect x="4" y="70" width="34" height="16" rx="1" />
          <path d="M38 18 H70 V48" />
          <path d="M38 48 H70" />
          <path d="M38 78 H70 V48" />
          <path className="accent" d="M70 48 H100" />
          <rect className="" x="100" y="34" width="52" height="28" rx="1" />
          <text x="126" y="51" textAnchor="middle">model</text>
        </>
      )}
      {kind === "analytics" && (
        <>
          {/* signal emerging from noise */}
          <polyline points="6,70 22,66 34,72 48,58 60,64 74,44 88,52 104,30 120,38 140,18" className="accent" />
          <circle className="dot" cx="140" cy="18" r="3" />
          <line x1="6" y1="86" x2="150" y2="86" />
          <line x1="6" y1="10" x2="6" y2="86" />
        </>
      )}
      {kind === "bi" && (
        <>
          {/* model -> metric layer -> decision surface */}
          <rect x="6" y="34" width="30" height="28" rx="1" />
          <text x="21" y="51" textAnchor="middle">model</text>
          <path d="M36 48 H60" />
          <line x1="60" y1="30" x2="60" y2="66" />
          <line x1="72" y1="30" x2="72" y2="66" />
          <path d="M84 48 H104" className="accent" />
          <rect x="104" y="24" width="50" height="48" rx="1" />
          <line x1="112" y1="60" x2="112" y2="46" className="accent" />
          <line x1="122" y1="60" x2="122" y2="38" className="accent" />
          <line x1="132" y1="60" x2="132" y2="50" className="accent" />
          <line x1="142" y1="60" x2="142" y2="34" className="accent" />
        </>
      )}
      {kind === "quality" && (
        <>
          {/* failed tests -> reconciliation -> verified */}
          <rect className="" x="6" y="20" width="42" height="56" rx="1" />
          <line className="warn" x1="14" y1="34" x2="40" y2="34" />
          <line className="warn" x1="14" y1="48" x2="40" y2="48" />
          <line x1="14" y1="62" x2="40" y2="62" />
          <path d="M48 48 H92" />
          <path className="accent" d="M92 48 H112" />
          <circle className="node" cx="132" cy="48" r="20" />
          <path className="accent" d="M124 48 l6 7 l12 -15" />
        </>
      )}
      {kind === "automation" && (
        <>
          {/* manual recurring steps -> scheduled reliable flow */}
          <circle className="node" cx="16" cy="26" r="7" />
          <circle className="node" cx="16" cy="48" r="7" />
          <circle className="node" cx="16" cy="70" r="7" />
          <path d="M30 26 H52 M30 48 H52 M30 70 H52" strokeDasharray="2 4" />
          <path className="accent" d="M64 48 H150" />
          <circle className="dot" cx="88" cy="48" r="2.5" />
          <circle className="dot" cx="112" cy="48" r="2.5" />
          <circle className="dot" cx="136" cy="48" r="2.5" />
          <text x="107" y="34" textAnchor="middle">scheduled</text>
        </>
      )}
      {kind === "reconcile" && (
        <>
          {/* two disagreeing numbers -> one reconciled */}
          <rect x="6" y="16" width="46" height="20" rx="1" />
          <text x="29" y="30" textAnchor="middle">4.21M</text>
          <rect x="6" y="60" width="46" height="20" rx="1" />
          <text x="29" y="74" textAnchor="middle">4.34M</text>
          <path d="M52 26 C80 26 80 48 100 48" />
          <path d="M52 70 C80 70 80 48 100 48" />
          <path className="accent" d="M100 48 H118" />
          <rect x="118" y="36" width="38" height="24" rx="1" />
          <text x="137" y="51" textAnchor="middle">4.21M</text>
        </>
      )}
    </svg>
  );
}
