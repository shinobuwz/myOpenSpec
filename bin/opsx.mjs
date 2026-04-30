#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";

export function usage() {
  return `Usage:
  opsx changes [--project <path>] <command> [...args]
  opsx fast [--project <path>] init <id> --source-type <lite|bugfix> [--branch]
  opsx git [--project <path>] merge-back <change|fast> <id>
  opsx git [--project <path>] checkpoint --message <message> (--all|-- <path...>)
  opsx install-skills
  opsx init-project --project <path>

Commands:
  changes         Run OpenSpec change helper operations
  fast            Initialize fast item artifacts from package templates
  git             Run OPSX git lifecycle gates
  install-skills  Install OPSX skills and common contracts globally
  init-project    Initialize project-local openspec state
`;
}

export function parseProjectOption(argv) {
  const args = [];
  let project;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "-p" || arg === "--project") {
      if (i + 1 >= argv.length) {
        throw new Error(`${arg} requires a path`);
      }
      project = argv[i + 1];
      i += 1;
      continue;
    }
    args.push(arg);
  }

  return { project, args };
}

function pathStat(candidate) {
  try {
    return fs.statSync(candidate);
  } catch {
    return undefined;
  }
}

function findNearestOpenSpecRoot(startDir) {
  let current = startDir;
  while (true) {
    if (
      fs.existsSync(path.join(current, "openspec", "config.yaml")) ||
      fs.existsSync(path.join(current, "openspec", "changes"))
    ) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return undefined;
    }
    current = parent;
  }
}

export function resolveProjectRoot({
  project,
  cwd = process.cwd(),
  env = process.env,
} = {}) {
  const selected = project ?? env.OPSX_PROJECT_ROOT ?? cwd;
  const absolute = path.resolve(cwd, selected);
  const stat = pathStat(absolute);

  if (!stat && (project || env.OPSX_PROJECT_ROOT)) {
    throw new Error(`Project path does not exist: ${absolute}`);
  }

  const startDir = stat?.isFile() ? path.dirname(absolute) : absolute;
  return findNearestOpenSpecRoot(startDir) ?? startDir;
}

function packageRoot() {
  return path.dirname(path.dirname(fileURLToPath(import.meta.url)));
}

function runGit(projectRoot, args, { allowFailure = false } = {}) {
  const result = spawnSync("git", args, {
    cwd: projectRoot,
    encoding: "utf8",
  });
  if (!allowFailure && result.status !== 0) {
    const detail = result.stderr || result.stdout || args.join(" ");
    throw new Error(`git ${args.join(" ")} failed: ${detail.trim()}`);
  }
  return result;
}

function isGitRepo(projectRoot) {
  return runGit(projectRoot, ["rev-parse", "--is-inside-work-tree"], { allowFailure: true }).status === 0;
}

function gitOutput(projectRoot, args) {
  return runGit(projectRoot, args).stdout.trim();
}

function gitStatusShort(projectRoot) {
  return gitOutput(projectRoot, ["status", "--short"]);
}

function branchExists(projectRoot, branch) {
  return runGit(projectRoot, ["show-ref", "--verify", "--quiet", `refs/heads/${branch}`], { allowFailure: true }).status === 0;
}

function lifecycleBranchName(kind, id) {
  return `${kind === "change" ? "opsx" : "fast"}/${id}`;
}

export function prepareLifecycleBranch({ projectRoot, kind, id, branchRequired = true } = {}) {
  if (!projectRoot) {
    throw new Error("projectRoot is required");
  }
  assertSafeFastId(id);
  if (!["change", "fast"].includes(kind)) {
    throw new Error("kind must be change or fast");
  }
  if (!isGitRepo(projectRoot)) {
    if (branchRequired) {
      throw new Error("Git lifecycle branch requires a git repository");
    }
    return undefined;
  }

  const dirty = gitStatusShort(projectRoot);
  if (dirty) {
    throw new Error(`Git workspace is not clean; cannot create lifecycle branch:\n${dirty}`);
  }

  const baseBranch = gitOutput(projectRoot, ["branch", "--show-current"]);
  if (!baseBranch) {
    throw new Error("Cannot create lifecycle branch from detached HEAD");
  }
  const baseSha = gitOutput(projectRoot, ["rev-parse", "HEAD"]);
  const changeBranch = lifecycleBranchName(kind, id);

  if (baseBranch !== changeBranch) {
    if (branchExists(projectRoot, changeBranch)) {
      runGit(projectRoot, ["switch", changeBranch]);
    } else {
      runGit(projectRoot, ["switch", "-c", changeBranch]);
    }
  }

  return {
    baseBranch,
    baseSha,
    changeBranch,
    createdAt: new Date().toISOString(),
  };
}

