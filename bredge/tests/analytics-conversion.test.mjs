import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { trackEvent, trackOnce, trafficGroup } from "../lib/analytics.ts";

const originalWindow=globalThis.window;
const originalStorage=globalThis.localStorage;
const originalLocation=globalThis.location;
function env(consent){
  const events=[];
  globalThis.localStorage={ getItem:(name)=>name==="bredge_consent"?consent:null };
  globalThis.location={pathname:"/contact",hostname:"thebredge.com",search:"",host:"thebredge.com"};
  globalThis.window={location:globalThis.location,gtag:(...args)=>events.push(args),dataLayer:[],clarity:()=>{},innerWidth:390};
  return events;
}
function reset(){
  if(originalWindow===undefined)delete globalThis.window;else globalThis.window=originalWindow;
  if(originalStorage===undefined)delete globalThis.localStorage;else globalThis.localStorage=originalStorage;
  if(originalLocation===undefined)delete globalThis.location;else globalThis.location=originalLocation;
}
test("lead conversion event is opt-in, standard GA4 and carries no enquiry PII",()=>{
  try{
    let e=env("denied");
    trackEvent("contact_success",{name:"Jane",email:"jane@example.com",company:"Client",message:"Private",phone:"+441234",intent:"diagnostic"});
    assert.equal(e.length,0);
    e=env("granted");
    trackEvent("contact_success",{name:"Jane",email:"jane@example.com",company:"Client",message:"Private",phone:"+441234",intent:"diagnostic"});
    assert.equal(e.filter(x=>x[1]==="contact_success").length,1);
    assert.equal(e.filter(x=>x[1]==="generate_lead").length,1);
    assert.equal(e[1][2].method,"website_contact_form");
    assert.equal(e[1][2].lead_source,undefined,"Do not overwrite GA4 session attribution with an internal referrer");
    for(const args of e)assert.doesNotMatch(JSON.stringify(args),/jane|Private|\+441234|Client/);
  }finally{reset()}
});
test("scroll milestones are not burned before analytics consent",()=>{
  try{
    let e=env("denied");
    trackOnce("reference_work_reached",{page_path:"/"});
    assert.equal(e.length,0);
    e=env("granted");
    globalThis.location.pathname="/insights";
    trackOnce("reference_work_reached",{page_path:"/insights"});
    trackOnce("reference_work_reached",{page_path:"/insights"});
    assert.equal(e.filter(a=>a[1]==="reference_work_reached").length,1);
    globalThis.location.pathname="/services";
    trackOnce("reference_work_reached",{page_path:"/services"});
    assert.equal(e.filter(a=>a[1]==="reference_work_reached").length,2);
  }finally{reset()}
});
test("Clarity consent and all contact text are explicitly masked",()=>{
 const form=readFileSync(new URL("../components/interactions/ContactForm.tsx",import.meta.url),"utf8");
 const analytics=readFileSync(new URL("../components/site/Analytics.tsx",import.meta.url),"utf8");
 assert.match(form,/data-clarity-mask="true"/);
 assert.match(analytics,/stored === "granted"\) loadVendors/);
 assert.match(analytics,/data-cta/);
 assert.match(analytics,/className="button button-small"/);
 assert.doesNotMatch(analytics,/className="button cta-accent button-small"/);
 assert.match(form,/className="button cta-accent" type="submit"/);
});


test("AI referrals do not misclassify ordinary email marketing",()=>{
 try{
   env("granted");
   const previousDocument=globalThis.document;
   globalThis.document={referrer:""};
   try{
     globalThis.location.search="?utm_medium=email&utm_source=weekly_update";
     assert.equal(trafficGroup(),"direct","email is not an AI-search referral");
     globalThis.location.search="?utm_medium=ai-search&utm_source=chatgpt";
     assert.equal(trafficGroup(),"ai_referral");
   }finally{
     if(previousDocument===undefined)delete globalThis.document;
     else globalThis.document=previousDocument;
   }
 }finally{reset()}
});
