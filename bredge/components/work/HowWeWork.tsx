"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Handshake, Key, MagnifyingGlass, SealCheck, Wrench } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { Picture } from "../site/Picture";

/**
 * How we work, in one section. Five steps, each pairing what we do with what
 * the client gets, because that is what a buyer is really asking: how does it
 * start, what will I see along the way, and what do I own at the end.
 *
 * Dark green panel, centred: the label, lime headline and intro on top; below,
 * a row of step tabs above one light card (after the Callie reference): the
 * active tab is lime and joins the card, which carries the step, a large
 * statement and the illustration with a floating "You get" note. The
 * principles under it, faint rings behind, and "Working rhythm" running
 * along the foot.
 *
 * Desktop (wide and tall enough, motion allowed): the section holds while the
 * page scrolls through one stretch per step; the chips and the progress line
 * track it and clicking a tab jumps there. Elsewhere: a plain stack of cards,
 * every step visible. Styles: app/pages.css (`hw-`).
 */

const STEPS: Array<{ n: string; name: string; we: string; get: string; img?: string }> = [
  { n: "01", name: "Understand", img: "/how/understand.jpg", we: "We start with the decision you need to make, then profile the data before promising anything.", get: "A written list of what is broken, ranked by what it costs you." },
  { n: "02", name: "Agree", img: "/how/agree.jpg", we: "We agree the definitions, the model and the outputs with the people who will use them.", get: "Metric definitions every team signs off, so nobody argues about the number later." },
  { n: "03", name: "Build", img: "/how/build.jpg", we: "We build in visible increments, and you work directly with the people building it.", get: "Something usable inside the first month, not at the end of a long programme." },
  { n: "04", name: "Validate", img: "/how/validate.jpg", we: "We test and reconcile before anything is called done.", get: "Numbers that trace back to a source, with the checks that prove it." },
  { n: "05", name: "Hand over or run", img: "/how/handover.jpg", we: "We keep improving it with you, or leave your team everything it needs to own it.", get: "Runbook, data model, metric dictionary and known limitations, written down." },
];

// One mark per step, for the tabs.
const MARKS: Icon[] = [MagnifyingGlass, Handshake, Wrench, SealCheck, Key];

const PRINCIPLES = ["Start with the decision", "Show the logic", "Resolve disagreement", "Test before trust", "Build for operation", "Document the edges"];
const PIN_QUERY = "(min-width: 901px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)";

function Art({ step }: { step: (typeof STEPS)[number] }) {
  if (step.img) return <Picture src={step.img} srcWidth={1024} sizes="(max-width: 900px) 100vw, 720px" alt="" width={720} height={720} />;
  // Drawn stand-in in the same style until its illustration is generated.
  return <span className="hw-art-drawn" aria-hidden="true"><i /><i /></span>;
}

export function HowWeWork() {
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(PIN_QUERY);
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = trackRef.current;
      if (!el || !mq.matches) return;
      const r = el.getBoundingClientRect();
      const run = el.offsetHeight - window.innerHeight;
      const p = Math.min(0.999, Math.max(0, -r.top / Math.max(1, run)));
      setActive(Math.floor(p * STEPS.length));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    const sync = () => { setPinned(mq.matches); onScroll(); };
    sync();
    mq.addEventListener("change", sync);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); mq.removeEventListener("change", sync); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  // Pinned: jump the page to that step's stretch. Otherwise just show it.
  const go = (i: number) => {
    const el = trackRef.current;
    if (!pinned || !el) { setActive(i); return; }
    const run = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY + run * ((i + 0.5) / STEPS.length);
    window.scrollTo({ top, behavior: "smooth" });
  };

  const s = STEPS[active];

  return (
    <section className={`hw${pinned ? " is-pinned" : ""}`} aria-labelledby="hw-title">
      <div className="hw-track" ref={trackRef} style={{ "--steps": STEPS.length } as React.CSSProperties}>
        <div className="hw-stage">
          <span className="hw-rings" aria-hidden="true"><i /><i /><i /><i /></span>

          <div className="hw-grid section-wrap">
            <header className="hw-head">
              <p className="hw-label"><i aria-hidden="true" />How we work</p>
              <h2 id="hw-title">A working rhythm, not a black box.</h2>
              <p className="hw-sub">No black box and no account-management telephone game. Five steps, and at each one you know what you get.</p>
            </header>

            {/* Tabs above one card (after the Callie reference): the active tab
                is lime and joins the card; scrolling steps through them. */}
            <div className="hw-tabbed">
              <div className="hw-tabs" role="tablist" aria-label="The five steps">
                {STEPS.map((x, i) => {
                  const M = MARKS[i];
                  return (
                    <button key={x.n} type="button" role="tab" id={`hw-tab-${i}`} aria-controls="hw-panel" aria-selected={i === active} aria-label={`Step ${x.n}: ${x.name}`} className={i === active ? "is-on" : undefined} onClick={() => go(i)}>
                      <M size={20} weight="bold" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
              <article className="hw-card" id="hw-panel" role="tabpanel" aria-labelledby={`hw-tab-${active}`} aria-live="polite">
                <p className="hw-tag"><span className="hw-tag-mark" aria-hidden="true">{(() => { const M = MARKS[active]; return <M size={13} weight="bold" />; })()}</span>{s.name}<small>{s.n} / 05</small></p>
                <h3 key={s.n} className="hw-we">{s.we}</h3>
                <div className="hw-art">
                  <Art step={s} />
                  <p className="hw-get" key={`g${s.n}`}><span>You get</span>{s.get}</p>
                </div>
              </article>
            </div>
          </div>

          {/* Unpinned (phones, short screens, reduced motion): every step as a card. */}
          <ol className="hw-stack section-wrap">
            {STEPS.map((x) => (
              <li key={x.n} className="hw-card">
                <p className="hw-tag">{x.name}<small>{x.n} / 05</small></p>
                <h3 className="hw-we">{x.we}</h3>
                <div className="hw-art">
                  <Art step={x} />
                  <p className="hw-get"><span>You get</span>{x.get}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="hw-principles section-wrap" aria-label="Principles">
            {PRINCIPLES.map((p) => <span key={p}><Check size={12} weight="bold" aria-hidden="true" />{p}</span>)}
          </p>

          {/* "Working rhythm" running along the foot of the section. */}
          <div className="hw-ticker" aria-hidden="true">
            <div>{[0, 1].map((k) => <span key={k}>{Array.from({ length: 4 }, (_, i) => <b key={i}>Working rhythm</b>)}</span>)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
