/**
 * Card text for each portfolio board (name, question, tools, data source).
 * Kept apart from the boards so the Work page sidebar can list every build
 * while only the selected board's code is downloaded.
 */

export const financialPerformanceMeta = {
  name: "Financial Performance Report",
  question: "Does discounting buy us revenue, or does it just burn margin, and where exactly do we lose money?",
  tools: ["Power BI", "Excel", "PostgreSQL", "dbt"],
  source: "Microsoft's public Power BI Financial Sample dataset (sample data) in USD, Sep 2013 to Dec 2014. 2013 covers four months, so year-on-year is shown like for like as well.",
};

export const hrMeta = {
  name: "HR Analytics",
  question: "Who works here, how diverse is the workforce, and why do people leave?",
  tools: ["Power BI", "Excel", "Python", "PostgreSQL"],
  source: "Built on a public HR sample dataset; names removed.",
};

export const hospitalMeta = {
  name: "MedCore HMIS Performance",
  question: "Are admissions, billing, beds and staff keeping pace with demand?",
  tools: ["Power BI", "PostgreSQL", "Python", "Excel"],
  source: "Synthetic hospital data.",
};

export const majorCompaniesMeta = {
  name: "Major Companies Financial Performance",
  question: "Across 12 major public companies, which ones are efficient and which are simply large?",
  tools: ["Power BI", "Python", "Excel", "Snowflake"],
  source: "Public filings, 2009-2022 (2023 partial), via the Kaggle Financial Statements of Major Companies dataset. Figures in USD, nominal. Averages shown both simple and revenue-weighted.",
};

export const marketingMeta = {
  name: "IQ Marketing Performance",
  question: "Which channels, campaign types and audiences earn back their spend, and where does the funnel leak?",
  tools: ["Power BI", "Python", "PostgreSQL", "dbt"],
  source: "Synthetic data in USD, 12 months. Revenue is credited single-touch to each campaign's own channel.",
};

export const saasAnalyticsMeta = {
  name: "SaaS Analytics: revenue, churn and customers",
  question: "Are we growing faster than we are losing customers?",
  tools: ["Power BI", "PostgreSQL", "dbt", "Excel"],
  source: "Synthetic subscription data in USD for three plans, Jan 2024 to Jun 2025. Churn rates on start-of-month customers and MRR.",
};

export const supplyChainMeta = {
  name: "Supply Chain Performance",
  question: "Where are deliveries running late, and what is it costing us?",
  tools: ["Power BI", "Python", "PostgreSQL", "Excel"],
  source: "Built on the public DataCo supply chain sample.",
};
