import { readFileSync } from "node:fs";
import { selectCurrentWorkerVersion } from "./select-rollback-version.mjs";

// Unconditional entrypoint, including when invoked through a symlink.
try {
  const body = readFileSync(0, "utf8");
  if (body.length > 3_000_000) throw new Error("Deployment history too large.");
  const history = JSON.parse(body);
  process.stdout.write(selectCurrentWorkerVersion(history) + "\n");
} catch {
  console.error("RELEASE_BLOCKED: unable to identify the currently deployed 100% Worker version.");
  process.exitCode = 1;
}
