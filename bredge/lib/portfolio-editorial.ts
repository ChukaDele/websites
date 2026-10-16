import type {LabId} from "./workbench-data";
/** Screenshots from the owned Bredge dashboard portfolio. These public,
 * interactive alternatives are presentation-only model slices, not confidential
 * client records or a claim that the complete original PBIX is publicly live.
 */
export type PortfolioStudy={
 slug:string;lab:LabId;index:string;sector:string;title:string;lede:string;
 metric:string;metricDescription:string;source:string;
 decision:string;capabilities:string[];who:string;
 narrative:{label:string;heading:string;paragraphs:string[]}[];
 limitations:string[];
};
export const portfolioStudies:readonly PortfolioStudy[]=[
 {
  slug:"finance",lab:"finance",index:"01",sector:"FINANCE & REVENUE OPERATIONS",
  title:"Find the revenue that survives its discount.",
  lede:"A finance dashboard should do more than celebrate sales. Step into a historical sample, separate product and segment performance, and see how sensitive profit is to another point of discounting.",
  metric:"$14.26M",metricDescription:"Canada sample sales represented by the interactive model; full source report shows $118.7M",
  source:"Microsoft Power BI Financial Sample, 2013–2014 (sample data); dashboard designed and analysed by Bredge",
  decision:"What should the CFO review before changing commercial discounts?",
  capabilities:["Revenue modelling","Margin analysis","Segment economics","Decision-ready BI"],
  who:"CFOs · revenue leaders · private equity operating partners",
  narrative:[
   {label:"A BETTER QUESTION",heading:"A sales increase is not a margin strategy.",
    paragraphs:["The original Bredge financial-performance dashboard shows $118.7 million of historical sales, around $17 million of profit and $9.2 million of discounts across its complete model. A high sales total is interesting. It does not establish which customer segments are actually profitable.",
      "The live panel uses only the 18 Canada product-by-segment rows visible in the source report's detail table. Choose Product or Segment, select a bar and change the assumed extra discount. The figures are real transcriptions of that published sample slice, not a fabricated reconstruction of all $118.7 million."]},
   {label:"OPERATOR'S LENS",heading:"Make the uncomfortable comparison.",
    paragraphs:["Enterprise transactions can look large while individual sample rows show negative profit. A management review should ask how margins vary by product and customer channel, which discounts correlate with worthwhile volume, and whether revenue growth is arriving with healthy contribution.",
      "The what-if model subtracts incremental discount from sample profit while holding demand fixed. It is deliberately simple: real price changes may alter demand. The point is to expose a question worth testing, not pretend to have estimated elasticity."]},
  ],
  limitations:["Only 18 visible Canada detail-table entries are modelled here; results cannot be equated with complete company totals.","Discount scenario assumes no demand response and should not be treated as a pricing forecast.","The data originates from a sample demonstration report; it does not describe an identifiable client business."],
 },
 {
  slug:"supply",lab:"supply",index:"02",sector:"SUPPLY CHAIN & OPERATIONS",
  title:"When 55% of deliveries are late, where do you start?",
  lede:"Explore a supply-chain operating view built around regional sales, product categories, order concentration and delivery exposure. Use the assumptions to turn a worrying KPI into a testable operational question.",
  metric:"54.8%",metricDescription:"global late-delivery share reported in the original sample dashboard",
  source:"DataCo SMART SUPPLY CHAIN FOR BIG DATA ANALYSIS (Constante, Silva & Pereira, CC BY 4.0); dashboard designed and analysed by Bredge",
  decision:"What should the COO fix first?",
  capabilities:["Operations analytics","Service-level monitoring","Commercial reporting","Risk prioritisation"],
  who:"COOs · logistics executives · operations improvement teams",
  narrative:[
   {label:"THE OPERATING QUESTION",heading:"A late-delivery rate needs a denominator and an owner.",
    paragraphs:["The Bredge source dashboard reports $36.8 million of sales, around $4.0 million of profit and a 54.8% late-delivery share. The problem is not that a red KPI needs a brighter colour. It is that management needs to know which operating decisions could improve it.",
      "Explore the five reported regions and the ten leading categories. The chart uses actual published aggregates. The scenario deliberately applies a hypothetical percentage-point reduction to the complete displayed order-count denominator. Region-specific lateness was not published, so we do not invent it."]},
   {label:"THE EXECUTION QUESTION",heading:"Don't solve the wrong bottleneck.",
    paragraphs:["Before replacing a carrier or promising customers a shorter SLA, an operations team should reconcile promised versus actual shipping days, identify regional bottlenecks, separate order status from delivery status, and inspect the product/customer mix that drives margin.",
      "A dashboard worth using lets the team move from a global alarm to a defined improvement hypothesis, and says clearly where the source data is not granular enough to justify action."]},
  ],
  limitations:["Global on-time and late rates are not published by region. Any region-specific estimate would be an unsupported extrapolation.","Region sales are rounded in the source PDF and may not add exactly to its enterprise total.","The report is a public demonstration artifact, not evidence of private client performance."],
 },
 {
  slug:"saas",lab:"saas",index:"03",sector:"SAAS & GROWTH INTELLIGENCE",
  title:"Your MRR headline isn't your retention story.",
  lede:"Three plan tiers. Different ARPU, concentration and churn exposure. Explore the snapshot as if you were the company operator deciding what to improve before the next board meeting.",
  metric:"$208K",metricDescription:"monthly recurring revenue in the original sample snapshot",
  source:"Bredge SaaS Analytics historical demonstration dashboard",
  decision:"Which retention lever deserves attention first?",
  capabilities:["Subscription analytics","Revenue retention","Cohort thinking","Board reporting"],
  who:"SaaS founders · CROs · investors · growth operators",
  narrative:[
   {label:"THE COMMERCIAL QUESTION",heading:"Customers are not interchangeable units.",
    paragraphs:["The sample dashboard reports 832 active subscriptions, approximately $207,950 of MRR and a 4.98% customer churn rate. Enterprise represents 273 of those accounts but $136,500 of MRR; Basic has 269 accounts but only $13,450 of MRR.",
      "The difference is the point: a customer count does not tell you where retained revenue sits. Select MRR, Customers or Churn. Then adjust an assumed improvement in churn and inspect the illustrative revenue preserved using each plan's published ARPU."]},
   {label:"THE ANALYTICAL CAUTION",heading:"A snapshot cannot prove a retention trend.",
    paragraphs:["A useful revenue-retention dashboard distinguishes gross customer churn, revenue churn, expansion, new business and cohort effects. The source PDF provides reliable plan-level snapshot values but not every underlying monthly transaction. We do not manufacture missing monthly series.",
      "The interactive model answers a narrower question: how much monthly recurring revenue might be exposed if churn improved by a defined number of percentage points, holding plan size and ARPU fixed? Management would still need cohort-level data to make a real forecast."]},
  ],
  limitations:["Plan-level figures are a historical demonstration snapshot, not a live subscription database.","The churn scenario assumes existing ARPU and headcount remain constant, so it is not a retention forecast.","Different churn, expansion and revenue recognition definitions could change the actual financial effect."],
 },
];
export const portfolioBySlug=Object.fromEntries(portfolioStudies.map(s=>[s.slug,s])) as Record<string,PortfolioStudy>;
