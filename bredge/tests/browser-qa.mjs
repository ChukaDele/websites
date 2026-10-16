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
  // A missing CSS asset used to masquerade as a layout defect because the
  // SSR HTML contains unbounded code snippets until its stylesheet loads.
  // This must fail closed for actual 404 styles rather than measuring raw HTML.
  await page.waitForFunction(() => getComputedStyle(document.body).fontFamily.includes("Instrument Sans"),
    null, {timeout:12000});
  await page.waitForTimeout(80);

  // Playwright locators pierce open shadow roots. The Cal.com widget inserts
  // its own H1 inside a shadow root on /schedule; this is not a page heading.
  // Count document-owned headings, so duplicate site H1s still fail strictly.
  const h1Count = await page.evaluate(() => document.querySelectorAll("h1").length);
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
  await context.addInitScript(() => sessionStorage.setItem("bredge_preloaded", "1"));
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

// Remote preview QA should distinguish a transient network socket timeout
// from a broken link. Retry only thrown transport errors, for a strictly
// bounded number of attempts. Any HTTP 4xx/5xx still fails immediately.
async function getWithNetworkRetry(request, url, options = {}) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await request.get(url, { timeout: 45_000, ...options });
    } catch (error) {
      const message = String(error);
      const retryable = /ETIMEDOUT|ECONNRESET|ERR_CONNECTION_RESET|ERR_NETWORK_CHANGED/i.test(message);
      if (!retryable || attempt === 2) throw error;
      console.warn(`Network retry ${attempt + 1}/2 for ${new URL(url).pathname}: ${message.match(/ETIMEDOUT|ECONNRESET|ERR_CONNECTION_RESET|ERR_NETWORK_CHANGED/i)?.[0] || "transient error"}`);
      await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
    }
  }
  throw new Error("unreachable");
}

async function testInternalLinks(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => sessionStorage.setItem("bredge_preloaded", "1"));
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
    const response = await getWithNetworkRetry(context.request, `${base}${path}`, { maxRedirects: 5 });
    assert.ok(response.status() < 400, `internal link ${path}: HTTP ${response.status()}`);
  }

  await context.close();
  console.log(`✓ internal links: ${paths.size} destinations`);
}

async function testScrollNarratives(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
  await context.addInitScript(() => sessionStorage.setItem("bredge_preloaded", "1"));
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);

  // The Five Systems scene is CSS-sticky, without a GSAP pin spacer.
  // The SQL narrative also uses one CSS-owned sticky viewport; no nested
  // ScrollTrigger pins may be introduced on either section.
  const iqPinState = await page.locator(".iq").evaluate((root) => {
    const scene = root.querySelector(".iq-scene");
    return {
      rootInsidePinSpacer: Boolean(root.closest(".pin-spacer")),
      sceneInsidePinSpacer: Boolean(scene?.closest(".pin-spacer")),
    };
  });
  assert.equal(iqPinState.rootInsidePinSpacer, false, "Invisible 90% root must not be wrapped by a GSAP pin-spacer");
  assert.equal(iqPinState.sceneInsidePinSpacer, false, "Invisible 90% scene must not be wrapped by a GSAP pin-spacer");

  const geometry = await page.locator(".iq").evaluate((root) => {
    const scene = root.querySelector(".iq-scene");
    const style = scene ? getComputedStyle(scene) : null;
    return {
      rootHeight: root.getBoundingClientRect().height,
      scenePosition: style?.position || "",
      viewportHeight: window.innerHeight,
      top: root.getBoundingClientRect().top + window.scrollY,
    };
  });
  assert.equal(geometry.scenePosition, "sticky", `Invisible 90% should be CSS-sticky, got ${geometry.scenePosition}`);
  assert.ok(geometry.rootHeight >= geometry.viewportHeight * 3.4, `Invisible 90% runway too short (${geometry.rootHeight}px)`);

  const transition = await page.evaluate(() => {
    const ref = document.querySelector(".reference-work");
    const iq = document.querySelector(".iq");
    if (!ref || !iq) return null;
    const rr = ref.getBoundingClientRect();
    const ir = iq.getBoundingClientRect();
    return {
      refBottom: rr.bottom + window.scrollY,
      iqTop: ir.top + window.scrollY,
    };
  });
  assert.ok(transition, "missing Reference Work / Invisible 90% sections");
  assert.ok(transition.iqTop >= transition.refBottom - 2, `scroll sections overlap in document flow by ${transition.refBottom - transition.iqTop}px`);

  const checkpoints = [0.01, 0.35, 0.72, 0.98];
  for (const [index, progress] of checkpoints.entries()) {
    await page.evaluate(({ top, height, vh, p }) => window.scrollTo(0, top + Math.max(0, height - vh) * p), {
      top: geometry.top,
      height: geometry.rootHeight,
      vh: geometry.viewportHeight,
      p: progress,
    });
    await page.waitForTimeout(220);

    const overlap = await page.evaluate(() => {
      const editor = document.querySelector(".iq-editor")?.getBoundingClientRect();
      if (!editor) return false;
      const inViewport = (r) => r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
      const intersects = (a, b) => Math.min(a.right, b.right) > Math.max(a.left, b.left) && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top);
      return [...document.querySelectorAll(".reference-case")].some((node) => {
        const r = node.getBoundingClientRect();
        return inViewport(r) && inViewport(editor) && intersects(r, editor);
      });
    });
    assert.equal(overlap, false, `Reference Work overlaps the SQL scene at progress ${progress}`);
    await page.screenshot({ path: new URL(`home-scroll-${index}.png`, artifacts).pathname, fullPage: false });
  }

  await context.close();
  console.log("✓ scroll narratives: SQL scene has one bounded sticky system and no overlap");
}

