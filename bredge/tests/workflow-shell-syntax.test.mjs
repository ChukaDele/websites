import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const text = readFileSync(
  new URL("../../.github/workflows/deploy-bredge.yml", import.meta.url),
  "utf8",
);

function extractRunBlocks(source) {
  const lines = source.split(/\r?\n/);
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const start = lines[i].match(/^(\s*)run:\s*\|\s*$/);
    if (!start) continue;
    const parentIndent = start[1].length;
    let j = i + 1;
    const body = [];
    for (; j < lines.length; j++) {
      const line = lines[j];
      const indentation = (line.match(/^ */) || [""])[0].length;
      if (line.trim() !== "" && indentation <= parentIndent) break;
      body.push(line);
    }
    const nonblankIndents = body.filter((line) => line.trim() !== "").map(
      (line) => (line.match(/^ */) || [""])[0].length,
    );
    if (nonblankIndents.length === 0) throw new Error(`Empty YAML shell block at line ${i + 1}`);
    const indentation = Math.min(...nonblankIndents);
    const script = body.map((line) => line.trim() ? line.slice(indentation) : "").join("\n");
    blocks.push({ line: i + 1, script });
    i = j - 1;
  }
  return blocks;
}

test("each multi-line GitHub Actions shell step passes bash -n, including protected production", () => {
  const blocks = extractRunBlocks(text);
  assert.ok(blocks.length >= 8, "Too few workflow shell blocks extracted; check parser assumptions");
  for (const { line, script } of blocks) {
    const result = spawnSync("bash", ["-n"], {
      input: script,
      encoding: "utf8",
      timeout: 10_000,
    });
    assert.equal(result.status, 0, `Workflow shell at line ${line} has syntax errors:\n${result.stderr}`);
  }
});

test("the rollback selector assignment is fully terminated on its own line", () => {
  const blocks = extractRunBlocks(text);
  const publish = blocks.find(({ script }) => script.includes("Previous Worker version for rollback"));
  assert.ok(publish, "Production publishing shell step missing");
  const assignment = publish.script.split("\n").find((line) => line.trim().startsWith('previous="'));
  assert.ok(assignment, "Rollback version assignment missing");
  assert.match(
    assignment.trim(),
    /^previous="\$\(printf '%s' "\$history" \| node scripts\/select-rollback-version-cli\.mjs\)"$/,
    "Malformed rollback selection can silently swallow later commands despite bash -n success",
  );
});

test("a regression fixture with an unclosed rollback quote fails validation", () => {
  const malformed = `previous="$(printf '%s' "$history" | node scripts/select-rollback-version-cli.mjs)\nif [[ ! "$previous" =~ ^[a-f0-9-]{36}$ ]]; then exit 1; fi\n`;
  const result = spawnSync("bash", ["-n"], {
    input: malformed,
    encoding: "utf8",
    timeout: 10_000,
  });
  assert.notEqual(result.status, 0);
});
