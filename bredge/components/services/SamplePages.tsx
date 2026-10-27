"use client";

import { useRef, useState, type KeyboardEvent } from "react";

/**
 * /data-diagnostic: "Peek inside". Two illustrative sample pages from the
 * report (ranked fix list, reconciliation) behind tabs, so the visitor sees
 * the format without a long scroll. Illustrative, not client data.
 */

const TABS = ["Ranked fix list", "Reconciliation"] as const;

export function SamplePages() {
  const [active, setActive] = useState(0);
  const [kb, setKb] = useState(false);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = (active + 1) % TABS.length;
    setKb(true);
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="sv-sample">
      <div className="sv-sample-tabs" role="tablist" aria-label="Sample pages">
        {TABS.map((t, i) => (
          <button
            key={t}
            ref={(el) => { tabs.current[i] = el; }}
            type="button"
            role="tab"
            id={`sv-sample-tab-${i}`}
            aria-selected={i === active}
            aria-controls="sv-sample-panel"
            tabIndex={i === active ? 0 : -1}
            className={i === active ? "is-on" : undefined}
            onClick={() => { setKb(false); setActive(i); }}
            onKeyDown={onKey}
          >Sample page: {t.toLowerCase()}</button>
        ))}
      </div>
      <figure className={kb ? "sv-sample-page is-kb" : "sv-sample-page"} id="sv-sample-panel" role="tabpanel" aria-labelledby={`sv-sample-tab-${active}`}>
        <div className="sv-sample-swap" key={active}>
          {active === 0 ? (
            <table>
              <thead><tr><th scope="col">#</th><th scope="col">Issue</th><th scope="col">Impact</th><th scope="col">Effort</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>Monthly revenue is defined three ways across finance, sales and the board pack.</td><td><span className="sv-tag hi">High</span></td><td><span className="sv-tag">Low</span></td></tr>
                <tr><td>2</td><td>Weekly sales report is rebuilt by hand from two CRM exports.</td><td><span className="sv-tag hi">High</span></td><td><span className="sv-tag md">Medium</span></td></tr>
                <tr><td>3</td><td>Customer records duplicated between billing and CRM, with no shared ID.</td><td><span className="sv-tag md">Medium</span></td><td><span className="sv-tag md">Medium</span></td></tr>
              </tbody>
            </table>
          ) : (
            <table>
              <thead><tr><th scope="col">Metric</th><th scope="col">Why the numbers differ</th><th scope="col">Recommendation</th></tr></thead>
              <tbody>
                <tr><td>Revenue</td><td>CRM counts a deal when it’s signed. Finance counts it when it’s invoiced.</td><td>Report invoiced revenue. Show signed deals as pipeline.</td></tr>
                <tr><td>Active customers</td><td>Billing includes paused accounts. The dashboard doesn’t.</td><td>One definition, owned by finance, used in both.</td></tr>
              </tbody>
            </table>
          )}
        </div>
        <figcaption>Illustrative examples of the format, not client data.</figcaption>
      </figure>
    </div>
  );
}
