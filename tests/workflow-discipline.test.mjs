import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

async function skill(name) {
  return readFile(`skills/${name}/SKILL.md`, "utf8");
}

test("bugfix skill requires root cause before fixes", async () => {
  const text = await skill("opsx-bugfix");

  assert.match(text, /没有根因，不允许修复/);
  assert.match(text, /形成单一假设/);
  assert.match(text, /连续 3 次修复失败/);
});

test("verify and lite require fresh verification evidence before completion claims", async () => {
  const verify = await skill("opsx-verify");
  const lite = await skill("opsx-lite");

  assert.match(verify, /没有当前轮验证证据/);
  assert.match(verify, /不允许宣称完成、通过、已修复或可归档/);
  assert.match(lite, /没有当前轮验证证据/);
  assert.match(lite, /已修改但未验证/);
});

test("tasks skill requires bite-sized executable tasks", async () => {
  const text = await skill("opsx-tasks");

  assert.match(text, /Task 不是意图清单/);
  assert.match(text, /标题行用于扫读进度/);
  assert.match(text, /验证命令 \/ 方法/);
  assert.match(text, /处理边界情况/);
  assert.match(text, /不是 bite-sized/);
});

test("tasks template keeps trace mapping in detail fields only", async () => {
  const text = await readFile("runtime/schemas/spec-driven/templates/tasks.md", "utf8");

  assert.match(text, /\*\*需求追踪\*\*：\[R1\] → \[U1\]/);
  assert.match(text, /任务标题行只保留执行方式标签/);
  assert.doesNotMatch(text, /^- \[ \] \d+\.\d+ \[R\d+\]\[U\d+\]/m);
});

