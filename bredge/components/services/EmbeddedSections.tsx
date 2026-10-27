"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Sections for the Embedded Data Team page, in the grammar of the homepage
 * and Services overview (two-tone heads, white capability-style cards, dark
 * framed bands). Content comes from the page, word for word.
 * Styles: app/services.css (`em-`).
 */

/** Two-tone head: the first sentence muted, the second in ink; optional text on the right. */
export function EmHead({ id, lines, text, rule = true }: { id: string; lines: [string, string?]; text?: string; /** Hairline under the head. */ rule?: boolean }) {
  return (
    <div className={`em-head${text ? "" : " is-solo"}${rule ? "" : " no-rule"}`}>
      <h2 id={id} className="em-h2">
        {lines[1] ? <><span>{lines[0]}</span> {lines[1]}</> : lines[0]}
      </h2>
      {text && <p className="em-text">{text}</p>}
    </div>
  );
}

/* A shared tick while the element is on screen; frozen under reduced motion. */
function useTick(ms: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearInterval(timer);
      if (e.isIntersecting) timer = window.setInterval(() => setTick((t) => t + 1), ms);
    }, { threshold: 0.25 });
    io.observe(el);
    return () => { io.disconnect(); window.clearInterval(timer); };
  }, [ms]);
  return [ref, tick] as const;
}

/**
 * Numbered cards (capability-card style). `live` walks a highlight along them.
 * `ruled`: hairline cells joined edge to edge on the page, the title set
 * large at the top and the text small at the foot, no marker.
 */
export function EmCards({ items, mark = "number", live = false, variant = "cards" }: { items: Array<[string, string]>; mark?: "number" | "dash"; live?: boolean; variant?: "cards" | "ruled" }) {
  const [ref, tick] = useTick(1800);
  const on = live ? tick % items.length : -1;
  return (
    <div ref={ref}>
      <ol className={`em-cards${variant === "ruled" ? " is-ruled" : ""}`} style={{ "--n": items.length } as React.CSSProperties} data-n={items.length}>
        {items.map(([h, p], i) => (
          <li key={h} className={`em-card${i === on ? " is-on" : ""}`}>
            {variant === "cards" && <span className="em-num">{mark === "number" ? String(i + 1).padStart(2, "0") : "—"}</span>}
            <h3>{h}</h3>
            <p>{p}</p>
            {live && <i className="em-card-bar" aria-hidden="true" />}
          </li>
        ))}
      </ol>
    </div>
  );
}
