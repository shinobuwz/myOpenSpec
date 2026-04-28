#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  parseSubagentTrace,
  withGitStateGuard,
} from "./lib/subagent-trace-parser.mjs";

export const DEFAULT_MODEL = "gpt-5.3-codex";

const DEFAULT_PROMPT = "evals/subagent-smoke/prompt.md";
const DEFAULT_SCHEMA = "evals/subagent-smoke/output.schema.json";
const DEFAULT_OUTPUT_DIR = ".tmp/opsx-evals";

export function buildCodexExecArgs({
  model = DEFAULT_MODEL,
  repo = process.cwd(),
  promptPath = DEFAULT_PROMPT,
  schemaPath = DEFAULT_SCHEMA,
  codexBin = "codex",
} = {}) {
  return {
    command: codexBin,
    promptPath,
    args: [
      "exec",
      "-m",
      model,
      "--json",
      "--ephemeral",
      "--sandbox",
      "read-only",
      "-C",
      repo,
      "--output-schema",
      schemaPath,
      "-",
    ],
  };
}

function usage() {
  return [
    "Usage: npm run eval:subagent -- [options]",
    "",
    "Options:",
    `  --model <name>       Model to use (default: ${DEFAULT_MODEL})`,
    "  --repo <path>        Repository root (default: cwd)",
    `  --output-dir <path>  Trace output directory (default: ${DEFAULT_OUTPUT_DIR})`,
    "  --codex-bin <path>   Codex binary (default: codex)",
    "  --help              Show this help",
    "",
    "Runs a real Codex subagent smoke eval. This command is optional and is not part of npm test.",
  ].join("\n");
}

function parseArgs(argv) {
  const options = {
    model: DEFAULT_MODEL,
    repo: process.cwd(),
    outputDir: DEFAULT_OUTPUT_DIR,
    codexBin: "codex",
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--model") {
      options.model = argv[++i];
    } else if (arg === "--repo") {
      options.repo = argv[++i];
    } else if (arg === "--output-dir") {
      options.outputDir = argv[++i];
    } else if (arg === "--codex-bin") {
      options.codexBin = argv[++i];
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.model || !options.repo || !options.outputDir || !options.codexBin) {
    throw new Error("Missing value for one or more options.");
  }

  return options;
}

function gitStatus(repo) {
  const result = spawnSync("git", ["status", "--short"], {
    cwd: repo,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(`git status failed: ${result.stderr || result.stdout}`);
  }

  return result.stdout;
}

function timestampSlug(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

async function runEval(options) {
  const repo = path.resolve(options.repo);
  const promptPath = path.join(repo, DEFAULT_PROMPT);
  const schemaPath = path.join(repo, DEFAULT_SCHEMA);
  const outputDir = path.resolve(repo, options.outputDir);
  const outputPath = path.join(outputDir, `subagent-smoke-${timestampSlug()}.jsonl`);
  const prompt = await readFile(promptPath, "utf8");
  const beforeStatus = gitStatus(repo);
  const command = buildCodexExecArgs({
    model: options.model,
    repo,
    promptPath,
    schemaPath,
    codexBin: options.codexBin,
  });

  await mkdir(outputDir, { recursive: true });

  const result = spawnSync(command.command, command.args, {
    cwd: repo,
    input: prompt,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  });

  const trace = [result.stdout, result.stderr].filter(Boolean).join(result.stdout && result.stderr ? "\n" : "");
  await writeFile(outputPath, trace);

  let parsed = parseSubagentTrace(trace);
  if (result.status !== 0) {
    parsed = {
      ...parsed,
      status: "fail",
      reasons: [
        ...parsed.reasons,
        `codex exec exited with status ${result.status}.`,
      ],
    };
  }

  const afterStatus = gitStatus(repo);
  const guarded = withGitStateGuard(parsed, beforeStatus, afterStatus);

  return {
    ...guarded,
    tracePath: outputPath,
    model: options.model,
    codexExitStatus: result.status,
  };
}

async function main(argv = process.argv.slice(2)) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    console.error(error.message);
    console.error(usage());
    return 2;
  }

  if (options.help) {
    console.log(usage());
    return 0;
  }

  const result = await runEval(options);
  const label = result.status === "pass" && result.warnings.length > 0
    ? "PASS_WITH_WARNINGS"
    : result.status.toUpperCase();

  console.log(`Result: ${label}`);
  console.log(`Model: ${result.model}`);
  console.log(`Trace: ${result.tracePath}`);
  if (result.warnings.length > 0) {
    console.log("Warnings:");
    for (const warning of result.warnings) {
      console.log(`- ${warning}`);
    }
  }
  if (result.reasons.length > 0) {
    console.log("Reasons:");
    for (const reason of result.reasons) {
      console.log(`- ${reason}`);
    }
  }

  console.log(JSON.stringify(result, null, 2));
  if (result.status === "fail") {
    return 1;
  }
  if (result.status === "inconclusive") {
    return 2;
  }
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then((code) => {
    process.exitCode = code;
  }).catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}

export { main, parseArgs, runEval };
