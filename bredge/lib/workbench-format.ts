import type {LabResponse} from "./workbench-data";

const formatter=new Intl.NumberFormat("en-US",{maximumFractionDigits:2});
export const num=(n:number)=>formatter.format(n);
/** No "$-123" or "0.27$M": currency belongs before the absolute value,
 * and losses need an explicit negative sign. Keep exact source values in
 * tooltips; large hypothetical scenario outputs use honest short notation. */
export const formatScenario=(n:number,unit:string)=>{
 const sign=n<0?"−":"";
 const absolute=Math.abs(n);
 const compact=absolute>=1_000_000
   ?num(Math.round(absolute/10000)/100)+"M"
   :absolute>=100_000
   ?num(Math.round(absolute/100)/10)+"K"
   :num(absolute);
 if(unit==="$M"){
   const dollars=absolute*1_000_000;
   // Small $M values should never be misrepresented as $0M.
   if(dollars>=1_000_000)return sign+"$"+num(Math.round(dollars/10000)/100)+"M";
   if(dollars>=1_000)return sign+"$"+num(Math.round(dollars/10)/100)+"K";
   return sign+"$"+num(Math.round(dollars*100)/100);
 }
 if(unit==="₦"||unit==="$")return sign+unit+compact;
 return sign+compact+unit;
};
export function display(n:number,unit:string){
 const sign=n<0?"−":"";
 const v=num(Math.abs(n));
 if(unit==="$ million sales")return sign+"$"+v+"M";
 if(unit==="million subscriptions")return sign+v+"M";
 if(unit==="₦ per adult/day"||unit==="₦ per litre"||unit.startsWith("₦"))return sign+"₦"+v;
 if(unit==="$ sample sales"||unit.startsWith("$"))return sign+"$"+v;
 if(unit==="percent churn")return sign+v+"%";
 return sign+v;
}
export function kpi(n:number,unit:string){
 const sign=n<0?"−":"";
 const v=Math.abs(n);
 const full=unit==="$"||unit==="₦";
 const val=full&&v>=1_000_000?num(Math.round(v/10000)/100)+"M":
           full&&v>=100_000?num(Math.round(v/100)/10)+"K":num(v);
 if(unit==="$"||unit==="₦")return sign+unit+val;
 if(unit==="$M")return sign+"$"+val+"M";
 if(unit==="₦/L")return sign+"₦"+val+"/L";
 return sign+val+unit;
}
export function secondaryPoint(d:LabResponse,value:number|undefined){
 if(value===undefined)return null;
 if(d.dataset==="finance")return{label:"Sample profit",value:display(value,"$ sample sales")};
 if(d.dataset==="supply"&&d.view==="market")return{label:"Orders",value:display(value,"orders")};
 if(d.dataset==="supply"&&d.view==="category")return{label:"Sample category profit",value:display(value,"$ million sales")};
 if(d.dataset==="telecom"&&d.view==="porting")return{label:"Port-outs",value:display(value,"ported numbers")};
 if(d.dataset==="telecom"&&d.view==="states")return{label:"Internet subscriptions",value:display(value,"million subscriptions")};
 if(d.dataset==="diet"&&d.view==="urban")return{label:"Rural daily cost",value:display(value,"₦ per adult/day")};
 return null;
}
