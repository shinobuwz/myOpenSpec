import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  main,
  parseProjectOption,
  resolveProjectRoot,
  usage,
} from "../bin/opsx.mjs";

function createIo() {
  let stdout = "";
  let stderr = "";
  return {
    io: {
      stdout: { write: (value) => { stdout += value; } },
      stderr: { write: (value) => { stderr += value; } },
    },
    get stdout() { return stdout; },
    get stderr() { return stderr; },
  };
}

test("help lists supported thin subcommands", async () => {
  const capture = createIo();
  const code = await main(["--help"], capture.io);

  assert.equal(code, 0);
  assert.match(capture.stdout, /changes/);
  assert.match(capture.stdout, /install-skills/);
  assert.match(capture.stdout, /init-project/);
  assert.equal(capture.stderr, "");
  assert.equal(usage().includes("workflow"), false);
});

test("unknown subcommands fail without invoking workflow engine", async () => {
  const capture = createIo();
  const code = await main(["workflow", "run"], capture.io);

  assert.equal(code, 1);
  assert.match(capture.stderr, /Unknown subcommand/);
});

test("cli entrypoint runs when invoked through an npm-style symlink", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "opsx-bin-"));
  const link = path.join(root, "opsx");

  try {
    await symlink(path.resolve("bin/opsx.mjs"), link);
    const result = spawnSync("node", [link, "--version"], {
      cwd: path.resolve("."),
      encoding: "utf8",
    });

    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, "1.0.1\n");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("project option can appear before or after command args", () => {
  assert.deepEqual(parseProjectOption(["-p", "/repo", "init", "demo"]), {
    project: "/repo",
    args: ["init", "demo"],
  });

  assert.deepEqual(parseProjectOption(["init", "demo", "--project", "/repo", "spec-driven"]), {
    project: "/repo",
    args: ["init", "demo", "spec-driven"],
  });
});

