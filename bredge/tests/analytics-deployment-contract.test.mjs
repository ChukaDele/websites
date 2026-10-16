import test from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {readFileSync} from "node:fs";
const yaml=readFileSync(new URL("../../.github/workflows/deploy-bredge.yml",import.meta.url),"utf8");
test("public analytics variables compile in the tested quality job, not after release",()=>{
  assert.match(yaml,/bredge-quality:[\s\S]*?NEXT_PUBLIC_GA4_MEASUREMENT_ID:\s*\$\{\{ vars.BREDGE_GA4_MEASUREMENT_ID \}\}/);
  assert.match(yaml,/NEXT_PUBLIC_CLARITY_PROJECT_ID:\s*\$\{\{ vars.BREDGE_CLARITY_PROJECT_ID \}\}/);
  assert.match(yaml,/Verify approved analytics IDs and source-backed agent index/);
  assert.match(yaml,/npm run agent-index:check/);
  assert.match(yaml,/node scripts\/verify-public-analytics-config.mjs/);
});
function verify(env={}){
  return spawnSync(process.execPath,["scripts/verify-public-analytics-config.mjs"],{
    env:{...process.env,NEXT_PUBLIC_GA4_MEASUREMENT_ID:"",NEXT_PUBLIC_GTM_ID:"",NEXT_PUBLIC_CLARITY_PROJECT_ID:"",...env},
    encoding:"utf8",
  });
}
test("public IDs are optional, format validated and cannot inject markup",()=>{
  assert.equal(verify().status,0);
  assert.equal(verify({NEXT_PUBLIC_GA4_MEASUREMENT_ID:"G-ABCDEF1234"}).status,0);
  assert.equal(verify({NEXT_PUBLIC_CLARITY_PROJECT_ID:"abcdefghij"}).status,0);
  assert.equal(verify({NEXT_PUBLIC_GA4_MEASUREMENT_ID:'G-ABC</script><script>'}).status,1);
  assert.equal(verify({NEXT_PUBLIC_GTM_ID:"javascript:alert(1)"}).status,1);
  assert.equal(verify({NEXT_PUBLIC_GTM_ID:"GTM-ABC1234",NEXT_PUBLIC_GA4_MEASUREMENT_ID:"G-ABCDEF1234"}).status,1);
});
