import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

async function skill(name) {
  return readFile(`skills/${name}/SKILL.md`, "utf8");
}

async function common(name) {
  return readFile(`skills/common/${name}`, "utf8");
}

test("fast bugfix source requires root cause before fixes", async () => {
  const text = await skill("opsx-fast");
  const itemSchema = await readFile("skills/opsx-fast/references/item-schema.md", "utf8");

  assert.match(text, /source_type: lite \| bugfix/);
  assert.match(text, /根因假设/);
  assert.match(text, /假设证据/);
  assert.match(text, /三次|3 次/);
  assert.match(text, /opsx fast init <id> --source-type lite\|bugfix/);
  assert.match(itemSchema, /opsx fast init <id> --source-type lite\|bugfix/);
  assert.match(itemSchema, /runtime\/schemas/);
  assert.doesNotMatch(text, /runtime\/schemas\/fast\/templates/);
  assert.doesNotMatch(itemSchema, /runtime\/schemas\/fast\/templates/);
  assert.doesNotMatch(text, /~\/\.opsx\/templates/);
  assert.doesNotMatch(itemSchema, /~\/\.opsx\/templates/);
});

test("codemap active chains route lightweight and bugfix work through opsx-fast", async () => {
  const text = await readFile(".aiknowledge/codemap/index.md", "utf8");

  assert.match(text, /opsx-fast 快速通道 \| active/);
  assert.match(text, /lite \/ bugfix/);
  assert.doesNotMatch(text, /\| bugfix 旁路 \| active \|/);
});

