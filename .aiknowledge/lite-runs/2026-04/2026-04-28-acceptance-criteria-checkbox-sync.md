---
id: 2026-04-28-acceptance-criteria-checkbox-sync
created_at: 2026-04-28T07:50:03Z
kind: lite
status: done
source_refs:
  - skill:skills/opsx-implement/SKILL.md
  - test:tests/workflow-discipline.test.mjs
  - change:openspec/changes/archive/2026-04-28-subagent-workflow-adapter-04-subagent-smoke-eval/tasks.md
---

# 验收标准复选框同步

## 意图

修复一个已归档 subchange：顶层任务已经完成，但任务内部验收标准仍未勾选；同时防止后续 implement 运行继续留下过期的任务级验收状态。

## 范围

- `openspec/changes/archive/2026-04-28-subagent-workflow-adapter-04-subagent-smoke-eval/tasks.md`
- `skills/opsx-implement/SKILL.md`
- `tests/workflow-discipline.test.mjs`

## 根因

`opsx-implement` 只要求把已完成的顶层任务从 `[ ]` 标记为 `[x]`，但没有明确要求同步任务内部的验收标准复选框。`opsx changes status` 也只统计顶层任务复选框，因此即使内部验收行已经过期，归档变更仍可能显示为完成。

实现证据已经存在于 `test-report.md`；缺失的是 `tasks.md` 中 artifact 状态的同步。

## 变更

- 在已归档的 `tasks.md` 中勾选所有已完成的内部验收标准和人工验收行。
- 更新 `opsx-implement`，要求已完成任务必须把有证据支撑的内部验收标准标记为 `[x]`。
- 明确保留证据纪律：没有证据支撑的验收标准不能勾选，未验证的 `[manual]` 行只有在明确说明时才能保持 `[ ]`。
- 增加 deterministic workflow-discipline 测试锁定该契约。
- 使用 `node bin/opsx.mjs install-skills` 重新全局安装 OPSX skills。

## 验证

- `node --test tests/workflow-discipline.test.mjs` 通过：11 个测试，11 个通过，0 个失败。
- `npm test` 通过：38 个测试，38 个通过，0 个失败。
- `rg -n "^- \\[ \\].*(验收标准|\\[manual\\])" openspec/changes/archive/2026-04-28-subagent-workflow-adapter-04-subagent-smoke-eval/tasks.md` 没有返回匹配。

## 风险

本次修复更新了 implement 纪律和 deterministic tests。除被报告的 subchange 外，没有批量改写其他已归档变更。