async function testMobileFirstVisitWithoutPreloader(browser) {
  const page = await browser.newPage({ viewport:{width:390,height:844}, reducedMotion:"no-preference" });
  await page.goto(base,{waitUntil:"domcontentloaded"});
  const state=await page.evaluate(()=>({
    htmlBlocked:document.documentElement.classList.contains("preload-active"),
    visible:getComputedStyle(document.querySelector(".preloader")).display!=="none",
    hero:!!document.querySelector(".hero h1"),
  }));
  assert.equal(state.htmlBlocked,false,"first-visit mobile must not block hero behind preloader");
  assert.equal(state.visible,false,"first-visit mobile preloader must not obstruct content");
  assert.equal(state.hero,true,"mobile hero must render on first view");
  await page.close();
  console.log("✓ first-visit phone shows content without GSAP preloader");
}

async function testMeasuredArrowResponsiveLayout(browser) {
  // Check the first eligible desktop width and wide desktops independently
  // of the fixed 1440px story test. Old percentage-based lines failed this.
  for (const viewport of [
    { width: 1251, height: 720 },
    { width: 1251, height: 900 },
    { width: 1280, height: 900 },
    { width: 1440, height: 800 },
    { width: 1920, height: 1080 },
  ]) {
    const page = await browser.newPage({ viewport, reducedMotion:"no-preference" });
    await page.addInitScript(() => sessionStorage.setItem("bredge_preloaded", "1"));
    await page.goto(base, { waitUntil:"domcontentloaded" });
    await page.locator(".hero-morph.morph-enhanced").waitFor({state:"attached",timeout:12000});
    const geometry=await page.locator(".hero-morph").evaluate(root=>{
      const r=root.getBoundingClientRect();
      return { top:r.top+scrollY, height:r.height };
    });
    await page.evaluate(({top,height})=>
      scrollTo({top:top+(height-innerHeight)*.53,behavior:"instant"}),geometry);
    await page.waitForTimeout(860);
    const state=await page.locator(".hero-morph").evaluate(root=>{
      const rect=root.querySelector(".morph-flow").getBoundingClientRect();
      const view=root.querySelector(".morph-flow").viewBox.baseVal;
      const head=root.querySelector(".hero-morph-tease").getBoundingClientRect();
      const targets=[...root.querySelectorAll(".morph-card")].map(el=>el.getBoundingClientRect());
      const dest=root.querySelector(".morph-result").getBoundingClientRect();
      const tx=dest.left+dest.width/2, ty=dest.top+dest.height/2;
      const headingOverlap=targets.some(r=>Math.min(r.right,head.right)>Math.max(r.left,head.left)
        &&Math.min(r.bottom,head.bottom)>Math.max(r.top,head.top));
      const chapters=root.querySelector(".morph-chapters").getBoundingClientRect();
      const chips=[...root.querySelectorAll(".morph-exception")].filter(el=>
        Number(getComputedStyle(el).opacity)>.1).map(el=>el.getBoundingClientRect());
      const chipOverlap=chips.some(r=>r.top<chapters.bottom-2||r.bottom>innerHeight-3);
      const routes=[...root.querySelectorAll(".morph-flow-route")].map((route,i)=>{
        const d=route.getAttribute("d")||"";
        const values=(d.match(/-?[0-9]+(?:\.[0-9]+)?/g)||[]).map(Number);
        if(values.length<8)return {anchored:false,converged:false,visible:false};
        const sx=rect.left+values[0]*rect.width/view.width;
        const sy=rect.top+values[1]*rect.height/view.height;
        const ex=rect.left+values[6]*rect.width/view.width;
        const ey=rect.top+values[7]*rect.height/view.height;
        const src=targets[i];
        return {
          anchored:sx>=src.left-10&&sx<=src.right+10&&sy>=src.top-10&&sy<=src.bottom+10,
          converged:Math.hypot(ex-tx,ey-ty)<=20,
          visible:Number(getComputedStyle(route).opacity)>.5,
        };
      });
      return { headingOverlap, chipOverlap, chipsCount:chips.length,
        headingOpacity:Number(getComputedStyle(root.querySelector(".hero-morph-tease")).opacity),
        stage:root.querySelector(".morph-chapter.is-active")?.textContent?.trim(), routes };
    });
    assert.equal(state.headingOverlap,false,`desktop ${viewport.width}x${viewport.height}: sources obscure header`);
    assert.equal(state.chipOverlap,false,
      `desktop ${viewport.width}x${viewport.height}: exception labels obscure heading or leave viewport`);
    assert.equal(state.chipsCount,3,`desktop ${viewport.width}x${viewport.height}: all three exception types must be visible`);
    assert.ok(state.headingOpacity>.95,`desktop ${viewport.width}: heading disappears during arrows`);
    assert.match(state.stage||"",/^02 \/ Reconcile differences/);
    assert.equal(state.routes.length,5);
    assert.ok(state.routes.every(r=>r.anchored&&r.converged&&r.visible),
      `desktop ${viewport.width}: disconnected arrows ${JSON.stringify(state.routes)}`);
    await page.close();
  }
  console.log("✓ responsive desktop arrows and warning labels: 1251x720, 1251x900, 1280x900, 1440x800, 1920x1080");
}

