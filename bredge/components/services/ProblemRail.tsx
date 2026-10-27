"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useRef } from "react";
import { useRailScroll } from "./useRailScroll";
import { ArrowDownRight } from "@phosphor-icons/react";

/**
 * "Problems we can own." as a horizontal board, built to the panel-board
 * reference, in black and white: a black board inset on the page, a small
 * two-line label top left, panels split by hairlines that stop short of the
 * edges, repeating three panel types:
 *   A  wide: big number, rule, dotted label, landscape image, title, small
 *      caps text, dotted link bottom right, bottom rule.
 *   B  narrow: big number, rule, the title and text.
 *   C  accent: an inset white card, portrait image on top, small caps text,
 *      dotted label and ↘ at the foot.
 * Sizes are fractions of the board's height (as measured on the reference),
 * so the board looks the same on every screen.
 *
 * Scroll: the section holds the screen (sticky stage) while vertical scroll
 * moves the board right to left; the page carries on only once the last
 * panel is in. Section height = rail overflow + one screen, measured live;
 * transform set from scroll progress on rAF. Phones, short screens and
 * reduced motion: no hold, the panels stack. Styles: app/services.css (`pr-`).
 */

export type RailItem = { title: string; text: string; image?: { src: string; alt: string } };

const KIND = ["a", "b", "c"] as const;

export function ProblemRail({ title, items, link }: { title: string; items: RailItem[]; link: { label: string; href: string } }) {
  const secRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  // Each image drifts a little inside its frame as its panel crosses the screen.
  const mode = useRailScroll(secRef, railRef, useCallback((rail: HTMLElement) => {
    const mid = window.innerWidth / 2;
    rail.querySelectorAll<HTMLElement>(".pr-img").forEach((img) => {
      const r = (img.parentElement as HTMLElement).getBoundingClientRect();
      img.style.setProperty("--px", `${(((r.left + r.width / 2 - mid) / window.innerWidth) * -6).toFixed(2)}%`);
    });
  }, []));

  const n = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <section ref={secRef} className={`pr is-${mode}`} aria-labelledby="pr-title">
      <div className="pr-stage">
        <div className="pr-board">
          <div className="pr-view">
            <div className="pr-rail" ref={railRef}>
              <h2 id="pr-title" className="pr-label">{title}</h2>
              {items.map((it, i) => {
                const kind = KIND[i % 3];
                if (kind === "a") return (
                  <article key={it.title} className="pr-panel is-a">
                    <p className="pr-num" aria-hidden="true">{n(i)}</p>
                    <p className="pr-tag">Problem {n(i)} <i aria-hidden="true" /></p>
                    {it.image && <span className="pr-frame"><img className="pr-img" src={it.image.src} alt={it.image.alt} loading="lazy" /></span>}
                    <h3>{it.title}</h3>
                    <p className="pr-caps">{it.text}</p>
                    <a className="pr-link" href={link.href}>{link.label} <i aria-hidden="true" /></a>
                  </article>
                );
                if (kind === "b") return (
                  <article key={it.title} className="pr-panel is-b">
                    <p className="pr-num" aria-hidden="true">{n(i)}</p>
                    <h3>{it.title}</h3>
                    <p className="pr-caps">{it.text}</p>
                  </article>
                );
                return (
                  <article key={it.title} className="pr-panel is-c">
                    <div className="pr-card">
                      {it.image && <span className="pr-frame"><img className="pr-img" src={it.image.src} alt={it.image.alt} loading="lazy" /></span>}
                      <h3>{it.title}</h3>
                      <p className="pr-caps">{it.text}</p>
                      <p className="pr-foot"><span className="pr-tag">Problem {n(i)} <i aria-hidden="true" /></span><ArrowDownRight size={18} weight="bold" aria-hidden="true" /></p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
