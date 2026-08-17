"use client";

import { useRef } from "react";
import { useMotion } from "../site/useMotion";

const discs: Array<[string, string]> = [
  ["Engineering", "Pipelines, models, infrastructure"],
  ["Analytics", "Questions, segments, investigation"],
  ["BI", "Reporting, semantic layer, dashboards"],
  ["Business", "Decisions, revenue, operations"],
];

export function DisciplineIntersections() {
  const rootRef = useRef<HTMLDivElement>(null);

  useMotion(rootRef, ({ gsap, root }) => {
    const cards = gsap.utils.toArray<HTMLElement>(".disc", root);
    const mid = root.querySelector<HTMLElement>(".disc-mid");
    gsap.set(mid, { autoAlpha: 0, y: 8 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: "top 70%", once: true } });
    cards.forEach((card, index) => {
      tl.call(() => card.classList.add("on"), undefined, index * 0.14);
    });
    tl.to(mid, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.7);
    return () => {
      cards.forEach((card) => card.classList.remove("on"));
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  });

  return (
    <div ref={rootRef} className="disciplines">
      {discs.map(([label, blurb]) => (
        <div className="disc" key={label}><b>{label}</b><small>{blurb}</small></div>
      ))}
      <div className="disc-mid"><b>The Bredge works in the intersections</b> — where a correct metric meets a real decision.</div>
    </div>
  );
}
