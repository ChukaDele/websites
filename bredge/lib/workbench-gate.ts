/** Native per-IP Cloudflare edge quota for public interactive chart responses.
 * Defense-in-depth rather than a guarantee against copying public visuals.
 */
import type { ContactRateLimitBinding } from "./contact-rate-limit";

export async function enforceWorkbenchQuota(request:Request, limiter?:ContactRateLimitBinding):Promise<Response|null>{
  const url=new URL(request.url);
  if(request.method!=="GET"||!url.pathname.startsWith("/api/workbench"))return null;
  if(!limiter||typeof limiter.limit!=="function")
    return Response.json({error:"Interactive charts are temporarily unavailable."},{status:503,headers:{"cache-control":"no-store"}});
  const ip=request.headers.get("CF-Connecting-IP")?.trim()||"unknown";
  try{
    const r=await limiter.limit({key:url.hostname+":workbench:"+ip});
    if(r?.success===true)return null;
    return Response.json({error:"Too many chart requests from this connection. Try again shortly."},
      {status:429,headers:{"cache-control":"no-store","retry-after":"60"}});
  }catch{
    return Response.json({error:"Interactive charts are temporarily unavailable."},
      {status:503,headers:{"cache-control":"no-store"}});
  }
}