async function testMobileMotionFallbacks(browser) {
  for (const reducedMotion of ["no-preference", "reduce"]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion });
    await page.addInitScript(() => sessionStorage.setItem("bredge_preloaded", "1"));
    for (const { route, selector } of [
      { route: "/data-diagnostic", selector: ".scan-item" },
      { route: "/services", selector: ".dtree-stage" },
      { route: "/about", selector: ".disc-mid" },
      { route: "/services/data-projects", selector: ".rs-eval" },
    ]) {
      await page.goto(base + route, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(120);
      const opacity = await page.locator(selector).first().evaluate((element) => Number(getComputedStyle(element).opacity));
      assert.ok(opacity > 0.95, `${route} at 390px / ${reducedMotion}: core content hidden at opacity ${opacity}`);
    }
    await page.close();
  }
  console.log("✓ mobile and reduced-motion service explanations remain readable");
}

async function testHeroCompositionAndMobileNative(browser) {
  for (const config of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
  ]) {
    const context = await browser.newContext({ viewport: config, reducedMotion: "no-preference" });
    await context.addInitScript(() => sessionStorage.setItem("bredge_preloaded", "1"));
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    const result = await page.evaluate(() => {
      const cards = [...document.querySelectorAll(".morph-card")];
      const rectangles = cards.map((c) => c.getBoundingClientRect());
      const overlap = [];
      for (let a = 0; a < rectangles.length; a++)
        for (let b = a + 1; b < rectangles.length; b++) {
          const x = Math.min(rectangles[a].right, rectangles[b].right) - Math.max(rectangles[a].left, rectangles[b].left);
          const y = Math.min(rectangles[a].bottom, rectangles[b].bottom) - Math.max(rectangles[a].top, rectangles[b].top);
          if (x > 2 && y > 2) overlap.push([a, b, x, y]);
        }
      const outcome = document.querySelector(".morph-result");
      const nav = document.querySelector(".nav-toggle");
      return {
        cardCount: cards.length, overlap,
        grid: getComputedStyle(document.querySelector(".morph-cards")).display,
        resultOpacity: Number(getComputedStyle(outcome).opacity),
        viewportOverflow: document.documentElement.scrollWidth - innerWidth,
        arrowConnectors: document.querySelectorAll(".morph-flow-route").length,
        dynamicArrowsHidden: getComputedStyle(document.querySelector(".morph-flow")).display === "none",
        staticFlowVisible: getComputedStyle(document.querySelector(".morph-static-flow")).display !== "none",
        warningLabelsHidden:getComputedStyle(document.querySelector(".morph-exceptions")).display === "none",
        headingVisible: Number(getComputedStyle(document.querySelector(".hero-morph-tease")).opacity) >= .99,
        navTapSize: nav.getBoundingClientRect().height,
        heroVideo: document.querySelector(".hero-video")?.getAttribute("src"),
      };
    });
    assert.equal(result.cardCount, 5, `mobile ${config.width}: expected five systems`);
    assert.deepEqual(result.overlap, [], `mobile ${config.width}: source cards overlap`);
    assert.equal(result.grid, "grid", `mobile ${config.width}: layout must be a real grid`);
    assert.ok(result.resultOpacity >= 0.99, `mobile ${config.width}: summary hidden`);
    assert.equal(result.arrowConnectors, 5, "all five sources need their own connector path");
    assert.equal(result.dynamicArrowsHidden, true, "narrow viewport should use a clear static arrow rather than overlaid SVG routes");
    assert.equal(result.staticFlowVisible, true, "narrow viewport must visually connect separate systems to the reconciled model");
    assert.equal(result.warningLabelsHidden, true, "fallback warning chips must not cover the heading");
    assert.equal(result.headingVisible, true, "section heading must remain visible above the sources");
    assert.ok(result.navTapSize >= 44, `mobile ${config.width}: menu control too small`);
    assert.ok(result.viewportOverflow <= 2, `mobile ${config.width}: horizontal overflow ${result.viewportOverflow}px`);
    const contact = await page.goto(`${base}/contact`, { waitUntil: "domcontentloaded" });
    assert.equal(contact.status(), 200);
    const form = await page.evaluate(() => ({
      inputs: [...document.querySelectorAll(".contact-form input, .contact-form textarea")].filter(el => !el.closest(".hp") && el.getAttribute("type") !== "checkbox").map(el => ({ id: el.id, fontSize: Number.parseFloat(getComputedStyle(el).fontSize) })),
      overflow: document.documentElement.scrollWidth - innerWidth,
      layoutWidth: document.querySelector(".contact-layout").getBoundingClientRect().width,
      introWidth: document.querySelector(".contact-intro").getBoundingClientRect().width,
      formWidth: document.querySelector(".contact-form").getBoundingClientRect().width,
      nextWidth: document.querySelector(".contact-next").getBoundingClientRect().width,
      templateAreas: getComputedStyle(document.querySelector(".contact-layout")).gridTemplateAreas,
    }));
    assert.ok(form.inputs.every(input => input.fontSize >= 16), `mobile ${config.width}: some form fields trigger iOS focus zoom`);
    assert.ok(form.overflow <= 2, `mobile ${config.width}: contact form overflow`);
    assert.ok(form.formWidth >= form.layoutWidth * 0.94 && form.introWidth >= form.layoutWidth * 0.94
      && form.nextWidth >= form.layoutWidth * 0.94,
      `mobile ${config.width}: contact page squeezed into desktop grid (form=${form.formWidth}, layout=${form.layoutWidth})`);
    assert.match(form.templateAreas, /intro[\s\S]*form[\s\S]*next/,
      `mobile ${config.width}: contact sections not in vertical reading order`);
    await context.close();
  }

  // An 1100px browser is wide but deliberately below the precise-pointer
  // 1251px animation threshold. It must keep the readable flow and full model.
  const intermediate = await browser.newPage({viewport:{width:1100,height:900}});
  await intermediate.goto(base,{waitUntil:"load"});
  const mediumState=await intermediate.locator(".hero-morph").evaluate(root=>({
    enhanced:root.classList.contains("morph-enhanced"),
    grid:getComputedStyle(root.querySelector(".morph-cards")).display,
    resultOpacity:Number(getComputedStyle(root.querySelector(".morph-result")).opacity),
    staticArrow:getComputedStyle(root.querySelector(".morph-static-flow")).display,
    exceptionDisplay:getComputedStyle(root.querySelector(".morph-exceptions")).display,
  }));
  assert.equal(mediumState.enhanced,false,"1100px desktop should not force the large GSAP stage");
  assert.equal(mediumState.grid,"grid","1100px desktop must use readable cards");
  assert.ok(mediumState.resultOpacity>.99,"1100px desktop must reveal the summary");
  assert.notEqual(mediumState.staticArrow,"none","1100px desktop must show source-to-result arrow");
  assert.equal(mediumState.exceptionDisplay,"none","fallback exception chips must never cover heading");
  await intermediate.close();

  // Short and reduced-motion desktops must get the SAME no-overlap static
  // fallback as phones. A visible result card cannot sit on top of source
  // cards, even if JS fails or the user zooms to a short effective viewport.
  for (const cfg of [
    { name: "short desktop", width:1280, height:680, motion:"no-preference" },
    { name: "reduced motion", width:1440, height:900, motion:"reduce" },
    { name: "short + reduced", width:1280, height:680, motion:"reduce" },
  ]) {
    const fallback = await browser.newPage({viewport:{width:cfg.width,height:cfg.height},reducedMotion:cfg.motion});
    await fallback.addInitScript(() => sessionStorage.setItem("bredge_preloaded","1"));
    await fallback.goto(base,{waitUntil:"domcontentloaded"});
    await fallback.locator('.iq[data-iq-hydrated="true"]').waitFor({state:"attached",timeout:12000});
    await fallback.waitForTimeout(350);
    const state = await fallback.locator(".hero-morph").evaluate(root => {
      const cards=[...root.querySelectorAll(".morph-card")].map(el=>el.getBoundingClientRect());
      const result=root.querySelector(".morph-result");
      const decision=root.querySelector(".morph-decision");
      const rr=result.getBoundingClientRect();
      const dr=decision.getBoundingClientRect();
      const overlap=[];
      for(let a=0;a<cards.length;a++) for(let b=a+1;b<cards.length;b++) {
        const x=Math.min(cards[a].right,cards[b].right)-Math.max(cards[a].left,cards[b].left);
        const y=Math.min(cards[a].bottom,cards[b].bottom)-Math.max(cards[a].top,cards[b].top);
        if(x>2&&y>2) overlap.push({a,b,x,y});
      }
      const lastBottom=Math.max(...cards.map(c=>c.bottom));
      return {
        enhanced:root.classList.contains("morph-enhanced"),
        resultOpacity:Number(getComputedStyle(result).opacity),
        position:getComputedStyle(root.querySelector(".hero-morph-content")).position,
        cardsDisplay:getComputedStyle(root.querySelector(".morph-cards")).display,
        staticArrowVisible:getComputedStyle(root.querySelector(".morph-static-flow")).display!=="none",
        resultAfterCards:rr.top>=lastBottom-3,
        decisionAfterResult:dr.top>=rr.bottom-3,
        overlap, overflow:document.documentElement.scrollWidth-innerWidth,
        pinned:!!root.closest(".pin-spacer"),
      };
    });
    assert.equal(state.enhanced,false, `${cfg.name} must not activate the scroll animation`);
    assert.equal(state.position,"relative", `${cfg.name} should use natural flow`);
    assert.equal(state.cardsDisplay,"grid", `${cfg.name} cards need a nonoverlapping layout`);
    assert.equal(state.staticArrowVisible,true,`${cfg.name} must show flow from inputs to output`);
    assert.deepEqual(state.overlap, [], `${cfg.name} source cards overlap`);
    assert.equal(state.resultAfterCards,true, `${cfg.name} reconciled result overlays source cards`);
    assert.equal(state.decisionAfterResult,true, `${cfg.name} decision overlays result`);
    assert.ok(state.resultOpacity>=0.99, `${cfg.name} result is invisible`);
    assert.equal(state.pinned,false,`${cfg.name} must have no GSAP pin`);
    assert.ok(state.overflow<=2, `${cfg.name} horizontal overflow`);
    await fallback.close();
  }

  // Progressive enhancement must not be necessary to read the business
  // narrative. Simulate a capable full desktop with JavaScript DISABLED.
  const noScript = await browser.newPage({
    viewport:{width:1440,height:900}, javaScriptEnabled:false, reducedMotion:"no-preference",
  });
  // The remote Worker can deliver CSS after DOMContentLoaded. A no-JS
  // computed-style assertion before the stylesheet arrives is meaningless:
  // an unstyled <div> defaults to display:block. Wait for actual CSS.
  await noScript.goto(base,{waitUntil:"load",timeout:60000});
  await noScript.evaluate(() => document.fonts.ready);
  await noScript.waitForFunction(() =>
    getComputedStyle(document.querySelector(".morph-cards")).display === "grid",
    null,{timeout:12000});
  const plain = await noScript.locator(".hero-morph").evaluate(root => {
    const cards=[...root.querySelectorAll(".morph-card")].map(el=>el.getBoundingClientRect());
    const rr=root.querySelector(".morph-result").getBoundingClientRect();
    const dr=root.querySelector(".morph-decision").getBoundingClientRect();
    const overlap=[];
    for(let a=0;a<cards.length;a++)for(let b=a+1;b<cards.length;b++){
      const x=Math.min(cards[a].right,cards[b].right)-Math.max(cards[a].left,cards[b].left);
      const y=Math.min(cards[a].bottom,cards[b].bottom)-Math.max(cards[a].top,cards[b].top);
      if(x>2&&y>2)overlap.push({a,b});
    }
    const mobileSQL=document.querySelector(".iq-mobile");
    return {
      enhanced:root.classList.contains("morph-enhanced"),
      cardsDisplay:getComputedStyle(root.querySelector(".morph-cards")).display,
      staticArrowVisible:getComputedStyle(root.querySelector(".morph-static-flow")).display!=="none",
      overlap,
      resultAfterCards:rr.top>=Math.max(...cards.map(c=>c.bottom))-3,
      decisionAfterResult:dr.top>=rr.bottom-3,
      opacity:Number(getComputedStyle(root.querySelector(".morph-result")).opacity),
      staticSQLVisible:mobileSQL && getComputedStyle(mobileSQL).display!=="none",
      staticSQLHeight:document.querySelector(".iq").getBoundingClientRect().height,
      viewportHeight:innerHeight,
      noJSFeature:matchMedia("(scripting:none)").matches,
    };
  });
  assert.equal(plain.enhanced,false,"no-JS browser must never activate GSAP");
  assert.equal(plain.cardsDisplay,"grid","no-JS desktop must use readable source grid");
  assert.equal(plain.staticArrowVisible,true,"no-JS desktop must show how inputs become the result");
  assert.deepEqual(plain.overlap,[],"no-JS desktop source cards overlap");
  assert.equal(plain.resultAfterCards,true,"no-JS desktop result overlays source cards");
  assert.equal(plain.decisionAfterResult,true,"no-JS desktop decision overlays result");
  assert.ok(plain.opacity>=0.99,"no-JS desktop must have visible result");
  assert.equal(plain.staticSQLVisible,true,"no-JS desktop should see SSR SQL excerpts");
  assert.ok(plain.staticSQLHeight<=plain.viewportHeight*1.5,
    `no-JS SQL section reserves a pointless scroll runway (${plain.staticSQLHeight}px)`);
  await noScript.close();

  const desktop = await browser.newPage({viewport:{ width:1440, height:900 }, reducedMotion:"no-preference"});
  await desktop.addInitScript(() => sessionStorage.setItem("bredge_preloaded", "1"));
  await desktop.goto(base,{waitUntil:"domcontentloaded"});
  await desktop.locator(".hero-morph.morph-enhanced").waitFor({state:"attached",timeout:12000});
  const scene = await desktop.locator(".hero-morph").evaluate(root => {
    const r=root.getBoundingClientRect();
    const sticky=root.querySelector(".hero-morph-content");
    return {top:r.top+scrollY,height:r.height,stickyPosition:getComputedStyle(sticky).position,pinCount:root.querySelectorAll(".pin-spacer").length};
  });
  assert.equal(scene.stickyPosition,"sticky","desktop must have a single CSS-owned sticky viewport");
  assert.equal(scene.pinCount,0,"hero narrative must not use GSAP pin spacers");
  // The site uses scroll-behavior:smooth. A programmatic scrollTo(x,y)
  // otherwise starts an animation; a fixed sleep can check an intermediate
  // scroll offset and mistake it for a broken CSS-sticky section.
  const midpoint = await desktop.evaluate(({top,height}) => {
    const requested=top+(height-innerHeight)*0.53;
    window.scrollTo({ top:requested, behavior:"instant" });
    return requested;
  }, scene);
  await desktop.waitForFunction(target=>Math.abs(window.scrollY-target)<3, midpoint, {timeout:2500});
  await desktop.waitForTimeout(280);
  const stickyTop = await desktop.locator(".hero-morph-content").evaluate(el=>el.getBoundingClientRect().top);
  assert.ok(Math.abs(stickyTop)<=4,
    `Hero sticky scene moved by ${stickyTop}px at mid-scroll. Check ancestor overflow and CSS sticky containment.`);
  await desktop.waitForTimeout(650);
  // Five measured routes must connect actual DOM cards to one hub, remain
  // visible WITH the section heading, and follow transformed source cards.
  const measuredFlow = await desktop.locator(".hero-morph").evaluate(root => {
    const flow=root.querySelector(".morph-flow");
    const svgBox=flow.getBoundingClientRect();
    const view=flow.viewBox.baseVal;
    const heading=root.querySelector(".hero-morph-tease");
    const cards=[...root.querySelectorAll(".morph-card")];
    const paths=[...root.querySelectorAll(".morph-flow-route")];
    const tips=[...root.querySelectorAll(".morph-flow-tip")];
    const output=root.querySelector(".morph-result").getBoundingClientRect();
    const ox=output.left+output.width/2;
    const oy=output.top+output.height/2;
    const sx=svgBox.width/view.width;
    const sy=svgBox.height/view.height;
    return {
      headingOpacity:Number(getComputedStyle(heading).opacity),
      activeChapter:root.querySelector(".morph-chapter.is-active")?.textContent?.trim(),
      headingVisible:heading.getBoundingClientRect().top < innerHeight
        && heading.getBoundingClientRect().bottom>0,
      svgDisplay:getComputedStyle(flow).display,
      pathCount:paths.length, tipCount:tips.length,
      pathChecks:paths.map((path,index)=>{
        const nums=(path.getAttribute("d").match(/-?[0-9]+(?:\.[0-9]+)?/g)||[]).map(Number);
        const r=cards[index].getBoundingClientRect();
        const startX=svgBox.left+nums[0]*sx, startY=svgBox.top+nums[1]*sy;
        const endX=svgBox.left+nums[6]*sx, endY=svgBox.top+nums[7]*sy;
        return {
          measured:nums.length>=8,
          beginsAtSource:startX>=r.left-9&&startX<=r.right+9&&startY>=r.top-9&&startY<=r.bottom+9,
          endsAtHub:Math.hypot(endX-ox,endY-oy)<20,
          opacity:Number(getComputedStyle(path).opacity),
          dash:getComputedStyle(path).strokeDashoffset,
        };
      }),
    };
  });
  assert.equal(measuredFlow.headingVisible,true,"section header must remain in view while sources converge");
  assert.ok(measuredFlow.headingOpacity>=.95,"section heading must not fade out before the arrows appear");
  assert.match(measuredFlow.activeChapter || "", /^02 \/ Reconcile differences/,
    "when arrows converge, the section should identify the reconciliation stage");
  assert.equal(measuredFlow.svgDisplay,"block","desktop must display the measured arrow field");
  assert.equal(measuredFlow.pathCount,5,"each source must have one route to the shared model");
  assert.equal(measuredFlow.tipCount,5,"each route must end with a directional arrowhead");
  assert.ok(measuredFlow.pathChecks.every(p=>p.measured&&p.beginsAtSource&&p.endsAtHub),
    `connectors are no longer anchored to the actual cards / result: ${JSON.stringify(measuredFlow.pathChecks)}`);
  assert.ok(measuredFlow.pathChecks.filter(p=>p.opacity>.3).length>=4,
    "arrows should be visible before the final result, not hidden or drawn too late");

  await desktop.evaluate(({top,height})=>
    window.scrollTo({top:top+height-innerHeight-12,behavior:"instant"}),scene);
  await desktop.waitForTimeout(650);
  const reveal = await desktop.locator(".morph-result").evaluate(el=>Number(getComputedStyle(el).opacity));
  assert.ok(reveal > 0.9, `desktop narrative never reveals outcome (opacity ${reveal})`);
  const finalHeading = await desktop.locator(".hero-morph-tease").evaluate(el=>Number(getComputedStyle(el).opacity));
  assert.ok(finalHeading >= .95, "heading must still contextualise the reconciled result");
  const finalChapter=await desktop.locator(".morph-chapter.is-active").textContent();
  assert.match(finalChapter || "", /^03 \/ One trusted model/,
    "once the output appears the section should label the trusted model");
  await desktop.close();

  const llms = await browser.newPage();
  const llmsRes = await llms.request.get(`${base}/llms.txt`);
  assert.equal(llmsRes.status(),200,"agent-readable public map missing");
  assert.match(await llmsRes.text(), /user.authorised|user-authorised/i);
  const manifest = await llms.request.get(`${base}/.well-known/bredge-agent.json`);
  assert.equal(manifest.status(),200,"agent capabilities manifest missing");
  const doc = await manifest.json();
  assert.equal(doc.agent_authentication.public_write_credentials_available, false, "public write bypass must not be offered");
  await llms.close();
  console.log("✓ mobile-native source grid and form, desktop motion bounds and agent manifest");
}

