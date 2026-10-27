import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.QA_BASE_URL || "http://127.0.0.1:8787";
const artifacts = new URL("../qa-artifacts/", import.meta.url);
await mkdir(artifacts, { recursive: true });

const coreRoutes = [
  "/",
  "/services",
  "/services/embedded-data-team",
  "/services/data-projects",
  "/data-diagnostic",
  "/how-we-work",
  "/about",
  "/insights",
  "/resources",
  "/contact",
  "/schedule",
];

function localPath(href) {
  try {
    const url = new URL(href, base);
    if (url.origin !== new URL(base).origin) return null;
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

async function assertPageBasics(page, path) {
  const response = await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  assert.ok(response, `${path}: no navigation response`);
  assert.ok(response.status() < 400, `${path}: HTTP ${response.status()}`);
  // Stylesheets load without blocking the first paint; measure the styled page.
  await page.waitForSelector("html.css-ready", { state: "attached", timeout: 10_000 });
  await page.waitForTimeout(120);

  // Metadata must be in <head> itself, not streamed into a hidden body block.
  assert.equal(await page.locator("head > title").count(), 1, `${path}: <title> must be in <head>`);
  assert.equal(await page.locator('head > meta[name="description"]').count(), 1, `${path}: meta description must be in <head>`);
  assert.equal(await page.locator('head > link[rel="canonical"]').count(), 1, `${path}: canonical must be in <head>`);

  // Third-party calendar markup (Cal.com) is not our page structure.
  const h1Count = await page.locator("h1:not(.cal-inline h1)").count();
  assert.equal(h1Count, 1, `${path}: expected exactly one H1, saw ${h1Count}`);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 2, `${path}: horizontal overflow ${overflow}px`);

  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  assert.ok(canonical?.startsWith("https://thebredge.com"), `${path}: missing/incorrect canonical (${canonical})`);

  const title = await page.title();
  assert.ok(title.includes("The Bredge"), `${path}: title does not identify The Bredge (${title})`);
}

async function sitemapRoutes(request) {
  const response = await request.get(`${base}/sitemap.xml`);
  assert.equal(response.status(), 200, "sitemap.xml must return 200");
  const xml = await response.text();
  const matches = [...xml.matchAll(/<loc>https:\/\/thebredge\.com([^<]*)<\/loc>/g)];
  return matches.map((m) => m[1] || "/");
}

async function testRouteMatrix(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
  await context.addInitScript(() => sessionStorage.setItem("bredge_opened", "1"));
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const fromSitemap = await sitemapRoutes(context.request);
  const routes = [...new Set([...coreRoutes, ...fromSitemap])];
  for (const path of routes) await assertPageBasics(page, path);

  assert.deepEqual(pageErrors, [], `uncaught browser errors: ${pageErrors.join(" | ")}`);
  await context.close();
  console.log(`✓ route matrix: ${routes.length} canonical routes`);
}

async function testInternalLinks(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => sessionStorage.setItem("bredge_opened", "1"));
  const page = await context.newPage();
  const paths = new Set();

  for (const seed of ["/", "/services", "/insights"]) {
    await page.goto(`${base}${seed}`, { waitUntil: "domcontentloaded" });
    const hrefs = await page.locator("a[href]").evaluateAll((links) => links.map((link) => link.getAttribute("href") || ""));
    for (const href of hrefs) {
      assert.notEqual(href, "#", `${seed}: placeholder href '#' found`);
      if (/^(mailto:|tel:|javascript:)/i.test(href) || href.startsWith("#")) continue;
      const path = localPath(href);
      if (path) paths.add(path);
    }
  }

  for (const path of paths) {
    const response = await context.request.get(`${base}${path}`, { maxRedirects: 5 });
    assert.ok(response.status() < 400, `internal link ${path}: HTTP ${response.status()}`);
  }

  await context.close();
  console.log(`✓ internal links: ${paths.size} destinations`);
}

async function testPreloaderAndHero(browser) {
  // First open in a fresh tab: the preloader plays, then lifts and leaves the hero usable.
  const fresh = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
  const page = await fresh.newPage();
  await page.goto(base, { waitUntil: "domcontentloaded" });
  assert.ok(await page.locator("html.preload-active .preloader").count(), "preloader should play when the site is opened");
  await page.waitForFunction(() => !document.documentElement.classList.contains("preload-active"), null, { timeout: 6000 });
  assert.equal(await page.locator("h1").count(), 1, "home should have exactly one H1");
  assert.ok(await page.locator("h1").isVisible(), "hero H1 should be visible after the preloader");
  // Moving to another page in the same tab must not replay it.
  await page.goto(new URL("/services", base).href, { waitUntil: "domcontentloaded" });
  assert.equal(await page.locator("html.preload-active").count(), 0, "preloader must not replay on another page in the same tab");
  await fresh.close();

  // Reduced motion: no preloader at all.
  const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const rp = await reduced.newPage();
  await rp.goto(base, { waitUntil: "domcontentloaded" });
  assert.equal(await rp.locator("html.preload-active").count(), 0, "reduced motion should skip the preloader");
  await rp.screenshot({ path: new URL("home-reduced.png", artifacts).pathname, fullPage: false });
  await reduced.close();
  console.log("✓ preloader plays on open, not on page change, skipped for reduced motion");
}

