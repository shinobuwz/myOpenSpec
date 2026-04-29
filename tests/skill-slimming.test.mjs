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

  assert.equal(payload.summary.totalSkills, 18);
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
    "opsx-fast": {
      maxLines: 120,
      references: ["route.md", "item-schema.md", "gate-profile.md", "escalation.md"],
      mustKeep: [/source_type/, /lite.*bugfix/s, /preflight/, /TDD|tdd/, /三次|3 次/, /opsx-tdd/, /opsx-verify/],
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

test("gate and reviewer skills use thin entries with canonical references", async () => {
  const expectations = {
    "opsx-plan-review": {
      maxLines: 120,
      references: ["reviewer-prompt.md", "audit-gate.md"],
      mustKeep: [/强制关卡/, /spec.*design|spec↔plan/, /opsx-subagent/, /docs\/stage-packet-protocol\.md/, /gates\.plan-review/, /opsx-tasks/],
    },
    "opsx-task-analyze": {
      maxLines: 120,
      references: ["reviewer-prompt.md", "audit-gate.md"],
      mustKeep: [/强制关卡/, /plan.*tasks|plan↔tasks/, /opsx-subagent/, /docs\/stage-packet-protocol\.md/, /gates\.task-analyze/, /opsx-implement/],
    },
    "opsx-verify": {
      maxLines: 130,
      references: ["reviewer-prompt.md", "fresh-evidence.md"],
      mustKeep: [/没有当前轮验证证据/, /Spec Compliance Review/, /VERIFY_SPEC_COMPLIANCE/, /opsx-subagent/, /docs\/stage-packet-protocol\.md/, /gates\.verify/, /opsx-review/],
    },
    "opsx-review": {
      maxLines: 130,
      references: ["risk-taxonomy.md", "reviewer-prompt.md"],
      mustKeep: [/code quality \/ release risk review/, /VERIFY_DRIFT/, /opsx-verify.*Spec Compliance Review/, /opsx-subagent/, /review-report\.md/, /gates\.review/, /opsx-archive/],
    },
  };

  for (const [name, expectation] of Object.entries(expectations)) {
    const text = await skill(name);
    const lines = text.endsWith("\n") ? text.split("\n").length - 1 : text.split("\n").length;
    const refs = await referenceNames(name);

    assert.ok(lines <= expectation.maxLines, `${name} has ${lines} lines`);
    assert.match(text, /references\//, `${name} should navigate to references`);
    assert.doesNotMatch(text, /"version"\s*:\s*1/, `${name} should not copy StageResult schema`);
    assert.doesNotMatch(text, /"run_id"/, `${name} should not copy StageResult schema`);
    assert.doesNotMatch(text, /"agent_role"/, `${name} should not copy StageResult schema`);
    for (const file of expectation.references) {
      assert.ok(refs.includes(file), `${name} should include references/${file}`);
    }
    for (const pattern of expectation.mustKeep) {
      assert.match(text, pattern, `${name} lost required entry guardrail ${pattern}`);
    }
  }
});

test("execution support skills use thin entries with template references", async () => {
  const expectations = {
    "opsx-tasks": {
      maxLines: 110,
      references: ["task-template.md", "forbidden-patterns.md"],
      mustKeep: [/测试不是单独的 Task/, /Task 不是意图清单/, /gates\.plan-review/, /\[test-first\]/, /\[characterization-first\]/, /\[direct\]/, /opsx-task-analyze/],
    },
    "opsx-tdd": {
      maxLines: 110,
      references: ["red-green-refactor.md", "test-report-template.md", "anti-patterns.md"],
      mustKeep: [/先写测试/, /红.*绿.*重构/, /\[manual\]/, /test-report\.md/, /覆盖率/, /裸 `?N\/A`?/],
    },
    "opsx-report": {
      maxLines: 95,
      references: ["stage-data-sources.md", "html-report-template.md"],
      mustKeep: [/audit-log\.md/, /test-report\.md/, /review-report\.md/, /run-report\.html/, /self-contained|自包含/, /\.openspec\.yaml/],
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

test("implementation and archive skills keep worker guidance in references", async () => {
  const expectations = {
    "opsx-implement": {
      maxLines: 105,
      references: ["worker-contract.md", "execution-rules.md"],
      mustKeep: [
        /gates\.plan-review/,
        /gates\.task-analyze/,
        /默认串行|serial-by-default/i,
        /disjoint write sets/i,
        /共享 artifact.*串行写入|串行.*共享 artifact/,
        /没有证据的验收标准不得勾选/,
        /opsx-subagent/,
        /opsx-verify/,
      ],
    },
    "opsx-archive": {
      maxLines: 110,
      references: ["archive-routing.md", "follow-up-workers.md"],
      mustKeep: [
        /校验 `gates\.verify` 和 `gates\.review` 字段均存在/,
        /不可被用户确认绕过/,
        /顶层 `openspec\/changes\/archive\/<archive-dir>\/`/,
        /如果 `<archive-slug>` 已经以 `YYYY-MM-DD-` 开头/,
        /active_subchange/,
        /opsx-subagent/,
        /opsx-knowledge/,
        /opsx-codemap/,
      ],
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
