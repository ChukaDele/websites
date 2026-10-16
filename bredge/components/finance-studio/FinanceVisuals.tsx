"use client";
import {useRef} from "react";
import {ResponsiveContainer,ComposedChart,Bar,Line,XAxis,YAxis,CartesianGrid,Tooltip,Cell,ScatterChart,Scatter,ZAxis,ReferenceLine} from "recharts";
import type {FinanceMonth,FinanceAggregate,MatrixCell,FinanceMetrics} from "../../lib/finance-studio-model";
import {currency,pct,number,orderedProducts,orderedSegments} from "../../lib/finance-studio-model";
const gridStroke="#e7ece7";
const ticks={fontSize:11,fill:"#788980"};
const compactTick=(v:number)=>v>=1e6?"$"+number(v/1e6,1)+"m":"$"+number(v/1000)+"k";
export function TrendChart({series,month,onMonthSelect}:{series:FinanceMonth[];month:string|null;onMonthSelect:(m:string)=>void}){
 if(!series.length)return <p className="bi-empty-small">No monthly observations match this selection.</p>;
 return <div className="bi-trend-chart" role="figure" aria-label="Monthly net sales shown as columns with profit overlaid; click a month to filter the report">
  <ResponsiveContainer width="100%" height="100%">
   <ComposedChart data={series} accessibilityLayer margin={{top:8,right:0,left:-22,bottom:0}}>
    <CartesianGrid stroke={gridStroke} strokeDasharray="3 5" vertical={false}/>
    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={ticks} interval={series.length>13?1:0} tickMargin={9} minTickGap={5}/>
    <YAxis yAxisId="sales" axisLine={false} tickLine={false} tick={ticks} tickFormatter={compactTick} width={58}/>
    <YAxis yAxisId="profit" orientation="right" axisLine={false} tickLine={false} tick={ticks} tickFormatter={compactTick} width={58}/>
    <Tooltip isAnimationActive={false} cursor={{fill:"rgba(57,107,76,.055)"}} content={({active,payload})=>{
      if(!active||!payload?.length)return null;
      const r=payload[0]?.payload as FinanceMonth;if(!r)return null;
      return <div className="bi-chart-tooltip"><strong>{r.label}</strong><span>Net sales <b>{currency(r.sales)}</b></span><span>Profit <b>{currency(r.profit)}</b></span><small>{number(r.rows)} rows · click a bar to isolate</small></div>;
     }}/>
    <Bar yAxisId="sales" dataKey="sales" name="Net sales" maxBarSize={26} radius={[3,3,0,0]} isAnimationActive={false} onClick={item=>{
      const key=(item as unknown as {payload?:FinanceMonth}).payload?.key;if(key)onMonthSelect(key);
    }}>
      {series.map(p=><Cell key={p.key} cursor="pointer" fill={month===p.key?"#bd7955":"#518c75"} fillOpacity={!month||month===p.key?1:.25}/>)}
    </Bar>
    <Line yAxisId="profit" type="monotone" name="Profit" dataKey="profit" stroke="#d3a064" strokeWidth={2.5} dot={false}
     activeDot={{r:5,fill:"#d3a064",stroke:"white",strokeWidth:2}} isAnimationActive={false}/>
   </ComposedChart>
  </ResponsiveContainer>
 </div>;
}
export function SegmentRanks({data,total,active,onSelect}:{data:FinanceAggregate[];total:number;active:string[];onSelect:(n:string)=>void}){
 const max=Math.max(1,...data.map(d=>d.sales));
 return <div className="bi-segment-list" role="group" aria-label="Select a customer segment to cross-filter">
 {data.map((s,i)=><button type="button" key={s.name} aria-pressed={active.includes(s.name)}
  className={"bi-segment-row"+(active.includes(s.name)?" is-selected":"")} onClick={()=>onSelect(s.name)}
  title={s.name+" · "+currency(s.sales)+" · "+pct(s.margin)+" margin"}>
   <span className="bi-segment-number">{String(i+1).padStart(2,"0")}</span>
   <span className="bi-segment-info"><strong>{s.name}</strong><i><em style={{width:s.sales/max*100+"%"}}/></i></span>
   <span className="bi-segment-amount"><b>{currency(s.sales,true)}</b><small>{pct(total?s.sales/total*100:0,0)} mix</small></span>
   <span className={"bi-segment-margin"+(s.margin<0?" is-negative":"")}>{pct(s.margin)}</span>
 </button>)}
 </div>;
}
function heatColor(v:number,has:boolean){return !has?"#f0f2ee":v<0?(v< -15?"#c88078":"#f7ddd8"):v<10?"#f4efda":v<20?"#d1e4d0":"#a6cdbc"}
export function MarginMatrix({cells,onSelect,selectedProduct,selectedSegment}:{
 cells:MatrixCell[];onSelect:(product:string,segment:string)=>void;selectedProduct:string[];selectedSegment:string[];
}){
 const map=new Map(cells.map(c=>[c.product+"::"+c.segment,c]));
 const firstCell=orderedProducts.flatMap((product,i)=>orderedSegments.map((segment,j)=>({
  available:map.has(product+"::"+segment),key:i+"-"+j
 }))).find(x=>x.available)?.key;
 const grid=useRef<HTMLDivElement>(null);
 const move=(e:React.KeyboardEvent<HTMLButtonElement>,i:number,j:number)=>{
  const key:Record<string,[number,number]>={ArrowRight:[0,1],ArrowLeft:[0,-1],ArrowDown:[1,0],ArrowUp:[-1,0]};
  if(!key[e.key])return;
  e.preventDefault();const [di,dj]=key[e.key];
  for(let offset=1;offset<=Math.max(orderedProducts.length,orderedSegments.length);offset++){
   const ni=(i+di*offset+orderedProducts.length*4)%orderedProducts.length;
   const nj=(j+dj*offset+orderedSegments.length*4)%orderedSegments.length;
   const target=grid.current?.querySelector<HTMLButtonElement>('[data-cell="'+ni+'-'+nj+'"]');
   if(target&&!target.disabled){target.focus();break;}
  }
 };
 return <div className="bi-matrix-shell">
  <div className="bi-margin-matrix" ref={grid} role="group" aria-label="Product by customer segment profit margin matrix, arrow keys move between cells">
   <span className="bi-matrix-corner">PRODUCT / SEGMENT</span>
   {orderedSegments.map(s=><span key={s} className="bi-matrix-heading">{s==="Channel Partners"?"Channels":s==="Small Business"?"Small biz":s}</span>)}
   {orderedProducts.map((product,i)=><div className="bi-matrix-row" key={product}>
    <strong className="bi-matrix-product">{product}</strong>
    {orderedSegments.map((segment,j)=>{
      const c=map.get(product+"::"+segment);
      const selected=selectedProduct.includes(product)&&selectedSegment.includes(segment);
      return <button key={segment} type="button" disabled={!c} tabIndex={firstCell===i+"-"+j?0:-1} data-cell={i+"-"+j}
       className={"bi-matrix-cell"+(selected?" is-focused":"")}
       style={{background:heatColor(c?.margin||0,!!c)}} onClick={()=>onSelect(product,segment)}
       onKeyDown={e=>move(e,i,j)}
       aria-label={product+" and "+segment+": "+(c?pct(c.margin)+" margin, "+currency(c.sales)+" net sales":"no matching rows")}
       title={product+" / "+segment+"\n"+(c?pct(c.margin)+" margin | "+currency(c.profit)+" profit":"No observations")}>
       {c?pct(c.margin,0):"—"}
      </button>;
    })}
   </div>)}
  </div>
  <div className="bi-matrix-scale" aria-hidden="true"><span>LOSS</span><i className="loss"/><i className="low"/><i className="mid"/><i className="high"/><span>HIGHER MARGIN</span></div>
 </div>;
}
export function ProfitBridge({metrics}:{metrics:FinanceMetrics}){
 const max=Math.max(1,metrics.gross);
 const steps=[
  {name:"Gross sales",value:metrics.gross,color:"#376d59",kind:"total"},
  {name:"Discounts",value:metrics.discounts,color:"#d39a67",kind:"less"},
  {name:"Net sales",value:metrics.sales,color:"#4e8a74",kind:"total"},
  {name:"Cost of goods sold",value:metrics.cogs,color:"#d2a179",kind:"less"},
  {name:"Profit",value:metrics.profit,color:metrics.profit<0?"#c16c68":"#96bd82",kind:"result"}
 ];
 return <div className="bi-bridge" role="list" aria-label="Accounting bridge from gross sales through discounts and cost of goods sold to profit">
  {steps.map((step,i)=><div role="listitem" className="bi-bridge-step" key={step.name}>
    <span className="bi-bridge-index">{String(i+1).padStart(2,"0")}</span>
    <div className="bi-bridge-name"><strong>{step.name}</strong><small>{step.kind==="less"?"Deduction":step.kind==="result"?"Final result":"Reported amount"}</small></div>
    <div className="bi-bridge-track"><span style={{width:Math.max(1,Math.abs(step.value)/max*100)+"%",background:step.color}}/></div>
    <strong className="bi-bridge-value">{step.kind==="less"?"−"+currency(Math.abs(step.value),true):currency(step.value,true)}</strong>
  </div>)}
  <p className="bi-bridge-explain">Gross sales minus discounts equals net sales. Net sales minus COGS equals profit. All amounts reconcile to the selected records.</p>
 </div>;
}
export function ProductScatter({data,onSelect}:{data:FinanceAggregate[];onSelect:(name:string)=>void}){
 const plotted=data.map(x=>({...x,x:x.discountRate,y:x.margin,z:x.sales}));
 if(!plotted.length)return <p className="bi-empty-small">No products match this selection.</p>;
 return <div className="bi-scatter-chart" role="figure" aria-label="Product profitability plotted by discount percentage and margin, with circle size reflecting net sales">
 <ResponsiveContainer width="100%" height="100%">
  <ScatterChart margin={{top:13,right:13,left:-23,bottom:12}} accessibilityLayer>
   <CartesianGrid stroke={gridStroke} strokeDasharray="3 5"/>
   <XAxis type="number" dataKey="x" name="Discount share" domain={[0,"dataMax+2"]} unit="%" tick={ticks} tickLine={false} axisLine={false}/>
   <YAxis type="number" dataKey="y" name="Margin" domain={["dataMin-5","dataMax+5"]} unit="%" tick={ticks} tickLine={false} axisLine={false}/>
   <ZAxis type="number" dataKey="z" range={[40,800]}/>
   <ReferenceLine y={0} stroke="#c58679" strokeDasharray="5 5"/>
   <Tooltip content={({active,payload})=>{
    if(!active||!payload?.length)return null;
    const r=payload[0]?.payload as FinanceAggregate;
    return <div className="bi-chart-tooltip"><strong>{r.name}</strong><span>Profit margin <b>{pct(r.margin)}</b></span><span>Discount share <b>{pct(r.discountRate)}</b></span><span>Sales <b>{currency(r.sales)}</b></span><small>Click to filter this product</small></div>;
   }}/>
   <Scatter data={plotted} fill="#559178" cursor="pointer" onClick={x=>{
    const item=x as unknown as {payload?:{name:string};name?:string};const n=item.payload?.name||item.name;if(n)onSelect(n);
   }}/>
  </ScatterChart>
 </ResponsiveContainer>
 </div>;
}
