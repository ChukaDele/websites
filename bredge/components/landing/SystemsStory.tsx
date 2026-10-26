"use client";

import { useEffect, useRef } from "react";

/**
 * "Five systems. Five customer counts. One board meeting." (Second Direction)
 *
 * The week before a board meeting, drawn as a timeline (after the milestone
 * timeline reference). Pinned and scrubbed: the axis draws left to right and
 * each day appears as the playhead reaches it.
 *
 *  Above the axis  Each system reports its customer count, one per day, in
 *                  its own colour: Product, Billing, CRM, Support, Finance.
 *  Below the axis  What happens because of it, in mono type.
 *  At the arrow    The board meeting: "Which number is right?", and the
 *                  decision about the business, struck through.
 *
 * The days and the notes below the axis are illustrative; the counts are the
 * section's own figures. Reduced motion shows the whole week.
 */

type Up = { kind: "up"; x: number; lvl: number; day: string; label: string; color: string };
type Down = { kind: "down"; x: number; lvl: number; day: string; text: string };
type Ev = Up | Down;

// x: position along the axis (0–1). lvl: how far from the axis (1–3).
const EVENTS: Ev[] = [
  { kind: "up", x: 0.04, lvl: 1, day: "Monday", label: "Product: 1,842", color: "#e0623a" },
  { kind: "down", x: 0.13, lvl: 3, day: "Monday", text: "Product's count goes\ninto the board pack" },
  { kind: "up", x: 0.22, lvl: 2, day: "Tuesday", label: "Billing: 1,731", color: "#f0ae7a" },
  { kind: "down", x: 0.31, lvl: 2, day: "Tuesday", text: "Billing's is\n111 lower" },
  { kind: "up", x: 0.4, lvl: 1, day: "Wednesday", label: "CRM: 1,809", color: "#f4d64a" },
  { kind: "down", x: 0.49, lvl: 1, day: "Wednesday", text: "Someone rebuilds\nthe spreadsheet" },
  { kind: "up", x: 0.58, lvl: 2, day: "Thursday", label: "Support: 1,795", color: "#7cbf8a" },
  { kind: "down", x: 0.67, lvl: 3, day: "Thursday", text: "Two versions of\nthe board deck" },
  { kind: "up", x: 0.73, lvl: 1, day: "Friday", label: "Finance: 1,764", color: "#8d9cf4" },
];
const MEETING_X = 0.92;

// The headline and microcopy stay put.
const HEADLINE = ["Five systems.", "Five customer counts.", "One board meeting."];
const MICROCOPY = "Product says 1,842. Billing says 1,731. Nobody in the room can tell you which is right, so the meeting becomes an argument about the number instead of a decision about the business. We find out why they differ, fix it at the source, and give every team one number it can defend.";

// Timeline length in timeline units; each event fires at x * AXIS_T.
const AXIS_T = 9;

