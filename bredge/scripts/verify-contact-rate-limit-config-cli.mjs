import { readFileSync } from "node:fs";
import { verifyContactRateLimitConfig } from "./verify-contact-rate-limit-config.mjs";

try {
  const file = process.argv[2];
  if (!file) throw new Error("Expected compiled Worker config path");
  verifyContactRateLimitConfig(JSON.parse(readFileSync(file, "utf8")));
  console.log("CONTACT_RATE_LIMIT_BINDING_CONFIG_VERIFIED");
} catch {
  // Never print arbitrary config or credentials in production job logs.
  console.error("RELEASE_BLOCKED: Worker contact rate limit binding missing or invalid.");
  process.exitCode = 1;
}
