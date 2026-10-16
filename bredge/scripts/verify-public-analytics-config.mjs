/** Fail the exact production bundle quality job on malformed public IDs.
 * Do not print IDs or analytics account information in CI logs. */
const settings=[
  {name:"NEXT_PUBLIC_GA4_MEASUREMENT_ID",valid:/^G-[A-Z0-9]{5,18}$/},
  {name:"NEXT_PUBLIC_CLARITY_PROJECT_ID",valid:/^[a-z0-9]{6,25}$/},
  {name:"NEXT_PUBLIC_GTM_ID",valid:/^GTM-[A-Z0-9]{4,14}$/},
];
for(const item of settings){
  const raw=process.env[item.name]||"";
  const value=raw.trim();
  // Build-time variable interpolation inlines the raw value. Reject padded
  // IDs now rather than declaring them valid and shipping a broken tracker.
  if(raw!==value){
    console.error("INVALID_PUBLIC_ANALYTICS_ID: "+item.name+" contains surrounding whitespace.");
    process.exit(1);
  }
  if(value && !item.valid.test(value)){
    console.error("INVALID_PUBLIC_ANALYTICS_ID: "+item.name+" must match its documented format.");
    process.exit(1);
  }
}
if(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim() && process.env.NEXT_PUBLIC_GTM_ID?.trim()){
  console.error("ANALYTICS_DUPLICATION_RISK: review GA4-vs-GTM ownership and choose one loading path.");
  process.exit(1);
}
console.log("PUBLIC_ANALYTICS_CONFIG_FORMAT_CHECK_PASS");