test("verify and fast require fresh verification evidence before completion claims", async () => {
  const verify = await skill("opsx-verify");
  const fast = await skill("opsx-fast");

  assert.match(verify, /没有当前轮验证证据/);
  assert.match(verify, /不允许宣称完成、通过、已修复或可归档/);
  assert.match(fast, /验证计划/);
  assert.match(fast, /evidence\.md/);
  assert.match(fast, /不得宣称完成|不能宣称完成/);
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

test("aiknowledge logs and historical lite-runs default to Chinese prose", async () => {
  const lifecycle = await readFile(".aiknowledge/README.md", "utf8");
  const liteReadme = await readFile(".aiknowledge/lite-runs/README.md", "utf8");
  const fastItem = await readFile("runtime/schemas/fast/templates/item.md", "utf8");
  const fastEvidence = await readFile("runtime/schemas/fast/templates/evidence.md", "utf8");
  const log = await readFile(".aiknowledge/logs/2026-04.md", "utf8");
  const liteRunFiles = (await readdir(".aiknowledge/lite-runs/2026-04"))
    .filter((name) => name.endsWith(".md"));

  for (const text of [lifecycle, liteReadme, fastItem]) {
    assert.match(text, /默认使用中文/);
    assert.match(text, /意图/);
    assert.match(text, /范围/);
    assert.match(text, /变更|预期影响/);
    assert.match(text, /验证/);
    assert.match(text, /风险|升级检查|TDD/);
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

  assert.match(fastEvidence, /默认使用中文/);
  assert.match(fastEvidence, /命令证据/);
  assert.match(fastEvidence, /人工观察证据/);
  assert.match(fastEvidence, /跳过 TDD 理由/);
  assert.match(fastEvidence, /被否定的尝试/);

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

test("workflow git lifecycle contract is centralized and referenced", async () => {
  const contract = await common("git-lifecycle.md");
  const slice = await skill("opsx-slice");
  const plan = await skill("opsx-plan");
  const implement = await skill("opsx-implement");
  const verify = await skill("opsx-verify");
  const review = await skill("opsx-review");
  const archive = await skill("opsx-archive");
  const workflows = await readFile("docs/workflows.md", "utf8");

  assert.match(contract, /正式 change 的本地分支和关键节点 checkpoint 是强制的/);
  assert.match(contract, /opsx git checkpoint --message/);
  assert.match(contract, /opsx git merge-back <change\|fast> <id>/);
  assert.match(contract, /任一 gate 从 fail 或 blocking 进入 pass/);
  assert.match(contract, /pending_merge_reason/);
  assert.match(contract, /git branch -d opsx\/<change-id>/);
  assert.match(contract, /git worktree remove <path>/);
  assert.match(contract, /不得默认使用 `git branch -D`/);

  for (const text of [slice, plan, implement, verify, review, archive, workflows]) {
    assert.match(text, /~\/\.opsx\/common\/git-lifecycle\.md/);
  }
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

test("reusable skills support fast targets without formal artifacts", async () => {
  const tdd = await skill("opsx-tdd");
  const verify = await skill("opsx-verify");
  const verifyPrompt = await readFile("skills/opsx-verify/references/reviewer-prompt.md", "utf8");
  const review = await skill("opsx-review");
  const report = await skill("opsx-report");
  const reportSources = await readFile("skills/opsx-report/references/stage-data-sources.md", "utf8");

  assert.match(tdd, /target_kind: fast/);
  assert.match(tdd, /fast root.*test-report\.md|test-report\.md.*fast root/s);

  assert.match(verify, /target_kind: fast/);
  assert.match(verify, /item\.md/);
  assert.match(verify, /evidence\.md/);
  assert.match(verifyPrompt, /fast artifacts/);
  assert.match(verifyPrompt, /不要求 specs\/design\/tasks|不要求.*formal artifacts/);

  assert.match(review, /target_kind: fast/);
  assert.match(review, /不要求.*proposal\/design\/specs\/tasks|不要求.*formal artifacts/s);

  assert.match(report, /target_kind: fast/);
  assert.match(reportSources, /fast item/);
  assert.match(reportSources, /缺少 specs\/design\/tasks.*不中断|不中断.*specs\/design\/tasks/s);
});

test("touched skill descriptions avoid workflow step summaries", async () => {
  const touched = [
    "opsx-fast",
    "opsx-verify",
    "opsx-tasks",
    "opsx-review",
    "opsx-explore",
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
  const text = await common("subagent.md");

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

test("subagent contract owns dispatch classes and model recommendations", async () => {
  const text = await common("subagent.md");

  assert.match(text, /职责分离/);
  assert.match(text, /workflow skill 负责定义/);
  assert.match(text, /~\/\.opsx\/common\/subagent\.md.*负责定义.*默认模型/s);
  assert.match(text, /retrieval-explorer/);
  assert.match(text, /implementation-worker/);
  assert.match(text, /gate-reviewer/);
  assert.match(text, /maintenance-worker/);
  assert.match(text, /long-running-auditor/);
  assert.match(text, /gpt-5\.3-codex/);
  assert.match(text, /gpt-5\.4/);
  assert.match(text, /gpt-5\.5/);
  assert.match(text, /gpt-5\.2/);
  assert.match(text, /用户明确指定模型时优先使用/);
  assert.match(text, /运行环境不支持推荐模型时/);
});

test("subagent contract owns roster lifecycle and capacity policy", async () => {
  const text = await common("subagent.md");
  const lifecycle = await common("subagent-lifecycle.md");

  assert.match(text, /~\/\.opsx\/common\/subagent-lifecycle\.md/);
  assert.match(text, /Agent Roster/);
  assert.match(text, /list-all subagents API/);
  assert.match(text, /spawn_agent/);
  assert.match(text, /wait_agent/);
  assert.match(text, /subagent notification/);
  assert.match(text, /close_agent/);
  assert.match(text, /Pre-Spawn Check/);
  assert.match(text, /completed no-reuse/);
  assert.match(text, /gate-reviewer.*不复用/s);
  assert.match(text, /不要为了释放容量随意关闭 running agent/);
  assert.match(text, /\.opsx\/subagents/);
  assert.match(text, /subagent-roster\.md/);
  assert.match(text, /不得作为 gate/);

  assert.match(lifecycle, /Agent Roster/);
  assert.match(lifecycle, /Pre-Spawn Check/);
  assert.match(lifecycle, /Reuse Policy/);
  assert.match(lifecycle, /Close Policy/);
  assert.match(lifecycle, /Capacity Policy/);
  assert.match(lifecycle, /completed no-reuse|completed_no_reuse/);
  assert.match(lifecycle, /gate-reviewer.*不复用/s);
  assert.match(lifecycle, /不要为了释放容量随意关闭 running agent/);
  assert.match(lifecycle, /\.opsx\/subagents\/<session-id>\.json/);
  assert.match(lifecycle, /\.opsx\/subagents\/current\.json/);
  assert.match(lifecycle, /"version": 1/);
  assert.match(lifecycle, /openspec\/changes\/<change>\/subagent-roster\.md/);
  assert.match(lifecycle, /不得作为 OpenSpec gate 通过依据/);
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

    assert.match(text, /~\/\.opsx\/common\/subagent\.md/, `${name} should reference the common subagent contract`);
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
      assert.match(text, /~\/\.opsx\/common\/subagent\.md/, `${name} must pair platform dispatch wording with central contract`);
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
