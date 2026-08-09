"use client";

import { useRef } from "react";
import { useMotion } from "../site/useMotion";

const bands: Array<[string, string]> = [
  ["Engineering", ""],
  ["Analytics", ""],
  ["BI & reporting", ""],
  ["Data operations", "ops"],
];

// Each phase describes how capability flexes over one relationship.
const phases = [
  { label: "Foundations", widths: [82, 28, 20, 34] },
  { label: "Reporting push", widths: [40, 46, 84, 40] },
  { label: "Steady operation", widths: [30, 44, 38, 78] },
];

export function ElasticTeam() {
  const rootRef = useRef<HTMLDivElement>(null);

  useMotion(rootRef, ({ gsap, root }) => {
    const fills = gsap.utils.toArray<HTMLElement>(".elastic-fill", root);
    const note = root.querySelector<HTMLElement>(".elastic-note");
    gsap.set(fills, { width: (i: number) => `${phases[0].widths[i]}%` });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: root, start: "top 70%", end: "bottom 60%", scrub: 0.7 },
    });
    phases.slice(1).forEach((phase, p) => {
      fills.forEach((fill, i) => {
        tl.to(fill, { width: `${phase.widths[i]}%`, ease: "power2.inOut", duration: 1 }, p);
      });
      tl.add(() => { if (note) note.textContent = `One relationship · ${phase.label}`; }, p + 0.5);
    });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  });

  return (
    <div ref={rootRef} className="elastic">
      <div className="elastic-core">Your business · one agreed backlog</div>
      <div className="elastic-bands">
        {bands.map(([label, mod], i) => (
          <div className="elastic-band" key={label}>
            <span>{label}</span>
            <div className="elastic-track"><div className={`elastic-fill ${mod}`} style={{ width: `${phases[0].widths[i]}%` }} /></div>
          </div>
        ))}
      </div>
      <p className="elastic-note" aria-hidden="true">One relationship · {phases[0].label}</p>
    </div>
  );
}
