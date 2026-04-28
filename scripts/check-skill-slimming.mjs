#!/usr/bin/env node

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

function usage() {
  return [
    "Usage: node scripts/check-skill-slimming.mjs [--root <dir>] [--max-lines <n>] [--json] [--fail-on-duplicates]",
    "",
    "Checks OPSX SKILL.md entry files for size and duplicated canonical contracts.",
  ].join("\n");
}

function parseArgs(argv) {
  const options = {
    root: process.cwd(),
    maxLines: 180,
    json: false,
    failOnDuplicates: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--root") {
      index += 1;
      if (!argv[index]) throw new Error("--root requires a directory");
      options.root = path.resolve(argv[index]);
    } else if (arg === "--max-lines") {
      index += 1;
      const value = Number.parseInt(argv[index], 10);
      if (!Number.isFinite(value) || value <= 0) throw new Error("--max-lines requires a positive integer");
      options.maxLines = value;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--fail-on-duplicates") {
      options.failOnDuplicates = true;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function countLines(text) {
  if (text.length === 0) return 0;
  return text.endsWith("\n") ? text.split("\n").length - 1 : text.split("\n").length;
}

function detectDuplicates(skill) {
  const findings = [];
  const canonicalSubagent = skill.name === "opsx-subagent";

  const copiesStageResultSchema =
    /"version"\s*:\s*1/.test(skill.text) &&
    /"run_id"/.test(skill.text) &&
    /"change_id"/.test(skill.text) &&
    /"agent_role"/.test(skill.text) &&
    /"decision"/.test(skill.text) &&
    /"findings"/.test(skill.text);

  if (copiesStageResultSchema) {
    findings.push({
      kind: "stage-result-schema",
      name: skill.name,
      path: skill.path,
      message: "StageResult schema should be referenced from docs/stage-packet-protocol.md instead of copied.",
    });
  }

  const copiesSubagentMapping =
    !canonicalSubagent &&
    (/Codex 默认/.test(skill.text) && /Claude Code 兼容/.test(skill.text) && /spawn_agent\(agent_type=/.test(skill.text) && /Task tool/.test(skill.text));

  if (copiesSubagentMapping) {
    findings.push({
      kind: "subagent-platform-mapping",
      name: skill.name,
      path: skill.path,
      message: "Subagent platform mapping should be referenced from skills/opsx-subagent/SKILL.md instead of copied.",
    });
  }

  const copiesKnowledgeLifecycle =
    /Source References/.test(skill.text) &&
    /LLM-maintained wiki/.test(skill.text) &&
    /状态机/.test(skill.text);

  if (copiesKnowledgeLifecycle) {
    findings.push({
      kind: "aiknowledge-lifecycle",
      name: skill.name,
      path: skill.path,
      message: ".aiknowledge lifecycle should be referenced from .aiknowledge/README.md instead of copied.",
    });
  }

  return findings;
}

async function collectSkills(root) {
  const skillsDir = path.join(root, "skills");
  const entries = await readdir(skillsDir, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith("opsx-")) continue;

    const skillPath = path.join(skillsDir, entry.name, "SKILL.md");
    const info = await stat(skillPath).catch(() => null);
    if (!info?.isFile()) continue;

    const text = await readFile(skillPath, "utf8");
    skills.push({
      name: entry.name,
      path: path.relative(root, skillPath),
      lines: countLines(text),
      text,
    });
  }

  return skills.sort((left, right) => left.name.localeCompare(right.name));
}

function toPayload(skills, options) {
  const publicSkills = skills.map(({ text, ...skill }) => skill);
  const oversized = publicSkills.filter((skill) => skill.lines > options.maxLines);
  const duplicates = skills.flatMap(detectDuplicates);

  return {
    version: 1,
    root: options.root,
    thresholds: {
      maxLines: options.maxLines,
    },
    summary: {
      totalSkills: publicSkills.length,
      totalLines: publicSkills.reduce((sum, skill) => sum + skill.lines, 0),
      oversized: oversized.length,
      duplicates: duplicates.length,
    },
    skills: publicSkills,
    oversized,
    duplicates,
  };
}

function printText(payload) {
  console.log("Skill Slimming Check");
  console.log(`skills: ${payload.summary.totalSkills}`);
  console.log(`total lines: ${payload.summary.totalLines}`);
  console.log(`oversized: ${payload.summary.oversized}`);
  console.log(`duplicates: ${payload.summary.duplicates}`);

  if (payload.oversized.length > 0) {
    console.log("\nOversized SKILL.md files:");
    for (const item of payload.oversized) {
      console.log(`- ${item.name}: ${item.lines} lines (${item.path})`);
    }
  }

  if (payload.duplicates.length > 0) {
    console.log("\nDuplicated canonical contract candidates:");
    for (const item of payload.duplicates) {
      console.log(`- ${item.name}: ${item.kind} (${item.path})`);
    }
  }
}

async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);

  if (options.help) {
    console.log(usage());
    return 0;
  }

  const skills = await collectSkills(options.root);
  const payload = toPayload(skills, options);

  if (options.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    printText(payload);
  }

  if (options.failOnDuplicates && payload.duplicates.length > 0) {
    return 1;
  }

  return 0;
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (error) => {
    console.error(error.message);
    process.exitCode = 1;
  },
);
