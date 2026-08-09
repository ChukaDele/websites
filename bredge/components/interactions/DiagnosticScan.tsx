"use client";

import { useRef } from "react";
import { useMotion } from "../site/useMotion";

// Abstract current-state environment. Flagged nodes become roadmap items.
const nodes: Array<{ label: string; x: number; y: number; flag?: boolean }> = [
  { label: "CRM", x: 8, y: 12 },
  { label: "Billing", x: 60, y: 10, flag: true },
  { label: "Finance.xlsx", x: 30, y: 40, flag: true },
  { label: "Product", x: 72, y: 46 },
  { label: "Manual report", x: 12, y: 68, flag: true },
  { label: "Dashboard", x: 62, y: 76, flag: true },
];

const roadmap: Array<[string, string]> = [
  ["Duplicate sources", "Billing and finance describe the same revenue twice."],
  ["Undefined metrics", "“Active customer” means three different things."],
  ["Manual handoffs", "The Monday report depends on one person’s spreadsheet."],
  ["Single-person dependency", "Only one analyst can rebuild the dashboard."],
];

export function DiagnosticScan() {
  const rootRef = useRef<HTMLDivElement>(null);

  useMotion(rootRef, ({ gsap, root }) => {
    const sweep = root.querySelector<HTMLElement>(".scan-sweep");
    const flags = gsap.utils.toArray<HTMLElement>(".scan-node.flag", root);
    const items = gsap.utils.toArray<HTMLElement>(".scan-item", root);
    gsap.set(flags, { borderColor: "var(--line)", color: "#3c4b46" });

    const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: "top 66%", once: true } });
    tl.fromTo(sweep, { autoAlpha: 0, left: "0%" }, { autoAlpha: 1, duration: 0.2 }, 0)
      .to(sweep, { left: "100%", duration: 1.4, ease: "power1.inOut" }, 0.1)
      .to(sweep, { autoAlpha: 0, duration: 0.3 }, 1.4)
      .to(flags, { borderColor: "var(--warning)", color: "#a9741f", duration: 0.2, stagger: 0.16 }, 0.5)
      .to(items, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.14, ease: "power2.out" }, 1.5);
    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  });

  return (
    <div ref={rootRef} className="scan">
      <div className="scan-map" aria-hidden="true">
        {nodes.map((n) => (
          <div key={n.label} className={`scan-node${n.flag ? " flag" : ""}`} style={{ left: `${n.x}%`, top: `${n.y}%` }}>{n.label}</div>
        ))}
        <div className="scan-sweep" />
      </div>
      <div className="scan-roadmap">
        <p className="k">PRIORITISED FINDINGS</p>
        {roadmap.map(([title, body], i) => (
          <div className="scan-item" key={title}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <div><b>{title}</b><small>{body}</small></div>
          </div>
        ))}
      </div>
    </div>
  );
}