export function initProject(projectRoot) {
  const openspecDir = path.join(projectRoot, "openspec");
  const changesDir = path.join(openspecDir, "changes");
  const configPath = path.join(openspecDir, "config.yaml");

  fs.mkdirSync(changesDir, { recursive: true });
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, "schema: spec-driven\n", "utf8");
  }
}

export function installSkills({
  targetRoot = process.env.OPSX_AGENTS_SKILLS_HOME ?? path.join(homedir(), ".agents", "skills"),
  commonRoot = process.env.OPSX_COMMON_HOME ?? path.join(homedir(), ".opsx", "common"),
} = {}) {
  if (!targetRoot) {
    throw new Error("Cannot determine global agent skills directory");
  }
  if (!commonRoot) {
    throw new Error("Cannot determine OPSX common directory");
  }

  const sourceRoot = path.join(packageRoot(), "skills");
  if (!fs.existsSync(sourceRoot)) {
    throw new Error(`skills source not found: ${sourceRoot}`);
  }

  fs.mkdirSync(targetRoot, { recursive: true });

  const sourceSkillNames = new Set(
    fs.readdirSync(sourceRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name.startsWith("opsx-"))
      .map((entry) => entry.name),
  );

  for (const entry of fs.readdirSync(targetRoot, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name.startsWith("opsx-") && !sourceSkillNames.has(entry.name)) {
      fs.rmSync(path.join(targetRoot, entry.name), { recursive: true, force: true });
    }
  }

  for (const skillName of sourceSkillNames) {
    const source = path.join(sourceRoot, skillName);
    const target = path.join(targetRoot, skillName);
    fs.rmSync(target, { recursive: true, force: true });
    fs.cpSync(source, target, { recursive: true });
  }

  const commonSource = path.join(sourceRoot, "common");
  let commonCount = 0;
  if (fs.existsSync(commonSource)) {
    fs.rmSync(commonRoot, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(commonRoot), { recursive: true });
    fs.cpSync(commonSource, commonRoot, { recursive: true });
    commonCount = fs.readdirSync(commonSource, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .length;
  }

  return { targetRoot, commonRoot, count: sourceSkillNames.size, commonCount };
}

function runChanges(args, projectRoot, io) {
  const helper = path.join(packageRoot(), "runtime", "bin", "changes.sh");
  if (!fs.existsSync(helper)) {
    io.stderr.write(`changes helper not found: ${helper}\n`);
    return 1;
  }

  const result = spawnSync("bash", [helper, "-p", projectRoot, ...args], {
    cwd: projectRoot,
    env: { ...process.env, OPSX_PROJECT_ROOT: projectRoot },
    encoding: "utf8",
  });

  if (result.stdout) io.stdout.write(result.stdout);
  if (result.stderr) io.stderr.write(result.stderr);
  return result.status ?? 1;
}

function todayString(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function assertSafeFastId(id) {
  if (!id || id === "." || id === ".." || id.includes("/") || id.includes("\\") || id.includes("..")) {
    throw new Error(`Invalid fast item id: ${id}`);
  }
}

function parseFastInitArgs(args) {
  if (args[0] !== "init") {
    throw new Error(`Unknown fast command: ${args[0] ?? ""}`);
  }

  const id = args[1];
  let sourceType;
  let branch = false;

  for (let index = 2; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--source-type") {
      index += 1;
      sourceType = args[index];
    } else if (arg === "--branch") {
      branch = true;
    } else {
      throw new Error(`Unknown fast init argument: ${arg}`);
    }
  }

  if (!id) {
    throw new Error("fast init requires an id");
  }
  if (!["lite", "bugfix"].includes(sourceType)) {
    throw new Error("fast init requires --source-type lite|bugfix");
  }

  return { id, sourceType, branch };
}

function readTemplate(schema, templateName) {
  const templatePath = path.join(packageRoot(), "runtime", "schemas", schema, "templates", templateName);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`template not found: ${templatePath}`);
  }

  return fs.readFileSync(templatePath, "utf8");
}

function fillTemplate(text, { id, sourceType, created }) {
  return text
    .replaceAll("<id>", id)
    .replaceAll("YYYY-MM-DD", created)
    .replace("- source_type: lite", `- source_type: ${sourceType}`);
}

