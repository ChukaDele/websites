"use client";

import { useRef } from "react";
import { useMotion } from "../site/useMotion";

const stages: Array<[string, string, string]> = [
  ["SOURCES", "Where the numbers come from", "Product, billing, CRM, finance and operational systems — each with its own version of the customer, the order and the month."],
  ["RECONCILIATION", "Make the sources agree", "Resolve identity, align definitions and explain the differences instead of picking the number that looks right."],
  ["MODELLING", "Build the shared model", "A structured model the whole business can query — not a spreadsheet only one person understands."],
  ["ANALYSIS", "Find what moved, and why", "Segment, compare and investigate until the fall in margin has an explanation, not just a figure."],
  ["REPORTING", "Put it where decisions happen", "A reporting layer built around the question, so the answer is one place — not a Monday-morning rebuild."],
  ["DECISION", "Act with a number you can defend", "Leadership acts on one figure everyone in the room can trace back to source."],
];

export function DecisionTree() {
  const rootRef = useRef<HTMLDivElement>(null);

  useMotion(rootRef, ({ gsap, ScrollTrigger, root }) => {
    const fill = root.querySelector<HTMLElement>(".dtree-fill");
    const items = gsap.utils.toArray<HTMLElement>(".dtree-stage", root);
    const fillTween = gsap.to(fill, {
      height: "100%", ease: "none",
      scrollTrigger: { trigger: root, start: "top 68%", end: "bottom 80%", scrub: 0.6 },
    });
    const st = ScrollTrigger.create({
      trigger: root,
      start: "top 68%",
      end: "bottom 80%",
      scrub: true,
      onUpdate: (self) => {
        const active = Math.floor(self.progress * items.length + 0.0001);
        items.forEach((item, i) => item.classList.toggle("on", self.progress > 0.02 && i <= active));
      },
    });
    return () => { st.kill(); fillTween.scrollTrigger?.kill(); fillTween.kill(); };
  }, "(prefers-reduced-motion: no-preference)");

  return (
    <div ref={rootRef}>
      <div className="dtree-q">
        <span>THE BUSINESS QUESTION</span>
        <b>“Why did gross margin fall this month?”</b>
      </div>
      <div className="dtree">
        <div className="dtree-fill" aria-hidden="true" />
        {stages.map(([k, title, body]) => (
          <div className="dtree-stage" key={k}>
            <span className="k">{k}</span>
            <b>{title}</b>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