async function testExperienceMotionAndMobileReading(browser) {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
  await desktop.addInitScript(() => sessionStorage.setItem("bredge_opened", "1"));
  const desktopPage = await desktop.newPage();
  await desktopPage.goto(base, { waitUntil: "domcontentloaded" });
  await desktopPage.waitForTimeout(500);
  await desktopPage.locator(".xp").evaluate((root) => window.scrollTo(0, root.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.55));
  await desktopPage.waitForTimeout(180);
  const desktopState = await desktopPage.locator(".xp").evaluate((root) => {
    const track = root.querySelector(".xp-track");
    const clone = root.querySelector('.xp-track span[aria-hidden="true"]');
    if (!track || !clone) return null;
    const row = track.parentElement;
    return {
      overflow: track.scrollWidth - (row?.clientWidth || 0),
      transform: getComputedStyle(track).transform,
      cloneDisplay: getComputedStyle(clone).display,
    };
  });
  assert.ok(desktopState, "team experience rows are missing");
  assert.ok(desktopState.overflow > 0, "desktop experience rows must have scroll distance");
  assert.equal(desktopState.cloneDisplay, "flex", "desktop repeat should maintain the motion track");
  assert.notEqual(desktopState.transform, "none", "desktop experience row should respond to scrolling");
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" });
  await mobile.addInitScript(() => sessionStorage.setItem("bredge_opened", "1"));
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(base, { waitUntil: "domcontentloaded" });
  await mobilePage.waitForTimeout(500);
  const mobileState = await mobilePage.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    trackDisplay: getComputedStyle(document.querySelector(".xp-track")).display,
    repeatDisplay: getComputedStyle(document.querySelector('.xp-track span[aria-hidden="true"]')).display,
    headingWraps: [...document.querySelectorAll("h1,h2,h3")].map((node) => getComputedStyle(node).textWrapStyle),
    bodyWraps: [...document.querySelectorAll(".hero-summary,.section-heading > p,.case-copy > p")].map((node) => getComputedStyle(node).textWrapStyle),
  }));
  assert.ok(mobileState.overflow <= 2, `mobile homepage horizontal overflow ${mobileState.overflow}px`);
  assert.equal(mobileState.trackDisplay, "grid", "mobile experience section should use a static grid");
  assert.equal(mobileState.repeatDisplay, "none", "mobile should show each organisation once");
  assert.ok(mobileState.headingWraps.every((value) => value === "balance"), "headings should use balanced wraps");
  assert.ok(mobileState.bodyWraps.every((value) => value === "pretty"), "body copy should avoid orphaned final words");
  await mobilePage.screenshot({ path: new URL("home-mobile-reading.png", artifacts).pathname, fullPage: true });
  await mobile.close();
  console.log("✓ experience motion desktop + mobile reading rhythm");
}

async function testInsights(browser) {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    await context.addInitScript(() => sessionStorage.setItem("bredge_opened", "1"));
    const page = await context.newPage();
    await assertPageBasics(page, "/insights");

    const featured = await page.locator('main a[href^="/insights/"]').first().getAttribute("href");
    assert.ok(featured?.startsWith("/insights/"), "insights: featured article link missing");
    const collectionSchema = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.some((node) => node.textContent?.includes('"CollectionPage"') && node.textContent?.includes('"ItemList"')));
    assert.equal(collectionSchema, true, "insights: CollectionPage/ItemList schema missing");

    await assertPageBasics(page, featured);
    const articleOverlap = await page.evaluate(() => {
      const hero = document.querySelector(".ax-hero")?.getBoundingClientRect();
      const grid = document.querySelector(".ax-grid")?.getBoundingClientRect();
      return hero && grid ? hero.bottom - grid.top : 0;
    });
    assert.ok(articleOverlap <= 2, `article hero/body overlap by ${articleOverlap}px`);
    await page.screenshot({ path: new URL(`insights-${viewport.width}.png`, artifacts).pathname, fullPage: false });
    await context.close();
  }
  console.log("✓ insights index + article desktop/mobile");
}

async function testHeaders(browser) {
  const context = await browser.newContext();
  const response = await context.request.get(base);
  const headers = response.headers();
  assert.equal(headers["x-content-type-options"], "nosniff");
  assert.equal(headers["x-frame-options"], "SAMEORIGIN");
  assert.equal(headers["referrer-policy"], "strict-origin-when-cross-origin");
  assert.ok(headers["permissions-policy"]?.includes("camera=()"));
  assert.ok(headers["content-security-policy-report-only"]?.includes("frame-ancestors 'self'"));
  await context.close();
  console.log("✓ response hardening headers");
}

const browser = await chromium.launch({ headless: true });
try {
  await testRouteMatrix(browser);
  await testInternalLinks(browser);
  await testPreloaderAndHero(browser);
  await testExperienceMotionAndMobileReading(browser);
  await testInsights(browser);
  await testHeaders(browser);
  console.log("\nBredge browser QA: PASS");
} finally {
  await browser.close();
}
