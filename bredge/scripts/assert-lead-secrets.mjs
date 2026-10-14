// Fail-closed preflight for required production contact webhook bindings.
// This verifies presence of secret NAMES only. It cannot prove actual lead delivery.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const required = ["GOOGLE_LEADS_WEBHOOK_URL", "GOOGLE_LEADS_WEBHOOK_SECRET"];

export function missingLeadSecretNames(rows) {
  if (!Array.isArray(rows)) throw new TypeError("Expected an array from Cloudflare secret list");
  const names = new Set(rows.map((row) => row && typeof row.name === "string" ? row.name : ""));
  return required.filter((name) => !names.has(name));
}

function main() {
  const rows = JSON.parse(readFileSync(0, "utf8"));
  const missing = missingLeadSecretNames(rows);
  if (missing.length) {
    console.error("RELEASE_BLOCKED: missing required Worker secret names: " + missing.join(", "));
    process.exitCode = 1;
    return;
  }
  console.log("WORKER_LEAD_SECRET_NAMES_PRESENT. Actual lead delivery remains unverified.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(); }
  catch (error) {
    console.error("RELEASE_BLOCKED: unable to validate Worker secret inventory: " + error.message);
    process.exitCode = 1;
  }
}
