import test from "node:test";
import assert from "node:assert/strict";
import {display,kpi,formatScenario,secondaryPoint} from "../lib/workbench-format.ts";
import {getWorkbench} from "../lib/workbench-data.ts";

test("currency prefixes, large numbers and derived units remain truthful",()=>{
 assert.equal(kpi(36.8,"$M"),"$36.8M");
 assert.equal(kpi(4,"$M"),"$4M");
 assert.equal(kpi(1589,"₦"),"₦1,589");
 assert.equal(kpi(1596.25,"₦/L"),"₦1,596.25/L");
 assert.equal(kpi(14264925.3,"$"),"$14.26M");
 assert.equal(kpi(-14264925.3,"$"),"−$14.26M");
 assert.equal(kpi(179.64,"M"),"179.64M");
 assert.equal(kpi(54.8,"%"),"54.8%");
 assert.equal(display(10.9,"$ million sales"),"$10.9M");
 assert.equal(display(11869.45,"$ sample sales"),"$11,869.45");
 assert.equal(display(-38342,"$ sample sales"),"−$38,342");
 assert.equal(display(79.87,"million subscriptions"),"79.87M");
 assert.equal(display(5.2,"percent churn"),"5.2%");
 assert.equal(formatScenario(-.39,"$M"),"−$390K");
 assert.equal(formatScenario(-.0011,"$M"),"−$1.1K");
 assert.equal(formatScenario(.0034,"$M"),"$3.4K");
 assert.equal(formatScenario(.0000034,"$M"),"$3.4");
 assert.equal(formatScenario(-37568.85,"$"),"−$37,568.85");
 assert.equal(formatScenario(162276000,"₦"),"₦162.28M");
});
test("finance, switching, operations and regional secondary figures have explicit units",()=>{
 const finance=getWorkbench("finance","segment");
 const enterprise=finance.rows.find(x=>x.label==="Enterprise");
 assert.ok(enterprise&&enterprise.secondary<0,"Unprofitable Enterprise sample must remain visible");
 assert.equal(secondaryPoint(finance,enterprise.secondary)?.value,
   display(enterprise.secondary,"$ sample sales"));
 const porting=getWorkbench("telecom","porting");
 assert.equal(secondaryPoint(porting,945)?.label,"Port-outs");
 const supply=getWorkbench("supply","market");
 assert.equal(secondaryPoint(supply,43855)?.value,"43,855");
 const category=getWorkbench("supply","category");
 assert.equal(secondaryPoint(category,.7562208)?.value,"$0.76M");
 const internet=getWorkbench("telecom","states");
 assert.equal(secondaryPoint(internet,18.6)?.value,"18.6M");
});
test("third-party demonstration datasets have original attribution, not invented client ownership",()=>{
 const finance=getWorkbench("finance","product");
 assert.match(finance.source,/Microsoft Power BI Financial Sample/);
 assert.match(finance.sourceURL,/learn\.microsoft\.com/);
 const supply=getWorkbench("supply","market");
 assert.match(supply.source,/DataCo SMART SUPPLY CHAIN/);
 assert.match(supply.source,/CC BY 4\.0/);
 assert.match(supply.sourceURL,/data\.mendeley\.com/);
});
