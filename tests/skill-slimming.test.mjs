import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";

function runChecker(args = [], options = {}) {
  return spawnSync(process.execPath, ["scripts/check-skill-slimming.mjs", ...args], {
    cwd: options.cwd ?? process.cwd(),
    encoding: "utf8",
  });
}

async function skill(name) {
  return readFile(`skills/${name}/SKILL.md`, "utf8");
}

async function referenceNames(name) {
  return readdir(`skills/${name}/references`);
}

test("skill slimming checker reports current inventory without failing baseline", () => {
  const result = runChecker(["--json"]);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);

  assert.equal(payload.summary.totalSkills, 19);
  assert.ok(payload.summary.totalLines < 3200);
  assert.ok(payload.skills.some((entry) => entry.name === "opsx-explore" && entry.lines <= 180));
  assert.ok(payload.skills.every((entry) => entry.path.endsWith("/SKILL.md")));
});

test("guidance skills use thin entries with reference navigation", async () => {
  const expectations = {
    "opsx-explore": {
      maxLines: 180,
      references: ["workflow.md", "conversation-patterns.md", "codemap-first.md"],
      mustKeep: [/只读/, /禁止.*写.*产品代码/, /opsx-subagent/, /codemap-first|codemap/],
    },
    "opsx-knowledge": {
      maxLines: 160,
      references: ["lifecycle-workflow.md", "templates.md"],
      mustKeep: [/\.aiknowledge\/README\.md/, /source_refs/, /月度日志/, /tombstone|superseded/],
    },
    "opsx-codemap": {
      maxLines: 160,
      references: ["lifecycle-workflow.md", "templates.md"],
      mustKeep: [/\.aiknowledge\/README\.md/, /index-first|先读.*index/, /月度日志/, /codemap-only|只写.*codemap/],
    },
    "opsx-lite": {
      maxLines: 140,
      references: ["workflow.md", "lite-run-template.md"],
      mustKeep: [/低风险/, /升级.*opsx-slice/, /fresh verification evidence|fresh evidence/, /默认使用中文/],
    },
    "opsx-slice": {
      maxLines: 135,
      references: ["workflow.md", "templates.md"],
      mustKeep: [/cohesion|内聚/, /subchange/, /active_subchange|recommended_order/],
    },
    "opsx-auto-drive": {
      maxLines: 130,
      references: ["engine-loop.md", "record-templates.md"],
      mustKeep: [/目标/, /量化/, /停止|卡住/, /summary\.md/],
    },
    "opsx-bugfix": {
      maxLines: 100,
      references: ["workflow.md"],
      mustKeep: [/根因/, /连续 3 次|3 次/, /opsx-knowledge|知识/],
    },
  };

  for (const [name, expectation] of Object.entries(expectations)) {
    const text = await skill(name);
    const lines = text.endsWith("\n") ? text.split("\n").length - 1 : text.split("\n").length;
    const refs = await referenceNames(name);

    assert.ok(lines <= expectation.maxLines, `${name} has ${lines} lines`);
    assert.match(text, /references\//, `${name} should navigate to references`);
    for (const file of expectation.references) {
      assert.ok(refs.includes(file), `${name} should include references/${file}`);
    }
    for (const pattern of expectation.mustKeep) {
      assert.match(text, pattern, `${name} lost required entry guardrail ${pattern}`);
    }
  }
});

test("skill slimming checker can fail on synthetic canonical contract duplication", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "opsx-slimming-"));
  const skillDir = path.join(root, "skills", "opsx-demo");

  try {
    await mkdir(skillDir, { recursive: true });
    await writeFile(
      path.join(skillDir, "SKILL.md"),
      [
        "---",
        "name: opsx-demo",
        "description: demo",
        "---",
        "",
        "| 角色 | Codex 默认 | Claude Code 兼容 |",
        "|------|------------|------------------|",
        "| reviewer worker | `spawn_agent(agent_type=\"worker\", message=...)` | `Task tool` |",
        "",
        "StageResult JSON:",
        "{",
        "  \"version\": 1,",
        "  \"run_id\": \"demo\",",
        "  \"change_id\": \"demo\",",
        "  \"stage\": \"verify\",",
        "  \"agent_role\": \"verify-reviewer\",",
        "  \"summary\": \"demo\",",
        "  \"decision\": \"pass\",",
        "  \"metrics\": {\"findings_total\": 0, \"critical\": 0, \"warning\": 0, \"suggestion\": 0},",
        "  \"findings\": []",
        "}",
        "",
      ].join("\n"),
    );

    const result = runChecker(["--root", root, "--json", "--fail-on-duplicates"]);
    assert.notEqual(result.status, 0);
    const payload = JSON.parse(result.stdout);

    assert.equal(payload.duplicates.length, 2);
    assert.deepEqual(payload.duplicates.map((item) => item.kind).sort(), [
      "stage-result-schema",
      "subagent-platform-mapping",
    ]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("skill slimming checker uses only node standard library imports", async () => {
  const source = await readFile("scripts/check-skill-slimming.mjs", "utf8");

  assert.doesNotMatch(source, /from ["'](?!node:|\.)/);
  assert.doesNotMatch(source, /require\(/);
});
