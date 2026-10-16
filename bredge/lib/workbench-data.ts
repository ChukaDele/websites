/**
 * Server-only public presentation aggregates.
 *
 * We never ship uploaded PBIX, PBIT, Power Query source definitions, source
 * connections or line-level client records. This file contains small, audited
 * public-data aggregates and transparent illustrative dashboard slices.
 *
 * Every value is an observation from the labelled source PDF, not a current
 * market price or an implied foreign investment return. Category filters
 * affect only the available observed rows, NOT a reconstructed full dataset.
 */
export type LabId = "fuel" | "diet" | "telecom" | "finance" | "supply" | "saas";
export type ViewRow = { label: string; value: number; secondary?: number };
export type LabResponse = {
  dataset: LabId;
  view: string;
  units: string;
  title: string;
  subtitle: string;
  rows: ViewRow[];
  periods?: { label: string; value: number }[];
  note: string;
  coverage: string;
  source: string;
  sourceURL?: string;
  reportedDate: string;
  isSample: boolean;
  totals?: { label: string; value: number; unit: string }[];
  scenario: { title: string; min: number; max: number; step: number; initial: number; unit: string; calculation: string };
};

const source = {
  fuel:"NBS Premium Motor Spirit (Petrol) Price Watch, May 2026",
  diet:"NBS/GAIN Cost of a Healthy Diet, April 2026",
  telecom:"NBS Telecoms Data / NCC administrative records, Q4 2025",
  finance:"Microsoft Power BI Financial Sample (public sample data), visualised in Bredge Financial Performance Report",
  supply:"DataCo SMART SUPPLY CHAIN (Constante, Silva & Pereira, CC BY 4.0), visualised in a Bredge demo dashboard",
  saas:"Bredge SaaS Analytics sample dashboard",
} as const;

const url = {
  fuel:"https://microdata.nigerianstat.gov.ng/index.php/catalog/157/related-materials",
  diet:"https://microdata.nigerianstat.gov.ng/index.php/catalog/146/related-materials",
  telecom:"https://microdata.nigerianstat.gov.ng/index.php/catalog/179/related-materials",
  finance:"https://learn.microsoft.com/en-us/power-bi/create-reports/sample-financial-download",
  supply:"https://data.mendeley.com/datasets/8gx2fvg2k6/5",
} as const;

