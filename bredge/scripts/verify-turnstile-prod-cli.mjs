import { readFileSync } from "node:fs";
import { checkLiveTurnstile } from "./turnstile-release-contract.mjs";

// Always execute, including through a symlink. No secrets are logged.
try {
  const source = readFileSync("lib/config.ts", "utf8");
  await checkLiveTurnstile(process.env.TURNSTILE_SECRET || "", source);
  console.log("TURNSTILE_PRODUCTION_SECRET_VERIFIED; dummy challenge rejected.");
} catch {
  console.error("RELEASE_BLOCKED: production Turnstile key or Siteverify check failed.");
  process.exitCode = 1;
}
