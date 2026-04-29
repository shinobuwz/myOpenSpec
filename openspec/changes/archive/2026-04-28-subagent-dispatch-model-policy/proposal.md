## 为什么

当前 `opsx-subagent` 已经集中维护 Codex / Claude Code 的 subagent 平台映射，但还没有把“不同职责应派给哪类 subagent、默认使用哪个模型档位”写成统一契约。结果是各 workflow skill 容易重新发明模型选择规则，或把具体 prompt 注入职责和 subagent 角色分发职责混在一起。

## 变更内容

- 在 `opsx-subagent` 中明确职责分离：具体 workflow skill 负责注入任务 prompt，`opsx-subagent` 负责 dispatch class、默认模型建议、controller 边界和 fallback。
- 为常见 subagent 工作抽象 dispatch class，并给出推荐模型和 reasoning 档位。
- 补充支持工具文档，说明模型职责映射仍由 `opsx-subagent` 统一维护。
- 增加回归测试，防止 `opsx-subagent` 丢失职责/模型分发规则。

## 功能 (Capabilities)

### 新增功能
- `subagent-dispatch-policy`: 统一描述 OPSX subagent 的职责类型、推荐模型和 workflow prompt 注入边界。

### 修改功能

## 影响

- `skills/opsx-subagent/SKILL.md` — subagent canonical contract。
- `docs/supported-tools.md` — 支持工具和 subagent 映射说明。
- `tests/workflow-discipline.test.mjs` — workflow discipline 回归测试。
