/**
 * Human-readable retrieval index built from the same article/resource metadata
 * as /insights and /resources. It is a discovery aid, not a ranking guarantee,
 * bot authentication protocol, or duplicate full-text article store.
 */
import { readFileSync, writeFileSync } from "node:fs";
// Importing erasable .ts sources requires Node 22.18+ or newer current majors.
const [nodeMajor,nodeMinor] = process.versions.node.split(".").map(Number);
if(nodeMajor < 22 || (nodeMajor === 22 && nodeMinor < 18)){
 console.error("BUILD_REQUIRES_NODE_22_18: update the build runtime before generating the research index.");
 process.exit(1);
}
// Evaluate TypeScript sources only after the runtime is known to support
// built-in erasable TS stripping. Static imports execute too early for this.
const [{ articles }, { resources }, { dataBriefs }] = await Promise.all([
  import("../lib/insights.ts"),
  import("../lib/resources.ts"),
  import("../lib/data-briefs.ts"),
]);
const BASE = "https://thebredge.com";
const out = new URL("../public/llms-full.txt", import.meta.url);
const safe = (text) => String(text || "").replace(/\s+/g, " ").trim();
const articleSlugs=new Set(articles.map(item=>item.slug));
const resourceSlugs=new Set(resources.map(item=>item.slug));
if(articleSlugs.size!==articles.length||resourceSlugs.size!==resources.length) throw Error("Duplicate source slugs");
const lines=[
 "# The Bredge | Canonical Knowledge and Service Index",
 "",
 "> A source-linked summary of Bredge's public services, published articles and decision resources. It is not a substitute for the original articles.",
 "",
 "Publisher: The Bredge",
 `Canonical site: ${BASE}/`,
 "Contact: hello@thebredge.com",
 "",
 "## What The Bredge offers",
 "",
 `- Data engineering, analytics and business intelligence: ${BASE}/services`,
 `- Embedded data team for a continuing data backlog: ${BASE}/services/embedded-data-team`,
 `- Defined-scope data projects and handover: ${BASE}/services/data-projects`,
 `- Data Diagnostic to map issues and prioritise next actions: ${BASE}/data-diagnostic`,
 `- Bredge original analysis of public statistical releases: ${BASE}/research`,
 "",
 "The Bredge helps growing and mid-market organisations reconcile conflicting data, define important measures, automate recurring reporting and improve the reliability of systems feeding business decisions. Work is scoped around the actual source problem.",
 "",
 "## Published Insights (canonical URLs and descriptions)",
 "",
];
for (const item of articles) {
  if (!/^202[0-9]-\d{2}-\d{2}$/.test(item.date)) throw Error("Invalid publication date: "+item.slug);
  const path=`${BASE}/insights/${encodeURIComponent(item.slug)}`;
  lines.push(`### ${safe(item.title)}`);
  lines.push(`URL: ${path}`);
  lines.push(`Published: ${item.date}${item.updated ? "; updated: "+item.updated : ""}`);
  lines.push(`Topic: ${safe(item.category)}`);
  lines.push(`Summary: ${safe(item.standfirst)}`);
  lines.push("");
}
lines.push("## Bredge original public-data briefs", "");
for (const brief of dataBriefs) {
  lines.push(`### ${safe(brief.title)}`);
  lines.push(`URL: ${BASE}/research#${brief.slug}`);
  lines.push(`Period: ${brief.period}`);
  lines.push(`Finding: ${brief.number} — ${brief.unit}`);
  lines.push(`Summary: ${safe(brief.summary)}`);
  lines.push(`Source: ${safe(brief.source)}`);
  lines.push(`Underlying primary source: ${brief.sourceUrl}`);
  lines.push(`Caveats: ${safe(brief.limitations)}`);
  lines.push("");
}
lines.push("## Public checklists and resources", "");
for(const item of resources) {
  if (!articleSlugs.has(item.article)) throw Error("Resource points to an unknown Insight: "+item.slug);
  lines.push(`### ${safe(item.title)}`);
  lines.push(`URL: ${BASE}/resources/${encodeURIComponent(item.slug)}`);
  lines.push(`Type: ${safe(item.kind)}`);
  lines.push(`Purpose: ${safe(item.intro)}`);
  lines.push(`Related evidence and background: ${BASE}/insights/${encodeURIComponent(item.article)}`);
  lines.push("");
}
lines.push(
 "## Using and citing this index",
 "",
 "- Read and cite the canonical page. Snippets here summarise the public source rather than replace it.",
 "- Published dates describe the source metadata. No automated freshness or fabricated revisions are claimed.",
 "- The synthetic data demonstrations on the homepage are illustrative, not customer testimonials or independently audited case studies. Review each original article for its own evidence and limitations.",
 "- User-authorised browsers and agents may use the same public pages and contact form. There is no public machine-write credential, bot-trust bypass, or bulk-outreach permission.",
 "- For actual enquiries use the browser form at https://thebredge.com/contact, subject to standard validation and rate limits.",
 "- For booking use https://thebredge.com/schedule and obtain user approval of the selected time.",
 "",
);
const rendered=lines.join("\n");
if(process.argv.includes("--check")){
  const current=readFileSync(out,"utf8");
  if(current!==rendered) {console.error("AGENT_INDEX_STALE: rebuild agent knowledge index");process.exit(1)}
  console.log(`AGENT_INDEX_CHECK_PASS articles=${articles.length} resources=${resources.length}`);
}else{
 writeFileSync(out,rendered);
 console.log(`AGENT_INDEX_GENERATED articles=${articles.length} resources=${resources.length}`);
}
