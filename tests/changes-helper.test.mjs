import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const helper = path.resolve("runtime/bin/changes.sh");

async function createRepo(prefix) {
  const repo = await mkdtemp(path.join(tmpdir(), prefix));
  await mkdir(path.join(repo, "openspec", "changes"), { recursive: true });
  await writeFile(path.join(repo, "openspec", "config.yaml"), "schema: spec-driven\n");
  return repo;
}

function run(args, options = {}) {
  return spawnSync("bash", [helper, ...args], {
    cwd: options.cwd ?? process.cwd(),
    encoding: "utf8",
    env: { ...process.env, ...(options.env ?? {}) },
  });
}

test("change helper accepts project flag before and after commands", async () => {
  const repo = await createRepo("opsx-helper-");
  try {
    assert.equal(run(["-p", repo, "init", "demo", "spec-driven"]).status, 0);
    assert.equal(existsSync(path.join(repo, "openspec", "changes", "demo", ".openspec.yaml")), true);

    const list = run(["list", "-p", repo], { cwd: tmpdir() });
    assert.equal(list.status, 0);
    assert.match(list.stdout, /demo/);
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});

test("change helper list remains compact while status shows project diagnostics", async () => {
  const repo = await createRepo("opsx-helper-status-");
  try {
    assert.equal(run(["-p", repo, "init", "demo", "spec-driven"]).status, 0);
    await writeFile(
      path.join(repo, "openspec", "changes", "demo", "tasks.md"),
      "- [x] 1.1 Done\n- [ ] 1.2 Pending\n",
    );

    const list = run(["-p", repo, "list"]);
    assert.equal(list.status, 0, list.stderr);
    assert.match(list.stdout, /活动变更 \(1\):/);
    assert.match(list.stdout, /demo\s+\[tasks \(1\/2\)\]/);
    assert.doesNotMatch(list.stdout, /Project:/);

    const status = run(["-p", repo, "status"]);
    assert.equal(status.status, 0, status.stderr);
    const repoReal = await realpath(repo);
    assert.match(status.stdout, new RegExp(`Project: ${repoReal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
    assert.match(status.stdout, /Change: demo/);
    assert.match(status.stdout, /Stage: tasks/);
    assert.match(status.stdout, /Tasks: 1\/2/);
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});

test("change helper status shows gates reports and next step", async () => {
  const repo = await createRepo("opsx-helper-status-gates-");
  const changeDir = path.join(repo, "openspec", "changes", "ready");

  try {
    assert.equal(run(["-p", repo, "init", "ready", "spec-driven"]).status, 0);
    await writeFile(path.join(changeDir, "proposal.md"), "# Proposal\n");
    await writeFile(path.join(changeDir, "design.md"), "# Design\n");
    await mkdir(path.join(changeDir, "specs", "demo"), { recursive: true });
    await writeFile(path.join(changeDir, "specs", "demo", "spec.md"), "## ADDED Requirements\n");
    await writeFile(path.join(changeDir, "tasks.md"), "- [x] 1.1 Done\n");
    await writeFile(path.join(changeDir, "audit-log.md"), "audit\n");
    await writeFile(path.join(changeDir, "test-report.md"), "tests\n");
    await writeFile(path.join(changeDir, "review-report.md"), "review\n");
    await writeFile(
      path.join(changeDir, ".openspec.yaml"),
      [
        "schema: spec-driven",
        "created: 2026-04-27",
        "gates:",
        "  plan-review: \"2026-04-27T10:00:00+08:00\"",
        "  task-analyze: \"2026-04-27T10:01:00+08:00\"",
        "  verify: \"2026-04-27T10:02:00+08:00\"",
        "  review: \"2026-04-27T10:03:00+08:00\"",
        "",
      ].join("\n"),
    );

    const status = run(["-p", repo, "status"]);
    assert.equal(status.status, 0, status.stderr);
    assert.match(status.stdout, /plan-review:\s+2026-04-27T10:00:00\+08:00/);
    assert.match(status.stdout, /task-analyze:\s+2026-04-27T10:01:00\+08:00/);
    assert.match(status.stdout, /verify:\s+2026-04-27T10:02:00\+08:00/);
    assert.match(status.stdout, /review:\s+2026-04-27T10:03:00\+08:00/);
    assert.match(status.stdout, /audit-log\.md:\s+yes/);
    assert.match(status.stdout, /test-report\.md:\s+yes/);
    assert.match(status.stdout, /review-report\.md:\s+yes/);
    assert.match(status.stdout, /Next: opsx-archive/);

    await writeFile(
      path.join(changeDir, ".openspec.yaml"),
      [
        "schema: spec-driven",
        "created: 2026-04-27",
        "gates:",
        "  plan-review: \"2026-04-27T10:00:00+08:00\"",
        "  task-analyze: \"2026-04-27T10:01:00+08:00\"",
        "  verify: \"2026-04-27T10:02:00+08:00\"",
        "",
      ].join("\n"),
    );

    const needsReview = run(["-p", repo, "status"]);
    assert.equal(needsReview.status, 0, needsReview.stderr);
    assert.match(needsReview.stdout, /review:\s+missing/);
    assert.match(needsReview.stdout, /Next: opsx-review/);
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});

test("change helper operates on target project instead of cwd project", async () => {
  const repoA = await createRepo("opsx-helper-a-");
  const repoB = await createRepo("opsx-helper-b-");
  try {
    assert.equal(run(["-p", repoB, "init", "target", "spec-driven"], { cwd: repoA }).status, 0);
    assert.equal(existsSync(path.join(repoB, "openspec", "changes", "target", ".openspec.yaml")), true);
    assert.equal(existsSync(path.join(repoA, "openspec", "changes", "target", ".openspec.yaml")), false);
  } finally {
    await rm(repoA, { recursive: true, force: true });
    await rm(repoB, { recursive: true, force: true });
  }
});

test("change helper resolve prints absolute path and rejects traversal names", async () => {
  const repo = await createRepo("opsx-helper-resolve-");
  try {
    assert.equal(run(["-p", repo, "init", "demo", "spec-driven"]).status, 0);
    const resolved = run(["-p", repo, "resolve", "demo"]);
    assert.equal(resolved.status, 0);
    assert.equal(resolved.stdout.trim(), await realpath(path.join(repo, "openspec", "changes", "demo")));

    const escape = run(["-p", repo, "init", "../escape", "spec-driven"]);
    assert.notEqual(escape.status, 0);
    assert.equal(existsSync(path.join(repo, "openspec", "escape")), false);
    assert.equal(existsSync(path.join(repo, "escape")), false);
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});
