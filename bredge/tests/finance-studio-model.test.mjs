import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {applyFilters,aggregate,defaultFilters,financeScenario,groupBy,monthlySeries,marginMatrix,safeParamFilters,encodeFilterParams} from "../lib/finance-studio-model.ts";

const source=JSON.parse(await readFile(new URL("../lib/financial-full-sample.json",import.meta.url),"utf8"));
const records=source.records;
const tolerance=(a,b,epsilon=.1)=>assert.ok(Math.abs(a-b)<epsilon,a+" vs "+b);

test("full Microsoft sample is 700 source-backed transactions with reconciled totals",()=>{
 assert.equal(records.length,700);
 const m=aggregate(records);
 tolerance(m.sales,118726350.26);
 tolerance(m.profit,16893702.25);
 tolerance(m.gross,127931598.5);
 tolerance(m.discounts,9205248.24);
 for(const r of records){
  tolerance(r.gross-r.discounts,r.sales,.07);
  tolerance(r.sales-r.cogs,r.profit,.07);
 }
});
test("year dimension filters accurately; 2013 is a partial year",()=>{
 assert.equal(applyFilters(records,{...defaultFilters,year:"2013"}).length,175);
 assert.equal(applyFilters(records,{...defaultFilters,year:"2014"}).length,525);
 assert.equal(monthlySeries(records).length,16);
 assert.equal(monthlySeries(records)[0].key,"2013-09");
 assert.equal(monthlySeries(records).at(-1).key,"2014-12");
});
test("all independent slicers intersect and preserve source data",()=>{
 const f={...defaultFilters,year:"2014",countries:["Canada"],products:["Paseo"],segments:["Government"],bands:["High"]};
 const selected=applyFilters(records,f);
 assert.ok(selected.length>0);
 for(const r of selected){
  assert.equal(r.year,2014);
  assert.equal(r.country,"Canada");
  assert.equal(r.product,"Paseo");
  assert.equal(r.segment,"Government");
  assert.equal(r.discountBand,"High");
 }
 assert.equal(applyFilters(records,f,["products"]).every(r=>r.product==="Paseo"),false);
});
test("margin matrix and rollups reconcile to the filtered source",()=>{
 const subset=applyFilters(records,{...defaultFilters,countries:["Germany"]});
 const m=aggregate(subset);
 const bySegment=groupBy(subset,"segment");
 tolerance(bySegment.reduce((s,r)=>s+r.sales,0),m.sales);
 const matrix=marginMatrix(subset);
 tolerance(matrix.reduce((s,r)=>s+r.profit,0),m.profit);
 assert.equal(new Set(matrix.map(r=>r.product+"|"+r.segment)).size,matrix.length);
});
test("scenario 0/0 matches baseline; profit follows the documented variable-cost model",()=>{
 const baseline=aggregate(records);
 const unchanged=financeScenario(records,0,0);
 tolerance(unchanged.scenarioProfit,baseline.profit);
 const discounted=financeScenario(records,2,0);
 tolerance(discounted.deltaProfit,-baseline.gross*.02);
 const highVolume=financeScenario(records,0,10);
 tolerance(highVolume.scenarioProfit,baseline.profit*1.1);
});
test("filter URLs roundtrip safely, rejecting unrecognised values",()=>{
 const f={...defaultFilters,year:"2014",products:["Paseo"],countries:["Canada","France"],month:"2014-10"};
 const p=encodeFilterParams(f);
 assert.deepEqual(safeParamFilters(p),f);
 assert.deepEqual(safeParamFilters(new URLSearchParams("year=2026&countries=unknown&month=2030-99")),defaultFilters);
 assert.equal(safeParamFilters(new URLSearchParams("month=2013-02")).month,null);
 assert.equal(safeParamFilters(new URLSearchParams("year=2014&month=2013-11")).month,null);
});
