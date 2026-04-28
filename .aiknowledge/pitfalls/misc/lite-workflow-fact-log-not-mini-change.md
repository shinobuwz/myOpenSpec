---
status: active
created_at: 2026-04-28
created_from: change:2026-04-27-opsx-lite-workflow
last_verified_at: 2026-04-28
last_verified_by: opsx-bugfix
verification_basis: bugfix + archive
applies_to:
  - skills/opsx-lite/SKILL.md
  - .aiknowledge/lite-runs
source_refs:
  - change:2026-04-27-opsx-lite-workflow
superseded_by:
merged_from:
deprecated_reason:
---

# 轻量 workflow 应记录事实，不应退化成 mini change

**标签**：opsx-lite, workflow, lite-run, aiknowledge

## 现象

为小改动设计轻量 workflow 时，容易把事实留档做成 proposal/design/spec/tasks/gates 的缩小版，导致 lite 流程重新变重。

## 根因

小改动需要的是可追溯事实，而不是规划门控。若 lite-run 承担 planning 或 gates，就会和正式 OpenSpec change 竞争，并失去“低仪式感”的价值。

## 修复前

```diff
- opsx-ff 一次性生成 planning artifacts
- 串起 plan-review / task-analyze / implement / verify
- 快速入口仍然围绕正式 change 产物运转
```

## 修复后

```diff
+ opsx-lite 不创建正式 OpenSpec change
+ lite-run 只记录意图 / 范围 / 变更 / 验证 / 风险 / 知识沉淀
+ 范围扩大时升级到 opsx-slice → opsx-plan
+ lite-run 可作为 source_refs，但不参与 opsx changes status
```

## 要点

轻量 workflow 的事实留档要足够审计，但不能复制正式 change 的规划门控；否则轻量入口会重新变成重流程。

## 来源

change: 2026-04-27-opsx-lite-workflow（2026-04-28 归档）
