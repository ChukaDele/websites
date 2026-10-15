/** Verify native Cloudflare contact abuse protection survives build/artifact packaging. */
export const CONTACT_RATE_LIMIT_SPEC = Object.freeze({
  name: "CONTACT_RATE_LIMITER",
  namespace_id: "41986273",
  limit: 10,
  period: 60,
});

export function verifyContactRateLimitConfig(config) {
  if (!config || typeof config !== "object") throw new Error("Missing generated Worker configuration");
  const matches = (config.ratelimits || []).filter((x) => x?.name === CONTACT_RATE_LIMIT_SPEC.name);
  if (matches.length !== 1) throw new Error("Bredge Worker must have one native contact rate-limit binding");
  const entry = matches[0];
  if (entry.namespace_id !== CONTACT_RATE_LIMIT_SPEC.namespace_id
    || entry.simple?.limit !== CONTACT_RATE_LIMIT_SPEC.limit
    || entry.simple?.period !== CONTACT_RATE_LIMIT_SPEC.period) {
    throw new Error("Contact quota or namespace changed without review");
  }
  if (config.name !== "bredge") throw new Error("Unexpected production Worker target");
  return true;
}
