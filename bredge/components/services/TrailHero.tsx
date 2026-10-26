import { ArrowUpRight, Check } from "@phosphor-icons/react/dist/ssr";
import { StreakField } from "./StreakField";

/**
 * Service hero after the light-trail reference: a full-screen dark green
 * field of flowing light trails (StreakField); on the left a big two-line
 * headline, the lede, a white pill and an outline pill, and a small line
 * of facts; on the right two frosted cards — a gap that closes over the
 * ten days (an illustrative example: CRM vs billing customer counts, as in
 * the Services hero) and a delivered-findings note.
 *
 * Motion: trails flow; the copy rises in; the chart line draws, the gap
 * marker settles, the cards lift in. Reduced motion: all still.
 * Styles: app/services.css (`th-`).
 */
export function TrailHero({ title, accent, lede, note, primary, secondary, footer }: {
  title: string;
  accent: string;
  lede: string;
  note: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  /** Optional strip along the foot of the hero, across both columns. */
  footer?: React.ReactNode;
}) {
  const d = (i: number) => ({ "--i": i } as React.CSSProperties);
  // Gap per day (illustrative): 111 customers apart on day 1, explained by day 10.
  const gap = [111, 104, 92, 74, 51, 30, 18, 9, 3, 0];
  const today = 5; // day 6, zero-based
  const X = (i: number) => 4 + (i / 9) * 292;
  const Y = (v: number) => 8 + (1 - v / 111) * 92;
  const solid = gap.slice(0, today + 1).map((v, i) => `${X(i)},${Y(v)}`).join(" ");
  const ahead = gap.slice(today).map((v, i) => `${X(i + today)},${Y(v)}`).join(" ");
  const area = `${X(0)},108 ${solid} ${X(today)},108`;

  return (
    <section className="th" aria-labelledby="th-title">
      <StreakField className="th-trails" />
      <span className="th-shade" aria-hidden="true" />

      <div className="th-wrap">
        <div className="th-copy">
          <h1 id="th-title" className="th-h1">
            <span className="th-line"><span style={d(0)}>{title}</span></span>
            <span className="th-line"><span style={d(1)}>{accent}</span></span>
          </h1>
          <p className="th-lede th-rise" style={d(2)}>{lede}</p>
          <div className="th-actions th-rise" style={d(3)}>
            <a className="th-btn is-solid" href={primary.href}>{primary.label}</a>
            <a className="th-btn" href={secondary.href}>{secondary.label} <ArrowUpRight size={13} weight="bold" aria-hidden="true" /></a>
          </div>
          <p className="th-note th-rise" style={d(4)}>{note}</p>
        </div>

        <div className="th-cards" aria-hidden="true">
          <div className="th-card th-gap th-lift" style={d(3)}>
            <div className="th-card-top">
              <p className="th-k">Gap between CRM and billing</p>
              <span className="th-chip">Illustrative</span>
            </div>
            <p className="th-big">111</p>
            <p className="th-sub">customers apart on day 1 · closing</p>
            <svg className="th-chart" viewBox="0 0 300 112" preserveAspectRatio="none">
              <defs>
                <linearGradient id="th-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#90d26f" stopOpacity=".32" />
                  <stop offset="1" stopColor="#90d26f" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon className="th-area" points={area} fill="url(#th-fill)" />
              <polyline className="th-solid" points={solid} pathLength={1} />
              <polyline className="th-ahead" points={ahead} />
              <circle className="th-dot" cx={X(today)} cy={Y(gap[today])} r="4" />
            </svg>
            <p className="th-axis">
              {([[0, "Day 1"], [2, "Day 3"], [today, "Today"], [7, "Day 8"], [9, "Day 10"]] as Array<[number, string]>).map(([i, l]) => (
                <span key={l} style={{ left: `${(X(i) / 300) * 100}%` } as React.CSSProperties}>{l}</span>
              ))}
            </p>
          </div>

          <div className="th-card th-done th-lift" style={d(4)}>
            <span className="th-tick"><Check size={14} weight="bold" /></span>
            <p><b>Findings report delivered</b><small>Ranked fix list and roadmap, yours to keep.</small></p>
          </div>
        </div>
        {footer && <div className="th-foot th-rise" style={d(5)}>{footer}</div>}
      </div>
    </section>
  );
}