async function testShortAndReducedMotion(browser) {
  for (const config of [
    { name: "short", viewport: { width: 1280, height: 700 }, reducedMotion: "no-preference" },
    { name: "reduced", viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" },
  ]) {
    const context = await browser.newContext({ viewport: config.viewport, reducedMotion: config.reducedMotion });
    await context.addInitScript(() => sessionStorage.setItem("bredge_preloaded", "1"));
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "domcontentloaded" });
    // Distinguish a slow network from broken reduced-motion behavior: start
    // the completion deadline at React's hydration effect, not DOMContentLoaded.
    // Merely waiting indefinitely for iq-done would make this test vacuous.
    await page.locator('.iq[data-iq-hydrated="true"]').waitFor({ state: "attached", timeout: 10_000 });
    const hydratedAt = Date.now();
    await page.locator(".iq.iq-done").waitFor({ state: "attached", timeout: 1_600 });
    assert.ok(Date.now() - hydratedAt <= 1_650, `${config.name}: SQL completion was too slow after hydration`);
    // Confirm the completed result is actually presented, not just a CSS
    // marker accidentally left on the root.
    await page.waitForFunction(() => {
      const root = document.querySelector(".iq");
      const result = root?.querySelector(".iq-result");
      return Boolean(result) && Number(getComputedStyle(result).opacity) >= 0.95;
    }, null, { timeout: 2_000 });
    const state = await page.locator(".iq").evaluate((root) => ({
      scenePosition: getComputedStyle(root.querySelector(".iq-scene")).position,
      lastStageActive: root.querySelector(".iq-stage:last-child")?.classList.contains("active"),
      resultVisible: Number(getComputedStyle(root.querySelector(".iq-result")).opacity) >= 0.95,
      checksComplete: root.querySelector(".iq-result strong")?.textContent?.includes("6 / 6 checks passed"),
    }));
    assert.ok(state.scenePosition !== "sticky" && state.scenePosition !== "fixed", `${config.name}: SQL scene should fall back to natural flow, got ${state.scenePosition}`);
    assert.equal(state.lastStageActive, true, `${config.name}: final SQL stage must be active`);
    assert.equal(state.resultVisible, true, `${config.name}: completed result must be visible`);
    assert.equal(state.checksComplete, true, `${config.name}: all six checks must be presented`);
    await page.screenshot({ path: new URL(`home-${config.name}.png`, artifacts).pathname, fullPage: false });
    await context.close();
  }
  console.log("✓ short viewport + reduced-motion fallbacks");
}

