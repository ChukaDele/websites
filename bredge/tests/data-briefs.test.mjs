import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,readdirSync} from "node:fs";
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
 assert.match(b.limitations,/not shown in this public summary/);
});
test("research page uses authentic source links and visible limitations",()=>{
 const src=readFileSync(new URL("../app/research/page.tsx",import.meta.url),"utf8");
 assert.match(src,/dataBriefs\.map/);
 assert.match(src,/brief\.limitations/);
 assert.match(src,/brief\.sourceUrl/);
 assert.match(src,/noopener noreferrer/);
 assert.doesNotMatch(src,/localhost|drive\.google\.com\/file/);
});


test("public research assets contain no private Drive endpoints or PBIX/PDF paths",()=>{
  const entries=[
    "../app/research/page.tsx","../app/page.tsx",
    "../lib/data-briefs.ts","../app/sitemap.ts",
    "../docs/original-research-source-audit.md",
    "../docs/visibility-conversion-20261016.md",
  ];
  const visit=(root)=>{
    for(const item of readdirSync(root,{withFileTypes:true})){
      const target=new URL(item.name+(item.isDirectory()?"/":""),root);
      if(item.isDirectory())visit(target);
      else if(/\.(txt|json|md|html)$/i.test(item.name))entries.push(target.href);
    }
  };
  visit(new URL("../public/",import.meta.url));
  for(const location of entries){
    const data=readFileSync(new URL(location,import.meta.url),"utf8");
    assert.doesNotMatch(data,
      /drive\.google\.com|drive\.usercontent\.google\.com|docs\.google\.com|\.pbix\b|\.pdf\b|\.pptx\b/i,
      "Private binary or Drive reference leaked into "+location);
  }
});

test("each research text anchor has a matching DOM ID",()=>{
  const src=readFileSync(new URL("../app/research/page.tsx",import.meta.url),"utf8");
  assert.match(src,/id=\{brief\.slug\}/);
});
