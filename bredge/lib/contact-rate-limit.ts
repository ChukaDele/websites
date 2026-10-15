/**
 * Cloudflare-native contact abuse limiting, before the Google webhook executes.
 * Never accept a missing or failed limiter as an allowed remote submission.
 */
export interface ContactRateLimitBinding {
  limit(input: { key: string }): Promise<{ success: boolean }>;
}

const err = (message: string, status: number): Response =>
  Response.json({ error: message }, { status, headers: { "cache-control": "no-store", "retry-after": "60" } });

export async function enforceContactRateLimit(
  request: Request,
  limiter?: ContactRateLimitBinding,
): Promise<Response | null> {
  const u = new URL(request.url);
  if (request.method !== "POST" || u.pathname !== "/api/contact") return null;

  if (!limiter || typeof limiter.limit !== "function") {
    return err("Contact protection is temporarily unavailable. Please email hello@thebredge.com.", 503);
  }
  // Cloudflare supplies CF-Connecting-IP at the edge. Never trust a
  // client-supplied JSON field or X-Forwarded-For to partition quotas.
  const ip = request.headers.get("CF-Connecting-IP")?.trim() || "unknown";
  // Host-scoping keeps QA traffic from consuming real production visitor quota.
  const key = u.hostname + ":contact:" + ip;
  try {
    const result = await limiter.limit({ key });
    if (!result || result.success !== true) {
      return err("Too many enquiries from this connection. Please try again in a minute, or email hello@thebredge.com.", 429);
    }
  } catch {
    return err("Contact protection is temporarily unavailable. Please email hello@thebredge.com.", 503);
  }
  return null;
}