export function SystemsStory() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const qa = <T extends Element>(sel: string) => Array.from(root.querySelectorAll(sel)) as T[];
    const q = <T extends Element>(sel: string) => root.querySelector(sel) as T;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const showAll = () => {
      root.classList.add("tl-static");
    };
    if (reduce) { showAll(); return; }

    let disposed = false;
    let revert: (() => void) | undefined;
    (async () => {
      let mods;
      try { mods = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]); } catch { showAll(); return; }
      if (disposed) return;
      const [{ default: gsap }, { ScrollTrigger }] = mods;
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const track = q<HTMLElement>(".tl-track");
        const viewport = q<HTMLElement>(".tl");

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root, start: "top top", end: "+=240%", pin: true, scrub: 0.4, anticipatePin: 1, invalidateOnRefresh: true },
        });

        // The axis draws and the playhead rides its end.
        tl.fromTo(".tl-axis-fill", { scaleX: 0 }, { scaleX: 1, duration: AXIS_T }, 0)
          .fromTo(".tl-playhead", { left: "0%" }, { left: "100%", duration: AXIS_T }, 0);

        // On phones the track is wider than the screen: pan with the playhead.
        tl.to(track, { x: () => -Math.max(0, track.scrollWidth - viewport.clientWidth), duration: AXIS_T }, 0);

        // Each day: leader draws out from the axis, dot pops, then the card settles.
        qa<HTMLElement>(".tl-ev").forEach((ev) => {
          const at = Number(ev.dataset.x) * AXIS_T;
          tl.fromTo(ev.querySelector(".tl-stem"), { scaleY: 0 }, { scaleY: 1, duration: 0.3, ease: "power2.out" }, at)
            .fromTo(ev.querySelector(".tl-dot"), { scale: 0.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.18, ease: "back.out(2)" }, at + 0.22)
            .fromTo(ev.querySelector(".tl-card"), { autoAlpha: 0, y: ev.classList.contains("up") ? 8 : -8 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, at + 0.28);
        });

        // The meeting: the strike lands after everything has arrived.
        // A strike drawn through each line of the decision.
        tl.fromTo(".tl-struck", { backgroundSize: "0% 1.5px" }, { backgroundSize: "100% 1.5px", duration: 0.4, ease: "power2.inOut" }, MEETING_X * AXIS_T + 0.7)
          .to({}, { duration: 0.6 });

      }, root);
      revert = () => ctx.revert();
      ScrollTrigger.refresh();
    })();

    return () => { disposed = true; revert?.(); };
  }, []);

  return (
    <section ref={rootRef} id="story" className="systems-story ss-timeline" aria-labelledby="systems-story-title">
      <div className="ss-frame">
        <div className="tl" aria-label="The week before a board meeting">
          <div className="tl-track">
            <div className="tl-axis"><span className="tl-axis-fill" /><span className="tl-arrow" /><span className="tl-playhead" /></div>
            <ol className="tl-events">
              {EVENTS.map((ev, i) => (
                <li
                  key={i}
                  className={`tl-ev ${ev.kind}`}
                  data-x={ev.x}
                  style={{ "--x": ev.x, "--lvl": ev.lvl, "--c": ev.kind === "up" ? ev.color : undefined } as React.CSSProperties}
                >
                  <span className="tl-stem" />
                  <span className="tl-head">
                    <span className="tl-dot" />
                    <span className="tl-card">
                      <b>{ev.day}</b>
                      {ev.kind === "up" ? <span className="tl-pill">{ev.label}</span> : <span className="tl-note">{ev.text}</span>}
                    </span>
                  </span>
                </li>
              ))}
              <li className="tl-ev up tl-meeting" data-x={MEETING_X} style={{ "--x": MEETING_X, "--lvl": 3 } as React.CSSProperties}>
                <span className="tl-stem" />
                <span className="tl-head">
                  <span className="tl-dot" />
                  <span className="tl-card"><b>Next Monday</b><span className="tl-pill">Board meeting</span></span>
                </span>
              </li>
              <li className="tl-ev down tl-meeting" data-x={MEETING_X} style={{ "--x": MEETING_X, "--lvl": 1 } as React.CSSProperties}>
                <span className="tl-stem" />
                <span className="tl-head">
                  <span className="tl-dot" />
                  <span className="tl-card">
                    <b>Which number is right?</b>
                    <span className="tl-note"><span className="tl-struck">Decision about{"\n"}the business</span></span>
                  </span>
                </span>
              </li>
            </ol>
          </div>
        </div>

        {/* Static copy: the headline top left, one sentence per line; the microcopy top right. */}
        <div className="tl-top">
          <h2 id="systems-story-title" className="tl-h1">
            {HEADLINE.map((line) => <span key={line}>{line}</span>)}
          </h2>
          <p className="tl-mc">{MICROCOPY}</p>
        </div>
      </div>
    </section>
  );
}
