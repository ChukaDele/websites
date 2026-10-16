/** Original Bredge-authored analysis of public statistical releases.
 * Source facts checked against official NBS collections. These are NOT
 * client results, and Drive document links remain private until approved. */
export type DataBrief = {
  slug: string;
  title: string;
  period: string;
  category: string;
  number: string;
  unit: string;
  comparison: string;
  summary: string;
  decision: string;
  source: string;
  sourceUrl: string;
  provenance: string;
  limitations: string;
};

export const dataBriefs: readonly DataBrief[] = [
  {
    slug: "nigeria-telecoms-q4-2025",
    title: "Nigeria's telecom subscriber base recovered through 2025.",
    period: "Q4 2025", category: "Telecoms",
    number: "179.64M", unit: "active voice subscriptions",
    comparison: "148.17M active internet subscriptions in the same quarter",
    summary: "Our quarterly brief traces the rebound from the Q3 2024 subscriber trough and compares the Q4 2025 market shares, regional distribution and porting flows. The analysis distinguishes a total subscription measure from an individual-customer count.",
    decision: "Useful for market sizing, network coverage and distribution planning.",
    source: "National Bureau of Statistics, Nigerian Telecoms Data Q3–Q4 2025; underlying NCC administrative data",
    sourceUrl: "https://microdata.nigerianstat.gov.ng/index.php/catalog/179/related-materials",
    provenance: "Bredge analysis of publicly published NBS/NCC data, Q4 2025",
    limitations: "Mobile subscriptions are not unique people. Number-porting volumes are small relative to the subscriber base and should not be presented as overall churn.",
  },
  {
    slug: "nigeria-pms-may-2026",
    title: "Petrol prices varied substantially between Nigerian states.",
    period: "May 2026", category: "Energy and logistics",
    number: "₦1,596.25", unit: "national average price per litre",
    comparison: "Edo ₦1,722.91; Adamawa ₦1,469.83",
    summary: "The Bredge fuel-price brief maps state and regional differences in the NBS survey. It compares the national price with the range paid across states, rather than treating a country average as a universal distribution cost.",
    decision: "Useful for logistics budgeting, location-specific operations and scenario planning.",
    source: "National Bureau of Statistics, Premium Motor Spirit (Petrol) Price Watch, May 2026",
    sourceUrl: "https://microdata.nigerianstat.gov.ng/index.php/catalog/157/related-materials",
    provenance: "Bredge analysis of publicly published NBS PMS Price Watch, May 2026",
    limitations: "Survey averages do not describe every pump or predict a current pump price. Values describe May 2026 and must not be presented as today's prices.",
  },
  {
    slug: "nigeria-cohd-april-2026",
    title: "A healthy diet cost ₦1,589 per adult per day nationally.",
    period: "April 2026", category: "Food affordability",
    number: "₦1,589", unit: "average cost of a healthy diet per adult per day",
    comparison: "Ekiti ₦2,036; Adamawa ₦1,143",
    summary: "The Bredge brief compares the national healthy-diet reference cost with state and zonal variation, then shows which food groups contribute most to the estimated total. It keeps a nutritional affordability metric separate from general food inflation.",
    decision: "Useful for affordability analysis, regional comparisons and understanding supply-chain exposure.",
    source: "National Bureau of Statistics and GAIN, Cost of a Healthy Diet, April 2026",
    sourceUrl: "https://microdata.nigerianstat.gov.ng/index.php/catalog/146/related-materials",
    provenance: "Bredge analysis of publicly published NBS Cost of a Healthy Diet data, April 2026",
    limitations: "CoHD is a modelled least-cost measure, not the amount each household actually spends. Month-on-month and year-on-year comparisons are not shown in this public summary. Refer to the original NBS source for published period-on-period changes.",
  },
] as const;
