---
status: active
created_at: 2026-04-13
created_from: metadata-backfill
last_verified_at: 2026-04-13
last_verified_by: repository-audit
verification_basis: repository-audit
applies_to:
  - .openspec.yaml
  - .claude/skills/opsx-verify
  - .claude/skills/opsx-archive
superseded_by:
---

# 门控机制修改时的自举悖论

**标签**：[workflow, gating, bootstrap, yaml]

## 现象

修改门控机制本身（如往 `.openspec.yaml` 增加 gates 字段校验）时，本次变更无法通过自身新增的门控校验——因为变更尚未合入，gates 字段尚不存在。verify/archive 环节报"gates 缺失"而阻塞。

## 根因

门控校验逻辑 = 被修改的对象。经典自举问题：新规则要求旧流程满足新规则，但旧流程运行时新规则尚未生效。

## 修复前

```diff
- # verify skill 硬性要求 gates 字段存在
- 若 .openspec.yaml 中缺少 gates → 阻塞
- # 但 gates 字段是本次变更新增的，尚未写入
```

## 修复后

```diff
+ # 方案 A：首次豁免
+ 若变更本身修改了门控定义 → 跳过该门控的校验，手动补写 gates
+
+ # 方案 B：手动补写
+ 在 verify 前手动向 .openspec.yaml 写入 gates 字段，使校验通过
```

## 要点

当变更目标是校验/门控机制本身时，需要"首次豁免"策略或手动预填 gates。识别标志：变更的 specs 中包含对 verify/archive 流程自身的修改。规划阶段应提前标记此类变更为"自举变更"，在 tasks 中注明豁免步骤。

## 来源

change: fix-workflow-consistency（2026-04-13）
