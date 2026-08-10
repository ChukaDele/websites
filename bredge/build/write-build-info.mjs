// Writes the build fingerprint consumed by GET /__build (worker short-circuit).
import { writeFileSync } from "node:fs";
const info = {
  sha: process.env.GITHUB_SHA || process.env.CF_PAGES_COMMIT_SHA || "local",
  builtAt: new Date().toISOString(),
  worker: "bredge",
};
writeFileSync(new URL("../worker/build-info.json", import.meta.url), JSON.stringify(info, null, 2) + "\n");
console.log("build-info:", info);
