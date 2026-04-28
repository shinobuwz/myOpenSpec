---
id: 2026-04-28-deterministic-workflow-tests
created_at: 2026-04-28T06:38:57Z
kind: lite
status: done
source_refs:
  - test:tests/changes-helper.test.mjs
  - test:tests/workflow-discipline.test.mjs
---

# deterministic workflow 测试

## 意图

为 OPSX workflow contracts 增加不依赖模型的 deterministic tests，让日常测试在引入 agent eval 层之前就能发现状态路由、artifact schema 和 gate prerequisite 漂移。

## 范围

- `tests/changes-helper.test.mjs`
- `tests/workflow-discipline.test.mjs`

## 变更

- 增加真实的 `opsx changes status` next-step 矩阵，用合成 change 从空状态一路覆盖 proposal、plan、review gates、verify、review 和 archive。
- 增加 proposal、design、spec 和 tasks 模板的 artifact contract 检查。
- 增加 workflow skill gate prerequisite 检查，覆盖 `opsx-tasks`、`opsx-implement`、`opsx-archive` 和只读 explore 路由约束。

## 验证

- `npm test` 通过：30 个测试，30 个通过，0 个失败。

## 风险

- 这些测试只验证 deterministic contracts 和 CLI routing，不评估模型生成输出质量或真实 agent trace 质量。

## 知识沉淀

未新增长期 pitfall 或 codemap 更新。
