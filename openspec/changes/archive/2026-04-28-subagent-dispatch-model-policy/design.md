## 上下文

`opsx-subagent` 已经是 subagent 平台映射的 canonical contract，负责 Codex `spawn_agent` 与 Claude Code `Task tool` 的等价说明。用户现在希望进一步职责分离：具体 workflow skill 只负责注入具体任务 prompt，`opsx-subagent` 负责抽象 subagent 职责类型，并按工作内容推荐模型档位。

相关约束：
- `opsx-subagent` 必须继续是统一中心，避免 workflow skill 复制平台或模型分发规则。
- 具体 reviewer / implementer prompt 仍保留在各 workflow skill 或其 `references/` 中。
- 模型推荐必须是可回退的建议，不应破坏工具兼容性。
- 主 agent 仍是 controller，不能把 gate、归档、外部写操作或最终判断下放给 subagent。

## 目标 / 非目标

**目标：**
- 在 `opsx-subagent` 中增加职责分离说明。
- 在 `opsx-subagent` 中增加 dispatch class 表，覆盖检索、实现、门控审查、维护和长上下文审计。
- 给每类 dispatch class 提供推荐模型和 reasoning 档位。
- 在 docs 和测试中锁住这套分发规则。

**非目标：**
- 不把各 workflow skill 的具体 prompt 搬进 `opsx-subagent`。
- 不要求 Claude Code 必须支持 Codex 的模型覆盖参数。
- 不改变现有 workflow gate 顺序。
- 不引入新的 runtime CLI 或自动模型探测逻辑。

## 需求追踪

- [R1] -> [U1]
- [R2] -> [U1]
- [R3] -> [U1]
- [R4] -> [U2]
- [R5] -> [U3]

## 实施单元

### [U1] Subagent contract dispatch policy
- 关联需求: [R1], [R2], [R3]
- 模块边界:
  - `skills/opsx-subagent/SKILL.md`
- 验证方式: 静态读取 `opsx-subagent`，确认包含职责分离、dispatch class、推荐模型、override/fallback 和 controller 边界。
- 知识沉淀: subagent 分发中心应只维护“职责和模型路由”，具体 stage prompt 留在 workflow skill。

### [U2] Supported tools documentation
- 关联需求: [R4]
- 模块边界:
  - `docs/supported-tools.md`
- 验证方式: 静态读取 supported-tools 文档，确认说明职责类型和默认模型推荐由 `opsx-subagent` 维护，prompt 由 workflow skill 注入。
- 知识沉淀: 用户可见文档需要指向 canonical contract，避免读者把 docs 当作第二套规则源。

### [U3] Workflow discipline regression
- 关联需求: [R5]
- 模块边界:
  - `tests/workflow-discipline.test.mjs`
- 验证方式: 运行 `npm test -- tests/workflow-discipline.test.mjs`，确认测试覆盖 dispatch class、模型推荐、用户 override 和 fallback。
- 知识沉淀: 对纯指令 workflow 的回归保护应检查关键 contract 文案，而不是只依赖人工 review。

## 决策

- 将模型职责映射放入 `skills/opsx-subagent/SKILL.md`，因为它已经是 subagent 平台映射、controller boundary、写入边界和 fallback 的 canonical contract。
- 保持具体 workflow prompt 不变，避免 `opsx-subagent` 膨胀成所有 stage 的 prompt 仓库。
- 模型名以当前可用模型列表为基准：`gpt-5.3-codex` 用于低成本检索，`gpt-5.4` 用于普通实现，`gpt-5.5` 用于 gate/release reviewer，`gpt-5.2` 用于长上下文审计。
- 模型选择写成推荐和回退规则，不写成不可绕过的硬依赖。

## 风险 / 权衡

- [风险] 硬编码模型名可能随运行环境变化而过时。  
  缓解措施: 明确“运行环境不支持推荐模型时回退到可用默认 subagent 模型”。
- [风险] `opsx-subagent` 入口文件变长，和 skill slimming 原则冲突。  
  缓解措施: 只增加职责/模型中心化规则，不复制具体 prompt；如后续继续增长，再迁移到 `references/`。
- [风险] reviewer 使用强模型可能被误解为可替代主 agent gate 判断。  
  缓解措施: 在模型规则中再次声明最终判断、gate 写入和外部写操作由主 agent 保留。

## 知识沉淀

- `.aiknowledge/codemap/openspec-skills.md` 需要在归档后记录 `opsx-subagent` 现在同时维护平台映射和职责/模型 dispatch policy。
- 如发现模型推荐规则在多工具环境中反复漂移，可沉淀一个 pitfall：模型推荐必须有 fallback，不能成为 workflow 硬依赖。