const fuelStates:ViewRow[]=[
  {label:"Edo",value:1722.91},{label:"Bauchi",value:1715.47},
  {label:"Benue",value:1698.57},{label:"Gombe",value:1686.37},
  {label:"Delta",value:1667.68},{label:"Kogi",value:1534.32},
  {label:"Anambra",value:1519.72},{label:"Sokoto",value:1489.33},
  {label:"Katsina",value:1470.63},{label:"Adamawa",value:1469.83},
];
const fuelZones:ViewRow[]=[
  {label:"South South",value:1623.84},{label:"North East",value:1622.76},
  {label:"South East",value:1593.91},{label:"North Central",value:1589.92},
  {label:"South West",value:1588.96},{label:"North West",value:1564.11},
];
const fuelTime:ViewRow[]=[
  {label:"May 2025",value:1027.76},{label:"Apr 2026",value:1532.93},
  {label:"May 2026",value:1596.25},
];
const dietStates:ViewRow[]=[
  {label:"Ekiti",value:2036},{label:"Imo",value:2018},
  {label:"Bayelsa",value:1909},{label:"Abia",value:1895},
  {label:"Lagos",value:1863},{label:"Borno",value:1383},
  {label:"Nasarawa",value:1371},{label:"Akwa Ibom",value:1314},
  {label:"FCT",value:1278},{label:"Adamawa",value:1143},
];
const dietZones:ViewRow[]=[
  {label:"South East",value:1830},{label:"South West",value:1753},
  {label:"South South",value:1633},{label:"North West",value:1496},
  {label:"North Central",value:1483},{label:"North East",value:1415},
];
const dietBasket:ViewRow[]=[
  {label:"Animal-source foods",value:643},{label:"Starchy staples",value:259},
  {label:"Fruits",value:248},{label:"Vegetables",value:216},
  {label:"Oils and fats",value:117},{label:"Legumes, nuts and seeds",value:106},
];
const dietUrbanRural:ViewRow[]=[
  {label:"Ekiti",value:2218,secondary:1853},
  {label:"Imo",value:2023,secondary:2012},
  {label:"Lagos",value:1938,secondary:1787},
  {label:"Jigawa",value:1337,secondary:1487},
  {label:"FCT",value:1238,secondary:1318},
  {label:"Adamawa",value:1039,secondary:1247},
];
const telecomVoice:ViewRow[]=[
 {label:"MTN",value:93.06},{label:"Airtel",value:60.9},
 {label:"Glo",value:22.2},{label:"9mobile",value:3.2},
];
const telecomInternet:ViewRow[]=[
 {label:"MTN",value:79.87},{label:"Airtel",value:52.0},
 {label:"Glo",value:14.8},{label:"9mobile",value:0.8},
];
const telecomMarkets:ViewRow[]=[
 {label:"Lagos",value:21.58,secondary:18.60},
 {label:"Kano",value:11.3,secondary:9.2},
 {label:"Ogun",value:10.3,secondary:8.9},
 {label:"Kaduna",value:7.9,secondary:6.5},
 {label:"Oyo",value:7.9,secondary:6.6},
 {label:"FCT",value:7.7,secondary:6.5},
 {label:"Delta",value:6.4,secondary:5.6},
 {label:"Rivers",value:6.3,secondary:5.3},
 {label:"Edo",value:5.7,secondary:4.9},
 {label:"Niger",value:5.4,secondary:4.2},
];
const telecomPorting:ViewRow[]=[
 {label:"MTN",value:964,secondary:157},
 {label:"Glo",value:217,secondary:161},
 {label:"Airtel",value:206,secondary:136},
 {label:"9mobile",value:6,secondary:945},
];
const telecomTrend:ViewRow[]=[
 {label:"Voice Q3 2024",value:154.90},
 {label:"Voice Q3 2025",value:173.54},
 {label:"Voice Q4 2025",value:179.64},
 {label:"Internet Q3 2024",value:132.91},
 {label:"Internet Q3 2025",value:140.95},
 {label:"Internet Q4 2025",value:148.17},
];
// These records are an explicit SAMPLE SLICE TRANSCRIBED from the Bredge CFO
// PDF table (Canada only). They do not represent the entire $118.7M dataset.
const financeSamples=[
 ["Amarilla","Channel Partners",67177.6,8200.4,48333],
 ["Amarilla","Enterprise",371647.5,41352.5,-24833],
 ["Amarilla","Government",2579791.8,204711.2,520947],
 ["Amarilla","Midmarket",44741,5861.5,11006],
 ["Amarilla","Small Business",792408,48792,91408],
 ["Carretera","Channel Partners",110610.2,6605.8,81306],
 ["Carretera","Enterprise",356716.3,38096.3,-22304],
 ["Carretera","Government",1332156.7,63773.4,307812],
 ["Carretera","Midmarket",126091.2,14803.8,32161],
 ["Carretera","Small Business",684630,92370,37130],
 ["Montana","Channel Partners",55561.3,2506.7,41044],
 ["Montana","Enterprise",376312.5,0,15053],
 ["Montana","Government",829859.9,128219.1,129630],
 ["Montana","Midmarket",57994.8,6010.2,15325],
 ["Montana","Small Business",1392190.5,133459.5,120816],
 ["Paseo","Channel Partners",165020,12472,120647],
 ["Paseo","Enterprise",965142.5,46732.5,-6258],
 ["Paseo","Government",3956873.5,299611.6,861733],
] as const;
const supplyMarkets:ViewRow[]=[
 {label:"Europe",value:10.9,secondary:43855},
 {label:"LATAM",value:10.3,secondary:47084},
 {label:"Pacific Asia",value:8.3,secondary:32533},
 {label:"USCA",value:5.1,secondary:23562},
 {label:"Africa",value:2.3,secondary:10603},
];
const supplyCategories:ViewRow[]=[
 {label:"Fishing",value:6.9296537,secondary:.7562208},
 {label:"Cleats",value:4.4319428,secondary:.4946369},
 {label:"Camping & Hiking",value:4.1184256,secondary:.4274556},
 {label:"Cardio Equipment",value:3.6948432,secondary:.3830111},
 {label:"Women's Apparel",value:3.1478,secondary:.350421},
 {label:"Water Sports",value:3.1138447,secondary:.325147},
 {label:"Men's Footwear",value:2.8917577,secondary:.3119028},
 {label:"Indoor/Outdoor Games",value:2.8889939,secondary:.3184514},
 {label:"Shop By Sport",value:1.309522,secondary:.129814},
 {label:"Computers",value:.663,secondary:.0696568},
];
const saasPlan:ViewRow[]=[
 {label:"Enterprise",value:136500,secondary:273},
 {label:"Pro",value:58000,secondary:290},
 {label:"Basic",value:13450,secondary:269},
];
const saasChurn:ViewRow[]=[
 {label:"Enterprise",value:4.48,secondary:95.52},
 {label:"Pro",value:4.58,secondary:95.42},
 {label:"Basic",value:5.9,secondary:94.1},
];

