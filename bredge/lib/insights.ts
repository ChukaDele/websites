/* Published Insights articles — the single source of truth for the index, article
 * heroes, related links, nav and sitemap. Client-voiced titles; SEO language lives
 * in seoTitle/seoDescription and the article bodies. */

export type Category = "Data reliability" | "Data systems" | "Analytics & BI" | "Running a data function";

export type Article = {
  slug: string;
  category: Category;
  title: string;        // client-voiced public H1 / card title
  standfirst: string;   // concise editorial standfirst
  blurb: string;        // shorter index card blurb
  seoTitle: string;
  seoDescription: string;
  date: string;         // published (ISO)
  updated?: string;
  read: string;
  related: [string, string];
  service: { href: string; label: string; note: string };
};

export const articles: Article[] = [
  {
    slug: "why-dashboards-disagree",
    category: "Data reliability",
    title: "Why do Finance and Sales have different revenue numbers?",
    standfirst: "The board pack says £4.2m, CRM says £4.5m, and Finance has a spreadsheet with £4.3m. Every number has an explanation. Here is how to find it — before anyone rebuilds a dashboard.",
    blurb: "Three systems, three revenue numbers, and nobody wants another meeting about which one is right. How to reconcile them, and when it has become a system problem.",
    seoTitle: "Why Finance and Sales Numbers Disagree — Data Reconciliation Guide | The Bredge",
    seoDescription: "Finance and Sales revenue numbers disagree because of grain, timing, identity and definitions — not the chart. A practical reconciliation guide and checklist.",
    date: "2026-07-14",
    read: "9 min read",
    related: ["one-customer-view", "what-to-fix-first"],
    service: { href: "/services/data-projects", label: "how we approach data projects", note: "If your finance, CRM and billing numbers need to reconcile repeatedly rather than once, see how we approach data projects." },
  },
  {
    slug: "when-to-hire-a-data-team",
    category: "Running a data function",
    title: "When do we actually need a data team — and who should we hire first?",
    standfirst: "More data work does not always mean more headcount. How to tell when you have outgrown one analyst, and whether your first move is a hire, a project, or an embedded team.",
    blurb: "Analyst, analytics engineer, or data engineer? Hire, project, or embedded team? A decision guide for your first data capability — without hiring too early.",
    seoTitle: "When to Hire a Data Team — Analyst vs Data Engineer vs Fractional Team | The Bredge",
    seoDescription: "When to hire a data team, who to hire first, and the difference between an analyst, analytics engineer and data engineer — plus fractional and embedded options.",
    date: "2026-07-21",
    read: "8 min read",
    related: ["what-to-fix-first", "before-you-build-a-data-warehouse"],
    service: { href: "/services/embedded-data-team", label: "an embedded data team", note: "If you need consistent progress but not a full internal team yet, this is what an embedded data team is for." },
  },
  {
    slug: "before-you-build-a-data-warehouse",
    category: "Data systems",
    title: "Do we actually need a data warehouse yet?",
    standfirst: "A warehouse solves specific problems. Build it before you have them and you inherit cost and complexity you did not need. The questions that decide whether it is time.",
    blurb: "A warehouse is one answer, not the answer. When better SQL, a managed connector or a semantic model is enough — and the requirements that mean it is genuinely time.",
    seoTitle: "Do You Need a Data Warehouse? A Practical Decision Guide | The Bredge",
    seoDescription: "Do you need a data warehouse yet? A practical readiness checklist covering requirements, the modern data stack, and cases where a warehouse is premature.",
    date: "2026-07-28",
    read: "8 min read",
    related: ["one-customer-view", "what-to-fix-first"],
    service: { href: "/services/data-projects", label: "data warehouse projects", note: "If the readiness checks point to a build, this is how we scope and deliver data warehouse projects." },
  },
  {
    slug: "one-customer-view",
    category: "Data systems",
    title: "Our customer data lives in five systems. How do we get one reliable customer view?",
    standfirst: "CRM, billing, product, finance and support each have their own idea of who a customer is. A single customer view is an identity problem first, and a dashboard problem last.",
    blurb: "Customer 360 is not a dashboard — it is identity resolution across systems. Deterministic vs probabilistic matching, canonical IDs, exceptions, and ongoing ownership.",
    seoTitle: "How to Build One Customer View Across CRM, Billing and Product Data | The Bredge",
    seoDescription: "Build a single customer view across CRM, billing and product data with identity resolution, canonical customer IDs, source precedence and exception handling.",
    date: "2026-08-04",
    read: "10 min read",
    related: ["why-dashboards-disagree", "before-you-build-a-data-warehouse"],
    service: { href: "/services/data-projects", label: "data reconciliation and identity projects", note: "If the same customer has to be resolved across systems reliably every day, this is core to how we deliver data projects." },
  },
  {
    slug: "automate-monthly-reporting",
    category: "Analytics & BI",
    title: "We rebuild the same management report every month. How do we automate it without making it more fragile?",
    standfirst: "Automating a monthly report the wrong way just moves the fragility somewhere you can no longer see it. What to move upstream, what to leave in Excel, and how to keep it auditable.",
    blurb: "Excel is not the enemy. What belongs upstream, what stays in the spreadsheet, and how to automate monthly reporting with review controls and auditability intact.",
    seoTitle: "How to Automate Monthly Management Reporting Safely | The Bredge",
    seoDescription: "Automate monthly management and board reporting without adding fragility — what to move upstream, what Excel should still do, and how to keep it auditable.",
    date: "2026-08-08",
    read: "8 min read",
    related: ["why-dashboards-disagree", "what-to-fix-first"],
    service: { href: "/services/data-projects", label: "reporting automation projects", note: "If the monthly close depends on one person and a fragile workbook, reporting automation is a well-scoped project." },
  },
  {
    slug: "what-to-fix-first",
    category: "Running a data function",
    title: "We know our data setup is messy. What should we fix first?",
    standfirst: "Everything feels broken, so nothing gets fixed. A way to inventory the mess, score it by impact and effort, and choose the one change that makes the next three easier.",
    blurb: "When everything is messy, sequence matters more than ambition. Inventory sources, score issues by impact × effort, and pick the fix that unlocks the rest.",
    seoTitle: "Data Audit and Diagnostic — What to Fix First in a Messy Data Stack | The Bredge",
    seoDescription: "A practical data audit: inventory sources, definitions, identity, quality and ownership, then prioritise by impact and effort to decide what to fix first.",
    date: "2026-08-09",
    read: "9 min read",
    related: ["when-to-hire-a-data-team", "before-you-build-a-data-warehouse"],
    service: { href: "/data-diagnostic", label: "a Data Diagnostic", note: "If you want an outside read on what to fix first, that is exactly what a Data Diagnostic produces." },
  },
  {
    slug: "power-bi-slow",
    category: "Analytics & BI",
    title: "Why is our Power BI dashboard so slow?",
    standfirst: "A slow Power BI report is usually a data-model problem wearing a dashboard costume. Where the time actually goes, and the model choices that fix it.",
    blurb: "Slow visuals are rarely a visual problem. Star schema, high-cardinality columns, DAX, import vs DirectQuery — where the time goes and how to get it back.",
    seoTitle: "Why Is Power BI So Slow? A Data-Model Performance Guide | The Bredge",
    seoDescription: "Power BI is slow usually because of the data model, not the report: star schema, high-cardinality columns, DAX, and import vs DirectQuery. A performance checklist.",
    date: "2026-08-09",
    read: "9 min read",
    related: ["power-bi-warehouse-or-both", "is-our-data-reliable"],
    service: { href: "/services/data-projects", label: "a BI performance project", note: "If the fix is upstream — the model, the refresh, the source — that is a well-scoped BI performance project." },
  },
  {
    slug: "excel-cleaning-automation",
    category: "Analytics & BI",
    title: "We spend days cleaning Excel files before every report. What should we automate first?",
    standfirst: "If you repeat the same clean-up every month, it is a transformation waiting to be written down once. What to automate first, what to fix at source, and what to leave in Excel.",
    blurb: "Repeated manual clean-up is a transformation you have not written down yet. What to move to Power Query or SQL, what to fix at source, and what Excel should keep.",
    seoTitle: "Stop Cleaning Excel Files Every Month — What to Automate First | The Bredge",
    seoDescription: "Automate repeated Excel clean-up safely: what belongs in Power Query or SQL, what to fix at source, quality tests and human review — and what Excel should still do.",
    date: "2026-08-09",
    read: "8 min read",
    related: ["automate-monthly-reporting", "is-our-data-reliable"],
    service: { href: "/services/data-projects", label: "a reporting automation project", note: "If the same clean-up eats days every month, writing it down once is a defined project, not a heroic spreadsheet." },
  },
  {
    slug: "is-our-data-reliable",
    category: "Data reliability",
    title: "How do we know whether our data is actually reliable?",
    standfirst: "Reliable does not mean it looks right in a chart. It means it passes explicit checks — completeness, uniqueness, validity, freshness, reconciliation — that someone owns.",
    blurb: "Reliability is not a feeling; it is a set of checks that pass. Completeness, uniqueness, validity, referential integrity, freshness and reconciliation — and who owns them.",
    seoTitle: "How to Know If Your Data Is Reliable — Data Quality Checks | The Bredge",
    seoDescription: "A practical data-quality framework: completeness, uniqueness, validity, referential integrity, freshness, reconciliation, drift and business-rule tests — with a checklist.",
    date: "2026-08-09",
    read: "9 min read",
    related: ["why-dashboards-disagree", "what-to-fix-first"],
    service: { href: "/data-diagnostic", label: "a Data Diagnostic", note: "If you want the checks defined and running against your data, a Data Diagnostic is where that starts." },
  },
  {
    slug: "power-bi-warehouse-or-both",
    category: "Data systems",
    title: "We need better reporting. Do we need Power BI, a warehouse, or both?",
    standfirst: "\"We need better reporting\" hides three different problems. Separating the reporting layer, the model and the integration tells you what to buy — and in what order.",
    blurb: "Better reporting can mean three different problems. Separate the reporting layer, the model and the integration, and the Power-BI-vs-warehouse question answers itself.",
    seoTitle: "Power BI, a Data Warehouse, or Both? A Reporting Architecture Guide | The Bredge",
    seoDescription: "Do you need Power BI, a data warehouse, or both? Separate the reporting-layer, model and integration problems to decide what to build, and in what order.",
    date: "2026-08-09",
    read: "8 min read",
    related: ["before-you-build-a-data-warehouse", "power-bi-slow"],
    service: { href: "/services/data-projects", label: "data projects", note: "If the answer is an ordered build across model, integration and reporting, that sequencing is what a data project is for." },
  },
];

export const CATEGORIES: Category[] = ["Data reliability", "Data systems", "Analytics & BI", "Running a data function"];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
