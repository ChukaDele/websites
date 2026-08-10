// Writes the build fingerprint consumed by /__build. Runs before vinext build.
import { writeFileSync } from "node:fs";
const info = {
  sha: process.env.GITHUB_SHA || process.env.CF_PAGES_COMMIT_SHA || "local",
  builtAt: new Date().toISOString(),
  worker: "bredge",
};
writeFileSync(new URL("../app/__build/build-info.json", import.meta.url), JSON.stringify(info, null, 2) + "\n");
console.log("build-info:", info);
