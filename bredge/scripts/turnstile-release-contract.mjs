
// Published Cloudflare test credentials must never reach production.
export const TEST_SITE_KEYS = new Set([
  "1x00000000000000000000AA", "2x00000000000000000000AB",
  "1x00000000000000000000BB", "2x00000000000000000000BB",
  "3x00000000000000000000FF",
]);
export const TEST_SECRET_KEYS = new Set([
  "1x0000000000000000000000000000000AA",
  "2x0000000000000000000000000000000AA",
  "3x0000000000000000000000000000000AA",
]);

export function validateProductionTurnstile(publicSource, secret) {
  if (typeof secret !== "string" || secret.length < 30 || TEST_SECRET_KEYS.has(secret)) {
    throw new Error("Production Turnstile secret is missing, too short or a published test key");
  }
  const result = publicSource.match(/export\s+const\s+TURNSTILE_SITE_KEY\s*=\s*["\x27]([^"\x27]*)["\x27]/);
  if (!result || result[1].length < 14 || TEST_SITE_KEYS.has(result[1])) {
    throw new Error("Production Turnstile site key is missing or a published test key");
  }
  return result[1];
}

export function requireRealSecretRejectDummy(data) {
  if (!data || data.success !== false || !Array.isArray(data["error-codes"]) ||
      !data["error-codes"].includes("invalid-input-response") ||
      data["error-codes"].includes("invalid-input-secret")) {
    throw new Error("Turnstile did not reject the synthetic token as expected");
  }
  return true;
}

export async function checkLiveTurnstile(secret, publicSource, fetchImpl = fetch) {
  validateProductionTurnstile(publicSource, secret);
  const form = new URLSearchParams({ secret, response: "qa-intentionally-invalid-token" });
  const r = await fetchImpl("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST", body: form, signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error("Cloudflare Siteverify not reachable");
  requireRealSecretRejectDummy(await r.json());
  return true;
}
