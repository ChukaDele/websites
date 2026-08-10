"use client";
export function PrintButton() {
  return <button type="button" className="text-link resource-print" onClick={() => window.print()}>Print or save as PDF <span className="arrow" aria-hidden="true">↗</span></button>;
}