function gitStateYaml(git) {
  if (!git) {
    return [];
  }
  return [
    "git:",
    `  base_branch: ${git.baseBranch}`,
    `  base_sha: ${git.baseSha}`,
    `  change_branch: ${git.changeBranch}`,
    `  created_at: ${git.createdAt}`,
    "  last_checkpoint_sha:",
    "  branch_required: true",
    "  merged: false",
    "  merge_commit:",
    "  pending_merge_reason:",
  ];
}

function fastStateYaml({ id, sourceType, created, git }) {
  return [
    "schema: fast",
    "kind: fast",
    `id: ${id}`,
    `source_type: ${sourceType}`,
    `created: ${created}`,
    "status: in_progress",
    "attempts:",
    "  count: 0",
    "  max_fast_attempts: 3",
    "test_strategy:",
    "  mode:",
    "  reason:",
    "  alternative_verification:",
    "gates:",
    "  classify:",
    "    status:",
    "    at:",
    "  preflight:",
    "    status:",
    "    at:",
    "  tdd-strategy:",
    "    status:",
    "    at:",
    "  verify:",
    "    status:",
    "    at:",
    "  review:",
    "    status:",
    "    at:",
    "fallback:",
    "  trigger:",
    "  status:",
    "  route:",
    "  reason:",
    ...gitStateYaml(git),
    "",
  ].join("\n");
}

export function initFastItem({ projectRoot, id, sourceType, now = new Date(), branch = false } = {}) {
  if (!projectRoot) {
    throw new Error("projectRoot is required");
  }
  assertSafeFastId(id);
  if (!["lite", "bugfix"].includes(sourceType)) {
    throw new Error("sourceType must be lite or bugfix");
  }

  const created = todayString(now);
  const git = branch ? prepareLifecycleBranch({ projectRoot, kind: "fast", id, branchRequired: true }) : undefined;
  const fastRoot = path.join(projectRoot, "openspec", "fast", id);
  if (fs.existsSync(fastRoot)) {
    throw new Error(`fast item already exists: ${fastRoot}`);
  }

  fs.mkdirSync(fastRoot, { recursive: true });
  fs.writeFileSync(
    path.join(fastRoot, "item.md"),
    fillTemplate(readTemplate("fast", "item.md"), { id, sourceType, created }),
    "utf8",
  );
  fs.writeFileSync(
    path.join(fastRoot, "evidence.md"),
    fillTemplate(readTemplate("fast", "evidence.md"), { id, sourceType, created }),
    "utf8",
  );
  fs.writeFileSync(path.join(fastRoot, ".openspec.yaml"), fastStateYaml({ id, sourceType, created, git }), "utf8");

  const createdFiles = ["item.md", "evidence.md", ".openspec.yaml"];
  if (sourceType === "bugfix") {
    fs.writeFileSync(
      path.join(fastRoot, "root-cause.md"),
      fillTemplate(readTemplate("fast", "root-cause.md"), { id, sourceType, created }),
      "utf8",
    );
    createdFiles.push("root-cause.md");
  }

  return { fastRoot, createdFiles };
}

