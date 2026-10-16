import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getWorkbench,allowedLabIds,views} from "../lib/workbench-data.ts";
import {enforceWorkbenchQuota} from "../lib/workbench-gate.ts";

test("all six labs expose observed aggregates only, with valid selectable views",()=>{
 assert.deepEqual(allowedLabIds,["fuel","diet","telecom","finance","supply","saas"]);
 for(const id of allowedLabIds)for(const v of views[id]){
  const d=getWorkbench(id,v.id);
  assert.equal(d.dataset,id);assert.equal(d.view,v.id);
  assert.ok(d.rows.length>=3&&d.rows.length<=12);
  assert.ok(d.rows.every(r=>typeof r.label==="string"&&Number.isFinite(r.value)&&r.value>=0));
  assert.ok(d.source.length>25);
  assert.ok(d.scenario.max>d.scenario.min&&d.scenario.initial>=d.scenario.min&&d.scenario.initial<=d.scenario.max);
  assert.ok(d.coverage.length>25&&d.note.length>18);
 }
});

test("fuel and food research reproduce exactly the evidenced original report figures",()=>{
 const f=getWorkbench("fuel","states");
 assert.equal(f.rows.find(r=>r.label==="Edo").value,1722.91);
 assert.equal(f.rows.find(r=>r.label==="Adamawa").value,1469.83);
 assert.equal(getWorkbench("fuel","zones").rows.find(r=>r.label==="South South").value,1623.84);
 assert.equal(getWorkbench("fuel","trend").rows.at(-1).value,1596.25);
 const diet=getWorkbench("diet","basket");
 assert.equal(diet.rows.reduce((x,r)=>x+r.value,0),1589);
 assert.equal(diet.rows.find(r=>r.label==="Animal-source foods").value,643);
 assert.equal(getWorkbench("diet","urban").rows.find(r=>r.label==="Adamawa").secondary,1247);
 assert.match(getWorkbench("diet","states").note,/Not observed spending/);
});
test("telecom connections, operator structure and porting cannot be misrepresented as unique customers",()=>{
 const t=getWorkbench("telecom","voice");
 assert.equal(t.totals[0].value,179.64);
 assert.equal(t.rows.find(r=>r.label==="MTN").value,93.06);
 assert.equal(getWorkbench("telecom","internet").rows.find(r=>r.label==="MTN").value,79.87);
 assert.equal(getWorkbench("telecom","porting").rows.find(r=>r.label==="9mobile").secondary,945);
 assert.match(getWorkbench("telecom","porting").note,/unique consumers/);
});
test("portfolio demonstrators are correctly labelled as historical samples, not customer results",()=>{
 for(const kind of ["finance","supply","saas"]){
  const d=getWorkbench(kind,views[kind][0].id);
  assert.equal(d.isSample,true);
  assert.doesNotMatch(d.coverage,/entire live company|verified client/);
 }
 assert.equal(getWorkbench("saas","mrr").rows.reduce((x,r)=>x+r.value,0),207950);
 assert.equal(getWorkbench("saas","customers").rows.reduce((x,r)=>x+r.value,0),832);
 assert.equal(getWorkbench("supply","market").rows.find(r=>r.label==="Africa").secondary,10603);
 assert.ok(getWorkbench("finance","segment").totals.some(x=>x.label==="Sample sales"));
});
test("public workbench route is read-only, rejects unsupported views and blocks bulk export",()=>{
 const src=readFileSync(new URL("../app/api/workbench/route.ts",import.meta.url),"utf8");
 assert.match(src,/allowedLabIds/);
 assert.match(src,/u.searchParams.size>2/);
 assert.match(src,/view&&!views/);
 assert.match(src,/noindex, nofollow/);
 assert.doesNotMatch(src,/export async function POST|Content-Disposition|pbix/);
});
test("API quota fails closed and uses edge-supplied IP, not a claimed User-Agent",async()=>{
 const url="https://thebredge.com/api/workbench?dataset=saas";
 assert.equal((await enforceWorkbenchQuota(new Request(url)))?.status,503);
 const keys=[];
 const limiter={limit:async ({key})=>{keys.push(key);return {success:true};}};
 assert.equal(await enforceWorkbenchQuota(new Request(url,{headers:{"CF-Connecting-IP":"203.0.113.10","User-Agent":"ChatGPT-User"}}),limiter),null);
 assert.equal(await enforceWorkbenchQuota(new Request(url,{headers:{"CF-Connecting-IP":"203.0.113.10","User-Agent":"curl"}}),limiter),null);
 assert.equal(keys.length,2);assert.equal(keys[0],keys[1]);
 assert.equal((await enforceWorkbenchQuota(new Request(url),{limit:async()=>({success:false})}))?.status,429);
 assert.equal((await enforceWorkbenchQuota(new Request(url),{limit:async()=>{throw Error("edge_down")}}))?.status,503);
 assert.equal(await enforceWorkbenchQuota(new Request("https://thebredge.com/research")),null);
});
