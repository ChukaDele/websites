import { readFileSync, statSync, readdirSync, existsSync } from "node:fs";
const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const checks = [
  [/<h1[^>]*>When your numbers disagree, we find out why\.<\/h1>/, "approved hero proposition"],
  [/Five systems\./, "five-system narrative"],
  [/One reconciled model/i, "reconciliation outcome"],
  [/Data engineering/i, "service capability"],
  [/<link rel="canonical" href="https:\/\/thebredge.com\/"/, "canonical host"],
  [/name="viewport"/, "mobile viewport"],
  [/name="robots" content="noindex, nofollow"/, "isolated pilot crawler exclusion"],
  [/class="iq-mobile section-wrap"/, "server-rendered mobile SQL excerpts"],
  [/6 \/ 6 checks passed/, "server-rendered completed mobile SQL summary"],
  [/class="morph-card card-5"/, "server-rendered five sources"],
];
for (const [rule, label] of checks) {
  if (!rule.test(html)) throw new Error("Astro pilot missing " + label);
}
const bytes=statSync(new URL("../dist/index.html", import.meta.url)).size;
console.log("ASTRO_STATIC_PILOT_PASS home bytes="+bytes);


// Font assets must be bundled with hashed Astro URLs. Bare npm specifiers in
// emitted CSS silently 404 on visitors' browsers and change spacing/motion.
const cssFiles = readdirSync(new URL("../dist/_astro/", import.meta.url)).filter((file) => file.endsWith(".css"));
const stylesheet = cssFiles.map((file) => readFileSync(new URL("../dist/_astro/" + file, import.meta.url), "utf8")).join("\n");
const fontUrls = [...stylesheet.matchAll(/url\(\s*['"]?(\/_astro\/[^)'"]+\.woff2)/g)].map((match) => match[1]);
if (fontUrls.length < 3) throw new Error("Astro must bundle Latin Instrument Sans and two Plex Mono font weights");
for (const url of fontUrls) {
  const name = url.split("/").pop();
  if (!existsSync(new URL("../dist/_astro/" + name, import.meta.url))) throw new Error("Missing emitted font: " + name);
}
if (stylesheet.includes("url(@fontsource")) throw new Error("Unresolved font package URL in CSS");
console.log("ASTRO_CSS_FONT_BUNDLES_PASS " + fontUrls.length + " font URLs");
