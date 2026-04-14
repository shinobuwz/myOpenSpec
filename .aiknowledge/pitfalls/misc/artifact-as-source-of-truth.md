---
status: active
created_at: 2026-04-14
created_from: change:2026-04-14-simplify-skill-artifacts
last_verified_at: 2026-04-14
last_verified_by: opsx-knowledge
verification_basis: archive
applies_to:
  - .claude/skills/opsx-plan-review/SKILL.md
  - .claude/skills/opsx-verify/SKILL.md
  - .claude/skills/opsx-task-analyze/SKILL.md
  - .claude/skills/opsx-implement/SKILL.md
  - .claude/skills/opsx-report/SKILL.md
  - docs/stage-packet-protocol.md
superseded_by:
---

# 产物文件即真相源，subagent 直接读上游产物，不经 JSON 中间层

**标签**：[openspec, workflow, data-model, skill-design]

## 现象

`opsx-plan-review` 和 `opsx-verify` 在调用 subagent 前，先将已经结构化的上游产物（specs/*.md、design.md、tasks.md）重新提取为 JSON（PlanReviewPacket / VerifyPacket），传给 subagent。subagent 消费 JSON 后仍需回读原文件。这层组装步骤没有减少 token，只增加了维护负担和出错点。

同类问题：`opsx-implement` 写 `impl-context.json` / `impl-progress.json`；所有 skill 的审查结论写入 `run-report-data.json`（与被审查产物分离，查 design.md 看不到审查历史）。

## 根因

早期设计把"subagent 输入"和"权威产物文件"分开存放，认为 JSON 能帮助 subagent 快速定位数据。但上游产物本身已经是结构化的 markdown，多一层 JSON 只是重复序列化，且每次变更都需要同步两份数据。

## 修复前

```diff
- # 主 agent 组装 packet，传给 subagent
- packet = assemble_plan_review_packet(specs/, design.md)
- write_json("context/packet-plan-review.json", packet)
- launch_subagent(input=packet)
-
- # subagent 仍要回读原文件做精确引用
- read("specs/...")
- read("design.md")
-
- # 审查结论写入独立 JSON，与产物分离
- append_json("run-report-data.json", {decision, findings})
```

## 修复后

```diff
+ # subagent 直接读上游产物，I/O 边界由 skill 声明
+ launch_subagent(reads=["specs/**/*.md", "design.md"])
+
+ # 审查结论追加到 audit-log.md，与产物文件同目录
+ append("audit-log.md", "## plan-review | <timestamp> | pass\n...")
+
+ # context/ 目录不再创建；run-report-data.json 不再写入
```

## 要点

上游产物（specs、design.md、tasks.md）就是真相源，subagent 直接读即可。JSON 中间层（packet-*.json、impl-context.json）只有当真相源不存在或不可直接消费时才有意义；审查结论追加到 audit-log.md 与产物同目录，而不是写入独立的 JSON。

## 来源

change: 2026-04-14-simplify-skill-artifacts（2026-04-14）