test("spec-driven templates preserve deterministic artifact contracts", async () => {
  const proposal = await readFile("runtime/schemas/spec-driven/templates/proposal.md", "utf8");
  const design = await readFile("runtime/schemas/spec-driven/templates/design.md", "utf8");
  const spec = await readFile("runtime/schemas/spec-driven/templates/spec.md", "utf8");
  const tasks = await readFile("runtime/schemas/spec-driven/templates/tasks.md", "utf8");

  assert.match(proposal, /## 为什么/);
  assert.match(proposal, /## 变更内容/);
  assert.match(proposal, /## 功能 \(Capabilities\)/);
  assert.match(proposal, /## 影响/);

  assert.match(design, /## 需求追踪/);
  assert.match(design, /\[R1\] -> \[U1\]/);
  assert.match(design, /## 实施单元/);
  assert.match(design, /验证方式/);

  assert.match(spec, /\*\*Trace\*\*: R/);
  assert.match(spec, /\*\*Slice\*\*:/);
  assert.match(spec, /#### 场景:/);
  assert.match(spec, /- \*\*当\*\*/);
  assert.match(spec, /- \*\*那么\*\*/);

  assert.match(tasks, /\[test-first\]/);
  assert.match(tasks, /\[characterization-first\]/);
  assert.match(tasks, /\[direct\]/);
  assert.match(tasks, /\*\*需求追踪\*\*/);
  assert.match(tasks, /\*\*涉及文件\*\*/);
  assert.match(tasks, /\*\*验收标准\*\*/);
  assert.match(tasks, /\*\*验证命令 \/ 方法\*\*/);
  assert.match(tasks, /\*\*依赖\*\*/);
});

test("proposal generation contracts default to Chinese artifact prose", async () => {
  const slice = await skill("opsx-slice");
  const schema = await readFile("runtime/schemas/spec-driven/schema.yaml", "utf8");

  assert.match(slice, /正式 `proposal\.md` 默认使用中文/);
  assert.match(slice, /目标/);
  assert.match(slice, /范围内/);
  assert.match(slice, /范围外/);
  assert.match(slice, /依赖/);
  assert.match(slice, /完成标准/);
  assert.doesNotMatch(slice, /^- Goal$/m);
  assert.doesNotMatch(slice, /^- In Scope$/m);
  assert.doesNotMatch(slice, /^- Out of Scope$/m);
  assert.doesNotMatch(slice, /^- Depends On$/m);
  assert.doesNotMatch(slice, /^- Done Means$/m);

  assert.match(schema, /正式产物默认使用中文/);
  assert.match(schema, /\*\*为什么\*\*/);
  assert.match(schema, /\*\*变更内容\*\*/);
  assert.match(schema, /\*\*功能 \(Capabilities\)\*\*/);
  assert.match(schema, /\*\*影响\*\*/);
  assert.doesNotMatch(schema, /\*\*Why\*\*/);
  assert.doesNotMatch(schema, /\*\*What Changes\*\*/);
  assert.doesNotMatch(schema, /\*\*New Capabilities\*\*/);
  assert.doesNotMatch(schema, /\*\*Impact\*\*/);
});

test("aiknowledge logs and lite-runs default to Chinese prose", async () => {
  const lifecycle = await readFile(".aiknowledge/README.md", "utf8");
  const liteReadme = await readFile(".aiknowledge/lite-runs/README.md", "utf8");
  const lite = await skill("opsx-lite");
  const log = await readFile(".aiknowledge/logs/2026-04.md", "utf8");
  const liteRunFiles = (await readdir(".aiknowledge/lite-runs/2026-04"))
    .filter((name) => name.endsWith(".md"));

  for (const text of [lifecycle, liteReadme, lite]) {
    assert.match(text, /默认使用中文/);
    assert.match(text, /意图/);
    assert.match(text, /范围/);
    assert.match(text, /变更/);
    assert.match(text, /验证/);
    assert.match(text, /风险/);
    assert.match(text, /知识沉淀/);
    assert.doesNotMatch(text, /^- Intent$/m);
    assert.doesNotMatch(text, /^- Scope$/m);
    assert.doesNotMatch(text, /^- Changes$/m);
    assert.doesNotMatch(text, /^- Verification$/m);
    assert.doesNotMatch(text, /^- Risks$/m);
    assert.doesNotMatch(text, /^- Knowledge$/m);
    assert.doesNotMatch(text, /^## Intent$/m);
    assert.doesNotMatch(text, /^## Scope$/m);
    assert.doesNotMatch(text, /^## Changes$/m);
    assert.doesNotMatch(text, /^## Verification$/m);
    assert.doesNotMatch(text, /^## Risks$/m);
    assert.doesNotMatch(text, /^## Knowledge$/m);
  }

  assert.doesNotMatch(log, /^- summary: [A-Za-z]/m);
  assert.doesNotMatch(log, /^- reason: [A-Za-z]/m);

  for (const file of liteRunFiles) {
    const text = await readFile(`.aiknowledge/lite-runs/2026-04/${file}`, "utf8");
    assert.doesNotMatch(text, /^## Intent$/m);
    assert.doesNotMatch(text, /^## Scope$/m);
    assert.doesNotMatch(text, /^## Changes$/m);
    assert.doesNotMatch(text, /^## Verification$/m);
    assert.doesNotMatch(text, /^## Risks$/m);
    assert.doesNotMatch(text, /^## Knowledge$/m);
  }
});

test("workflow skills preserve deterministic gate prerequisites", async () => {
  const tasks = await skill("opsx-tasks");
  const implement = await skill("opsx-implement");
  const archive = await skill("opsx-archive");
  const explore = await skill("opsx-explore");

  assert.match(tasks, /校验 `gates\.plan-review` 字段存在/);
  assert.match(tasks, /请先完成 opsx-plan-review/);

  assert.match(implement, /校验 `gates\.plan-review` 和 `gates\.task-analyze` 字段均存在/);
  assert.match(implement, /任一缺失则拒绝执行/);

  assert.match(archive, /校验 `gates\.verify` 和 `gates\.review` 字段均存在/);
  assert.match(archive, /不可被用户确认绕过/);

  assert.match(explore, /explore 默认只读/);
  assert.match(explore, /绝不编写代码/);
  assert.match(explore, /下一步必须是 `opsx-slice`/);
  assert.match(explore, /禁止.*直接跳转到 `opsx-plan`/);
  assert.match(explore, /request_user_input/);
  assert.match(explore, /Default mode/);
  assert.match(explore, /降级为普通文本中的单个关键问题/);
});

test("implement marks task acceptance criteria consistently", async () => {
  const implement = await skill("opsx-implement");

  assert.match(implement, /顶层任务 `?\[ \]`? → `?\[x\]`?/);
  assert.match(implement, /验收标准 `?\[ \]`? → `?\[x\]`?/);
  assert.match(implement, /没有证据的验收标准不得勾选/);
  assert.match(implement, /未验证的 `?\[manual\]`? 项保持 `?\[ \]`?/);
});

test("verify owns spec compliance and review owns release risk", async () => {
  const verify = await skill("opsx-verify");
  const review = await skill("opsx-review");

  assert.match(verify, /Spec Compliance Review/);
  assert.match(verify, /VERIFY_SPEC_COMPLIANCE/);
  assert.match(review, /opsx-verify.*负责 Spec Compliance Review/);
  assert.match(review, /code quality \/ release risk review/);
  assert.match(review, /VERIFY_DRIFT/);
  assert.doesNotMatch(review, /两段审查顺序/);
});

test("touched skill descriptions avoid workflow step summaries", async () => {
  const touched = [
    "opsx-bugfix",
    "opsx-verify",
    "opsx-lite",
    "opsx-tasks",
    "opsx-review",
    "opsx-explore",
    "opsx-subagent",
  ];

  for (const name of touched) {
    const text = await skill(name);
    const description = text.match(/^description:\s*(.+)$/m)?.[1] ?? "";

    assert.doesNotMatch(description, /→/);
    assert.doesNotMatch(description, /先.*再/);
    assert.ok(description.length <= 220, `${name} description is too long`);
  }
});

test("subagent contract is codex-first with claude compatibility", async () => {
  const text = await skill("opsx-subagent");

  assert.match(text, /spawn_agent\(agent_type="worker"/);
  assert.match(text, /spawn_agent\(agent_type="explorer"/);
  assert.match(text, /Claude Code/);
  assert.match(text, /Task tool/);
  assert.match(text, /main agent.*controller/);
  assert.match(text, /共享 artifact/);
  assert.match(text, /DONE_WITH_CONCERNS/);
  assert.match(text, /NEEDS_CONTEXT/);
  assert.match(text, /BLOCKED/);
  assert.match(text, /StageResult/);
  assert.match(text, /fallback/);
});

test("workflow subagent users reference the central contract", async () => {
  const contractUsers = [
    "opsx-implement",
    "opsx-plan-review",
    "opsx-task-analyze",
    "opsx-verify",
    "opsx-review",
    "opsx-explore",
    "opsx-archive",
  ];

  for (const name of contractUsers) {
    const text = await skill(name);

    assert.match(text, /opsx-subagent/, `${name} should reference opsx-subagent`);
    assert.match(text, /主 agent|main agent/, `${name} should preserve controller ownership`);
  }
});

test("workflow subagent wording avoids claude-only dispatch semantics", async () => {
  const contractUsers = [
    "opsx-implement",
    "opsx-plan-review",
    "opsx-task-analyze",
    "opsx-verify",
    "opsx-review",
    "opsx-explore",
    "opsx-archive",
  ];

  for (const name of contractUsers) {
    const text = await skill(name);
    const usesClaudeDispatch = /subagent_type|Task tool|Agent tool/.test(text);

    if (usesClaudeDispatch) {
      assert.match(text, /opsx-subagent/, `${name} must pair platform dispatch wording with central contract`);
    }
  }
});

test("implement keeps parallel workers serial by default and explicitly bounded", async () => {
  const text = await skill("opsx-implement");

  assert.match(text, /默认串行|serial-by-default/i);
  assert.match(text, /任务簇独立/);
  assert.match(text, /写入集合不重叠|disjoint write sets/i);
  assert.match(text, /明确.*file ownership|明确.*文件 ownership|明确.*文件归属/i);
  assert.match(text, /public interface/i);
  assert.match(text, /migration/i);
  assert.match(text, /schema/i);
  assert.match(text, /config/i);
  assert.match(text, /package\/build scripts/i);
  assert.match(text, /依赖顺序不清/);
  assert.doesNotMatch(text, /默认.*多个 implementation workers|无条件.*多个 implementation workers|自动.*多个 implementation workers/);
});

test("implement keeps shared artifacts and gates under main-agent integration", async () => {
  const text = await skill("opsx-implement");

  assert.match(text, /tasks\.md/);
  assert.match(text, /test-report\.md/);
  assert.match(text, /\.openspec\.yaml/);
  assert.match(text, /audit-log\.md/);
  assert.match(text, /review-report\.md/);
  assert.match(text, /共享 artifact.*串行写入|串行.*共享 artifact/);
  assert.match(text, /逐个检查.*diff|diff.*逐个检查/);
  assert.match(text, /DONE_WITH_CONCERNS/);
  assert.match(text, /NEEDS_CONTEXT/);
  assert.match(text, /BLOCKED/);
  assert.match(text, /opsx-verify/);
});

test("supported tools documents codex-first subagent mapping and real skills", async () => {
  const doc = await readFile("docs/supported-tools.md", "utf8");
  const skillDirs = (await readdir("skills", { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("opsx-"))
    .map((entry) => entry.name)
    .sort();
  const documented = [...doc.matchAll(/^\| `(opsx-[^`]+)` \|/gm)]
    .map((match) => match[1])
    .sort();

  assert.match(doc, /Codex \| 默认入口/);
  assert.match(doc, /spawn_agent/);
  assert.match(doc, /Claude Code \| 兼容入口/);
  assert.deepEqual(documented, skillDirs);
});
