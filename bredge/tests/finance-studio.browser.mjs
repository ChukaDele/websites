import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

/** Full-source Financial Sample BI workspace release regression, public data only. */
export async function testFinanceStudio(browser,base){
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:"reduce"});
 try{
  const result=await page.goto(base+"/portfolio/finance/studio",{waitUntil:"domcontentloaded",timeout:30000});
  assert.equal(result?.status(),200);
  const studio=page.locator('[data-finance-studio="true"][data-ready="true"]');
  await studio.waitFor({timeout:20000});
  const source=await page.locator(".bi-intro-meta").innerText();
  assert.match(source,/700 of 700 records/);
  const kpis=await page.locator(".bi-kpi strong").allInnerTexts();
  assert.deepEqual(kpis,["$118.73m","$16.89m","14.2%","7.2%"]);
  const scene=await page.evaluate(()=>({height:document.documentElement.scrollHeight,
   horizontal:document.documentElement.scrollWidth-document.documentElement.clientWidth,
   columns:document.querySelectorAll(".bi-trend-chart .recharts-bar-rectangle").length}));
  assert.ok(scene.horizontal<=2,"Finance studio desktop horizontal overflow");
  assert.ok(scene.height<=930,"Finance studio must fit a normal desktop viewport");
  assert.equal(scene.columns,16,"Actual monthly data must render as bars");

  await page.getByRole("button",{name:"2014",exact:true}).click();
  assert.match(await page.locator(".bi-intro-meta").innerText(),/525 of 700 records/);
  await page.getByRole("button",{name:"All",exact:true}).first().click();

  // Same month can be filtered by keyboard through the labelled native control.
  await page.getByRole("combobox",{name:"Filter month"}).selectOption("2014-02");
  assert.match(await page.locator(".bi-intro-meta").innerText(),/35 of 700 records/);
  await page.getByRole("combobox",{name:"Filter month"}).selectOption("");

  const firstMonth=page.locator(".bi-trend-chart .recharts-bar-rectangle").nth(4);
  await firstMonth.click();
  assert.match(page.url(),/month=/,"Click-to-filter month must affect shareable URL");
  assert.ok(!await page.locator(".bi-intro-meta").innerText().then(s=>s.includes("700 of 700 records")));
  await page.getByRole("button",{name:/Reset/}).first().click();

  const cell=page.locator(".bi-margin-matrix button:not([disabled])").nth(3);
  await cell.click();
  assert.ok(await page.locator(".bi-intro-meta").innerText().then(s=>!s.includes("700 of 700 records")),
   "Margin matrix must update global filters");
  await page.getByRole("button",{name:/Reset/}).first().click();

  await page.locator(".bi-filter-trigger").first().click();
  await page.getByRole("checkbox",{name:"Canada",exact:true}).check();
  await page.getByRole("button",{name:/Apply/}).click();
  assert.match(await page.locator(".bi-intro-meta").innerText(),/140 of 700 records/);

  await page.getByRole("button",{name:"Transaction explorer"}).click();
  assert.equal(await page.locator(".bi-data-scroller tbody tr").count(),25);
  await page.locator(".bi-data-scroller tbody tr").first().click();
  assert.equal(await page.locator(".bi-row-detail").count(),1);
  await page.getByRole("button",{name:"Close details"}).click();

  // No wrong-signed financial figure can reach the decision screen.
  await page.getByRole("button",{name:/Reset/}).first().click();
  await page.locator(".bi-filter-trigger").nth(2).click();
  await page.getByRole("checkbox",{name:"Enterprise",exact:true}).check();
  await page.getByRole("button",{name:/Apply/}).click();
  await page.getByRole("button",{name:"Profit drivers"}).click();
  assert.match(await page.locator(".bi-bridge-step").last().innerText(),/−\$614/,"Enterprise sample loss must have a visible minus sign");
  await page.getByRole("button",{name:/Reset/}).first().click();
  await page.locator(".bi-filter-trigger").first().click();
  await page.getByRole("checkbox",{name:"Canada",exact:true}).check();
  await page.getByRole("button",{name:/Apply/}).click();

  await page.getByRole("button",{name:"Scenario lab"}).click();
  const prior=await page.locator(".bi-scenario-headline strong").innerText();
  await page.locator("#bi-extra-discount").fill("10");
  assert.notEqual(prior,await page.locator(".bi-scenario-headline strong").innerText());

  await page.getByRole("button",{name:"Save view",exact:true}).click();
  await page.locator("#bi-view-name").fill("Canada finance diagnostic");
  await page.getByRole("button",{name:/Save view/}).last().click();
  assert.equal(await page.locator(".bi-stored-line").count(),1);

  const exportWait=page.waitForEvent("download");
  await page.getByRole("button",{name:"Export CSV"}).click();
  const file=await exportWait;
  assert.match(file.suggestedFilename(),/\.csv$/);
  const csv=await readFile(await file.path(),"utf8");
  assert.equal(csv.split("\r\n").length,141,"Top-level export must represent the 140 Canada rows");
  console.log("✓ Finance Studio: KPI reconciliation, click filters, table, what-if, saved views, export");

  for(const [width,height] of [[390,844],[320,640],[1280,720]]){
   const responsive=await browser.newPage({viewport:{width,height},reducedMotion:"reduce"});
   try{
    await responsive.goto(base+"/portfolio/finance/studio",{waitUntil:"domcontentloaded"});
    await responsive.locator('[data-ready="true"]').waitFor({timeout:18000});
    const geometry=await responsive.evaluate(()=>({
      scrollWidth:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      chartHeight:document.querySelector(".bi-trend-chart")?.getBoundingClientRect().height||0,
      controls:[...document.querySelectorAll(".bi-filter-trigger")].every(x=>x.getBoundingClientRect().width>=80)
    }));
    assert.ok(geometry.scrollWidth<=2,"Overflow on "+width+"px");
    assert.ok(geometry.chartHeight>=110&&geometry.controls,"Unreadable chart or slicer on "+width+"px");
    if(width<400){
      // Popovers must stay inside the actual phone viewport, including the last slicer.
      await responsive.locator(".bi-filter-trigger").last().click();
      const expanded=await responsive.evaluate(()=>({
       overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
       right:document.querySelector(".bi-filter-popover")?.getBoundingClientRect().right||0
      }));
      assert.ok(expanded.overflow<=2&&expanded.right<=width+2,"Mobile open slicer causes overflow: "+JSON.stringify(expanded));
      await responsive.keyboard.press("Escape");
      assert.ok(await responsive.getByRole("button",{name:/Saved views/}).isVisible(),"Saved views must be reachable on mobile");
    }
   }finally{await responsive.close()}
  }
  console.log("✓ Finance Studio: mobile, narrow and short desktop responsive flow");
 }finally{await page.close()}
}
