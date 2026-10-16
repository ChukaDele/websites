/* eslint-disable @next/next/no-img-element */
"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {Area,AreaChart,CartesianGrid,ResponsiveContainer,Tooltip,XAxis,YAxis} from "recharts";
import {ArrowDownToLine,ArrowLeft,ArrowRight,ArrowUpRight,BarChart3,Bookmark,Check,ChevronDown,ChevronLeft,ChevronRight,Copy,Database,Filter,Info,LayoutDashboard,Link2,RotateCcw,Search,SlidersHorizontal,Sparkles,Table2,X} from "lucide-react";
import dataset from "../../lib/financial-full-sample.json";
import type {FinanceFilters,FinancialRecord} from "../../lib/finance-studio-model";
import {defaultFilters,applyFilters,aggregate,groupBy,marginMatrix,monthlySeries,financeScenario,currency,number,pct,countries,orderedProducts,orderedSegments,discountBands,getFilterCount,safeParamFilters,encodeFilterParams} from "../../lib/finance-studio-model";
import {TrendChart,SegmentRanks,MarginMatrix,ProfitBridge,ProductScatter} from "./FinanceVisuals";

const rows=dataset.records as FinancialRecord[];
type View="overview"|"drivers"|"records"|"scenario";
type FilterField="countries"|"products"|"segments"|"bands";
type SavedView={id:string;name:string;filters:FinanceFilters;view:View};
type SortKey="date"|"country"|"segment"|"product"|"sales"|"profit"|"discounts";
const selections:[FilterField,string,readonly string[]][]=[
 ["countries","Markets",countries],["products","Products",orderedProducts],
 ["segments","Segments",orderedSegments],["bands","Discount tiers",discountBands]
];
function sanitizeSavedViews(raw:unknown):SavedView[]{
 if(!Array.isArray(raw))return [];
 const allowedViews=new Set<View>(["overview","drivers","records","scenario"]);
 return raw.flatMap((item):SavedView[]=>{
  if(!item||typeof item!=="object")return [];
  const record=item as Record<string,unknown>;
  if(typeof record.id!=="string"||typeof record.name!=="string"||!record.name.trim()||!allowedViews.has(record.view as View)
   ||!record.filters||typeof record.filters!=="object")return [];
  const f=record.filters as Record<string,unknown>;
  const p=new URLSearchParams();
  if(typeof f.year==="string")p.set("year",f.year);
  for(const key of ["countries","products","segments","bands"] as const){
   if(Array.isArray(f[key]))p.set(key,f[key].filter((s:unknown)=>typeof s==="string").join(","));
  }
  if(typeof f.month==="string")p.set("month",f.month);
  return [{id:record.id.slice(0,90),name:record.name.slice(0,54),view:record.view as View,filters:safeParamFilters(p)}];
 }).slice(-12);
}
const tabs:[View,string,string,typeof LayoutDashboard][]=[
 ["overview","Overview","01",LayoutDashboard],["drivers","Profit drivers","02",BarChart3],
 ["records","Transaction explorer","03",Table2],["scenario","Scenario lab","04",SlidersHorizontal]
];
function FilterMenu({label,values,options,onChange}:{label:string;values:string[];options:readonly string[];onChange:(v:string[])=>void}){
 const [open,setOpen]=useState(false),[search,setSearch]=useState("");
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(!open)return;
  const down=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false)};
  const key=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false)};
  document.addEventListener("pointerdown",down);document.addEventListener("keydown",key);
  return()=>{document.removeEventListener("pointerdown",down);document.removeEventListener("keydown",key)};
 },[open]);
 const optionsVisible=options.filter(x=>x.toLowerCase().includes(search.toLowerCase()));
 return <div className={"bi-filter-menu"+(open?" is-open":"")} ref={root}>
  <button type="button" className="bi-filter-trigger" aria-expanded={open} onClick={()=>setOpen(x=>!x)}>
   <span>{label}</span><strong>{values.length?values.length===1?values[0]:values.length+" selected":"All"}</strong><ChevronDown size={14}/>
  </button>
  {open&&<div className="bi-filter-popover" role="group" aria-label={"Filter by "+label}>
   <div className="bi-filter-search"><Search size={14}/><input aria-label={"Search "+label} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find an option"/></div>
   <div className="bi-filter-items">{optionsVisible.map(x=><label key={x} className="bi-filter-item">
    <input type="checkbox" checked={values.includes(x)} onChange={e=>onChange(e.target.checked?[...values,x]:values.filter(v=>v!==x))}/><span>{x}</span>
   </label>)}{!optionsVisible.length&&<p>No matching options.</p>}</div>
   <div className="bi-filter-actions"><button type="button" onClick={()=>onChange([])}>Clear</button><button type="button" onClick={()=>setOpen(false)}>Apply <Check size={14}/></button></div>
  </div>}
 </div>;
}
function MiniSpark({values}:{values:number[]}){
 const max=Math.max(1,...values),min=Math.min(0,...values);
 const points=values.map((n,i)=>(i/Math.max(values.length-1,1)*96)+","+(34-(n-min)/(max-min||1)*29)).join(" ");
 return <svg viewBox="0 0 96 36" aria-hidden="true" preserveAspectRatio="none"><polyline fill="none" stroke="#76a58e" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" points={points}/></svg>;
}
function Metric({label,value,note,values,accent}:{label:string;value:string;note:string;values:number[];accent?:boolean}){
 return <article className={"bi-kpi"+(accent?" bi-kpi-primary":"")}><div className="bi-kpi-top"><span>{label}</span><Info size={13} aria-label={note}/></div><strong>{value}</strong><div className="bi-kpi-bottom"><small>{note}</small><MiniSpark values={values}/></div></article>;
}
function toCsv(items:FinancialRecord[]){
 const keys:[keyof FinancialRecord,string][]=[
  ["date","Date"],["country","Country"],["product","Product"],["segment","Segment"],["discountBand","Discount band"],
  ["units","Units sold"],["gross","Gross sales"],["discounts","Discounts"],["sales","Net sales"],["cogs","COGS"],["profit","Profit"]
 ];
 const escape=(x:unknown)=>{
  const text=String(x??"");const safe=/^[=+@-]/.test(text)&&!/^-[0-9]/.test(text)?"'"+text:text;
  return '"'+safe.replace(/"/g,'""')+'"';
 };
 return [keys.map(k=>escape(k[1])).join(","),...items.map(row=>keys.map(k=>escape(row[k[0]])).join(","))].join("\r\n");
}

export default function FinanceStudio(){
 const [view,setView]=useState<View>("overview");
 const [filters,setFilters]=useState<FinanceFilters>(defaultFilters);
 const [search,setSearch]=useState("");
 const [sort,setSort]=useState<{key:SortKey;desc:boolean}>({key:"sales",desc:true});
 const [page,setPage]=useState(0);
 const [selectedRow,setSelectedRow]=useState<FinancialRecord|null>(null);
 const [extraDiscount,setExtraDiscount]=useState(2),[volumeChange,setVolumeChange]=useState(0);
 const [views,setViews]=useState<SavedView[]>([]),[saveName,setSaveName]=useState("");
 const [showMobileViews,setShowMobileViews]=useState(false);
 const [toast,setToast]=useState(""),[ready,setReady]=useState(false);
 const saveDialog=useRef<HTMLDialogElement>(null);
 const hydrated=useRef(false);
 useEffect(()=>{
  const parsed=safeParamFilters(new URLSearchParams(location.search));
  const tab=new URLSearchParams(location.search).get("tab");
  const saved=(()=>{try{return sanitizeSavedViews(JSON.parse(localStorage.getItem("bredge_finance_saved_views_v1")||"[]"))}catch{return []}})();
  queueMicrotask(()=>{
   setFilters(parsed);
   if(tabs.some(t=>t[0]===tab))setView(tab as View);
   setViews(saved);setReady(true);hydrated.current=true;
  });
 },[]);
 useEffect(()=>{
  if(!ready||!hydrated.current)return;
  const params=encodeFilterParams(filters);
  if(view!=="overview")params.set("tab",view);
  const q=params.toString();
  history.replaceState({},"",location.pathname+(q?"?"+q:""));
 },[filters,view,ready]);
 const filtered=useMemo(()=>applyFilters(rows,filters),[filters]);
 const chartRows=useMemo(()=>applyFilters(rows,filters,["month"]),[filters]);
 const productUniverse=useMemo(()=>applyFilters(rows,filters,["products","segments"]),[filters]);
 const metrics=useMemo(()=>aggregate(filtered),[filtered]);
 const months=useMemo(()=>monthlySeries(chartRows),[chartRows]);
 const currentMonths=useMemo(()=>monthlySeries(filtered),[filtered]);
 const segments=useMemo(()=>groupBy(applyFilters(rows,filters,["segments"]),"segment"),[filters]);
 const products=useMemo(()=>groupBy(applyFilters(rows,filters,["products"]),"product"),[filters]);
 const selectedSegments=useMemo(()=>groupBy(filtered,"segment"),[filtered]);
 const selectedProducts=useMemo(()=>groupBy(filtered,"product"),[filtered]);
 const productCells=useMemo(()=>marginMatrix(productUniverse),[productUniverse]);
 const scenario=useMemo(()=>financeScenario(filtered,extraDiscount,volumeChange),[filtered,extraDiscount,volumeChange]);
 const updateField=(field:FilterField,value:string[])=>{setFilters(f=>({...f,[field]:value}));setPage(0)};
 const toggleField=(field:FilterField,n:string)=>updateField(field,filters[field].length===1&&filters[field][0]===n?[]:[n]);
 const selectMatrix=(product:string,segment:string)=>{
  setPage(0);
  setFilters(f=>{
   const same=f.products.length===1&&f.products[0]===product&&f.segments.length===1&&f.segments[0]===segment;
   return {...f,products:same?[]:[product],segments:same?[]:[segment]};
  });
 };
 const reset=()=>{setFilters(defaultFilters);setView("overview");setSearch("");setPage(0);setSelectedRow(null);setExtraDiscount(2);setVolumeChange(0)};
 const scope=filters.month?new Date(filters.month+"-01T00:00:00Z").toLocaleDateString("en-GB",{month:"long",year:"numeric",timeZone:"UTC"}):filters.year==="all"?"Sep 2013 – Dec 2014":filters.year;
 const activeFilters=getFilterCount(filters);
 const lowestSegment=[...selectedSegments].sort((a,b)=>a.profit-b.profit)[0];
 const topProduct=[...selectedProducts].sort((a,b)=>b.profit-a.profit)[0];
 const maxDiscount=[...selectedSegments].sort((a,b)=>b.discounts-a.discounts)[0];
 const explain=()=>{
  if(!filtered.length)return "No records match the selected filters.";
  return "Selected scope: "+number(metrics.records)+" rows in the Microsoft Financial Sample. Net sales: "+currency(metrics.sales)+". Profit: "+currency(metrics.profit)+" ("+pct(metrics.margin)+" margin). "+(lowestSegment?"Lowest-profit segment: "+lowestSegment.name+" ("+currency(lowestSegment.profit)+"). ":"")+(topProduct?"Highest product profit: "+topProduct.name+" ("+currency(topProduct.profit)+"). ":"")+"Educational synthetic records; this evidence describes associations, not causes.";
 };
 const copyText=async(value:string,message:string)=>{try{await navigator.clipboard.writeText(value);setToast(message)}catch{setToast("Copy unavailable in this browser. Use your browser's share controls.")}};
 const save=()=>{
  const name=saveName.trim().slice(0,54);if(!name)return;
  const next=[...views,{id:crypto.randomUUID(),name,filters,view}].slice(-12);
  try{localStorage.setItem("bredge_finance_saved_views_v1",JSON.stringify(next));setViews(next);setToast("View saved on this device")}catch{setToast("Unable to store the view on this device")}
  saveDialog.current?.close();setSaveName("");
 };
 const recordRows=useMemo(()=>{
  const q=search.trim().toLowerCase();
  return filtered.filter(r=>!q||[r.product,r.country,r.segment,r.discountBand,r.date].some(x=>x.toLowerCase().includes(q))).sort((a,b)=>{
   const va=a[sort.key],vb=b[sort.key];
   const delta=typeof va==="number"&&typeof vb==="number"?va-vb:String(va).localeCompare(String(vb));
   return (sort.desc?-1:1)*delta;
  });
 },[filtered,search,sort]);
 const exportData=(includeSearch=false)=>{
  const selected=includeSearch?recordRows:filtered;
  const blob=new Blob([toCsv(selected)],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download="bredge-microsoft-financial-sample-filtered.csv";
  document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),500);
  setToast(number(selected.length)+(includeSearch?" searched":" filtered")+" records exported");
 };
 const sortBy=(key:SortKey)=>{setSort(s=>({key,desc:s.key===key?!s.desc:["sales","profit","discounts"].includes(key)}));setPage(0)};
 const totalPages=Math.max(1,Math.ceil(recordRows.length/25));
 const safePage=Math.max(0,Math.min(page,totalPages-1));
 const pageRows=recordRows.slice(safePage*25,(safePage+1)*25);
 const rowMargin=(r:FinancialRecord)=>r.sales?r.profit/r.sales*100:0;
 const monthSelected=(m:string)=>{setPage(0);setFilters(f=>({...f,month:f.month===m?null:m}))};
 const question=(kind:"losses"|"discount"|"margin"|"scenario")=>{
  if(kind==="scenario"){setView("scenario");return}
  if(kind==="losses"&&lowestSegment){updateField("segments",[lowestSegment.name]);setView("drivers")}
  if(kind==="discount"&&maxDiscount){updateField("segments",[maxDiscount.name]);setView("drivers")}
  if(kind==="margin"&&topProduct){updateField("products",[topProduct.name]);setView("drivers")}
 };

 return <div className="finance-bi-app" inert={!ready} data-finance-studio="true" data-ready={ready?"true":"false"}>
  <aside className="bi-rail">
   <div className="bi-rail-brand">
    <a href="/portfolio/finance" aria-label="Return to Bredge Finance portfolio"><img src="/brand/bredge-logo.svg" alt="The Bredge"/></a>
    <span>Finance Studio <i>PREVIEW</i></span>
   </div>
   <div className="bi-rail-label">WORKSPACE</div>
   <nav className="bi-side-nav" aria-label="Finance studio views">
    {tabs.map(([value,label,index,Icon])=><button key={value} type="button" aria-current={view===value?"page":undefined}
      className={view===value?"is-current":""} onClick={()=>setView(value)}>
      <Icon size={17}/><span>{label}</span><small>{index}</small>
     </button>)}
   </nav>
   <button type="button" className="bi-mobile-saved-toggle" aria-expanded={showMobileViews}
     onClick={()=>setShowMobileViews(v=>!v)}><Bookmark size={15}/> Saved views ({views.length}) <ChevronDown size={14}/></button>
   {showMobileViews&&<div className="bi-mobile-saved-panel">
      {views.length?views.map(saved=><div className="bi-stored-line" key={saved.id}>
       <button type="button" onClick={()=>{setFilters(saved.filters);setView(saved.view);setPage(0);setSearch("");setSelectedRow(null);setShowMobileViews(false);setToast("Loaded: "+saved.name)}}>
        <Bookmark size={13}/><span>{saved.name}</span>
       </button>
       <button type="button" aria-label={"Delete "+saved.name} onClick={()=>{
        const next=views.filter(x=>x.id!==saved.id);setViews(next);
        try{localStorage.setItem("bredge_finance_saved_views_v1",JSON.stringify(next))}catch{setToast("Unable to update saved views")}
       }}><X size={13}/></button>
      </div>):<p>No saved views on this device yet.</p>}
    </div>}
   <div className="bi-rail-stored">
    <div className="bi-rail-label">YOUR SAVED VIEWS</div>
    {views.length?views.map(v=><div className="bi-stored-line" key={v.id}>
      <button type="button" onClick={()=>{setFilters(v.filters);setView(v.view);setPage(0);setSearch("");setSelectedRow(null);setToast("Loaded: "+v.name)}} title={v.name}>
       <Bookmark size={13}/><span>{v.name}</span>
      </button>
      <button type="button" aria-label={"Delete "+v.name} onClick={()=>{
       const next=views.filter(x=>x.id!==v.id);setViews(next);
       try{localStorage.setItem("bredge_finance_saved_views_v1",JSON.stringify(next))}catch{setToast("Unable to update saved views on this device")}
      }}><X size={12}/></button>
     </div>):<p>Save a filtered report and return to it whenever you need.</p>}
   </div>
   <div className="bi-rail-bottom">
    <span><i className="bi-status-dot"/> 700 sample records</span>
    <small>Microsoft · 2013–14</small>
    <a href="/portfolio/finance"><ArrowLeft size={14}/> Back to portfolio</a>
   </div>
  </aside>
  <main className="bi-main">
   <header className="bi-topbar">
    <div className="bi-breadcrumb"><span>THE BREDGE</span><ChevronRight size={13}/><span>PORTFOLIO</span><ChevronRight size={13}/><strong>FINANCIAL INTELLIGENCE</strong></div>
    <div className="bi-top-actions">
     <span className="bi-public-tag"><i/> Public demonstration</span>
     <button type="button" onClick={()=>copyText(location.href,"Filtered link copied")} title="Share this view"><Link2 size={15}/> Share</button>
     <button type="button" onClick={()=>{setSaveName("");saveDialog.current?.showModal()}}><Bookmark size={15}/> Save view</button>
     <button type="button" className="bi-top-primary" onClick={()=>exportData(false)}><ArrowDownToLine size={15}/> Export CSV</button>
    </div>
   </header>
   <section className="bi-controls" aria-label="Report filters">
    <div className="bi-period"><span>PERIOD</span>{(["all","2013","2014"] as const).map(y=>
     <button key={y} type="button" className={filters.year===y?"is-selected":""} aria-pressed={filters.year===y}
      onClick={()=>{setFilters(f=>({...f,year:y,month:null}));setPage(0)}}>{y==="all"?"All":y}</button>)}
    </div>
    <div className="bi-slicer-row">
     {selections.map(([field,label,options])=><FilterMenu key={field} label={label} values={filters[field]}
      options={options} onChange={v=>updateField(field,v)}/>)}
    </div>
    {activeFilters>0&&<button className="bi-reset-filters" onClick={()=>{setFilters(defaultFilters);setPage(0)}} type="button">Clear {activeFilters} filters <X size={13}/></button>}
   </section>
   <div className="bi-content">
    <div className="bi-view-intro">
     <div>
      <span className="bi-overline">MANAGEMENT REPORT / {scope.toUpperCase()}</span>
      <h1>{view==="overview"?"Revenue, with the margin exposed.":view==="drivers"?"Follow the profit, not just the sales.":view==="records"?"Every figure back to its source row.":"Make the assumptions visible."}</h1>
      <p>{view==="overview"?"Explore what drives the result. Select any month, segment or matrix cell to filter the report.":view==="drivers"?"Trace discounts, costs and segment economics through the same financial model.":view==="records"?"Search, sort, inspect and export the source rows supporting every visual.":"Stress-test your own hypothetical discount and volume assumptions."}</p>
     </div>
     <div className="bi-intro-meta"><Database size={15}/><span><b>{number(metrics.records)} of 700 records</b><small>{scope} · synthetic sample</small></span>
      <button type="button" className="bi-inline-clear" onClick={reset}><RotateCcw size={13}/> Reset</button>
     </div>
    </div>
    <section className="bi-kpi-grid" aria-label="Financial KPI summary">
     <Metric label="NET SALES" value={currency(metrics.sales,true)} note="After discounts" values={currentMonths.map(x=>x.sales)} accent/>
     <Metric label="SAMPLE PROFIT" value={currency(metrics.profit,true)} note="Net sales − COGS" values={currentMonths.map(x=>x.profit)}/>
     <Metric label="PROFIT MARGIN" value={pct(metrics.margin)} note="Profit ÷ net sales" values={currentMonths.map(x=>x.sales?x.profit/x.sales:0)}/>
     <Metric label="DISCOUNT SHARE" value={pct(metrics.discountRate)} note="Discounts ÷ gross sales" values={currentMonths.map(x=>x.gross?x.discounts/x.gross:0)}/>
    </section>
    {!filtered.length?<div className="bi-empty-main"><Filter size={28}/><h2>No matching transactions</h2>
     <p>Try another period or remove one or more filters.</p>
     <button type="button" onClick={()=>{setFilters(defaultFilters);setPage(0)}}>Clear filters <RotateCcw size={14}/></button>
    </div>:<>
    {view==="overview"&&<div className="bi-dashboard-content">
     <div className="bi-primary-grid">
      <article className="bi-panel bi-primary-chart">
       <div className="bi-panel-head"><div><span>01 / TIME SERIES</span><h2>Sales and profit trajectory</h2></div>
        <div className="bi-chart-key"><span><i className="sales"/> Net sales</span><span><i className="profit"/> Profit · right axis</span></div>
       </div>
       <TrendChart series={months} month={filters.month} onMonthSelect={monthSelected}/>
       <div className="bi-panel-foot"><span>Click a bar or choose a month.</span>
        <label className="bi-month-select">Month
          <select aria-label="Filter month" value={filters.month||""} onChange={e=>{
           setPage(0);setFilters(f=>({...f,month:e.target.value||null}));
          }}><option value="">All months</option>{months.map(m=><option key={m.key} value={m.key}>{m.label}</option>)}</select>
        </label>
        {filters.month&&<button type="button" onClick={()=>{setPage(0);setFilters(f=>({...f,month:null}))}}>Clear <X size={12}/></button>}</div>
      </article>
      <article className="bi-panel bi-rank-panel">
       <div className="bi-panel-head"><div><span>02 / SEGMENT PERFORMANCE</span><h2>Who generates the value?</h2></div><span className="bi-subtle">MARGIN</span></div>
       <SegmentRanks data={segments} total={aggregate(applyFilters(rows,filters,["segments"])).sales} active={filters.segments} onSelect={n=>toggleField("segments",n)}/>
       <div className="bi-panel-foot">Click a segment to cross-filter the model.</div>
      </article>
     </div>
     <div className="bi-secondary-grid">
      <article className="bi-panel bi-matrix-panel">
       <div className="bi-panel-head"><div><span>03 / MARGIN INTELLIGENCE</span><h2>Where margins break</h2></div><span className="bi-subtle" title="The matrix preserves all products and segments for comparison while respecting your time, market and discount filters.">PRODUCT × SEGMENT</span></div>
       <MarginMatrix cells={productCells} selectedProduct={filters.products} selectedSegment={filters.segments} onSelect={selectMatrix}/>
      </article>
      <article className="bi-panel bi-brief-panel">
       <div className="bi-panel-head"><div><span>04 / DECISION SUPPORT</span><h2>Your next useful question</h2></div><Sparkles size={18} className="bi-spark"/></div>
       <div className="bi-brief-answer"><span>BASED ON {number(metrics.records)} FILTERED RECORDS</span>
        <p>{lowestSegment?"The lowest-profit segment within this selection is "+lowestSegment.name+", contributing "+currency(lowestSegment.profit)+" in sample profit.":"No matched segment rows."}</p>
       </div>
       <div className="bi-brief-questions">
        <button type="button" onClick={()=>question("losses")}>Investigate lowest-profit segment <ArrowUpRight size={14}/></button>
        <button type="button" onClick={()=>question("discount")}>Find where discounts are largest <ArrowUpRight size={14}/></button>
        <button type="button" onClick={()=>question("scenario")}>Stress-test a price assumption <ArrowUpRight size={14}/></button>
       </div>
       <button className="bi-copy-brief" type="button" onClick={()=>copyText(explain(),"Evidence-backed brief copied")}><Copy size={13}/> Copy decision brief</button>
      </article>
     </div>
    </div>}
    {view==="drivers"&&<div className="bi-dashboard-content bi-drivers-content">
     <div className="bi-primary-grid">
      <article className="bi-panel">
       <div className="bi-panel-head"><div><span>01 / RECONCILIATION</span><h2>From gross sales to profit</h2></div><span className="bi-subtle">ACCOUNTING BRIDGE</span></div>
       <ProfitBridge metrics={metrics}/>
      </article>
      <article className="bi-panel">
       <div className="bi-panel-head"><div><span>02 / PRODUCT RISK MAP</span><h2>Discount vs. margin</h2></div><span className="bi-subtle">BUBBLE SIZE = SALES</span></div>
       <ProductScatter data={products} onSelect={n=>toggleField("products",n)}/>
       <div className="bi-panel-foot">Each bubble is derived from the observed data. Click to focus.</div>
      </article>
     </div>
     <div className="bi-secondary-grid">
      <article className="bi-panel bi-matrix-panel"><div className="bi-panel-head"><div><span>03 / PRODUCT × SEGMENT</span><h2>Profitability matrix</h2></div></div>
       <MarginMatrix cells={productCells} selectedProduct={filters.products} selectedSegment={filters.segments} onSelect={selectMatrix}/>
      </article>
      <article className="bi-panel bi-drivers-brief"><span className="bi-overline">EVIDENCE FOR FOLLOW-UP</span>
       <h2>What stands out?</h2>
       <p>{topProduct?"Highest absolute product profit: "+topProduct.name+" ("+currency(topProduct.profit)+").":"No matched product rows."}</p>
       <p>{maxDiscount?"Largest segment discount total: "+maxDiscount.name+" ("+currency(maxDiscount.discounts)+").":""}</p>
       <p>Descriptive evidence from a public sample, without unsupported causal claims.</p>
       <button type="button" onClick={()=>setView("scenario")}>Open the scenario model <ArrowRight size={15}/></button>
      </article>
     </div>
    </div>}

    {view==="records"&&<section className="bi-data-panel bi-panel">
     <header className="bi-data-head">
      <div><span className="bi-overline">SOURCE-LEVEL EXPLORER</span><h2>Financial transactions <small>({number(recordRows.length)})</small></h2>
       <p>Every published visual is calculated from these records.</p></div>
      <div className="bi-data-tools"><label><Search size={15}/><input aria-label="Search transactions" placeholder="Search country, product, segment…" value={search}
       onChange={e=>{setSearch(e.target.value);setPage(0)}}/></label>
       <button type="button" onClick={()=>exportData(true)}><ArrowDownToLine size={15}/> Export searched</button>
      </div>
     </header>
     <div className="bi-data-scroller">
      <table><thead><tr>
       {([["date","DATE"],["country","COUNTRY"],["product","PRODUCT"],["segment","SEGMENT"],["sales","NET SALES"],["discounts","DISCOUNT"],["profit","PROFIT"]] as [SortKey,string][]).map(([key,label])=>
        <th key={key} aria-sort={sort.key===key?(sort.desc?"descending":"ascending"):"none"}><button type="button" onClick={()=>sortBy(key)} aria-label={"Sort by "+label+(sort.key===key?(sort.desc?", currently descending":", currently ascending"):"")}>{label}{sort.key===key?<span>{sort.desc?" ↓":" ↑"}</span>:null}</button></th>)}
      </tr></thead><tbody>{pageRows.map(r=><tr key={r.id} tabIndex={0} className={selectedRow?.id===r.id?"is-focused":""}
       onClick={()=>setSelectedRow(r)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSelectedRow(r)}}}>
       <td>{r.date}</td><td>{r.country}</td><td>{r.product}</td><td>{r.segment}</td><td className="num">{currency(r.sales)}</td>
       <td className="num">{currency(r.discounts)}</td><td className={"num "+(r.profit<0?"negative":"")}>{currency(r.profit)}</td></tr>)}</tbody></table>
     </div>
     <footer className="bi-data-footer"><span>Rows {recordRows.length?number(safePage*25+1):0}–{number(Math.min((safePage+1)*25,recordRows.length))} of {number(recordRows.length)}</span>
      <div><button type="button" disabled={safePage<=0} onClick={()=>setPage(safePage-1)} aria-label="Previous page"><ChevronLeft size={16}/></button><span>{safePage+1} / {totalPages}</span>
       <button type="button" disabled={safePage>=totalPages-1} onClick={()=>setPage(safePage+1)} aria-label="Next page"><ChevronRight size={16}/></button></div>
     </footer>
     {selectedRow&&<aside className="bi-row-detail" aria-label="Selected transaction details">
      <div><span className="bi-overline">SOURCE ROW #{selectedRow.id}</span><button type="button" aria-label="Close details" onClick={()=>setSelectedRow(null)}><X size={16}/></button></div>
      <h3>{selectedRow.product} · {selectedRow.country}</h3><p>{selectedRow.segment} · {selectedRow.discountBand} discount · {selectedRow.date}</p>
      <dl>{([["Units",number(selectedRow.units,1)],["Gross sales",currency(selectedRow.gross)],["Discounts",currency(selectedRow.discounts)],["Net sales",currency(selectedRow.sales)],["COGS",currency(selectedRow.cogs)],["Profit",currency(selectedRow.profit)],["Margin",pct(rowMargin(selectedRow))]] as [string,string][]).map(([name,value])=><div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
      <button type="button" className="bi-detail-focus" onClick={()=>{setFilters(f=>({...f,products:[selectedRow.product],segments:[selectedRow.segment],countries:[selectedRow.country]}));setView("overview");setPage(0);setSelectedRow(null)}}>Focus this transaction’s dimensions <ArrowUpRight size={14}/></button>
     </aside>}
    </section>}
    {view==="scenario"&&<div className="bi-scenario-panel">
     <section className="bi-panel bi-scenario-controls">
      <span className="bi-overline">ILLUSTRATIVE MODEL / NOT A FORECAST</span><h2>Discount sensitivity</h2>
      <p>Change the additional discount, then specify a separate volume assumption. Neither parameter is an elasticity estimate.</p>
      <label htmlFor="bi-extra-discount"><span>Additional discount on gross sales</span><strong>+{pct(extraDiscount)}</strong></label>
      <input type="range" id="bi-extra-discount" min="0" max="12" step="0.5" value={extraDiscount} onChange={e=>setExtraDiscount(+e.target.value)}/>
      <div className="bi-range-ticks"><span>0%</span><span>6%</span><span>12%</span></div>
      <label htmlFor="bi-volume-change"><span>Assumed transaction volume change</span><strong>{volumeChange>0?"+":""}{pct(volumeChange,0)}</strong></label>
      <input type="range" id="bi-volume-change" min="-30" max="30" step="5" value={volumeChange} onChange={e=>setVolumeChange(+e.target.value)}/>
      <div className="bi-range-ticks"><span>−30%</span><span>0%</span><span>+30%</span></div>
      <button type="button" className="bi-scenario-reset" onClick={()=>{setExtraDiscount(2);setVolumeChange(0)}}><RotateCcw size={14}/> Restore assumptions</button>
      <div className="bi-scenario-method">Method: (sample net sales − gross sales × extra discount) × volume factor, less COGS × the same volume factor. Fixed costs are not modelled.</div>
     </section>
     <section className="bi-panel bi-scenario-outcomes">
      <span className="bi-overline">SCENARIO VS. OBSERVED BASELINE</span>
      <div className="bi-scenario-headline"><span>Illustrative profit under your assumptions</span>
       <strong>{currency(scenario.scenarioProfit,true)}</strong>
       <em className={scenario.deltaProfit<0?"is-negative":""}>{scenario.deltaProfit>0?"+":""}{currency(scenario.deltaProfit,true)} vs. baseline</em>
      </div>
      <div className="bi-scenario-numbers">
       <div><span>BASE PROFIT</span><strong>{currency(scenario.baselineProfit,true)}</strong></div>
       <div><span>ILLUSTRATIVE SALES</span><strong>{currency(scenario.scenarioSales,true)}</strong></div>
       <div><span>ILLUSTRATIVE MARGIN</span><strong>{pct(scenario.scenarioMargin)}</strong></div>
      </div>
      <div className="bi-sensitivity-chart" role="figure" aria-label="Illustrative profit sensitivity by additional discount percentage">
       <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={Array.from({length:13},(_,i)=>({discount:i,profit:financeScenario(filtered,i,volumeChange).scenarioProfit}))} margin={{top:10,right:12,left:0,bottom:7}}>
         <CartesianGrid stroke="#e7ece7" strokeDasharray="3 5" vertical={false}/>
         <XAxis dataKey="discount" tickFormatter={v=>v+"%"} tick={{fontSize:11,fill:"#86948b"}}/>
         <YAxis tickFormatter={v=>currency(v,true)} tick={{fontSize:11,fill:"#86948b"}} width={66}/>
         <Tooltip formatter={v=>currency(Number(v))} labelFormatter={v=>"Additional discount: "+v+"%"}/>
         <Area type="monotone" dataKey="profit" name="Illustrative profit" stroke="#4c8f70" fill="#d8eadd" strokeWidth={2} isAnimationActive={false}/>
        </AreaChart>
       </ResponsiveContainer>
      </div>
      <p className="bi-scenario-disclaimer">Historical educational sample. Outputs use user-defined assumptions only and do not constitute a forecast or a demonstrated causal relationship.</p>
     </section>
    </div>}
    </>}
    <footer className="bi-bottom-source"><div><span className="bi-source-dot"/> Microsoft Financial Sample · 700 synthetic records · Sep 2013 – Dec 2014</div>
     <a href="https://learn.microsoft.com/en-us/power-bi/create-reports/sample-financial-download" target="_blank" rel="noopener noreferrer">Source and methodology <ArrowUpRight size={13}/></a>
    </footer>
   </div>
  </main>
  <dialog className="bi-save-dialog" ref={saveDialog}>
   <form onSubmit={e=>{e.preventDefault();save()}}>
    <header><Bookmark size={20}/><h2>Save this workspace</h2><button type="button" onClick={()=>saveDialog.current?.close()} aria-label="Close"><X size={17}/></button></header>
    <p>Save your slicers and current page on this device, without creating an account.</p>
    <label htmlFor="bi-view-name">View name</label>
    <input id="bi-view-name" required maxLength={54} value={saveName} onChange={e=>setSaveName(e.target.value)} placeholder="e.g. Government · Canada"/>
    <footer><button type="button" onClick={()=>saveDialog.current?.close()}>Cancel</button><button type="submit">Save view <Check size={15}/></button></footer>
   </form>
  </dialog>
  {toast&&<div className="bi-toast" role="status"><Check size={15}/>{toast}<button type="button" onClick={()=>setToast("")} aria-label="Dismiss"><X size={13}/></button></div>}
 </div>;
}