test("project root resolution honors cli, env, then cwd discovery", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "opsx-root-"));
  const cliRepo = path.join(root, "cli repo");
  const envRepo = path.join(root, "env-repo");
  const cwdRepo = path.join(root, "cwd-repo");

  await mkdir(path.join(cliRepo, "openspec", "changes"), { recursive: true });
  await writeFile(path.join(cliRepo, "openspec", "config.yaml"), "schema: spec-driven\n");
  await mkdir(path.join(cliRepo, "docs"), { recursive: true });
  await writeFile(path.join(cliRepo, "README.md"), "# test\n");

  await mkdir(path.join(envRepo, "openspec", "changes"), { recursive: true });
  await writeFile(path.join(envRepo, "openspec", "config.yaml"), "schema: spec-driven\n");

  await mkdir(path.join(cwdRepo, "openspec", "changes"), { recursive: true });
  await writeFile(path.join(cwdRepo, "openspec", "config.yaml"), "schema: spec-driven\n");
  await mkdir(path.join(cwdRepo, "nested"), { recursive: true });

  try {
    assert.equal(
      resolveProjectRoot({ project: path.join(cliRepo, "docs"), cwd: path.join(cwdRepo, "nested"), env: { OPSX_PROJECT_ROOT: envRepo } }),
      cliRepo,
    );
    assert.equal(
      resolveProjectRoot({ project: path.join(cliRepo, "README.md"), cwd: root, env: {} }),
      cliRepo,
    );
    assert.equal(
      resolveProjectRoot({ cwd: path.join(cwdRepo, "nested"), env: { OPSX_PROJECT_ROOT: envRepo } }),
      envRepo,
    );
    assert.equal(
      resolveProjectRoot({ cwd: path.join(cwdRepo, "nested"), env: {} }),
      cwdRepo,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("init-project creates only project-local openspec state", async () => {
  const repo = await mkdtemp(path.join(tmpdir(), "opsx-init-"));
  const capture = createIo();

  try {
    const code = await main(["init-project", "-p", repo], capture.io);

    assert.equal(code, 0);
    assert.equal(existsSync(path.join(repo, "openspec", "config.yaml")), true);
    assert.equal(existsSync(path.join(repo, "openspec", "changes")), true);
    assert.equal(existsSync(path.join(repo, ".opsx")), false);
    assert.equal(existsSync(path.join(repo, ".claude", "opsx")), false);

    await writeFile(path.join(repo, "openspec", "config.yaml"), "custom: true\n");
    const second = createIo();
    assert.equal(await main(["init-project", "--project", repo], second.io), 0);
    assert.equal(await readFile(path.join(repo, "openspec", "config.yaml"), "utf8"), "custom: true\n");
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});

test("install-skills syncs opsx skills globally and prunes stale opsx skills", async () => {
  const target = await mkdtemp(path.join(tmpdir(), "opsx-skills-"));
  const oldEnv = process.env.OPSX_AGENTS_SKILLS_HOME;
  process.env.OPSX_AGENTS_SKILLS_HOME = target;

  try {
    await mkdir(path.join(target, "opsx-old"), { recursive: true });
    await writeFile(path.join(target, "opsx-old", "SKILL.md"), "old\n");
    await mkdir(path.join(target, "custom-skill"), { recursive: true });
    await writeFile(path.join(target, "custom-skill", "SKILL.md"), "custom\n");

    const capture = createIo();
    assert.equal(await main(["install-skills"], capture.io), 0);

    assert.equal(existsSync(path.join(target, "opsx-plan", "SKILL.md")), true);
    assert.equal(existsSync(path.join(target, "opsx-old")), false);
    assert.equal(existsSync(path.join(target, "custom-skill", "SKILL.md")), true);
  } finally {
    if (oldEnv === undefined) {
      delete process.env.OPSX_AGENTS_SKILLS_HOME;
    } else {
      process.env.OPSX_AGENTS_SKILLS_HOME = oldEnv;
    }
    await rm(target, { recursive: true, force: true });
  }
});

test("repo sync installs skills without copying claude runtime", async () => {
  const target = await mkdtemp(path.join(tmpdir(), "opsx-sync-"));
  try {
    const result = spawnSync("bash", ["scripts/sync.sh", target], {
      cwd: path.resolve("."),
      encoding: "utf8",
    });

    assert.equal(result.status, 0, result.stderr);
    assert.equal(existsSync(path.join(target, ".claude", "skills", "opsx-plan", "SKILL.md")), true);
    assert.equal(existsSync(path.join(target, ".claude", "opsx")), false);
  } finally {
    await rm(target, { recursive: true, force: true });
  }
});

test("npm package publishes canonical skills and runtime without claude source directories", () => {
  const result = spawnSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: path.resolve("."),
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  const [pack] = JSON.parse(result.stdout);
  const files = new Set(pack.files.map((file) => file.path));

  assert.equal(files.has("bin/opsx.mjs"), true);
  assert.equal(files.has("runtime/bin/changes.sh"), true);
  assert.equal(files.has("runtime/schemas/spec-driven/schema.yaml"), true);
  assert.equal(files.has("runtime/schemas/spec-driven/templates/proposal.md"), true);
  assert.equal(files.has("skills/opsx-plan/SKILL.md"), true);
  assert.equal([...files].some((file) => file.startsWith(".claude/")), false);
});

test("launcher changes command can initialize a target project change", async () => {
  const repo = await mkdtemp(path.join(tmpdir(), "opsx-e2e-"));
  try {
    assert.equal(await main(["init-project", "-p", repo], createIo().io), 0);

    const result = spawnSync("node", [
      "bin/opsx.mjs",
      "changes",
      "-p",
      repo,
      "init",
      "demo",
      "spec-driven",
    ], {
      cwd: path.resolve("."),
      encoding: "utf8",
    });

    assert.equal(result.status, 0, result.stderr);
    assert.equal(existsSync(path.join(repo, "openspec", "changes", "demo", ".openspec.yaml")), true);
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});

test("launcher changes command operates on project option instead of cwd", async () => {
  const repoA = await mkdtemp(path.join(tmpdir(), "opsx-launcher-a-"));
  const repoB = await mkdtemp(path.join(tmpdir(), "opsx-launcher-b-"));

  try {
    assert.equal(await main(["init-project", "-p", repoA], createIo().io), 0);
    assert.equal(await main(["init-project", "-p", repoB], createIo().io), 0);

    const result = spawnSync("node", [
      path.resolve("bin/opsx.mjs"),
      "changes",
      "-p",
      repoB,
      "init",
      "target",
      "spec-driven",
    ], {
      cwd: repoA,
      encoding: "utf8",
    });

    assert.equal(result.status, 0, result.stderr);
    assert.equal(existsSync(path.join(repoB, "openspec", "changes", "target", ".openspec.yaml")), true);
    assert.equal(existsSync(path.join(repoA, "openspec", "changes", "target", ".openspec.yaml")), false);
  } finally {
    await rm(repoA, { recursive: true, force: true });
    await rm(repoB, { recursive: true, force: true });
  }
});
