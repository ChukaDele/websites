export type FinancialRecord={
 id:number;segment:string;country:string;product:string;discountBand:string;
 units:number;manufacturingPrice:number;salePrice:number;gross:number;
 discounts:number;sales:number;cogs:number;profit:number;date:string;month:number;year:number;
};
export type FinanceKey="country"|"product"|"segment"|"discountBand";
export type FinanceFilters={
 year:"all"|"2013"|"2014";
 countries:string[];products:string[];segments:string[];bands:string[];
 month:string|null;
};
export type FinanceAggregate={
 name:string;rows:number;sales:number;profit:number;cogs:number;gross:number;
 discounts:number;units:number;margin:number;discountRate:number;
};
export const defaultFilters:FinanceFilters={year:"all",countries:[],products:[],segments:[],bands:[],month:null};
export const zeroMetrics=()=>({sales:0,profit:0,gross:0,discounts:0,cogs:0,units:0,records:0,margin:0,discountRate:0});
export type FinanceMetrics=ReturnType<typeof zeroMetrics>;
export function aggregate(rows:readonly FinancialRecord[]):FinanceMetrics{
 const totals=zeroMetrics();
 for(const r of rows){totals.sales+=r.sales;totals.profit+=r.profit;totals.gross+=r.gross;totals.discounts+=r.discounts;totals.cogs+=r.cogs;totals.units+=r.units;totals.records++;}
 totals.margin=totals.sales?totals.profit/totals.sales*100:0;
 totals.discountRate=totals.gross?totals.discounts/totals.gross*100:0;
 return totals;
}
export function applyFilters(rows:readonly FinancialRecord[],f:FinanceFilters,ignore:(keyof FinanceFilters)[]=[]):FinancialRecord[]{
 const skipped=new Set(ignore);
 return rows.filter(r=>(skipped.has("year")||f.year==="all"||String(r.year)===f.year)
  &&(skipped.has("countries")||!f.countries.length||f.countries.includes(r.country))
  &&(skipped.has("products")||!f.products.length||f.products.includes(r.product))
  &&(skipped.has("segments")||!f.segments.length||f.segments.includes(r.segment))
  &&(skipped.has("bands")||!f.bands.length||f.bands.includes(r.discountBand))
  &&(skipped.has("month")||!f.month||r.date.slice(0,7)===f.month));
}
export function groupBy(rows:readonly FinancialRecord[],key:FinanceKey):FinanceAggregate[]{
 const groups=new Map<string,FinancialRecord[]>();
 for(const r of rows){const k=r[key];const group=groups.get(k)||[];group.push(r);groups.set(k,group);}
 return [...groups.entries()].map(([name,entries])=>{
  const m=aggregate(entries);
  return {name,rows:m.records,sales:m.sales,profit:m.profit,cogs:m.cogs,gross:m.gross,discounts:m.discounts,units:m.units,margin:m.margin,discountRate:m.discountRate};
 }).sort((a,b)=>b.sales-a.sales||a.name.localeCompare(b.name));
}
export type FinanceMonth={key:string,label:string,sales:number;profit:number;discounts:number;gross:number;rows:number;};
export function monthlySeries(rows:readonly FinancialRecord[]):FinanceMonth[]{
 const buckets=new Map<string,FinancialRecord[]>();
 for(const r of rows){const k=r.date.slice(0,7);const arr=buckets.get(k)||[];arr.push(r);buckets.set(k,arr);}
 return [...buckets.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([key,records])=>{
  const m=aggregate(records);const [year,mon]=key.split("-");
  const label=new Date(Date.UTC(Number(year),Number(mon)-1,1)).toLocaleDateString("en-GB",{month:"short",year:"2-digit",timeZone:"UTC"});
  return {key,label,sales:m.sales,profit:m.profit,gross:m.gross,discounts:m.discounts,rows:m.records};
 });
}
export type MatrixCell={product:string;segment:string;profit:number;sales:number;margin:number;rows:number;};
export function marginMatrix(rows:readonly FinancialRecord[]):MatrixCell[]{
 const byCell=new Map<string,FinancialRecord[]>();
 for(const r of rows){const key=r.product+"::"+r.segment;const a=byCell.get(key)||[];a.push(r);byCell.set(key,a);}
 return [...byCell.entries()].map(([k,rs])=>{
  const [product,segment]=k.split("::");const m=aggregate(rs);
  return {product,segment,profit:m.profit,sales:m.sales,margin:m.margin,rows:m.records};
 });
}
export function financeScenario(rows:readonly FinancialRecord[],discountPoints:number,volumePercent:number){
 const baseline=aggregate(rows);
 const adjustedVolume=Math.max(0,1+volumePercent/100);
 const additionalDiscount=baseline.gross*(discountPoints/100);
 const scenarioSales=(baseline.sales-additionalDiscount)*adjustedVolume;
 const scenarioCost=baseline.cogs*adjustedVolume;
 const scenarioProfit=scenarioSales-scenarioCost;
 return {baselineSales:baseline.sales,baselineProfit:baseline.profit,scenarioSales,
  scenarioProfit,scenarioMargin:scenarioSales?scenarioProfit/scenarioSales*100:0,
  deltaProfit:scenarioProfit-baseline.profit,additionalDiscount:additionalDiscount*adjustedVolume,
  volumeMultiplier:adjustedVolume};
}
export const currency=(value:number,compact=false)=>{
 const abs=Math.abs(value),sign=value<0?"−":"";
 if(compact&&abs>=1_000_000)return sign+"$"+new Intl.NumberFormat("en-US",{maximumFractionDigits:2}).format(abs/1_000_000)+"m";
 if(compact&&abs>=1000)return sign+"$"+new Intl.NumberFormat("en-US",{maximumFractionDigits:1}).format(abs/1000)+"k";
 return sign+"$"+new Intl.NumberFormat("en-US",{maximumFractionDigits:0}).format(abs);
};
export const number=(value:number,maxDigits=0)=>new Intl.NumberFormat("en-US",{maximumFractionDigits:maxDigits}).format(value);
export const pct=(value:number,decimals=1)=>(Number.isFinite(value)?value:0).toFixed(decimals)+"%";
export const orderedProducts=["Amarilla","Carretera","Montana","Paseo","Velo","VTT"] as const;
export const orderedSegments=["Channel Partners","Enterprise","Government","Midmarket","Small Business"] as const;
export const countries=["Canada","France","Germany","Mexico","United States of America"] as const;
export const discountBands=["None","Low","Medium","High"] as const;
export function getFilterCount(f:FinanceFilters){return f.countries.length+f.products.length+f.segments.length+f.bands.length+(f.year==="all"?0:1)+(f.month?1:0)}
export function safeParamFilters(params:URLSearchParams):FinanceFilters{
 const values=(key:string,valid:readonly string[])=>[...new Set((params.get(key)||"").split(",").filter(v=>valid.includes(v)))];
 const year=params.get("year");const month=params.get("month")||null;
 return {year:year==="2013"||year==="2014"?year:"all",countries:values("countries",countries),
  products:values("products",orderedProducts),segments:values("segments",orderedSegments),
  bands:values("bands",discountBands),month:month&&/^201(3|4)-(0[1-9]|1[0-2])$/.test(month)
  &&month>="2013-09"&&month<="2014-12"
  &&(year!=="2013"&&year!=="2014"||month.startsWith(year))?month:null};
}
export function encodeFilterParams(f:FinanceFilters){
 const p=new URLSearchParams();if(f.year!=="all")p.set("year",f.year);
 if(f.countries.length)p.set("countries",f.countries.join(","));
 if(f.products.length)p.set("products",f.products.join(","));
 if(f.segments.length)p.set("segments",f.segments.join(","));
 if(f.bands.length)p.set("bands",f.bands.join(","));
 if(f.month)p.set("month",f.month);
 return p;
}
