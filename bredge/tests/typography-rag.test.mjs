import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const typo=readFileSync(new URL("../app/typography-rag.css",import.meta.url),"utf8");
const layout=readFileSync(new URL("../app/layout.tsx",import.meta.url),"utf8");
const base=readFileSync(new URL("../app/globals.css",import.meta.url),"utf8");
const astro=readFileSync(new URL("../../bredge-astro/src/layouts/Base.astro",import.meta.url),"utf8");

test("the real heading typography system uses one existing variable face across both renderers",()=>{
 assert.match(typo,/h1,h2,h3,h4,h5,h6/);
 assert.match(typo,/font-family:var\(--font-sans\)/);
 assert.match(typo,/text-wrap:balance/);
 assert.match(typo,/line-height:var\(--type-line-heading\)/);
 assert.match(typo,/\.footer-content h2 \{/);
 assert.match(typo,/line-height:1\.025/);
 assert.match(typo,/font-size:clamp\(2\.65rem,11vw,3\.5rem\)/);
 assert.match(layout,/import "\.\/typography-rag\.css"/);
 assert.match(astro,/typography-rag\.css/);
 assert.match(base,/--font-sans:"Instrument Sans Variable"/);
 assert.doesNotMatch(typo,/@import |@font-face/);
});
test("rag is handled by responsive measure, balanced headings and readable paragraphs",()=>{
 assert.match(typo,/max-width:17ch/);
 assert.match(typo,/max-width:32ch/);
 assert.match(typo,/text-wrap:pretty/);
 assert.match(typo,/max-width:100%/);
 assert.match(typo,/hyphens:manual/);
});
