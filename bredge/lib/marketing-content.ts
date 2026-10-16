/** Source-of-truth homepage copy consumed by both existing Worker and Astro pilot. */
export const problems = [
  ["01", "Your numbers disagree.", "Finance, sales and ops report different versions of the same metric. Every meeting starts by deciding which one is right. (“What’s our actual MRR?” “Which customers are we counting?”)"],
  ["02", "Your reporting is a person, not a system.", "Someone rebuilds the same spreadsheet every Monday. When they’re on leave, the report doesn’t happen."],
  ["03", "You have dashboards. You still need a meeting.", "The chart tells you revenue dropped. It doesn’t tell you which segment, when it started, or who to call."],
  ["04", "The data backlog never moves.", "Your team is at capacity, or there isn’t a team yet. The important work keeps getting pushed behind the urgent work."],
];

export const outcomes = [
  ["Finance", "Where is our cash? Who owes us? What moved against plan?", "Cash flow · Receivables · Profitability · Forecasting · Budget control"],
  ["Product", "What drives activation? Who might churn? Where can we expand?", "Funnels · Cohorts · Retention · Feature adoption · Customer health"],
  ["Revenue", "Where is pipeline leaking? Which accounts are growing? What actually converts?", "Funnel performance · Segmentation · Attribution · Forecasting · Customer economics"],
  ["Operations", "Where are the bottlenecks? What is off-SLA? What should we fix first?", "Process performance · Capacity · SLA monitoring · Exception management"],
];

export const capabilities = [
  ["Data foundations", "Get your data into one place, on a schedule, without anyone babysitting it.", "Pipelines · Warehouses · APIs · SQL · Python · Transformation · Data modelling"],
  ["Analytics", "Work out why a number moved, not just that it moved.", "KPI frameworks · Funnel analysis · Cohorts · Segmentation · Root-cause analysis"],
  ["BI & reporting", "Dashboards people open more than once.", "Power BI · Executive reporting · Operational dashboards · Self-service analytics"],
  ["Data quality & governance", "Make the important numbers defined, traceable and testable.", "Reconciliation · Metric definitions · Quality tests · Data lineage · Documentation"],
  ["Automation & data ops", "Something is watching the pipeline at 6am so you don’t find out at 10.", "Scheduled reporting · Refresh monitoring · Automated workflows · Runbooks · Ongoing improvements"],
];

// Four, not six. 05 (Direct access) now lives in the "Who you'll work with"
// block above, where it has context; 06 (Built to transfer) folded into 04 —
// honesty about limits and honesty about lock-in are the same promise.
export const principles = [
  ["01", "Traceable metrics", "Every number traces back to a source row and a written definition. If you ask where it came from, you get an answer, not a shrug."],
  ["02", "Reconciled systems", "When two systems disagree, the gap becomes a ticket. It doesn’t get quietly averaged away."],
  ["03", "Tests before presentation", "Beautiful reporting is worthless if the logic underneath is wrong."],
  ["04", "Documented, and yours", "We write down where the data stops being reliable instead of pretending every answer has equal confidence. And we document the build well enough that you could replace us."],
];
