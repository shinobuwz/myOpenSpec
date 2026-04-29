## ADDED Requirements

### 需求:Subagent 契约必须区分 prompt 注入与 dispatch 决策
**Trace**: R1
**Slice**: opsx-subagent/responsibility-separation
OPSX subagent 契约必须规定：具体 workflow skill 负责定义任务 prompt、审查维度、输入输出和 stage 规则；`opsx-subagent` 负责定义 subagent 职责类型、默认模型建议、平台映射、写入边界和 fallback。

#### 场景:workflow skill 保留具体任务语义
- **当** `opsx-plan-review`、`opsx-task-analyze`、`opsx-verify`、`opsx-review`、`opsx-implement`、`opsx-explore` 或 `opsx-archive` 需要派发 subagent
- **那么** 它们必须继续提供各自 stage 的 prompt、输入范围、输出格式和 gate 规则，而不是把具体任务语义迁移到 `opsx-subagent`

#### 场景:opsx-subagent 统一派发职责
- **当** workflow skill 引用 `opsx-subagent`
- **那么** `opsx-subagent` 必须提供 subagent 职责类型、平台映射、推荐模型和主 agent 收口规则

### 需求:Subagent 契约必须定义职责类与默认模型映射
**Trace**: R2
**Slice**: opsx-subagent/dispatch-classes
`opsx-subagent` 必须定义覆盖常见 OPSX 工作内容的 dispatch class，并为每类指定 Codex agent type、推荐模型、reasoning 档位和写入范围。

#### 场景:简单检索使用低成本模型
- **当** 工作内容是简单检索、跨文件读取、日志摘要、diff 摘要或证据收集
- **那么** 契约必须将其归入只读 `retrieval-explorer`，并推荐 `gpt-5.3-codex`

#### 场景:明确实现使用实现模型
- **当** 工作内容是按明确 task 实现、补测试、机械重构或局部修复
- **那么** 契约必须将其归入 `implementation-worker`，并推荐 `gpt-5.4`

#### 场景:门控审查使用强审查模型
- **当** 工作内容会影响 plan-review、task-analyze、verify 或 release-risk review 的 gate 结论
- **那么** 契约必须将其归入只读 `gate-reviewer`，并推荐 `gpt-5.5`

#### 场景:归档后维护和长上下文审计有独立职责类
- **当** 工作内容是归档后的 knowledge/codemap 更新或大上下文审计
- **那么** 契约必须分别提供 `maintenance-worker` 和 `long-running-auditor` 职责类，并给出对应推荐模型

### 需求:模型选择必须支持 override、fallback 和安全边界
**Trace**: R3
**Slice**: opsx-subagent/model-selection-safety
OPSX subagent 契约必须规定模型选择的优先级和安全边界：用户明确指定模型时优先使用；运行环境不支持推荐模型时回退到可用默认 subagent 模型；模型选择不得下放主 agent 的最终决策权。

#### 场景:用户指定模型优先
- **当** 用户明确要求某个可用模型执行 subagent 工作
- **那么** 主 agent 必须优先使用用户指定模型，并仍遵守对应 dispatch class 的读写边界

#### 场景:模型不可用时回退
- **当** 推荐模型在当前运行环境不可用
- **那么** 主 agent 必须回退到可用默认 subagent 模型，并说明该回退不改变 workflow gate 和安全边界

#### 场景:强模型不接管 controller
- **当** subagent 使用更强模型执行审查或实现
- **那么** 主 agent 仍必须负责 gate 写入、最终判断、用户可见结论和外部写操作决策

### 需求:职责模型映射必须有文档说明
**Trace**: R4
**Slice**: docs/subagent-dispatch
OPSX 必须在支持工具文档中记录 subagent dispatch class 与模型推荐的统一来源，防止读者把文档或单个 workflow skill 当作第二套分发规则。

#### 场景:支持工具文档说明统一来源
- **当** 读者查看 OPSX 支持工具和 subagent 适配说明
- **那么** 文档必须说明职责类型和默认模型推荐由 `opsx-subagent` 维护，具体 prompt 由触发的 workflow skill 注入

### 需求:职责模型映射必须有测试保护
**Trace**: R5
**Slice**: tests/subagent-dispatch
OPSX 必须在 workflow discipline 测试中保护 subagent dispatch class 与模型推荐，防止后续修改丢失统一分发中心。

#### 场景:测试覆盖关键职责类和模型
- **当** 执行 workflow discipline 测试
- **那么** 测试必须检查 `opsx-subagent` 包含职责分离、dispatch class、推荐模型、用户 override 和模型不可用 fallback 的规则
