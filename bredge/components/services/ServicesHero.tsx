import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PixelEdge } from "./PixelEdge";

/**
 * Service hero (Services overview and each service page). The dark field
 * comes from the homepage hero; the foot breaks up into paper-coloured pixels
 * that become the page below, climbing up the right-hand edge. The words come
 * from the page; `facts` is an optional row of short terms under the buttons.
 * Styles: app/services.css (`sh-`).
 */
export function ServicesHero({
  title = "A data team",
  accent = "when you need one.",
  lede = "Data engineering, analytics and BI for UK and US companies: every month, one project at a time, or a two-week diagnostic to find where to start. Every option is a fixed price, agreed in writing.",
  facts,
  eyebrow,
  cta = { label: "Book a 30-minute call", href: "/schedule" },
  secondary = { label: "Ask a question first", href: "/contact" },
  note,
}: {
  title?: string; accent?: string; lede?: string; facts?: string[];
  /** Small label above the headline. */
  eyebrow?: string;
  cta?: { label: string; href: string };
  /** Second link beside the button; null for none. */
  secondary?: { label: string; href: string } | null;
  /** One line of microcopy under the buttons. */
  note?: string;
} = {}) {
  const long = title.length > 12 || accent.length > 18;
  const xlong = accent.length > 28;
  return (
    <section className="sh" aria-labelledby="sh-title">
      <PixelEdge className="sh-pixels" />

      <div className="sh-wrap">
        <div className="sh-copy">
          {eyebrow && <p className="sh-eyebrow sh-rise" style={{ "--i": 0 } as React.CSSProperties}>{eyebrow}</p>}
          <h1 id="sh-title" className={`sh-h1${xlong ? " is-xlong" : long ? " is-long" : ""}`}>
            <span className="sh-line"><span style={{ "--i": 0 } as React.CSSProperties}>{title}</span></span>
            <span className="sh-line"><span style={{ "--i": 1 } as React.CSSProperties} className="sh-accent">{accent}</span></span>
          </h1>
          <p className="sh-lede sh-rise" style={{ "--i": 2 } as React.CSSProperties}>{lede}</p>
          <div className="sh-actions sh-rise" data-pixel-clear style={{ "--i": 3 } as React.CSSProperties}>
            <a className="button" href={cta.href}>{cta.label} <span className="arrow" aria-hidden="true">↗</span></a>
            {secondary && <a className="text-link" href={secondary.href}>{secondary.label} <ArrowUpRight size={14} weight="bold" aria-hidden="true" /></a>}
          </div>
          {note && <p className="sh-note-line sh-rise" style={{ "--i": 4 } as React.CSSProperties}>{note}</p>}
          {facts && (
            <ul className="sh-facts sh-rise" style={{ "--i": 4 } as React.CSSProperties}>
              {facts.map((f) => <li key={f}>{f}</li>)}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
