import assert from "node:assert/strict";
import test from "node:test";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const workerPromise = import(workerUrl.href).then(({ default: worker }) => worker);

async function render(path, host = "thebredge.com") {
  const worker = await workerPromise;
  return worker.fetch(
    new Request(`https://${host}${path}`, {
      headers: { accept: "text/html", host },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the current B2B data proposition with canonical metadata", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");

  const html = await response.text();
  assert.match(html, /<title>The Bredge \| Data Engineering, Analytics &amp; BI Partner<\/title>/);
  assert.match(html, /We build the data systems behind better business decisions\./);
  assert.match(html, /Finance, sales and operations report different versions of the same metric\./);
  assert.match(html, /https:\/\/thebredge\.com\/#organization/);
  assert.match(html, /rel="canonical" href="https:\/\/thebredge\.com"/);
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1"/);
  assert.doesNotMatch(html, /Land the Data Job|Tired of Upwork|high-paying data roles/i);
});

test("keeps the Cloudflare preview out of search", async () => {
  const response = await render("/", "bredge.thebredge.workers.dev");
  const html = await response.text();
  assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
});

test("ships canonical public routes, useful collection schema and a real 404", async () => {
  const sitemapResponse = await render("/sitemap.xml");
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  assert.doesNotMatch(sitemap, /workers\.dev/);

  const canonicalPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => new URL(url).pathname);
  assert.ok(canonicalPaths.length >= 26, "sitemap should contain the commercial pages, insights and resources");

  for (const path of [...canonicalPaths, "/privacy", "/cookies", "/terms", "/schedule"]) {
    const response = await render(path);
    assert.equal(response.status, 200, `${path} should render`);
  }

  const [insights, resources, missing, build] = await Promise.all([
    render("/insights").then((response) => response.text()),
    render("/resources").then((response) => response.text()),
    render("/not-a-real-page"),
    render("/__build"),
  ]);
  assert.match(insights, /"@type":"Blog"/);
  assert.match(insights, /"@type":"ItemList"/);
  assert.match(resources, /"@type":"CollectionPage"/);
  assert.match(resources, /"@type":"ItemList"/);
  assert.equal(missing.status, 404);
  assert.equal(build.status, 200);
  assert.equal(build.headers.get("x-robots-tag"), "noindex, nofollow");
});
