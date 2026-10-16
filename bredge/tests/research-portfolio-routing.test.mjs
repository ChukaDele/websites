import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {researchStories} from "../lib/research-editorial.ts";
import {portfolioStudies,portfolioBySlug} from "../lib/portfolio-editorial.ts";
const read=path=>readFileSync(new URL(path,import.meta.url),"utf8");
test("research longform exists for all three observed public-data stories",()=>{
 assert.equal(researchStories.length,3);
 const canon=read("../app/sitemap.ts");
 for(const story of researchStories){
  const file=read("../app/research/"+story.slug+"/page.tsx");
  assert.ok(file.includes("ResearchArticle"));
  assert.ok(canon.includes("/research/"+story.slug));
  assert.ok(story.sections.length>=4);
  assert.ok(story.sections.every(x=>x.paragraphs.length>=2&&x.paragraphs.every(p=>p.length>170)));
  assert.ok(story.method.length>=4&&story.caveats.length>=3);
  assert.ok(story.decisionPaths.length>=3);
  assert.doesNotMatch(story.deck,/businesses should definitely invest|guaranteed return|exclusive|confidential case/i);
 }
});
test("interactive portfolio offers three working source-scoped dashboards, not fake iframe cards",()=>{
 const canon=read("../app/sitemap.ts");
 const names=new Set();
 for(const p of portfolioStudies){
  names.add(p.slug);
  assert.ok(p.narrative.length>=2);
  assert.ok(p.narrative.every(x=>x.paragraphs.every(z=>z.length>140)));
  assert.ok(p.limitations.length>=3);
  assert.match(p.source,/Bredge/);
  assert.ok(canon.includes("/portfolio/"+(p.slug==="supply"?"supply-chain":p.slug)));
 }
 assert.equal(names.size,3);
 assert.equal(portfolioBySlug.supply.lab,"supply",
   "Supply-chain slug must resolve to the source-scoped dataset for /portfolio/supply-chain");
 const source=read("../app/portfolio/supply-chain/page.tsx");
 assert.match(source,/portfolioBySlug\["supply"\]/);
 const index=read("../app/portfolio/page.tsx");
 assert.match(index,/portfolioStudies\.map/);
 assert.match(index,/DEMONSTRATION DATA CLEARLY LABELLED/);
 const work=read("../app/work/page.tsx");
 assert.match(work,/href="\/research"/);assert.match(work,/href="\/portfolio"/);
});
test("navigation consolidates research, dashboards and insights beneath Work",()=>{
 const nav=read("../components/site/SiteHeader.tsx");
 for(const u of ['"/work"','"/research"','"/portfolio"','"/insights"'])assert.ok(nav.includes(u));
 assert.match(nav,/aria-expanded=\{workOpen\}/);
 assert.doesNotMatch(nav,/role="menuitem"/);
 assert.doesNotMatch(nav,/role="menu"/);
 const footer=read("../components/site/SiteFooter.tsx");
 assert.match(footer,/Interactive portfolio/);
 const site=read("../public/llms.txt");
 assert.match(site,/Live interactive operating-model portfolio/);
});
test("public workbench cannot expose original PBIX/report binary, data export or unlicensed assets",()=>{
 for(const f of ["../lib/workbench-data.ts","../app/api/workbench/route.ts",
   "../components/workbench/Workbench.tsx","../app/portfolio/page.tsx"]){
  const content=read(f);
  assert.doesNotMatch(content,/\.pbix"|download.*\.pbix|drive\.google\.com\/file\/d\//i);
 }
 const route=read("../app/api/workbench/route.ts");
 assert.doesNotMatch(route,/function POST|export.*POST|Content-Disposition|application\/zip/);
 assert.match(route,/noindex, nofollow/);
});
