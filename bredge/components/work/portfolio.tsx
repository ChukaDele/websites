import { Buildings, ChartLineUp, Coins, FileSql, FirstAidKit, FlowArrow, Megaphone, Truck, UsersThree } from "@phosphor-icons/react";
import { BUILDS, type Build } from "../landing/WorkStudio";
import { lazyPreview } from "../landing/lazyPreview";
import { supplyChainMeta, hospitalMeta, financialPerformanceMeta, majorCompaniesMeta, saasAnalyticsMeta, marketingMeta, hrMeta } from "../portfolio/meta";

// Each board is its own chunk: the Work page downloads only the one on screen
// first, then warms the rest when idle (see WorkStudio).
const PipelineRun = lazyPreview(() => import("../landing/PipelineRun").then((m) => m.PipelineRun));
const ModelPreview = lazyPreview(() => import("../landing/InvisibleQuery").then((m) => m.ModelPreview));
const SupplyChainBoard = lazyPreview(() => import("../portfolio/SupplyChainBoard").then((m) => m.SupplyChainBoard));
const HospitalBoard = lazyPreview(() => import("../portfolio/HospitalBoard").then((m) => m.HospitalBoard));
const FinancialPerformanceBoard = lazyPreview(() => import("../portfolio/FinancialPerformanceBoard").then((m) => m.FinancialPerformanceBoard));
const MajorCompaniesBoard = lazyPreview(() => import("../portfolio/MajorCompaniesBoard").then((m) => m.MajorCompaniesBoard));
const SaaSAnalyticsBoard = lazyPreview(() => import("../portfolio/SaaSAnalyticsBoard").then((m) => m.SaaSAnalyticsBoard));
const MarketingBoard = lazyPreview(() => import("../portfolio/MarketingBoard").then((m) => m.MarketingBoard));
const HRBoard = lazyPreview(() => import("../portfolio/HRBoard").then((m) => m.HRBoard));

/**
 * The portfolio on the Work page: the team's Power BI dashboards rebuilt as
 * interactive reports, grouped by the team that would use them, plus the two
 * pipeline builds. Each says plainly what data it is built on.
 */

type Meta = { name: string; question: string; tools: string[]; source: string };
const from = (id: string, group: string, icon: Build["icon"], meta: Meta, Preview: Build["Preview"]): Build => ({
  id, group, icon, Preview,
  name: meta.name,
  summary: meta.source,
  answers: meta.question,
  sources: [meta.source],
  stack: meta.tools.join(" · "),
  tools: meta.tools,
});

export const PORTFOLIO_GROUPS = ["Finance", "Growth", "Pipelines", "Operations", "People"];

// The homepage builds, under the same team groups.
const home = (id: string, group: string): Build => ({ ...BUILDS.find((b) => b.id === id)!, id: `home-${id}`, group });

export const PORTFOLIO: Build[] = [
  // Order from the simulated visitor panel (21 Oct 2026): finance first, since it owns the problem in every segment.
  from("financial-performance", "Finance", Coins, financialPerformanceMeta, FinancialPerformanceBoard),
  home("cfo", "Finance"),
  from("major-companies", "Finance", Buildings, majorCompaniesMeta, MajorCompaniesBoard),
  from("saas-analytics", "Growth", ChartLineUp, saasAnalyticsMeta, SaaSAnalyticsBoard),
  home("saas", "Growth"),
  from("marketing", "Growth", Megaphone, marketingMeta, MarketingBoard),
  {
    id: "customer-360", group: "Pipelines", icon: FlowArrow, Preview: PipelineRun,
    name: "Customer 360 pipeline",
    summary: "8,941 records from five systems matched at 96.3%, exceptions held for review, tested before it reaches a chart.",
    answers: "Five systems give five customer counts. Which one is right?",
    sources: ["Synthetic data"], stack: "Python · PostgreSQL · Snowflake · dbt", tools: ["Python", "PostgreSQL", "Snowflake", "dbt"],
  },
  {
    id: "customer-health", group: "Pipelines", icon: FileSql, Preview: ModelPreview,
    name: "Customer health model",
    summary: "One row per customer per month, built incrementally (late invoices rebuilt) and covered by six tests.",
    answers: "How healthy is each customer, month by month, and can we trust the number?",
    sources: ["Synthetic data"], stack: "PostgreSQL · BigQuery · Snowflake · dbt", tools: ["PostgreSQL", "BigQuery", "Snowflake", "dbt"],
  },
  from("supply-chain", "Operations", Truck, supplyChainMeta, SupplyChainBoard),
  from("hospital", "Operations", FirstAidKit, hospitalMeta, HospitalBoard),
  from("hr", "People", UsersThree, hrMeta, HRBoard),
];
