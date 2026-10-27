/* eslint-disable @next/next/no-img-element */
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import { PortalField } from "./PortalField";

/**
 * Service hero after the portal reference: a near-black screen, a glowing
 * lime tile carrying the Bredge "b" a little above centre, light rays
 * converging on it from the left and a stream of data points leaving it to
 * the right (PortalField). Below: a centred two-line serif headline with the
 * closing words in italic, a short lede and a white and a dark button.
 *
 * Motion: the tile settles in, the copy rises in, the field flows. Reduced
 * motion: all still. Styles: app/services.css (`ph-`).
 */
export function PortalHero({ title, accent, italic, lede, primary, secondary, footer }: {
  title: string;
  /** Second line; `italic` is the closing part of it set in italic. */
  accent: string;
  italic?: string;
  lede: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  /** Optional strip along the foot of the hero. */
  footer?: React.ReactNode;
}) {
  const d = (i: number) => ({ "--i": i } as React.CSSProperties);
  const head = italic && accent.endsWith(italic) ? accent.slice(0, -italic.length) : accent;

  return (
    <section className="ph" aria-labelledby="ph-title">
      <PortalField className="ph-field" cy={0.32} />
      <span className="ph-dots" aria-hidden="true" />
      <span className="ph-tile" data-portal-tile aria-hidden="true"><span><img src="/brand/bredge-logo-preloader.webp" alt="" /></span></span>

      <div className="ph-copy">
        <h1 id="ph-title" className="ph-h1">
          <span className="ph-line"><span style={d(0)}>{title}</span></span>
          <span className="ph-line"><span style={d(1)}>{head}{italic && head !== accent && <em>{italic}</em>}</span></span>
        </h1>
        <p className="ph-lede ph-rise" style={d(2)}>{lede}</p>
        <div className="ph-actions ph-rise" style={d(3)}>
          <a className="ph-btn is-light" href={primary.href}>{primary.label}</a>
          <a className="ph-btn" href={secondary.href}>{secondary.label}</a>
        </div>
      </div>
      {footer && <div className="ph-foot ph-rise" style={d(4)}>{footer}</div>}
    </section>
  );
}
