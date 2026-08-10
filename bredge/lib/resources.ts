/* Standalone, ungated linkable resources. Each is a genuinely useful checklist
 * or decision aid that also points to the deeper Insight article. */
export type Resource = {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  intro: string;
  kind: "Checklist" | "Decision guide" | "Map";
  article: string; // related Insight slug
  sections: { heading?: string; steps: string[] }[];
};

export const resources: Resource[] = [
  {
    slug: "revenue-reconciliation-checklist",
    title: "Revenue reconciliation checklist",
    seoTitle: "Revenue Reconciliation Checklist (Free) | The Bredge",
    seoDescription: "A free, printable checklist for reconciling revenue when Finance, Sales and billing numbers disagree: definition, time range, grain, record matching and difference classes.",
    intro: "Run this before anyone rebuilds a report. It reconciles two revenue figures at record level and classifies every difference, so you fix the cause rather than the chart.",
    kind: "Checklist",
    article: "why-dashboards-disagree",
    sections: [
      { steps: [
        "Write the metric definition in one sentence, including the event that counts as revenue and the date it is recognised.",
        "Pull both source totals for the exact same time range, using the same start and end boundaries.",
        "Compare the refresh timestamp of each source so you are not comparing stale data with live data.",
        "State the grain of each dataset: what does one row represent (an invoice line, an order, a customer, a month)?",
        "Match records, not just totals: join the two sources on a shared key and compare row by row.",
        "Classify every difference by type: timing, identity, scope, duplication, currency, grain, definition.",
        "For each class, decide the single owner and the single place the fix belongs (source, model, or definition).",
      ] },
    ],
  },
  {
    slug: "data-quality-checklist",
    title: "Critical-data quality checklist",
    seoTitle: "Data Quality Checklist (Free) | The Bredge",
    seoDescription: "A free data-quality checklist covering completeness, uniqueness, validity, referential integrity, freshness and reconciliation for the data your decisions depend on.",
    intro: "Reliable does not mean it looks right in a chart. It means the data passes explicit checks that someone owns. Run these against the few datasets your decisions actually depend on.",
    kind: "Checklist",
    article: "is-our-data-reliable",
    sections: [
      { heading: "Pick the critical data first", steps: [
        "List the few datasets that directly feed decisions or external reporting. Check those, not everything.",
      ] },
      { heading: "Run six checks on each", steps: [
        "Completeness: are required fields and expected rows all present?",
        "Uniqueness: are there unintended duplicate business keys?",
        "Validity: do values conform to the expected type, range and allowed set?",
        "Referential integrity: does every child row point to a valid parent key?",
        "Freshness: is the data recent enough for the decision it supports?",
        "Reconciliation: do independent sources agree at record level, not just on totals?",
        "Record the owner for each dataset and where failures are alerted.",
      ] },
    ],
  },
  {
    slug: "data-warehouse-readiness",
    title: "Data warehouse readiness checklist",
    seoTitle: "Data Warehouse Readiness Checklist (Free) | The Bredge",
    seoDescription: "A free readiness checklist to decide whether you actually need a data warehouse yet, or whether better SQL, a managed connector or a semantic model is enough.",
    intro: "A warehouse solves specific problems. Answer these before you build one. If most answers are no, a simpler option is usually cheaper and faster.",
    kind: "Checklist",
    article: "before-you-build-a-data-warehouse",
    sections: [
      { steps: [
        "How many separate sources must be combined to answer your core questions?",
        "How often must that combined view refresh: monthly, daily, or intra-day?",
        "How many people or tools consume the result, and do they need consistent definitions?",
        "Do metric definitions need to be governed once, centrally, rather than per report?",
        "Is there a named owner who will run and maintain the platform?",
        "What actually breaks today that a warehouse would fix, and could better SQL or a managed connector fix it instead?",
      ] },
    ],
  },
  {
    slug: "first-data-hire-decision-tree",
    title: "First data hire decision guide",
    seoTitle: "First Data Hire Decision Guide (Free) | The Bredge",
    seoDescription: "A free decision guide for your first data hire: analyst vs analytics engineer vs data engineer, and when a project or embedded team fits better than hiring.",
    intro: "Your first data move should follow the constraint that is actually blocking decisions, not a generic org chart. Work through these to point at a role or an alternative.",
    kind: "Decision guide",
    article: "when-to-hire-a-data-team",
    sections: [
      { steps: [
        "Is the bottleneck answering business questions and building reports? That points to an analyst.",
        "Is the bottleneck untrustworthy, unmodelled data and undefined metrics? That points to an analytics engineer.",
        "Is the bottleneck moving and integrating data reliably between systems? That points to a data engineer.",
        "Is the need continuous, or is it a defined one-off outcome? A defined outcome may be a project, not a hire.",
        "Is there someone senior to manage and direct a new hire? If not, an embedded or fractional team de-risks the start.",
        "Would hiring one person to do all three jobs set them up to fail? If yes, sequence the capability instead.",
      ] },
    ],
  },
  {
    slug: "reporting-automation-map",
    title: "Monthly reporting automation map",
    seoTitle: "Monthly Reporting Automation Map (Free) | The Bredge",
    seoDescription: "A free map for automating monthly management reporting safely: separate mechanical steps from judgement, decide what moves upstream and keep it auditable.",
    intro: "Map the report before you automate it, so automation removes effort without hiding fragility. Fill this in for one monthly report.",
    kind: "Map",
    article: "automate-monthly-reporting",
    sections: [
      { steps: [
        "List every input source the report needs and who owns each one.",
        "For each step, mark whether it is mechanical and repeatable, or a judgement call.",
        "Note the refresh timing each source needs and the close cut-off the report runs to.",
        "Identify manual joins and lookups that repeat every month: these are transformations waiting to be written once.",
        "Identify single points of failure: steps only one person understands.",
        "Mark what must be auditable, and where a human review must stay before distribution.",
        "Move mechanical steps upstream into tested logic; keep Excel for the last-mile judgement and presentation.",
      ] },
    ],
  },
  {
    slug: "data-diagnostic-checklist",
    title: "Data diagnostic checklist",
    seoTitle: "Data Diagnostic Checklist (Free) | The Bredge",
    seoDescription: "A free data diagnostic checklist to inventory a messy data stack, then prioritise by impact and effort so you fix the right thing first.",
    intro: "When everything feels broken, sequence matters more than ambition. Inventory the mess, then score each issue by impact and effort to decide what to fix first.",
    kind: "Checklist",
    article: "what-to-fix-first",
    sections: [
      { heading: "Inventory", steps: [
        "Business questions: which questions must be answerable, and can they be answered today?",
        "Source inventory: what systems hold the data, and who owns each?",
        "Reporting: where do current reports come from, and how much manual work goes into each?",
        "Definitions: do key metrics have agreed, documented definitions?",
        "Identity: is a customer or entity represented consistently across systems?",
        "Quality, lineage, freshness: is the data trustworthy, traceable and recent enough?",
        "Ownership, skills, cost, security: who owns outcomes, and what constrains change?",
      ] },
      { heading: "Prioritise", steps: [
        "Score each finding by impact (does it block or distort decisions) and effort (time, risk, dependencies).",
        "Sequence foundational fixes (definitions, identity) before surface fixes (dashboards): they make later work cheaper.",
      ] },
    ],
  },
];

export function getResource(slug: string) {
  return resources.find((r) => r.slug === slug);
}
