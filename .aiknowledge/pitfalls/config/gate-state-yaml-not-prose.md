---
status: active
created_at: 2026-04-13
created_from: metadata-backfill
last_verified_at: 2026-04-13
last_verified_by: repository-audit
verification_basis: repository-audit
applies_to:
  - .openspec.yaml
  - .claude/skills
superseded_by:
---

# 纯指令工作流的门控状态应持久化为结构化字段

**标签**：[workflow, gating, yaml, state-persistence]

## 现象

工作流环节（plan-review → tasks → implement → verify → archive）之间的门控仅靠 skill 指令文本描述（"确保 plan-review 已通过"），后续环节无法程序化校验前置条件是否真正满足。AI 执行时可能跳过门控或误判。

## 根因

纯指令式工作流中，状态存在于 AI 的上下文窗口而非持久存储。一旦上下文丢失或被截断，门控约束随之消失。文字约束依赖 AI 自觉遵守，缺乏强制性。

## 修复前

```diff
- # skill 指令中
- "在执行 implement 前，确认 plan-review 和 task-analyze 已通过"
- # 仅为文字提示，无持久化校验
```

## 修复后

```diff
+ # .openspec.yaml 新增 gates 字段
+ gates:
+   plan-review: passed
+   task-analyze: passed
+
+ # verify/archive skill 读取 gates 字段做程序化校验
+ if gates.plan-review != 'passed' → 阻塞并报错
```

## 要点

用 yaml 结构化字段替代文字约束来实现门控。好处：(1) 后续环节可程序化校验而非靠 AI 自觉；(2) 状态跨会话持久化；(3) 门控缺失可在 verify 阶段自动发现。适用于所有多阶段纯指令工作流。

## 来源

change: fix-workflow-consistency（2026-04-13）
