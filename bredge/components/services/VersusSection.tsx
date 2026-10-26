"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Buildings, Check, Minus, UserCircle, UsersThree } from "@phosphor-icons/react";
import type { CompareData } from "./CompareToggle";

/**
 * "Compared with the alternatives", in the page's newer grammar:
 *  Head   Two-tone headline left, one line right (as "What we actually do").
 *  Tabs   Option buttons with icons, lime when selected (as the engagement tabs).
 *  Cards  The chosen alternative on a quiet light card, The Bredge on the dark
 *         card with the top-left glow and fine grid (as the capability-card
 *         hover). Rows line up across both cards (subgrid); a "vs" sits on
 *         the seam.
 * Motion: only the alternative's card swaps, a short rise with a blur that
 * clears (transform/opacity/filter, 240ms ease-out). Keyboard: a real
 * tablist; arrow keys switch. Content comes from the page; nothing added.
 * Styles: app/services.css (`vs-`).
 */

const ICONS = [UserCircle, UsersThree, Buildings];

export function VersusSection({
  data,
  heading = ["Compared with", "the usual alternatives."],
  intro,
  id = "vs-title",
}: { data: CompareData; heading?: [string, string]; intro?: string; id?: string }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const n = data.alternatives.length;

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = (active + (e.key === "ArrowRight" ? 1 : -1) + n) % n;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section className="vs" aria-labelledby={id}>
      <div className="vs-wrap">
        <div className="vs-head">
          <h2 id={id} className="vs-h2"><span>{heading[0]}</span> {heading[1]}</h2>
          {intro && <p className="vs-intro">{intro}</p>}
        </div>

        <div className="vs-tabs" role="tablist" aria-label="Compare an embedded team with">
          {data.alternatives.map((a, i) => {
            const I = ICONS[i % ICONS.length];
            return (
              <button
                key={a}
                ref={(el) => { tabs.current[i] = el; }}
                type="button"
                role="tab"
                id={`vs-tab-${i}`}
                aria-selected={i === active}
                aria-controls="vs-panel"
                tabIndex={i === active ? 0 : -1}
                className={i === active ? "is-on" : undefined}
                onClick={() => setActive(i)}
                onKeyDown={onKey}
              >
                <I size={17} weight={i === active ? "fill" : "bold"} aria-hidden="true" />{a}
              </button>
            );
          })}
        </div>

        <div className="vs-grid" id="vs-panel" role="tabpanel" aria-labelledby={`vs-tab-${active}`} style={{ "--rows": data.rows.length } as React.CSSProperties}>
          <article className="vs-card vs-them">
            <header className="vs-card-head">
              <span className="vs-k">The alternative</span>
              <h3 className="vs-swap" key={`h-${active}`}>{data.alternatives[active]}</h3>
            </header>
            {data.rows.map((r, i) => (
              <div className="vs-row" key={r.label}>
                <span className="vs-label">{r.label}</span>
                <p className="vs-swap" key={`${r.label}-${active}`} style={{ "--i": i + 1 } as React.CSSProperties}>
                  <Minus size={13} weight="bold" aria-hidden="true" />{r.them[active]}
                </p>
              </div>
            ))}
          </article>

          <span className="vs-badge" aria-hidden="true">vs</span>

          <article className="vs-card vs-us">
            <header className="vs-card-head">
              <span className="vs-k">An embedded team</span>
              <h3>{data.usLabel}</h3>
            </header>
            {data.rows.map((r) => (
              <div className="vs-row" key={r.label}>
                <span className="vs-label">{r.label}</span>
                <p><Check size={13} weight="bold" aria-hidden="true" />{r.us}</p>
              </div>
            ))}
          </article>
        </div>
      </div>
    </section>
  );
}