export const views:Record<LabId,readonly {id:string;name:string}[]> = {
 fuel:[{id:"states",name:"State prices"},{id:"zones",name:"Regions"},{id:"trend",name:"Price history"}],
 diet:[{id:"states",name:"State affordability"},{id:"zones",name:"Regions"},{id:"basket",name:"Food basket"},{id:"urban",name:"Urban vs rural"}],
 telecom:[{id:"voice",name:"Voice networks"},{id:"internet",name:"Internet networks"},{id:"states",name:"Market geography"},{id:"porting",name:"Customer switching"},{id:"trend",name:"Observed endpoints"}],
 finance:[{id:"product",name:"Product"},{id:"segment",name:"Customer segment"}],
 supply:[{id:"market",name:"Operating region"},{id:"category",name:"Product category"}],
 saas:[{id:"mrr",name:"Recurring revenue"},{id:"customers",name:"Customers"},{id:"churn",name:"Churn rate"}],
};

function sum(a:number[]):number{return Math.round(a.reduce((x,y)=>x+y,0)*100)/100}
const money=(n:number)=>Math.round(n*100)/100;
const datasetDate:Record<LabId,string>={
 fuel:"May 2026",diet:"April 2026",telecom:"Q4 2025",
 finance:"2013–2014 sample",supply:"Historical sample",saas:"Dashboard snapshot",
};
export function getWorkbench(dataset:LabId, requestedView:string):LabResponse {
 const opts=views[dataset];
 if(!opts)throw Error("Unknown workbench");
 const view=opts.find(v=>v.id===requestedView)?.id||opts[0].id;
 const base={
  dataset,view,source:source[dataset],reportedDate:datasetDate[dataset],
  sourceURL:dataset==="saas"?undefined:url[dataset],
 };
 if(dataset==="fuel"){
  const rows=view==="zones"?fuelZones:view==="trend"?fuelTime:fuelStates;
  return {...base,title:view==="zones"?"Price pressure changes by region":view==="trend"?"Costs moved quickly in twelve months":"A single national average hides very different routes",
    subtitle:"Historical average pump prices; select any bar to inspect the observed difference from the national benchmark.",
    rows,units:"₦ per litre",note:"May 2026 observations, not current pump prices or a forecast.",
    coverage:view==="states"?"Selected top/bottom ten states shown in the original report, not all 36 states.":view==="zones"?"All six geopolitical zones, as reported.":"Three separately reported national observations.",
    isSample:false,totals:[{label:"National May average",value:1596.25,unit:"₦/L"},{label:"Highest state",value:1722.91,unit:"₦/L"},{label:"Highest–lowest gap",value:253.08,unit:"₦/L"}],
    scenario:{title:"Monthly transport fuel sensitivity",min:250,max:100000,step:250,initial:10000,unit:"litres per month",calculation:"Observed unit price × hypothetical monthly litres. Excludes freight rates, wages, exchange rates, vehicle efficiency and taxes."}};
 }
 if(dataset==="diet"){
  const rows=view==="zones"?dietZones:view==="basket"?dietBasket:view==="urban"?dietUrbanRural:dietStates;
  return {...base,title:view==="basket"?"What makes the basket expensive?":view==="urban"?"Urban does not always cost more":view==="zones"?"Regional affordability diverges":"The cost of a nutritious basket is highly local",
    subtitle:"A modelled minimum-cost healthy diet per adult per day. Select and compare the areas in the underlying report.",
    rows,units:"₦ per adult/day",note:"Not observed spending, purchasing power, actual wages or an inflation rate.",
    coverage:view==="states"?"Five highest and five lowest states from the April report.":view==="urban"?"Six representative urban/rural pairs, not a national census.":view==="zones"?"All six published zonal averages for April 2026, not a forecast of state prices or household spending.":"Six food groups, summing to the national cost-of-diet measure.",
    isSample:false,totals:[{label:"National daily",value:1589,unit:"₦"},{label:"Highest state",value:2036,unit:"₦"},{label:"Lowest state",value:1143,unit:"₦"}],
    scenario:{title:"Illustrative monthly nutrition baseline",min:1,max:50,step:1,initial:4,unit:"adults × 30 days",calculation:"Modelled daily least-cost basket × adults × 30 days. Not the actual food spend or an income-adequacy assessment."}};
 }
 if(dataset==="telecom"){
  const rows=view==="internet"?telecomInternet:view==="states"?telecomMarkets:view==="porting"?telecomPorting:view==="trend"?telecomTrend:telecomVoice;
  const units=view==="porting"?"ported numbers":view==="trend"||view==="states"||view==="voice"||view==="internet"?"million subscriptions":"subscriptions";
  return {...base,title:view==="states"?"Demand clusters around large commercial centres":view==="porting"?"Porting is a signal, not the whole churn story":view==="trend"?"Subscription totals rose between these observed endpoints":"One provider controls over half the subscription base",
    subtitle:"Choose the market lens. These are network subscriptions, not unique individuals or verified spenders.",
    rows,units,note:"Subscription connections ≠ unique consumers or addressable paid users.",
    coverage:view==="states"?"Ten largest reported state markets; voice is primary and internet secondary.":view==="porting"?"Operator number-porting transactions during Q4 2025, not churn.":view==="trend"?"Selected observed endpoints, not a complete reconstructed quarterly time series.":"Q4 2025 operator-level totals as rounded in original report.",
    isSample:false,totals:[{label:"Voice Q4 2025",value:179.64,unit:"M"},{label:"Internet Q4 2025",value:148.17,unit:"M"},{label:"MTN voice share",value:51.81,unit:"%"}],
    scenario:view==="porting"
     ?{title:"Hypothetical share of port-ins retained",min:10,max:100,step:5,initial:80,unit:"% of selected operator port-ins",calculation:"Observed Q4 port-ins × hypothetical retained share. This is not overall network churn or an observed retention measure."}
     :{title:"Hypothetical reachable connection share",min:1,max:20,step:1,initial:5,unit:"% of selected subscriptions",calculation:"Selected observed subscription total × hypothetical reach percentage. A subscription does not imply a unique person, buyer or forecast."}};
 }
 if(dataset==="finance"){
  const groupIndex=view==="segment"?1:0;
  const map=new Map<string,{sales:number;discount:number;profit:number}>();
  for(const record of financeSamples){
   const k=String(record[groupIndex]);
   const old=map.get(k)||{sales:0,discount:0,profit:0};
   old.sales+=record[2];old.discount+=record[3];old.profit+=record[4];map.set(k,old);
  }
  const rows=[...map.entries()].map(([label,v])=>({label,value:money(v.sales),secondary:money(v.profit)})).sort((a,b)=>b.value-a.value);
  return {...base,title:view==="segment"?"Which commercial segments deserve attention?":"Which products actually earn their keep?",
    subtitle:"Interactive sample of the Canada product × segment transaction breakdown shown in the original dashboard; this is not the full business.",
    rows,units:"$ sample sales",note:"Illustrative historic dataset slice only. Source PDF reports $118.7M total sales for the full underlying model; visible sample cells are substantially smaller.",
    coverage:"18 published Canada product-by-segment rows transcribed from one PDF table; all other markets and periods excluded.",isSample:true,
    totals:[{label:"Sample sales",value:money(sum(financeSamples.map(x=>x[2]))),unit:"$"},{label:"Sample profit",value:money(sum(financeSamples.map(x=>x[4]))),unit:"$"},{label:"Sample discount",value:money(sum(financeSamples.map(x=>x[3]))),unit:"$"}],
    scenario:{title:"Discount margin sensitivity",min:0,max:10,step:.5,initial:2,unit:"additional percentage points of sales",calculation:"Baseline sample profit minus incremental discount percentage × sample sales, holding demand constant. Not a causal price elasticity estimate."}};
 }
 if(dataset==="supply"){
  const rows=view==="category"?supplyCategories:supplyMarkets;
  return {...base,title:view==="category"?"Growth can hide weak category economics":"Where is volume creating delivery exposure?",
    subtitle:view==="category"?"Revenue and profit of top product categories in the historical report.":"Published regional sales and order counts from the dashboard, not raw shipment records.",
    rows,units:"$ million sales",note:"The original dashboard reports 54.8% late delivery overall; it does not establish separate late rates by region.",
    coverage:view==="category"?"Ten reported leading product categories from the sample dashboard; other categories and records are omitted.":"Five reported global market groups. Their rounded sales may differ from the complete company total.",
    isSample:true,totals:[{label:"Reported total sales",value:36.8,unit:"$M"},{label:"Reported profit",value:4,unit:"$M"},{label:"Overall late rate",value:54.8,unit:"%"}],
    scenario:view==="category"
      ?{title:"Category margin stress test",min:1,max:20,step:1,initial:5,unit:"% extra cost of selected sales",calculation:"Selected category reported profit less hypothetical cost increase as a percentage of selected sales. This is not a cost forecast or causal effect."}
      :{title:"Delivery-risk reduction scenario",min:1,max:20,step:1,initial:5,unit:"percentage-point reduction",calculation:"Selected region reported order count × hypothetical reduction in late-delivery rate. The all-market rate is not a reported regional rate."}};
 }
 const rows=view==="customers"?saasPlan.map(({label,value,secondary})=>({label,value:secondary||0,secondary:value})):
  view==="churn"?saasChurn:saasPlan;
 return {...base,title:view==="customers"?"How concentrated is the customer base?":view==="churn"?"Retention varies across plan tiers":"MRR is driven by a small premium segment",
   subtitle:"A self-service operating dashboard using the plan-level published sample metrics. Toggle KPI to compare revenue, retention and customer mix.",
   rows,units:view==="customers"?"active customers":view==="churn"?"percent churn":"$ monthly recurring revenue",
   note:"Demonstration sample snapshot, not client financials or a live subscription ledger.",
   coverage:"Three sample plan-level aggregates from the provided SaaS report; trend charts omitted because exact time-series rows were not provided.",isSample:true,
   totals:[{label:"Reported MRR",value:207950,unit:"$"},{label:"Active customers",value:832,unit:""},{label:"Overall churn",value:4.98,unit:"%"}],
   scenario:{title:"Monthly churn-improvement sensitivity",min:.1,max:3,step:.1,initial:.5,unit:"percentage points",calculation:"Selected plan's active subscribers × assumed churn-rate reduction × plan ARPU. Illustrative monthly recurring revenue retained, not a verified forecast."}};
}
export const allowedLabIds:LabId[]=["fuel","diet","telecom","finance","supply","saas"];