async function testExperienceMotionAndMobileReading(browser) {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
  await desktop.addInitScript(() => sessionStorage.setItem("bredge_preloaded", "1"));
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
  await mobile.addInitScript(() => sessionStorage.setItem("bredge_preloaded", "1"));
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(base, { waitUntil: "domcontentloaded" });
  await mobilePage.waitForTimeout(500);
  const mobileState = await mobilePage.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    trackDisplay: getComputedStyle(document.querySelector(".xp-track")).display,
    repeatDisplay: getComputedStyle(document.querySelector('.xp-track span[aria-hidden="true"]')).display,
    headingWraps: [...document.querySelectorAll("h1,h2,h3")].map((node) => getComputedStyle(node).textWrap),
    bodyWraps: [...document.querySelectorAll(".hero-summary,.section-heading > p,.case-copy > p")].map((node) => getComputedStyle(node).textWrap),
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
    await context.addInitScript(() => sessionStorage.setItem("bredge_preloaded", "1"));
    const page = await context.newPage();
    await assertPageBasics(page, "/insights");

    const featured = await page.locator(".insight-featured").getAttribute("href");
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

async function testContactCannotClaimUndeliveredSuccess(browser) {
  const context = await browser.newContext();
  try {
    const payload = {
      formType: "contact", name: "Internal QA", email: "qa-check@invalid.example",
      company: "Internal Test", message: "Controlled negative lead integrity test",
      needs: ["Data engineering"], company_website: "", elapsedMs: 100,
    };
    const headers = { Origin: "https://thebredge.com" };
    const fast = await context.request.post(`${base}/api/contact`, { data: payload, headers });
    assert.equal(fast.status(), 422, "fast lead must not be marked delivered");
    assert.equal((await fast.json()).ok, undefined);
    const trapped = await context.request.post(`${base}/api/contact`, {
      data: { ...payload, elapsedMs: 2000, company_website: "autofilled" }, headers,
    });
    assert.equal(trapped.status(), 422, "honeypot autofill must not be marked delivered");
    assert.equal((await trapped.json()).ok, undefined);
    console.log("✓ contact fast-fill/honeypot rejected without false success");
  } finally {
    await context.close();
  }
}

async function testHeaders(browser) {
  const context = await browser.newContext();
  const response = await context.request.get(base);
  const headers = response.headers();
  assert.equal(headers["x-content-type-options"], "nosniff");
  assert.equal(headers["x-frame-options"], "SAMEORIGIN");
  assert.equal(headers["referrer-policy"], "strict-origin-when-cross-origin");
  assert.ok(headers["permissions-policy"]?.includes("camera=()"));
  assert.equal(headers["x-robots-tag"], "noindex, nofollow", "preview and local host must not be indexed");
  assert.ok(headers["content-security-policy-report-only"]?.includes("frame-ancestors 'self'"));
  await context.close();
  console.log("✓ response hardening headers");
}

const browser = await chromium.launch({ headless: true });
try {
  await testRouteMatrix(browser);
  await testInternalLinks(browser);
  await testScrollNarratives(browser);
  await testHeroCompositionAndMobileNative(browser);
  await testMeasuredArrowResponsiveLayout(browser);
  await testMobileFirstVisitWithoutPreloader(browser);
  await testMobileMotionFallbacks(browser);
  await testShortAndReducedMotion(browser);
  await testExperienceMotionAndMobileReading(browser);
  await testInsights(browser);
  await testContactCannotClaimUndeliveredSuccess(browser);
  await testHeaders(browser);
  console.log("\nBredge browser QA: PASS");
} finally {
  await browser.close();
}
