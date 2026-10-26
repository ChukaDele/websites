import type { ReactNode } from "react";

/* Shared explainer blocks so every tool carries both readers:
 * PlainSummary: one line on what a technical result means for the business.
 * Terms: the technical words a tool uses, defined once.
 * DataPersonNote: exact formulas, settings and doc links on the simpler tools. */

export function PlainSummary({ children }: { children: ReactNode }) {
  return <p className="rs-plain"><b>What this means for the business:</b> {children}</p>;
}

export function Terms({ items }: { items: [string, ReactNode][] }) {
  return (
    <details className="rs-terms dd-disclosure">
      <summary>Terms used in this tool</summary>
      <dl>{items.map(([t, d]) => <div key={t}><dt>{t}</dt><dd>{d}</dd></div>)}</dl>
    </details>
  );
}

export function DataPersonNote({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <section id={id ?? "data-person"} className="rs-card rs-dataperson" aria-labelledby={`${id ?? "data-person"}-h`}>
      <header className="rs-card-head">
        <p className="rs-label">For your data person</p>
        <h2 id={`${id ?? "data-person"}-h`}>The exact method, settings and sources</h2>
        <p className="rs-muted">Hand this section to whoever will check the numbers or build the work.</p>
      </header>
      {children}
    </section>
  );
}
