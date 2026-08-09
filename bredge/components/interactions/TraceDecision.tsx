"use client";

import { useState } from "react";

// Trace a decision backwards to source, then forward again. Interactive
// (hover/focus/click), so it works without scroll and on touch.
const chain: Array<[string, string]> = [
  ["DECISION", "Hold price; fix the leak in mid-market"],
  ["METRIC", "Gross margin, this month vs plan"],
  ["DEFINITION", "Revenue − COGS ÷ revenue, mid-market segment"],
  ["MODEL", "customer_model · orders · cost allocation"],
  ["TRANSFORMATION", "Currency, refunds and timing normalised"],
  ["SOURCE", "Billing, finance ledger, product usage"],
];

export function TraceDecision() {
  const [active, setActive] = useState(0);

  return (
    <div className="trace">
      <p className="trace-hint">Follow the number from the decision back to its source →</p>
      {chain.map(([k, v], i) => (
        <button
          key={k}
          className={`trace-row${i <= active ? " on" : ""}`}
          onMouseEnter={() => setActive(i)}
          onFocus={() => setActive(i)}
          onClick={() => setActive(i)}
          type="button"
        >
          <span className="k">{k}</span>
          <b>{v}</b>
        </button>
      ))}
    </div>
  );
}
