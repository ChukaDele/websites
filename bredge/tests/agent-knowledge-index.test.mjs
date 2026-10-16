import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { articles } from "../lib/insights.ts";
import { resources } from "../lib/resources.ts";
import { dataBriefs } from "../lib/data-briefs.ts";

const index=readFileSync(new URL("../public/llms-full.txt",import.meta.url),"utf8");
test("agent discovery index stays derived from published metadata",()=>{
  const check=spawnSync(process.execPath,["scripts/build-agent-index.mjs","--check"],{encoding:"utf8"});
  assert.equal(check.status,0,check.stderr);
  for(const article of articles){
    assert.ok(index.includes(`https://thebredge.com/insights/${article.slug}`));
    assert.ok(index.includes(`Published: ${article.date}`));
    assert.ok(index.includes(article.title));
  }
  for(const resource of resources){
    assert.ok(index.includes(`https://thebredge.com/resources/${resource.slug}`));
    assert.ok(index.includes(resource.intro));
  }
  assert.equal((index.match(/^URL: https:\/\/thebredge.com\/insights\//gm)||[]).length,articles.length);
  assert.equal((index.match(/^URL: https:\/\/thebredge.com\/resources\//gm)||[]).length,resources.length);
  for(const brief of dataBriefs){
    assert.ok(index.includes("https://thebredge.com/research/"+brief.slug));
    assert.ok(index.includes(brief.sourceUrl));
    assert.ok(index.includes(brief.limitations));
  }
});
test("public agent index does not impersonate endorsements, clients, or bot authentication",()=>{
  assert.ok(index.includes("synthetic data demonstrations on the homepage"));
  assert.match(index,/There is no public machine-write credential/);
  assert.doesNotMatch(index,/api_secret|GOOGLE_LEADS_WEBHOOK_SECRET|TURNSTILE_SECRET_KEY/);
  const m=JSON.parse(readFileSync(new URL("../public/.well-known/bredge-agent.json",import.meta.url),"utf8"));
  assert.equal(m.knowledge_index_url,"https://thebredge.com/llms-full.txt");
  assert.equal(m.agent_authentication.public_write_credentials_available,false);
});
