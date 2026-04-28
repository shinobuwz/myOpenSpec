import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  parseSubagentTrace,
  withGitStateGuard,
} from "../scripts/lib/subagent-trace-parser.mjs";
import {
  DEFAULT_MODEL,
  buildCodexExecArgs,
} from "../scripts/eval-subagent-smoke.mjs";

async function fixture(name) {
  return readFile(path.join("evals", "subagent-smoke", "fixtures", name), "utf8");
}

test("trace parser classifies retry success as pass with warnings", async () => {
  const result = parseSubagentTrace(await fixture("success-with-retry.jsonl"));

  assert.equal(result.status, "pass");
  assert.equal(result.spawnSucceeded, true);
  assert.equal(result.waitCompleted, true);
  assert.equal(result.closeCompleted, true);
  assert.equal(result.finalResult.status, "pass");
  assert.match(result.warnings.join("\n"), /retry|non-JSON/i);
});

test("trace parser fails when no subagent is spawned", async () => {
  const result = parseSubagentTrace(await fixture("no-spawn.jsonl"));

  assert.equal(result.status, "fail");
  assert.equal(result.spawnSucceeded, false);
  assert.match(result.reasons.join("\n"), /spawn_agent/);
});

test("trace parser fails when wait never observes a completed subagent", async () => {
  const result = parseSubagentTrace(await fixture("no-wait-completed.jsonl"));

  assert.equal(result.status, "fail");
  assert.equal(result.spawnSucceeded, true);
  assert.equal(result.waitCompleted, false);
  assert.match(result.reasons.join("\n"), /wait/);
});

test("trace parser fails when final model JSON is malformed", async () => {
  const result = parseSubagentTrace(await fixture("malformed-final-json.jsonl"));

  assert.equal(result.status, "fail");
  assert.equal(result.finalResult, null);
  assert.match(result.reasons.join("\n"), /final JSON/);
});

test("trace parser preserves an inconclusive final model result", async () => {
  const result = parseSubagentTrace(await fixture("final-inconclusive.jsonl"));

  assert.equal(result.status, "inconclusive");
  assert.equal(result.spawnSucceeded, true);
  assert.equal(result.waitCompleted, true);
  assert.equal(result.closeCompleted, true);
  assert.equal(result.finalResult.status, "inconclusive");
  assert.match(result.warnings.join("\n"), /inconclusive/i);
});

test("runner builds a codex exec command compatible with the local CLI", () => {
  const command = buildCodexExecArgs({
    model: "gpt-5.3-codex",
    repo: "/tmp/repo",
    promptPath: "evals/subagent-smoke/prompt.md",
    schemaPath: "evals/subagent-smoke/output.schema.json",
  });

  assert.equal(DEFAULT_MODEL, "gpt-5.3-codex");
  assert.equal(command.command, "codex");
  assert.deepEqual(command.args.slice(0, 2), ["exec", "-m"]);
  assert.equal(command.args.includes("--json"), true);
  assert.equal(command.args.includes("--ephemeral"), true);
  assert.deepEqual(command.args.slice(command.args.indexOf("--sandbox"), command.args.indexOf("--sandbox") + 2), [
    "--sandbox",
    "read-only",
  ]);
  assert.deepEqual(command.args.slice(command.args.indexOf("-C"), command.args.indexOf("-C") + 2), ["-C", "/tmp/repo"]);
  assert.equal(command.args.includes("--ask-for-approval"), false);
  assert.equal(command.args.includes("-a"), false);
});

test("git state guard blocks a pass result when the working tree changes", () => {
  const guarded = withGitStateGuard(
    {
      status: "pass",
      warnings: [],
      reasons: [],
    },
    "",
    " M package.json\n",
  );

  assert.equal(guarded.status, "fail");
  assert.match(guarded.reasons.join("\n"), /working tree/i);
});
