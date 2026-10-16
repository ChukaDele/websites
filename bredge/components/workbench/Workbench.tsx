"use client";

import {useEffect,useMemo,useState,useCallback,useId} from "react";
import type {LabId,LabResponse} from "../../lib/workbench-data";
import {num,display,kpi,secondaryPoint,formatScenario} from "../../lib/workbench-format";

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
 const uid=useId().replace(/:/g,"");

 const reset=useCallback(()=>{
  setView(initial.view);setModel(initial);setSelection(initial.rows[0]?.label||"");
  setAmount(initial.scenario.initial);setError("");setBusy(false);
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
      setAmount(data.scenario.initial);
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
 const selected=rows.find(x=>x.label===selection)||rows[0];
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

 return <section className={"wb-shell"+(compact?" wb-compact":"")} data-workbench={dataset}
   aria-label={model.title}>
  <header className="wb-head">
   <div>
    <p className="wb-eyebrow"><span className="wb-live-dot" aria-hidden="true"/>INTERACTIVE WORKBENCH <span>/ {model.isSample?"DEMONSTRATION":"PUBLISHED DATA"}</span></p>
    <h3>{model.title}</h3>
    <p>{model.subtitle}</p>
   </div>
   <button className="wb-reset" type="button" onClick={reset}>Reset view <span aria-hidden="true">↺</span></button>
  </header>
  <div className="wb-kpis">
   {(model.totals||[]).map((k,i)=><div key={k.label} className="wb-kpi">
     <span>{String(i+1).padStart(2,"0")} / {k.label}</span>
     <strong title={kpi(k.value,k.unit)}>{kpi(k.value,k.unit)}</strong>
   </div>)}
  </div>
  <div className="wb-editor">
   <div className="wb-toolbar">
    <div className="wb-toolbar-label"><span>EXPLORE THE EVIDENCE</span><small>{model.reportedDate}</small></div>
    <div className="wb-tabs" role="group" aria-label="Choose an analytical view">
      {options.map(opt=><button key={opt.id} type="button" className={activeView===opt.id?"is-active":""}
       aria-pressed={activeView===opt.id} onClick={()=>{
        if(busy&&opt.id===view)return;
        if(opt.id===model.view&&!error&&!busy)return;
        setError("");
        if(opt.id===initial.view){
          setView(initial.view);setModel(initial);
          setSelection(initial.rows[0]?.label||"");
          setAmount(initial.scenario.initial);setBusy(false);
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
       <p>Select a bar to inspect its observed value and scenario.</p></div>
      <small>{model.units}</small>
     </div>
     {error&&<p role="alert" className="wb-error">{error}</p>}
     <div className="wb-bars" role="group" aria-label={model.title}>
      {rows.map((row,i)=>{
       const primary=Math.max(2,row.value/max*100);
       const secondary=Math.max(2,(row.secondary||0)/max*100);
       const active=selected?.label===row.label;
       return <button type="button" key={row.label} className={"wb-bar-row"+(active?" active":"")}
        aria-pressed={active}
        aria-describedby={"wb-point-tooltip-"+uid+"-"+i}
        aria-label={row.label+": "+display(row.value,model.units)}
        onClick={()=>setSelection(row.label)}>
        <span className="wb-bar-name">{row.label}</span>
        <span className="wb-bar-channel">
         <span className="wb-bar-track" aria-hidden="true">
          <span className="wb-bar-fill" style={{width:primary+"%"}}/>
          {dual&&<span className="wb-bar-second" style={{width:secondary+"%"}}/>}
         </span>
        </span>
        <strong className="wb-bar-value">{num(row.value)}</strong>
        <span className="wb-bar-index" aria-hidden="true">{String(i+1).padStart(2,"0")}</span>
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
     {dual&&<p className="wb-legend"><i/>{primaryLabel}<i/>{secondaryLabel}</p>}
     <p className="wb-smallprint">{model.coverage}</p>
    </div>
    <aside className="wb-inspector">
     <div className="wb-inspector-top"><span>CONTEXT PANEL</span><span className="wb-live-dot" aria-hidden="true"/></div>
     <p className="wb-inspector-label">SELECTED DATA POINT</p>
     <h4>{selected?.label||"No selection"}</h4>
     <strong className="wb-inspector-big">{selected?display(selected.value,model.units):"—"}</strong>
     {selectedSecondary?<p className="wb-inspector-secondary"><span>{selectedSecondary.label}</span><strong>{selectedSecondary.value}</strong></p>:null}
     <p className="wb-inspector-copy">{model.isSample?"Reported dashboard sample":"Published statistical observation"}. {model.note}</p>
     <div className="wb-divider"/>
     <p className="wb-inspector-label">WHAT-IF MODEL</p>
     <h5>{model.scenario.title}</h5>
     <label className="wb-scenario-label" htmlFor={"wb-range-"+uid}>
       <span>{model.scenario.unit}</span><b>{num(amount)}</b>
     </label>
     <input id={"wb-range-"+uid} type="range" min={model.scenario.min}
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
     <p className="wb-scenario-note">Assumption: {model.scenario.calculation}</p>
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
