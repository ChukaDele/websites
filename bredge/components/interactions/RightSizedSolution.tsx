"use client";

import { useRef } from "react";
import { useMotion } from "../site/useMotion";

const messy = [
  ["“Numbers don’t match across systems”", -2],
  ["“Reporting is all manual”", 1.5],
  ["“Nobody trusts the dashboard”", -1],
  ["“Forecasts keep missing”", 2],
];

const solution = [
  ["Three SQL models", false],
  ["One reconciled metric definition", false],
  ["One dashboard people trust", true],
];

export function RightSizedSolution() {
  const rootRef = useRef<HTMLDivElement>(null);

  useMotion(rootRef, ({ gsap, root }) => {
    const evalBox = root.querySelector<HTMLElement>(".rs-eval");
    const solved = gsap.utils.toArray<HTMLElement>(".rs-solution .chip", root);
    gsap.set(solved, { autoAlpha: 0, y: 10 });
    gsap.set(evalBox, { autoAlpha: 0 });

    const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: "top 68%", once: true } });
    tl.to(evalBox, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0.1)
      .to(solved, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.12, ease: "power2.out" }, 0.45);
    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  });

  return (
    <div ref={rootRef} className="rightsize">
      <div className="rs-col rs-messy">
        {messy.map(([label, r]) => (
          <div className="chip" key={label as string} style={{ ["--r" as string]: `${r}deg` }}>{label}</div>
        ))}
      </div>
      <div className="rs-arrow" aria-hidden="true">→</div>
      <div className="rs-col rs-solution">
        <div className="rs-eval"><span>BREDGE SIZES IT</span><b>Engineering? Analytics? BI? Just enough.</b></div>
        {solution.map(([label, solid]) => (
          <div className={`chip${solid ? " solid" : ""}`} key={label as string}>{label}</div>
        ))}
      </div>
    </div>
  );
}
