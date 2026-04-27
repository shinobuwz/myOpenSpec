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