function runFast(args, projectRoot, io) {
  try {
    const { id, sourceType, branch } = parseFastInitArgs(args);
    const result = initFastItem({ projectRoot, id, sourceType, branch });
    io.stdout.write(`Initialized fast item: ${result.fastRoot}\n`);
    for (const file of result.createdFiles) {
      io.stdout.write(`- ${file}\n`);
    }
    return 0;
  } catch (error) {
    io.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

function parseNestedGitMetadata(text) {
  const metadata = {};
  const lines = text.split(/\r?\n/);
  let inGit = false;
  for (const line of lines) {
    if (/^[^:\s][^:]*:/.test(line)) {
      inGit = line.startsWith("git:");
      continue;
    }
    if (!inGit) {
      continue;
    }
    const match = line.match(/^  ([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) {
      metadata[match[1]] = match[2].replace(/^"|"$/g, "");
    }
  }
  return metadata;
}

function updateNestedGitMetadata(filePath, updates) {
  const lines = fs.readFileSync(filePath, "utf8").split(/\n/);
  const gitIndex = lines.findIndex((line) => line === "git:");
  if (gitIndex === -1) {
    throw new Error(`Missing git metadata: ${filePath}`);
  }

  let end = lines.length;
  for (let index = gitIndex + 1; index < lines.length; index += 1) {
    if (/^[^:\s][^:]*:/.test(lines[index])) {
      end = index;
      break;
    }
  }

  for (const [key, value] of Object.entries(updates)) {
    const replacement = `  ${key}: ${value ?? ""}`;
    let replaced = false;
    for (let index = gitIndex + 1; index < end; index += 1) {
      if (lines[index].startsWith(`  ${key}:`)) {
        lines[index] = replacement;
        replaced = true;
        break;
      }
    }
    if (!replaced) {
      lines.splice(end, 0, replacement);
      end += 1;
    }
  }

  fs.writeFileSync(filePath, lines.join("\n"), "utf8");
}

function resolveLifecycleTarget(projectRoot, kind, id) {
  if (kind === "fast") {
    assertSafeFastId(id);
    const fastRoot = path.join(projectRoot, "openspec", "fast", id);
    const meta = path.join(fastRoot, ".openspec.yaml");
    if (!fs.existsSync(meta)) {
      throw new Error(`fast item not found: ${id}`);
    }
    return fastRoot;
  }
  if (kind === "change") {
    const helper = path.join(packageRoot(), "runtime", "bin", "changes.sh");
    const result = spawnSync("bash", [helper, "-p", projectRoot, "resolve", id], {
      cwd: projectRoot,
      encoding: "utf8",
    });
    if (result.status !== 0) {
      throw new Error((result.stderr || result.stdout || `change not found: ${id}`).trim());
    }
    return result.stdout.trim();
  }
  throw new Error("merge-back target kind must be change or fast");
}

export function mergeBackLifecycleBranch({ projectRoot, kind, id } = {}) {
  if (!projectRoot) {
    throw new Error("projectRoot is required");
  }
  if (!isGitRepo(projectRoot)) {
    throw new Error("merge-back requires a git repository");
  }
  const targetRoot = resolveLifecycleTarget(projectRoot, kind, id);
  const metaPath = path.join(targetRoot, ".openspec.yaml");
  const relativeMetaPath = path.relative(projectRoot, metaPath);
  const metadata = parseNestedGitMetadata(fs.readFileSync(metaPath, "utf8"));
  if (metadata.branch_required !== "true" && !metadata.change_branch) {
    return { skipped: true, reason: "no lifecycle branch recorded" };
  }
  const { base_branch: baseBranch, change_branch: changeBranch } = metadata;
  if (!baseBranch || !changeBranch) {
    throw new Error(`Incomplete git metadata in ${relativeMetaPath}`);
  }
  const dirty = gitStatusShort(projectRoot);
  if (dirty) {
    throw new Error(`Git workspace is not clean; cannot merge back:\n${dirty}`);
  }
  if (!branchExists(projectRoot, changeBranch)) {
    throw new Error(`Lifecycle branch not found: ${changeBranch}`);
  }
  if (!branchExists(projectRoot, baseBranch)) {
    throw new Error(`Base branch not found: ${baseBranch}`);
  }

  const current = gitOutput(projectRoot, ["branch", "--show-current"]);
  if (current !== changeBranch) {
    runGit(projectRoot, ["switch", changeBranch]);
  }

  runGit(projectRoot, ["switch", baseBranch]);
  runGit(projectRoot, ["merge", "--no-ff", changeBranch, "-m", `Merge ${changeBranch} for ${id}`]);
  const mergeCommit = gitOutput(projectRoot, ["rev-parse", "HEAD"]);
  updateNestedGitMetadata(path.join(projectRoot, relativeMetaPath), {
    merged: "true",
    merge_commit: mergeCommit,
    pending_merge_reason: "",
  });
  return { skipped: false, baseBranch, changeBranch, mergeCommit };
}

function parseCheckpointArgs(args) {
  let message;
  let all = false;
  const paths = [];
  let pathMode = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (pathMode) {
      paths.push(arg);
      continue;
    }
    if (arg === "--") {
      pathMode = true;
    } else if (arg === "--message" || arg === "-m") {
      index += 1;
      message = args[index];
    } else if (arg === "--all") {
      all = true;
    } else {
      throw new Error(`Unknown checkpoint argument: ${arg}`);
    }
  }

  if (!message) {
    throw new Error("checkpoint requires --message <message>");
  }
  if (all && paths.length > 0) {
    throw new Error("checkpoint accepts either --all or explicit paths, not both");
  }
  if (!all && paths.length === 0) {
    throw new Error("checkpoint requires --all or explicit paths after --");
  }
  return { message, all, paths };
}

export function createGitCheckpoint({ projectRoot, message, all = false, paths = [] } = {}) {
  if (!projectRoot) {
    throw new Error("projectRoot is required");
  }
  if (!message) {
    throw new Error("message is required");
  }
  if (!isGitRepo(projectRoot)) {
    throw new Error("checkpoint requires a git repository");
  }

  if (all) {
    runGit(projectRoot, ["add", "-A"]);
  } else if (paths.length > 0) {
    runGit(projectRoot, ["add", "--", ...paths]);
  } else {
    throw new Error("checkpoint requires --all or explicit paths");
  }

  const staged = gitOutput(projectRoot, ["diff", "--cached", "--name-only"]);
  if (!staged) {
    return { skipped: true, reason: "no staged changes" };
  }

  runGit(projectRoot, ["commit", "-m", message]);
  return {
    skipped: false,
    commit: gitOutput(projectRoot, ["rev-parse", "HEAD"]),
  };
}

function runGitLifecycle(args, projectRoot, io) {
  try {
    const command = args[0];
    if (command === "checkpoint") {
      const options = parseCheckpointArgs(args.slice(1));
      const result = createGitCheckpoint({ projectRoot, ...options });
      if (result.skipped) {
        io.stdout.write(`Checkpoint skipped: ${result.reason}\n`);
      } else {
        io.stdout.write(`Checkpoint committed: ${result.commit}\n`);
      }
      return 0;
    }
    if (command !== "merge-back") {
      throw new Error(`Unknown git lifecycle command: ${command ?? ""}`);
    }
    const kind = args[1];
    const id = args[2];
    if (!kind || !id || args.length > 3) {
      throw new Error("Usage: opsx git merge-back <change|fast> <id>");
    }
    const result = mergeBackLifecycleBranch({ projectRoot, kind, id });
    if (result.skipped) {
      io.stdout.write(`Merge-back skipped: ${result.reason}\n`);
    } else {
      io.stdout.write(`Merged ${result.changeBranch} into ${result.baseBranch}: ${result.mergeCommit}\n`);
    }
    return 0;
  } catch (error) {
    io.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

export async function main(argv = process.argv.slice(2), io = {}) {
  const stdout = io.stdout ?? process.stdout;
  const stderr = io.stderr ?? process.stderr;
  const command = argv[0];

  if (!command || command === "--help" || command === "-h" || command === "help") {
    stdout.write(usage());
    return 0;
  }

  if (command === "--version" || command === "-v") {
    stdout.write("1.0.3\n");
    return 0;
  }

  if (command === "changes") {
    const { project, args } = parseProjectOption(argv.slice(1));
    const projectRoot = resolveProjectRoot({ project });
    return runChanges(args, projectRoot, { stdout, stderr });
  }

  if (command === "fast") {
    const { project, args } = parseProjectOption(argv.slice(1));
    const projectRoot = resolveProjectRoot({ project });
    return runFast(args, projectRoot, { stdout, stderr });
  }

  if (command === "git") {
    const { project, args } = parseProjectOption(argv.slice(1));
    const projectRoot = resolveProjectRoot({ project });
    return runGitLifecycle(args, projectRoot, { stdout, stderr });
  }

  if (command === "init-project") {
    const { project, args } = parseProjectOption(argv.slice(1));
    if (args.length > 0) {
      stderr.write(`Unknown init-project argument: ${args[0]}\n`);
      return 1;
    }
    const projectRoot = resolveProjectRoot({ project });
    initProject(projectRoot);
    stdout.write(`Initialized OpenSpec project: ${projectRoot}\n`);
    return 0;
  }

  if (command === "install-skills") {
    const { args } = parseProjectOption(argv.slice(1));
    if (args.length > 0) {
      stderr.write(`Unknown install-skills argument: ${args[0]}\n`);
      return 1;
    }
    const result = installSkills();
    stdout.write(`Installed ${result.count} OPSX skills: ${result.targetRoot}\n`);
    stdout.write(`Installed ${result.commonCount} OPSX common contracts: ${result.commonRoot}\n`);
    return 0;
  }

  stderr.write(`Unknown subcommand: ${command}\n\n${usage()}`);
  return 1;
}

function isCliEntryPoint() {
  if (!process.argv[1]) {
    return false;
  }

  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  }
}

if (isCliEntryPoint()) {
  main().then((code) => {
    process.exitCode = code;
  }).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
