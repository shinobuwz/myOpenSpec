---
status: active
created_at: 2026-04-13
created_from: change:2026-04-13-stage-packet-protocol
last_verified_at: 2026-04-13
last_verified_by: opsx-knowledge
verification_basis: review
applies_to:
  - openspec/types/StageResult
superseded_by:
---

# 接口可选字段消费侧必须提供默认值，不得假设其存在

**标签**：[typescript, api-contract, optional-fields, deserialization]

## 现象

`StageResult` 的 `findings` 和 `metrics` 字段被标注为可选（`?`），但消费侧代码直接访问 `.findings.length` 或对 `metrics` 求和，当生产者未填写这两个字段时，运行时抛出 `Cannot read properties of undefined`。

## 根因

接口设计允许省略可选字段，但消费侧未对缺失值做防御。接口定义者与消费者之间缺少显式的"缺省值约定"，导致两端对"可选"的理解不一致：生产者认为可以不填，消费者认为不填等于空数组/零。

## 修复前

```diff
- const count = result.findings.length;          // findings 可能 undefined
- const total = result.metrics.reduce(..., 0);   // metrics 可能 undefined
```

## 修复后

```diff
+ const count = (result.findings ?? []).length;
+ const total = (result.metrics ?? []).reduce(..., 0);
```

或在消费侧统一做规范化：

```diff
+ function normalizeStageResult(r: StageResult): Required<Pick<StageResult, 'findings' | 'metrics'>> {
+   return { ...r, findings: r.findings ?? [], metrics: r.metrics ?? 0 };
+ }
```

## 要点

可选字段的消费侧必须显式提供默认值（空数组 / 零 / 空对象），不能假设生产者一定填写。

## 来源

change: 2026-04-13-stage-packet-protocol（2026-04-13）
