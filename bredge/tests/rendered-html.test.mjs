import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("Invisible 90% uses one bounded CSS sticky system, never a GSAP pin", async () => {
  const [component, css] = await Promise.all([
    read("components/landing/InvisibleQuery.tsx"),
    read("app/qa-fixes.css"),
  ]);

  assert.doesNotMatch(component, /\bpin\s*:/, "GSAP pinning must not return to InvisibleQuery");
  assert.match(component, /end:\s*"bottom bottom"/);
  assert.match(component, /min-height:\s*720px/);
  assert.match(css, /\.iq\s*\{\s*min-height:360svh;/);
  assert.match(css, /\.iq-scene\s*\{[^}]*position:sticky;/s);
  assert.match(css, /prefers-reduced-motion:no-preference/);
});

test("hero video subscribes before loading its source", async () => {
  const component = await read("components/site/HeroVideo.tsx");
  const listener = component.indexOf('video.addEventListener("canplay", onCanPlay, { once: true });');
  const load = component.indexOf("video.load();");

  assert.ok(listener >= 0, "hero video must subscribe to canplay");
  assert.ok(load >= 0, "hero video must load its selected source");
  assert.ok(listener < load, "hero video must subscribe before load() so a warm cache cannot lose canplay");
});

test("brand and commercial SEO signals are explicit and canonical", async () => {
  const [layout, services, sitemap, robots, insights] = await Promise.all([
    read("app/layout.tsx"),
    read("app/services/page.tsx"),
    read("app/sitemap.ts"),
    read("app/robots.ts"),
    read("app/insights/page.tsx"),
  ]);

  assert.match(layout, /applicationName:\s*"The Bredge"/);
  assert.match(layout, /siteName:\s*"The Bredge"/);
  assert.match(layout, /"@type":\s*"WebSite"/);
  assert.match(layout, /sameAs:\s*\["https:\/\/www\.linkedin\.com\/company\/thebredge"\]/);
  assert.match(services, /data engineering, analytics and business intelligence consulting for growing and mid-market companies/i);
  assert.match(sitemap, /https:\/\/thebredge\.com/);
  assert.match(robots, /sitemap:\s*"https:\/\/thebredge\.com\/sitemap\.xml"/);
  assert.match(insights, /"@type":\s*"CollectionPage"/);
  assert.match(insights, /"@type":\s*"ItemList"/);
});

test("security hardening is applied at the Worker boundary", async () => {
  const worker = await read("worker/index.ts");
  assert.match(worker, /X-Content-Type-Options/);
  assert.match(worker, /X-Frame-Options/);
  assert.match(worker, /Referrer-Policy/);
  assert.match(worker, /Permissions-Policy/);
  assert.match(worker, /Strict-Transport-Security/);
  assert.match(worker, /Content-Security-Policy-Report-Only/);
});

test("blog spacing and responsive reading safeguards remain scoped", async () => {
  const css = await read("app/qa-fixes.css");
  assert.match(css, /\.insight-featured\s*\{\s*padding-top:44px;\s*margin-bottom:40px;/);
  assert.match(css, /\.ax-body\s+table\.article-table\s*\{[^}]*overflow-x:auto;/s);
  assert.match(css, /max-width:1000px/);
  assert.match(css, /max-width:560px/);
});
