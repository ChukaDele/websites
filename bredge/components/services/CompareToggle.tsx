"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Check, Minus } from "@phosphor-icons/react";

/**
 * "Compared with the alternatives": pick an alternative (full-time hire,
 * freelancers, a large consultancy) and see it side by side with The Bredge,
 * row by row. One layout for every width, so it works at 375px.
 * Content comes from the page; nothing here adds claims.
 */

export type CompareRow = { label: string; us: string; them: string[] };
export type CompareData = { alternatives: string[]; usLabel: string; rows: CompareRow[] };

export function CompareToggle({ data }: { data: CompareData }) {
  const [active, setActive] = useState(0);
  const [kb, setKb] = useState(false);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = (active + (e.key === "ArrowRight" ? 1 : -1) + data.alternatives.length) % data.alternatives.length;
    setKb(true);
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="sv-cmp">
      <div className="sv-cmp-top">
        <p className="sv-k" id="sv-cmp-label">Compare us with</p>
        <div className="sv-cmp-tabs" role="tablist" aria-labelledby="sv-cmp-label">
          {data.alternatives.map((a, i) => (
            <button
              key={a}
              ref={(el) => { tabs.current[i] = el; }}
              type="button"
              role="tab"
              id={`sv-cmp-tab-${i}`}
              aria-selected={i === active}
              aria-controls="sv-cmp-panel"
              tabIndex={i === active ? 0 : -1}
              className={i === active ? "is-on" : undefined}
              onClick={() => { setKb(false); setActive(i); }}
              onKeyDown={onKey}
            >{a}</button>
          ))}
        </div>
      </div>
      <div className={kb ? "sv-cmp-table is-kb" : "sv-cmp-table"} id="sv-cmp-panel" role="tabpanel" aria-labelledby={`sv-cmp-tab-${active}`}>
        <div className="sv-cmp-row sv-cmp-head" aria-hidden="true">
          <span />
          <span>{data.alternatives[active]}</span>
          <span className="is-us">{data.usLabel}</span>
        </div>
        {data.rows.map((r) => (
          <div className="sv-cmp-row" key={r.label}>
            <span className="sv-cmp-label">{r.label}</span>
            <span className="sv-cmp-them" key={`${r.label}-${active}`}>
              <Minus size={13} weight="bold" aria-hidden="true" />
              <span><b className="sv-cmp-mob">{data.alternatives[active]}: </b>{r.them[active]}</span>
            </span>
            <span className="sv-cmp-us">
              <Check size={13} weight="bold" aria-hidden="true" />
              <span><b className="sv-cmp-mob">{data.usLabel}: </b>{r.us}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
