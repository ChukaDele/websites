/** Public, read-only aggregated data presentation API.
 * This endpoint never returns uploaded PBIX files, row-level models or exports.
 * It is guarded by the Cloudflare Worker native rate limiter.
 */
import {allowedLabIds,getWorkbench,views,type LabId} from "../../../lib/workbench-data";

export async function GET(request:Request){
  const u=new URL(request.url);
  const dataset=u.searchParams.get("dataset")||"";
  const view=u.searchParams.get("view")||"";
  if(!allowedLabIds.includes(dataset as LabId))
    return Response.json({error:"Unknown workbench."},{status:404,headers:{"cache-control":"no-store"}});
  if(u.searchParams.size>2 || (view&&!views[dataset as LabId].some(v=>v.id===view)))
    return Response.json({error:"Invalid chart selection."},{status:400,headers:{"cache-control":"no-store"}});
  const model=getWorkbench(dataset as LabId,view);
  // Aggregate-only response: enough to plot the one chosen view, never the
  // original private record-level dataset or model file.
  return Response.json(model,{
    status:200,
    headers:{
      "cache-control":"private, max-age=30",
      "x-robots-tag":"noindex, nofollow",
      "x-content-type-options":"nosniff",
      "vary":"accept-encoding",
    },
  });
}
