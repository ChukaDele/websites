"use client";

import {useEffect,useMemo,useState,useCallback,useId,useSyncExternalStore} from "react";
import type {CSSProperties} from "react";
import type {LabId,LabResponse} from "../../lib/workbench-data";
import {num,display,kpi,secondaryPoint,formatScenario} from "../../lib/workbench-format";

const listenForHydration=()=>()=>{};
const isHydrated=()=>true;
const isServerRendering=()=>false;
type Option={id:string;name:string};
type Props={
  dataset:LabId;
  initial:LabResponse;
  options:readonly Option[];
  compact?:boolean;
};

function calculate(d:LabResponse,selectedLabel:string,amount:number){
 const chosen=d.rows.find(x=>x.label===selectedLabel)||d.rows[0];
 const totals=d.totals||[];
 switch(d.dataset){
 case "fuel":{
  const price=chosen.value;
  return {value:price*amount,unit:"₦",label:"illustrative monthly fuel cost",
   secondary:(price-1596.25)*amount,
   secondaryLabel:"difference from the May 2026 national benchmark"};
 }
 case "diet":{
  const price=chosen.value;
  return {value:price*amount*30,unit:"₦",
   label:d.view==="basket"?"selected food group, 30-day component reference":"30-day least-cost diet reference",
   secondary:d.view==="basket"?0:(price-1589)*amount*30,
   secondaryLabel:"difference from the national reference"};
 }
 case "telecom":{
  if(d.view==="porting"){
    return {value:Math.round(chosen.value*amount/100),unit:" numbers",
     label:"hypothetical retained port-ins for this operator",
     secondary:0,secondaryLabel:"not a churn estimate"};
  }
  const base=chosen.value*1e6;
  return {value:base*amount/100,unit:" connections",
   label:"hypothetically reachable reported subscriptions",
   secondary:0,secondaryLabel:"not an estimate of unique people or customers"};
 }
 case "finance":{
  const profit=chosen.secondary??totals.find(x=>x.label==="Sample profit")?.value??0;
  const sales=chosen.value||totals.find(x=>x.label==="Sample sales")?.value||0;
  return {value:profit-sales*amount/100,unit:"$",
   label:"profit after hypothetical additional discount",secondary:sales*amount/100,
   secondaryLabel:"incremental discount cost, assuming fixed demand"};
 }
 case "supply":{
  if(d.view==="category"){
    const margin=(chosen.secondary||0)-chosen.value*amount/100;
    return{value:margin,unit:"$M",label:"illustrative category profit after additional cost",
      secondary:chosen.value*amount/100,secondaryLabel:"extra category costs"};
  }
  const count=chosen.secondary||0;
  return {value:Math.round(count*amount/100),unit:" orders",
   label:"illustrative late deliveries avoided",secondary:0,
   secondaryLabel:"assumed reduction; not an observed region-specific result"};
 }
 case "saas":{
  const p:{label:string;n:number;arpu:number}[]=[
    {label:"Basic",n:269,arpu:50},{label:"Pro",n:290,arpu:200},{label:"Enterprise",n:273,arpu:500},
  ];
  const items=p.filter(x=>x.label===chosen.label);
  return {value:items.reduce((sum,x)=>sum+x.n*x.arpu*amount/100,0),unit:"$",
   label:"illustrative monthly recurring revenue preserved",secondary:0,
   secondaryLabel:"holding subscribers and ARPU unchanged"};
 }
 }
}

