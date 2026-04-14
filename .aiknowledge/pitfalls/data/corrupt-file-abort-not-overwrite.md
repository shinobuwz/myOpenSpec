---
status: active
created_at: 2026-04-13
created_from: change:2026-04-13-stage-packet-protocol
last_verified_at: 2026-04-14
last_verified_by: opsx-knowledge
verification_basis: review
applies_to:
  - openspec/changes/*/audit-log.md
  - openspec/changes/*/review-report.md
  - .claude/skills/opsx-plan-review/
  - .claude/skills/opsx-verify/
  - .claude/skills/opsx-review/
superseded_by:
---

# 写文件前若文件已存在但损坏，必须 abort 而非覆盖

**标签**：[workflow, data-integrity, file-write, markdown-append]

## 现象

agent 追加写 `audit-log.md` 前检查文件是否存在。文件存在但无法追加（如文件损坏或权限异常）时，agent 将其误判为"不存在"，直接覆盖，导致历史留档静默丢失，且掩盖了上游写入出错的真实原因。

## 根因

"文件存在性"与"文件可追加性"是两个独立判断。只做了存在性检查，追加失败时未区分"新建场景"与"损坏场景"，直接走了新建分支。

## 修复前

```diff
- ## Exit 契约
- - audit-log.md 已写入（若文件不存在则创建）
```

## 修复后

```diff
+ ## Exit 契约
+ - audit-log.md 已写入（前提：文件若已存在但损坏无法追加，必须 abort，见步骤 X 错误处理）
+ - 若触发错误处理规则，以错误状态退出，不继续后续流程
```

## 要点

文件存在但无法追加时必须 abort 并上报错误，绝不能将"追加失败"等同于"文件不存在"而覆盖历史记录。适用于所有追加式写入文件（audit-log.md、review-report.md、test-report.md）。

## 来源

change: 2026-04-13-stage-packet-protocol（2026-04-13）— CRITICAL review finding  
updated: 2026-04-14 — 场景从 run-report-data.json（已废弃）更新为 audit-log.md
