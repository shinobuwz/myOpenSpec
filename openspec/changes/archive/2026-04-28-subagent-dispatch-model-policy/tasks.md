## 1. Subagent dispatch policy

- [x] 1.1 [direct] 在 `opsx-subagent` 中定义职责分离和 dispatch class

  **需求追踪**：[R1], [R2], [R3] → [U1]
  **执行方式**：[direct]
  **涉及文件**：
  - `skills/opsx-subagent/SKILL.md` — subagent canonical contract

  **验收标准**：
  - [x] `opsx-subagent` 明确 workflow skill 负责具体 prompt，`opsx-subagent` 负责职责类型、模型选择、平台映射、写入边界和 fallback。
  - [x] `opsx-subagent` 包含 `retrieval-explorer`、`implementation-worker`、`gate-reviewer`、`maintenance-worker`、`long-running-auditor`。
  - [x] `opsx-subagent` 包含 `gpt-5.3-codex`、`gpt-5.4`、`gpt-5.5`、`gpt-5.2` 的推荐映射。
  - [x] `opsx-subagent` 明确用户指定模型优先、模型不可用时 fallback、主 agent 保留 controller。

  **验证命令 / 方法**：
  - `rg -n "职责分离|Dispatch Classes|retrieval-explorer|implementation-worker|gate-reviewer|maintenance-worker|long-running-auditor|gpt-5\\.3-codex|gpt-5\\.4|gpt-5\\.5|gpt-5\\.2|用户明确指定模型|运行环境不支持" skills/opsx-subagent/SKILL.md`，预期：全部命中。

  **依赖**：无

## 2. Documentation and regression tests

- [x] 2.1 [direct] 更新支持工具文档说明职责/模型分发中心

  **需求追踪**：[R4] → [U2]
  **执行方式**：[direct]
  **涉及文件**：
  - `docs/supported-tools.md` — subagent 适配说明

  **验收标准**：
  - [x] 文档说明职责类型和默认模型推荐由 `opsx-subagent` 维护。
  - [x] 文档说明具体 prompt 仍由触发的 workflow skill 注入。

  **验证命令 / 方法**：
  - `rg -n "职责类型和默认模型推荐也由 `opsx-subagent` 维护|具体 prompt 仍由触发的 workflow skill 注入" docs/supported-tools.md`，预期：全部命中。

  **依赖**：Task 1.1

- [x] 2.2 [direct] 增加 workflow discipline 回归测试

  **需求追踪**：[R5] → [U3]
  **执行方式**：[direct]
  **涉及文件**：
  - `tests/workflow-discipline.test.mjs` — workflow contract tests

  **验收标准**：
  - [x] 测试检查职责分离。
  - [x] 测试检查五类 dispatch class。
  - [x] 测试检查推荐模型、用户 override 和模型不可用 fallback。

  **验证命令 / 方法**：
  - `npm test -- tests/workflow-discipline.test.mjs`，预期：通过。

  **依赖**：Task 1.1
