## 1. Parallel Worker Policy

- [x] 1.1 [test-first] Define serial default and parallel eligibility

  **需求追踪**：[R1] [R2] → [U1] [U2] [U4]
  **执行方式**：[test-first]
  **涉及文件**：
  - `tests/workflow-discipline.test.mjs` — workflow discipline regression tests
  - `skills/opsx-implement/SKILL.md` — implementation workflow skill

  **验收标准**：
  - [x] 测试先断言 `opsx-implement` 包含默认串行 / serial-by-default policy
  - [x] 测试先断言 `opsx-implement` 只允许在任务簇独立、写入集合不重叠且 file ownership 明确时派发多个 implementation workers
  - [x] `opsx-implement` 明确列出 public interface、migration、schema、config、package/build scripts 和依赖顺序不清时必须保持串行
  - [x] `opsx-implement` 不把多 worker 派发描述为默认、自动或无条件行为

  **验证命令 / 方法**：
  - `node --test tests/workflow-discipline.test.mjs`，预期：新增断言先失败，skill 更新后通过

  **依赖**：无

- [x] 1.2 [test-first] Preserve main-agent integration ownership

  **需求追踪**：[R3] → [U3] [U4]
  **执行方式**：[test-first]
  **涉及文件**：
  - `tests/workflow-discipline.test.mjs` — workflow discipline regression tests
  - `skills/opsx-implement/SKILL.md` — implementation workflow skill

  **验收标准**：
  - [x] 测试先断言 `tasks.md`、`test-report.md`、`.openspec.yaml`、`audit-log.md` 和 `review-report.md` 是共享 artifact，必须串行写入
  - [x] `opsx-implement` 要求主 agent 逐个检查 worker diff 并串行整合结果
  - [x] `opsx-implement` 要求主 agent 处理 `DONE_WITH_CONCERNS`、`NEEDS_CONTEXT` 和 `BLOCKED`
  - [x] `opsx-implement` 保留最终验证和进入 `opsx-verify` 的强制退出契约

  **验证命令 / 方法**：
  - `node --test tests/workflow-discipline.test.mjs`，预期：新增断言先失败，skill 更新后通过

  **依赖**：Task 1.1

## 2. Knowledge And Distribution

- [x] 2.1 [direct] Refresh knowledge map and installed OPSX skills

  **需求追踪**：[R1] [R2] [R3] → [U1] [U2] [U3] [U4]
  **执行方式**：[direct]
  **涉及文件**：
  - `.aiknowledge/codemap/openspec-skills.md` — OPSX skill architecture knowledge
  - `.aiknowledge/logs/2026-04.md` — monthly knowledge audit log
  - `skills/opsx-implement/SKILL.md` — installed skill source

  **验收标准**：
  - [x] codemap 说明 `opsx-implement` 已采用 serial-by-default + explicit disjoint parallel eligibility
  - [x] 月度日志追加本次 codemap 更新记录，source ref 指向当前 subchange
  - [x] `node bin/opsx.mjs install-skills` 已运行并成功
  - [x] 全量 `npm test` 通过

  **验证命令 / 方法**：
  - `rg -n "serial-by-default|默认串行|parallel eligibility|disjoint" .aiknowledge/codemap/openspec-skills.md .aiknowledge/logs/2026-04.md`，预期：能定位并行策略知识
  - `node bin/opsx.mjs install-skills`，预期：安装成功
  - `npm test`，预期：全部通过

  **依赖**：Task 1.2
