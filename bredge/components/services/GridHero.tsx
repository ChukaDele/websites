import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { DitherField } from "./DitherField";

/**
 * Service hero after the framed-grid reference: a dark column framed by
 * hairlines (crosshairs where they meet, diagonal hatching outside, a faint
 * dot grid inside); a chip with a blinking cursor, the headline with the
 * call to action on the right, a divider whose bright segment walks across
 * three short columns of text, and a dithered dot field below.
 *
 * Motion: the copy rises in; the divider's segment moves column to column
 * (the column it sits over brightens); the caret blinks; the dot field
 * drifts. Reduced motion: still, first column lit.
 * Sizing: exactly one screen tall; the copy keeps its size and the dot
 * field takes whatever height is left, so it always meets the fold.
 * Styles: app/services.css (`gh-`).
 */
export function GridHero({ eyebrow, title, accent, columns, cta }: {
  eyebrow: string;
  title: string;
  accent: string;
  /** Three short texts under the divider. */
  columns: [string, string, string];
  cta: { label: string; href: string };
}) {
  const d = (i: number) => ({ "--i": i } as React.CSSProperties);
  return (
    <section className="gh" aria-labelledby="gh-title">
      <div className="gh-frame">
        <span className="gh-cross is-tl" aria-hidden="true" />
        <span className="gh-cross is-tr" aria-hidden="true" />

        <div className="gh-top">
          <p className="gh-chip gh-rise" style={d(0)}>{eyebrow}<i className="gh-caret" aria-hidden="true" /></p>
          <div className="gh-titlerow">
            <h1 id="gh-title" className="gh-h1">
              <span className="gh-line"><span style={d(1)}>{title}</span></span>
              <span className="gh-line"><span style={d(2)}>{accent}</span></span>
            </h1>
            <div className="gh-actions gh-rise" style={d(3)}>
              <a className="gh-btn" href={cta.href}>{cta.label} <ArrowUpRight size={14} weight="bold" aria-hidden="true" /></a>
            </div>
          </div>
          <div className="gh-rule" aria-hidden="true"><i /></div>
          <div className="gh-cols">
            {columns.map((c, i) => <p key={i} className="gh-col gh-rise" style={{ "--i": 4 + i, "--c": i } as React.CSSProperties}>{c}</p>)}
          </div>
        </div>

        <div className="gh-field">
          <span className="gh-cross is-bl" aria-hidden="true" />
          <span className="gh-cross is-br" aria-hidden="true" />
          <DitherField className="gh-canvas" />
        </div>
      </div>
    </section>
  );
}
