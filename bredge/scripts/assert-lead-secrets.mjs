// Pure, fail-closed validation of Cloudflare Worker secret NAME inventory.
// This does not inspect values or prove an end-to-end Google Sheet write.
export const REQUIRED_LEAD_SECRET_NAMES = Object.freeze([
  "GOOGLE_LEADS_WEBHOOK_URL",
  "GOOGLE_LEADS_WEBHOOK_SECRET",
]);

export function missingLeadSecretNames(rows) {
  if (!Array.isArray(rows)) throw new TypeError("Expected an array from Cloudflare secret list");
  const names = new Set(rows.map((row) => row && typeof row.name === "string" ? row.name : ""));
  return REQUIRED_LEAD_SECRET_NAMES.filter((name) => !names.has(name));
}
