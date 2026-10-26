"use client";

import { WorkStudio } from "../landing/WorkStudio";
import { PORTFOLIO, PORTFOLIO_GROUPS } from "./portfolio";

/** The Work page gallery. Client-side, because the builds carry components. */
export function PortfolioStudio() {
  return (
    <WorkStudio
      builds={PORTFOLIO}
      groups={PORTFOLIO_GROUPS}
      walkthrough={false}
      sectionId="portfolio"
      brand="Portfolio"
      fit
      titleAs="h1"
      heading={["Proof you can", "click through."]}
      intro="Client work stays under NDA, so these are our Power BI reports and reference builds, rebuilt on public and synthetic data. Pick one on the left, then filter, drill in and click around."
    />
  );
}
