---
status: active
created_at: 2026-04-28
created_from: change:2026-04-28-subagent-workflow-adapter/03-parallel-worker-policy
last_verified_at: 2026-04-28
last_verified_by: opsx-archive
verification_basis: archive
applies_to:
  - skills/opsx-implement/SKILL.md
  - skills/opsx-subagent/SKILL.md
  - tests/workflow-discipline.test.mjs
source_refs:
  - change:2026-04-28-subagent-workflow-adapter/03-parallel-worker-policy
  - review-report:openspec/changes/archive/2026-04-28-subagent-workflow-adapter-03-parallel-worker-policy/review-report.md
superseded_by:
merged_from:
deprecated_reason:
---

# Parallel workers need disjoint write sets

**标签**：[opsx, subagent, workflow, parallelism]

## 现象

Implementation workers 可以并行执行，但如果 workflow skill 只写“可以派发多个 worker”，没有要求任务簇独立、写入集合不重叠和明确 file ownership，worker 容易同时修改共享 artifact 或共享接口，导致任务状态、测试留档和 gate 证据互相覆盖。

## 根因

OPSX 的事实来源依赖 `tasks.md`、`test-report.md`、`.openspec.yaml`、`audit-log.md` 和 `review-report.md`。这些文件不是普通实现文件，而是 controller 级状态。多个 worker 并行写这些文件会破坏顺序证据，也会让主 agent 无法可靠判断哪个 worker 的局部完成可以进入 verify/review/archive。

## 修复前

```diff
- 本 subchange 不引入多 worker 并行策略。主 agent 仍负责 gates 校验、worker 结果汇总、`tasks.md` / `test-report.md` 状态整合、diff 检查和最终完成声明。
```

## 修复后

```diff
+ `opsx-implement` 采用 **serial-by-default / 默认串行** 策略。
+ 只有主 agent 能证明以下条件全部成立时，才允许派发多个 implementation workers：
+ - 任务簇独立，不共享前置依赖或隐含状态。
+ - 写入集合不重叠（disjoint write sets）。
+ - 每个 worker 都有明确 file ownership / 文件归属。
+ 共享 artifact 必须串行写入。
```

## 要点

并行 implementation workers 是显式例外，不是默认优化。必须先证明任务簇独立、disjoint write sets 和 file ownership；共享 workflow artifact、共享接口、migration、schema、config、package/build scripts 仍然串行。

## 来源

change: 2026-04-28-subagent-workflow-adapter/03-parallel-worker-policy
