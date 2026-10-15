import { readFileSync } from "node:fs";
import { missingLeadSecretNames } from "./assert-lead-secrets.mjs";

// Deliberately unconditional: a symlink cannot bypass this CLI entrypoint.
try {
  const input = readFileSync(0, "utf8");
  if (input.length > 262144) throw new Error("inventory too large");
  const missing = missingLeadSecretNames(JSON.parse(input));
  if (missing.length) {
    console.error("RELEASE_BLOCKED: missing Worker secret names: " + missing.join(", "));
    process.exitCode = 1;
  } else {
    console.log("WORKER_LEAD_SECRET_NAMES_PRESENT; actual delivery not yet verified.");
  }
} catch {
  // Keep arbitrary Cloudflare CLI output, and especially secret material, out of CI logs.
  console.error("RELEASE_BLOCKED: Worker secret inventory is missing or invalid JSON.");
  process.exitCode = 1;
}
