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

async function createFastItem(repo, name, yaml = "schema: fast\nkind: fast\nsource_type: lite\nstatus: in_progress\n") {
  const fastDir = path.join(repo, "openspec", "fast", name);
  await mkdir(fastDir, { recursive: true });
  await writeFile(path.join(fastDir, ".openspec.yaml"), yaml);
  await writeFile(path.join(fastDir, "item.md"), "# Fast item\n");
  return fastDir;
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

test("change helper status follows deterministic artifact and gate next-step matrix", async () => {
  const repo = await createRepo("opsx-helper-next-step-");
  const changeDir = path.join(repo, "openspec", "changes", "matrix");

  async function expectNext(step) {
    const status = run(["-p", repo, "status"]);
    assert.equal(status.status, 0, status.stderr);
    assert.match(status.stdout, new RegExp(`Next: ${step}`));
  }

  async function writeGates(keys) {
    const lines = [
      "schema: spec-driven",
      "created: 2026-04-28",
    ];
    if (keys.length > 0) {
      lines.push("gates:");
      for (const key of keys) {
        lines.push(`  ${key}: "2026-04-28T10:00:00+08:00"`);
      }
    }
    lines.push("");
    await writeFile(path.join(changeDir, ".openspec.yaml"), lines.join("\n"));
  }

  try {
    assert.equal(run(["-p", repo, "init", "matrix", "spec-driven"]).status, 0);
    await expectNext("opsx-slice");

    await writeFile(path.join(changeDir, "proposal.md"), "# Proposal\n");
    await expectNext("opsx-plan");

    await writeFile(path.join(changeDir, "design.md"), "# Design\n");
    await expectNext("opsx-plan");

    await mkdir(path.join(changeDir, "specs", "demo"), { recursive: true });
    await writeFile(path.join(changeDir, "specs", "demo", "spec.md"), "## 新增需求\n");
    await expectNext("opsx-plan-review");

    await writeGates(["plan-review"]);
    await expectNext("opsx-tasks");

    await writeFile(path.join(changeDir, "tasks.md"), "- [ ] 1.1 [test-first] Add coverage\n");
    await expectNext("opsx-task-analyze");

    await writeGates(["plan-review", "task-analyze"]);
    await expectNext("opsx-verify");

    await writeGates(["plan-review", "task-analyze", "verify"]);
    await expectNext("opsx-review");

    await writeGates(["plan-review", "task-analyze", "verify", "review"]);
    await expectNext("opsx-archive");
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});

test("change helper status lists active fast items alongside changes", async () => {
  const repo = await createRepo("opsx-helper-fast-status-");
  try {
    assert.equal(run(["-p", repo, "init", "same-name", "spec-driven"]).status, 0);
    await createFastItem(repo, "same-name");

    const status = run(["-p", repo, "status"]);
    assert.equal(status.status, 0, status.stderr);
    assert.match(status.stdout, /Active changes: 1/);
    assert.match(status.stdout, /Change: same-name/);
    assert.match(status.stdout, /Active fast items: 1/);
    assert.match(status.stdout, /Fast: same-name/);
    assert.match(status.stdout, /Source type: lite/);
    assert.match(status.stdout, /Next: opsx-fast classify/);
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});

test("change helper list shows fast items when no formal changes exist", async () => {
  const repo = await createRepo("opsx-helper-fast-only-list-");
  try {
    await createFastItem(repo, "only-fast");

    const list = run(["-p", repo, "list"]);
    assert.equal(list.status, 0, list.stderr);
    assert.match(list.stdout, /活动 fast items \(1\):/);
    assert.match(list.stdout, /only-fast/);
    assert.doesNotMatch(list.stdout, /^无活动变更$/m);
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});

test("change helper computes fast next step from fast gates", async () => {
  const repo = await createRepo("opsx-helper-fast-next-");
  const fastDir = await createFastItem(repo, "matrix");

  async function writeFastYaml({ gates = [], reviewRequired = true } = {}) {
    const lines = [
      "schema: fast",
      "kind: fast",
      "source_type: bugfix",
      "status: in_progress",
      `review_required: ${reviewRequired ? "true" : "false"}`,
    ];
    if (gates.length > 0) {
      lines.push("gates:");
      for (const key of gates) {
        lines.push(`  ${key}: "2026-04-29T10:00:00+08:00"`);
      }
    }
    lines.push("");
    await writeFile(path.join(fastDir, ".openspec.yaml"), lines.join("\n"));
  }

  async function expectNext(step) {
    const status = run(["-p", repo, "status"]);
    assert.equal(status.status, 0, status.stderr);
    assert.match(status.stdout, new RegExp(`Next: ${step}`));
  }

  try {
    await expectNext("opsx-fast classify");

    await writeFastYaml({ gates: ["classify"] });
    await expectNext("opsx-fast preflight");

    await writeFastYaml({ gates: ["classify", "preflight"] });
    await expectNext("opsx-fast tdd-strategy");

    await writeFastYaml({ gates: ["classify", "preflight", "tdd-strategy"] });
    await expectNext("opsx-verify");

    await writeFastYaml({ gates: ["classify", "preflight", "tdd-strategy", "verify"], reviewRequired: true });
    await expectNext("opsx-review");

    await writeFastYaml({ gates: ["classify", "preflight", "tdd-strategy", "verify"], reviewRequired: false });
    await expectNext("opsx-archive");
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});

test("change helper computes fast next step from nested fast gate schema", async () => {
  const repo = await createRepo("opsx-helper-fast-nested-gates-");
  const fastDir = await createFastItem(repo, "nested");

  try {
    await writeFile(
      path.join(fastDir, ".openspec.yaml"),
      [
        "schema: fast",
        "kind: fast",
        "source_type: lite",
        "status: in_progress",
        "review_required: false",
        "gates:",
        "  classify:",
        "    status: pass",
        "    at: \"2026-04-29T10:00:00+08:00\"",
        "  preflight:",
        "    status: pass",
        "    at: \"2026-04-29T10:01:00+08:00\"",
        "  tdd-strategy:",
        "    status: pass",
        "    at: \"2026-04-29T10:02:00+08:00\"",
        "  verify:",
        "    status: pass",
        "    at: \"2026-04-29T10:03:00+08:00\"",
        "  review:",
        "    status:",
        "    at:",
        "",
      ].join("\n"),
    );

    const status = run(["-p", repo, "status"]);
    assert.equal(status.status, 0, status.stderr);
    assert.match(status.stdout, /verify:\s+pass/);
    assert.match(status.stdout, /Next: opsx-archive/);
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});

test("change helper resolves fast items explicitly and keeps same-name changes separate", async () => {
  const repo = await createRepo("opsx-helper-fast-resolve-");
  try {
    assert.equal(run(["-p", repo, "init", "same-name", "spec-driven"]).status, 0);
    await createFastItem(repo, "same-name");

    const change = run(["-p", repo, "resolve", "same-name"]);
    assert.equal(change.status, 0, change.stderr);
    assert.equal(change.stdout.trim(), await realpath(path.join(repo, "openspec", "changes", "same-name")));

    const fast = run(["-p", repo, "resolve-fast", "same-name"]);
    assert.equal(fast.status, 0, fast.stderr);
    assert.equal(fast.stdout.trim(), await realpath(path.join(repo, "openspec", "fast", "same-name")));
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});

test("change helper rejects unsafe fast identifiers", async () => {
  const repo = await createRepo("opsx-helper-fast-safety-");
  try {
    for (const candidate of ["/tmp/escape", "../escape", ".hidden", "parent/child"]) {
      const result = run(["-p", repo, "resolve-fast", candidate]);
      assert.notEqual(result.status, 0, candidate);
    }
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

test("init-subchange creates a missing parent group", async () => {
  const repo = await createRepo("opsx-helper-subchange-");
  try {
    const result = run(["-p", repo, "init-subchange", "parent", "child", "spec-driven"]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(existsSync(path.join(repo, "openspec", "changes", "parent", ".openspec.group.yaml")), true);
    assert.equal(
      existsSync(path.join(repo, "openspec", "changes", "parent", "subchanges", "child", ".openspec.yaml")),
      true,
    );
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});

test("init-subchange rejects an existing non-group parent change", async () => {
  const repo = await createRepo("opsx-helper-subchange-conflict-");
  try {
    assert.equal(run(["-p", repo, "init", "parent", "spec-driven"]).status, 0);

    const result = run(["-p", repo, "init-subchange", "parent", "child", "spec-driven"]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /父 change 'parent' 已存在但不是 group/);
    assert.equal(existsSync(path.join(repo, "openspec", "changes", "parent", "subchanges", "child")), false);
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});
