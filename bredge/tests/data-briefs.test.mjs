import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dataBriefs} from "../lib/data-briefs.ts";

test("public Bredge analysis is traceable to official periods and named government source",()=>{
 assert.equal(dataBriefs.length,3);
 const paths=new Set(dataBriefs.map(x=>x.slug));
 assert.equal(paths.size,dataBriefs.length);
 for(const b of dataBriefs){
  assert.match(b.sourceUrl,/^https:\/\/microdata\.nigerianstat\.gov\.ng\/index\.php\/catalog\/\d+\/related-materials$/);
  assert.match(b.source,/National Bureau of Statistics/);
  assert.ok(b.period.length>6);
  assert.ok(b.limitations.length>=80);
  assert.ok(b.provenance.includes("Bredge analysis"));
  assert.doesNotMatch(b.summary,/client projects|client outcomes|customer testimonials/i);
 }
 const sitemapSource=readFileSync(new URL("../app/sitemap.ts",import.meta.url),"utf8");
 assert.match(sitemapSource,/\["\/research", 0\.7, "monthly"\]/);
});
test("uncertain healthy diet draft deltas are not presented as verified figures",()=>{
 const b=dataBriefs.find(x=>x.slug==="nigeria-cohd-april-2026");
 assert.equal(b.number,"₦1,589");
 assert.doesNotMatch(b.summary,/3\.11%|4\.68%|3\.12%|4\.74%/);
 assert.match(b.limitations,/did not match NBS/);
});
test("research page uses authentic source links and visible limitations",()=>{
 const src=readFileSync(new URL("../app/research/page.tsx",import.meta.url),"utf8");
 assert.match(src,/dataBriefs\.map/);
 assert.match(src,/brief\.limitations/);
 assert.match(src,/brief\.sourceUrl/);
 assert.match(src,/noopener noreferrer/);
 assert.doesNotMatch(src,/localhost|drive\.google\.com\/file/);
});


test("website research source, linked agent text, and provenance docs publish no private Drive links or PBIX asset paths",()=>{
  for(const location of [
    "../app/research/page.tsx","../app/page.tsx",
    "../lib/data-briefs.ts","../public/llms-full.txt",
    "../docs/original-research-source-audit.md",
  ]){
    const value=readFileSync(new URL(location,import.meta.url),"utf8");
    assert.doesNotMatch(value,/drive\.google\.com\/(?:file|drive\/folders)\/|docs\.google\.com\/(?:document|spreadsheets)\/d\/|\.pbix\b/i,
      "Private source-file link or binary path leaked to "+location);
  }
});