export default function Workbench({dataset,initial,options,compact=false}:Props){
 const [model,setModel]=useState(initial);
 const [view,setView]=useState(initial.view);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [selection,setSelection]=useState(initial.rows[0]?.label||"");
 const [amount,setAmount]=useState(initial.scenario.initial);
 const [retry,setRetry]=useState(0);
 const ready=useSyncExternalStore(listenForHydration,isHydrated,isServerRendering);
 const [compare,setCompare]=useState("");
 const [showAll,setShowAll]=useState(false);
 const uid=useId().replace(/:/g,"");

 const reset=useCallback(()=>{
  setView(initial.view);setModel(initial);setSelection(initial.rows[0]?.label||"");
  setAmount(initial.scenario.initial);setError("");setBusy(false);setCompare("");setShowAll(false);
 },[initial]);

 useEffect(()=>{
  if(view===initial.view)return;
  const controller=new AbortController();
  const timer=window.setTimeout(()=>{
    fetch("/api/workbench?dataset="+encodeURIComponent(dataset)+"&view="+encodeURIComponent(view),{
      signal:controller.signal,
      credentials:"omit",
      headers:{"accept":"application/json"},
    }).then(async response=>{
      if(!response.ok){
        throw Error(response.status===429
         ?"Please wait a minute before switching views again."
         :"This data view is temporarily unavailable.");
      }
      return response.json() as Promise<LabResponse>;
    }).then(data=>{
      if(data.dataset!==dataset||data.view!==view||!Array.isArray(data.rows)
       ||data.rows.length<3||data.rows.length>12){
        throw Error("Unexpected data response. Try again.");
      }
      setModel(data);setSelection(data.rows[0]?.label||"");
      setAmount(data.scenario.initial);setCompare("");setShowAll(false);
      setBusy(false);
    }).catch(reason=>{
      if(reason?.name!=="AbortError"){
        setError(reason instanceof Error?reason.message:"Unable to load this view.");
        setBusy(false);
      }
    });
  },150);
  return()=>{window.clearTimeout(timer);controller.abort()};
 },[dataset,view,initial,retry]);

 const rows=model.rows;
 const visibleRows=showAll||rows.length<=6?rows:
  (dataset==="fuel"||dataset==="diet")&&["states","zones"].includes(model.view)
   ? [...rows.slice(0,3),...rows.slice(-3)]
   : rows.slice(0,6);
 const selected=rows.find(x=>x.label===selection)||rows[0];
 const compared=rows.find(x=>x.label===compare&&x.label!==selected?.label);
 const rowsTotal=rows.reduce((sum,x)=>sum+x.value,0);
 const showMix=(dataset==="saas"&&model.view!=="churn")||
  (dataset==="diet"&&model.view==="basket")||
  (dataset==="telecom"&&["voice","internet"].includes(model.view));
 const priceMinimum=Math.min(...rows.map(x=>x.value),dataset==="fuel"&&model.view!=="trend"?1596.25:Infinity);
 const priceMaximum=Math.max(...rows.map(x=>x.value),dataset==="fuel"&&model.view!=="trend"?1596.25:-Infinity);
 const priceSpan=Math.max(1,priceMaximum-priceMinimum);
 const dual=(model.dataset==="diet"&&model.view==="urban")||
   (model.dataset==="telecom"&&["states","porting"].includes(model.view));
 const max=useMemo(()=>Math.max(1,...rows.flatMap(x=>dual?[x.value,x.secondary||0]:[x.value])),[dual,rows]);
 const computation=calculate(model,selected?.label||"",amount);
 const viewName=options.find(x=>x.id===model.view)?.name||"Model view";
 const primaryLabel=model.dataset==="diet"&&model.view==="urban"?"Urban":
    model.dataset==="telecom"&&model.view==="porting"?"Port-ins":
    model.dataset==="telecom"&&model.view==="states"?"Voice":"Primary";
 const secondaryLabel=model.dataset==="diet"?"Rural":
    model.dataset==="telecom"&&model.view==="porting"?"Port-outs":"Internet";
 const activeView=busy?view:model.view;
 const selectedSecondary=secondaryPoint(model,selected?.secondary);
 const datasetPrompts:Record<LabId,{eyebrow:string;instruction:string;chartHeading:string}> = {
  finance:{eyebrow:"FINANCE / DISCOUNT EXPOSURE",instruction:"Test how an extra discount affects contribution in a real sample slice.",chartHeading:"Compare sales with the profit each segment actually delivers."},
  supply:{eyebrow:"OPERATIONS / DELIVERY EXPOSURE",instruction:"Explore where volume sits before deciding which bottleneck to investigate.",chartHeading:"Explore the reported regions and product economics, one segment at a time."},
  saas:{eyebrow:"SAAS / RETENTION ECONOMICS",instruction:"Change tiers or assumptions to test where retained revenue matters.",chartHeading:"The size of a plan tier depends on which metric you choose."},
  fuel:{eyebrow:"FUEL / DISTRIBUTION ECONOMICS",instruction:"Compare observed pump prices with the May 2026 national reference.",chartHeading:"Regional prices against the observed national benchmark."},
  diet:{eyebrow:"FOOD / AFFORDABILITY",instruction:"Explore where the minimum-cost healthy basket is more expensive.",chartHeading:"Compare the modelled cost of a healthy diet by location and component."},
  telecom:{eyebrow:"TELECOM / NETWORK CONCENTRATION",instruction:"Compare reported subscriptions and switching without treating SIMs as unique people.",chartHeading:"Explore where connections are concentrated and how operators compare."},
 };
 const brief=datasetPrompts[dataset];
 const relative=(row:number)=>Math.min(100,Math.max(0,row/Math.max(1,rows.reduce((sum,x)=>sum+x.value,0))*100));
 const shareBasis=model.dataset==="saas"&&model.view==="churn"?"Ring scale: 0–10% churn":
   model.dataset==="saas"?"Ring shows the share of the three plan tiers":"";
 return <section className={"wb-shell wb-theme-"+dataset+" wb-view-"+model.view+(compact?" wb-compact":"")} data-workbench={dataset} data-ready={ready?"true":"false"}
   aria-busy={!ready} aria-label={model.title}>
  <header className="wb-head">
   <div>
    <p className="wb-eyebrow"><span className="wb-live-dot" aria-hidden="true"/>{brief.eyebrow} <span>/ {model.isSample?"DEMONSTRATION":"PUBLISHED DATA"}</span></p>
    <h3>{model.title}</h3>
    <p>{model.subtitle}</p>
   </div>
   <button className="wb-reset" type="button" disabled={!ready} onClick={reset}>Reset view <span aria-hidden="true">↺</span></button>
  </header>
  <div className="wb-kpis">
   {(model.totals||[]).map((k,i)=><div key={k.label} className="wb-kpi">
     <span>{String(i+1).padStart(2,"0")} / {k.label}</span>
     <strong title={kpi(k.value,k.unit)}>{kpi(k.value,k.unit)}</strong>
   </div>)}
  </div>
  <div className="wb-editor">
   <div className="wb-toolbar">
    <div className="wb-toolbar-label"><span>{brief.instruction}</span><small>{model.reportedDate}</small></div>
    <div className="wb-tabs" role="group" aria-label="Choose an analytical view">
      {options.map(opt=><button key={opt.id} type="button" disabled={!ready} className={activeView===opt.id?"is-active":""}
       aria-pressed={activeView===opt.id} onClick={()=>{
        if(busy&&opt.id===view)return;
        if(opt.id===model.view&&!error&&!busy)return;
        setError("");
        if(opt.id===initial.view){
          setView(initial.view);setModel(initial);
          setSelection(initial.rows[0]?.label||"");
          setAmount(initial.scenario.initial);setCompare("");setShowAll(false);setBusy(false);
          return;
        }
        setBusy(true);
        if(opt.id===view){setRetry(n=>n+1);}
        else setView(opt.id);
       }}>{opt.name}</button>)}
    </div>
   </div>
   <div className="wb-stage" aria-busy={busy}>
    <div className="wb-chart">
     <div className="wb-chart-heading">
      <div><span>0{options.findIndex(v=>v.id===model.view)+1} / {viewName.toUpperCase()}</span>
       <p>{brief.chartHeading}</p></div>
      <small>{model.units}</small>
     </div>
     {error&&<p role="alert" className="wb-error">{error}</p>}
     {showMix&&<div className="wb-mix">
      <div className="wb-mix-top"><span>{dataset==="diet"?"The selected food groups":"Share of visible "+(dataset==="saas"?"plan tier totals":"network subscriptions")}</span>
       <small>Click a segment to inspect</small></div>
      <div className="wb-mix-strip" aria-hidden="true">
       {rows.map((r,i)=><button key={r.label} type="button" disabled={!ready} tabIndex={-1}
         className={"wb-mix-piece wb-mix-piece-"+i+(selected?.label===r.label?" is-active":"")}
         style={{flexGrow:Math.max(.01,r.value/Math.max(.01,rowsTotal)*100)}}
         aria-label={r.label+": "+num(r.value/Math.max(.01,rowsTotal)*100)+"% of displayed values"}
         aria-pressed={selected?.label===r.label}
         onClick={()=>setSelection(r.label)} title={r.label+": "+display(r.value,model.units)}/>)}
      </div>
     </div>}
     <div className={"wb-bars wb-viz-"+dataset} role="group" aria-label={model.title}>
      {visibleRows.map((row,i)=>{
       const primary=Math.max(2,row.value/max*100);
       const secondary=Math.max(2,(row.secondary||0)/max*100);
       const active=selected?.label===row.label;
       const share=(dataset==="saas"
        ?model.view==="churn"?Math.min(100,Math.max(0,row.value*10)):relative(row.value)
        :primary);
       const extra=secondaryPoint(model,row.secondary);
       const profitRelative=Math.abs(row.secondary||0)/max*100;
       const visualStyle={"--wb-share":share+"%","--wb-strength":primary+"%",
         "--wb-reference":Math.max(0,Math.min(100,(1596.25-priceMinimum)/priceSpan*100))+"%",
         "--wb-position":Math.max(0,Math.min(100,(row.value-priceMinimum)/priceSpan*100))+"%",
         "--wb-profit":Math.min(100,profitRelative)+"%"} as CSSProperties;
       return <button type="button" key={row.label} disabled={!ready} className={"wb-bar-row"+(active?" active":"")}
        style={visualStyle}
        aria-pressed={active}
        aria-describedby={"wb-point-tooltip-"+uid+"-"+i}
        aria-label={row.label+": "+display(row.value,model.units)}
        onClick={()=>setSelection(row.label)}>
        <span className="wb-bar-name">{row.label}</span>
        <span className="wb-bar-channel">
         <span className="wb-bar-track" aria-hidden="true">
          <span className="wb-bar-fill" style={{width:primary+"%"}}/>
          {dual&&<span className="wb-bar-second" style={{width:secondary+"%"}}/>}
          {dataset==="finance"&&row.secondary!==undefined&&<span className={"wb-bar-profit"+(row.secondary<0?" is-loss":"")}
            style={{width:Math.min(100,profitRelative)+"%"}}/>}
          {dataset==="fuel"&&model.view!=="trend"&&<><span className="wb-benchmark" />
            <span className="wb-dot" /></>}
         </span>
        </span>
        <strong className="wb-bar-value">{num(row.value)}</strong>
        {(dataset==="finance"||dataset==="supply"||dataset==="telecom"&&model.view==="porting")
         &&extra?<span className={"wb-bar-extra"+(row.secondary!==undefined&&row.secondary<0?" is-loss":"")}>{extra.label}: {extra.value}</span>:null}
        <span className="wb-bar-index" aria-hidden="true">{String(rows.indexOf(row)+1).padStart(2,"0")}</span>
        <span id={"wb-point-tooltip-"+uid+"-"+i}
          className="wb-point-tooltip" role="tooltip">
          <strong>{row.label}</strong>
          <span>Reported: {display(row.value,model.units)}</span>
          {secondaryPoint(model,row.secondary)?<span>{secondaryPoint(model,row.secondary)?.label}: {secondaryPoint(model,row.secondary)?.value}</span>:null}
          <small>{model.reportedDate} · {model.isSample?"demo slice":"published aggregate"}</small>
        </span>
       </button>;
      })}
     </div>
     {rows.length>6&&<button type="button" className="wb-show-all" disabled={!ready} aria-expanded={showAll}
        onClick={()=>setShowAll(x=>!x)}>
        {showAll?"Show six key observations":"Explore all "+rows.length+" observations"} <span aria-hidden="true">{showAll?"↑":"↓"}</span>
      </button>}
     {dual&&<p className="wb-legend"><i/>{primaryLabel}<i/>{secondaryLabel}</p>}
     {shareBasis&&<p className="wb-share-basis">{shareBasis}</p>}
     {dataset==="finance"&&<p className="wb-share-basis">Sales and profit use the same dollar scale. Red indicates a loss.</p>}
     {dataset==="fuel"&&model.view!=="trend"&&<p className="wb-share-basis"><i className="wb-reference-key"/> May 2026 national reference: ₦1,596.25 per litre</p>}
     <p className="wb-smallprint">{model.coverage}</p>
    </div>
    <aside className="wb-inspector">
     <div className="wb-inspector-top"><span>CONTEXT PANEL</span><span className="wb-live-dot" aria-hidden="true"/></div>
     <p className="wb-inspector-label">SELECTED DATA POINT</p>
     <h4>{selected?.label||"No selection"}</h4>
     <strong className="wb-inspector-big">{selected?display(selected.value,model.units):"—"}</strong>
     {selectedSecondary?<p className="wb-inspector-secondary"><span>{selectedSecondary.label}</span><strong>{selectedSecondary.value}</strong></p>:null}
     <p className="wb-inspector-caveat">{dataset==="finance"?"Canada sample rows, not the full report totals."
      :dataset==="supply"?"Global late rate is not a measured regional rate."
      :dataset==="saas"?"Historical demonstration snapshot, not client financials."
      :dataset==="fuel"?"May 2026 prices, not current pump rates."
      :dataset==="diet"?"Least-cost diet model, not observed spending or wages."
      :"Subscriptions are connections, not unique people."}</p>
     <div className="wb-divider"/>
     <p className="wb-inspector-label">WHAT-IF MODEL</p>
     <h5>{model.scenario.title}</h5>
     <label className="wb-scenario-label" htmlFor={"wb-range-"+uid}>
       <span>{model.scenario.unit}</span><b>{num(amount)}</b>
     </label>
     <input id={"wb-range-"+uid} type="range" disabled={!ready} min={model.scenario.min}
      max={model.scenario.max} step={model.scenario.step} value={amount}
      onChange={event=>setAmount(Number(event.target.value))}
      aria-valuetext={num(amount)+" "+model.scenario.unit}/>
     <div className="wb-projection" aria-live="polite">
      <span>ILLUSTRATIVE OUTPUT</span>
      <strong className={computation.value<0?"is-negative":""}
        title={"Scenario result: "+formatScenario(computation.value,computation.unit)}>
        {formatScenario(computation.value,computation.unit)}</strong>
      <small>{computation.label}</small>
      {computation.secondary!==0&&<p>
        {computation.secondaryLabel}: {computation.secondary>0?"+":""}
        {formatScenario(computation.secondary,computation.unit)}
      </p>}
     </div>
     <details className="wb-analysis-details">
       <summary>Method, assumptions and comparison</summary>
       <p className="wb-inspector-copy">{model.isSample?"Reported dashboard sample":"Published statistical observation"}. {model.note}</p>
       <div className="wb-compare">
         <label htmlFor={"wb-compare-"+uid}>Compare with</label>
         <select id={"wb-compare-"+uid} disabled={!ready} value={compared?.label||""} onChange={event=>setCompare(event.target.value)}>
           <option value="">Choose another {dataset==="saas"?"plan":dataset==="finance"?"segment":"observation"}</option>
           {rows.filter(x=>x.label!==selected?.label).map(x=><option value={x.label} key={x.label}>{x.label}</option>)}
         </select>
         {compared&&selected&&<p className="wb-comparison-result" aria-live="polite">
           <span>{model.units}: {selected.label} vs {compared.label}</span>
           <strong>{selected.value>=compared.value?"+":"−"}{display(Math.abs(selected.value-compared.value),model.units)}</strong>
         </p>}
       </div>
       <p className="wb-scenario-note">Assumption: {model.scenario.calculation}</p>
     </details>
    </aside>
   </div>
  </div>
  <footer className="wb-foot">
   <div><strong>Source & limitations</strong>
    <span>{model.source} · {model.reportedDate}. {model.note}</span></div>
   {model.sourceURL
    ?<a href={model.sourceURL} target="_blank" rel="noopener noreferrer">View original publisher <span aria-hidden="true">↗</span></a>
    :<span className="wb-source-note">Bredge sample dashboard; no underlying records are distributed.</span>}
  </footer>
 </section>;
}
