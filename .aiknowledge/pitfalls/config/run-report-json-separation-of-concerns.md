---
status: active
created_at: 2026-04-14
created_from: change:2026-04-14-slim-run-report
last_verified_at: 2026-04-14
last_verified_by: opsx-knowledge
verification_basis: archive
applies_to:
  - .claude/skills/opsx-plan-review/SKILL.md
  - .claude/skills/opsx-verify/SKILL.md
  - .claude/skills/opsx-tdd/SKILL.md
  - .claude/skills/opsx-review/SKILL.md
  - .claude/skills/opsx-report/SKILL.md
  - docs/stage-packet-protocol.md
superseded_by:
---

# run-report-data.json 只存判定结果，不存上下文副本

**标签**：[openspec, workflow, data-model, json]

## 现象

`run-report-data.json` 曾将 plan-review 和 verify 的完整 StagePacket（含 core_payload：requirements/trace_mapping/units 等上下文摘要）写入 JSON。归档后 JSON 体积庞大，且与权威源（specs/、design.md、tasks.md）存在数据冗余。`opsx-report` 只能渲染 plan-review 和 verify 两个 stage，TDD 和 review 结果游离在 JSON 之外。

## 根因

早期没有区分"子 agent 判断所需的输入上下文"（packet）和"持久化的判定结果"（run-report-data.json），将两者混为一谈写入同一个 JSON 文件。权威源始终存在于 archive 目录，无需在 JSON 中保留副本。

## 修复前

```diff
- // plan-review 退出时写入完整 PlanReviewPacket：
- {
-   "stages": {
-     "plan-review": {
-       "packet": { ...完整 core_payload（requirements, trace_mapping, units）... },
-       "decision": "pass",
-       "reviewed_at": "..."
-     }
-   }
- }
```

## 修复后

```diff
+ // 所有 stage 退出时只写判定结果：
+ {
+   "stages": {
+     "plan-review": {
+       "decision": "pass",
+       "findings": [...],
+       "metrics": {"findings_total": 1, "critical": 0, "warning": 1, "suggestion": 0},
+       "reviewed_at": "..."
+     },
+     "tdd": {
+       "total_tasks": 3,
+       "completed_tasks": 3,
+       "all_green": true,
+       "tasks": [...]
+     },
+     "verify": { "decision": "pass", "findings": [], "metrics": {...}, "verified_at": "..." },
+     "review": { "decision": "pass_with_warnings", "findings": [...], "metrics": {...}, "reviewed_at": "..." }
+   }
+ }
+
+ // opsx-report 渲染 trace 矩阵时从权威源实时读取，不从 JSON 读：
+ // specs/ → trace 矩阵；design.md → 设计决策；tasks.md → task 列表
```

## 要点

`run-report-data.json` 职责是持久化**判定结果**（decision/findings/metrics/时间戳），上下文数据（specs/design/tasks）从权威源实时读取，packet 文件（packet-*.json）才是子 agent 的输入，两者不要混用。

## 来源

change: 2026-04-14-slim-run-report（2026-04-14）
