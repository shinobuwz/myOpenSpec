## 新增需求

### 需求: Central subagent contract must exist
**Trace**: R1
**Slice**: opsx-subagent/central-contract
OPSX 必须提供一个 canonical subagent contract，作为现有 workflow skill 引用 subagent 派发、角色边界和结果处理规则的单一说明来源。

#### 场景: Agent needs subagent rules
- **当** OPSX skill 需要说明如何启动 implementation、review 或 explore subagent
- **那么** agent 能从 canonical subagent contract 获取统一规则，而不是在每个 skill 中维护一份完整说明

### 需求: Codex must be the default execution model
**Trace**: R2
**Slice**: opsx-subagent/platform-mapping
Subagent contract 必须将 Codex 作为默认执行模型，并明确 Claude Code 是兼容映射；禁止只描述 Claude Code `Task` / `subagent_type` 而缺少 Codex `spawn_agent` 对应关系。

#### 场景: General worker is dispatched
- **当** skill 需要启动通用 implementation 或 reviewer subagent
- **那么** contract 必须给出 Codex `spawn_agent(agent_type="worker", message=...)` 和 Claude Code `Task` tool / `subagent_type: "general-purpose"` 的等价映射

#### 场景: Explorer is dispatched
- **当** skill 需要启动探索型 subagent
- **那么** contract 必须给出 Codex `spawn_agent(agent_type="explorer", message=...)` 和 Claude Code `Task` tool / `subagent_type: "Explore"` 的等价映射

### 需求: Main agent must own workflow authority
**Trace**: R3
**Slice**: opsx-subagent/controller-boundary
Subagent contract 必须规定主 agent 是唯一 controller，负责 gates、最终决策、audit-log、`.openspec.yaml`、用户可见完成声明和跨 subagent 汇总；subagent 禁止自行宣称整个 change 完成、通过或可归档。

#### 场景: Subagent reports success
- **当** subagent 报告局部任务完成或审查通过
- **那么** 主 agent 仍必须基于 OPSX gate 和 fresh verification evidence 决定是否继续

#### 场景: Shared workflow artifacts need writing
- **当** `tasks.md`、`test-report.md`、`.openspec.yaml` 或 `audit-log.md` 需要更新
- **那么** contract 必须要求由主 agent 或当前 stage owner 串行写入，禁止多个 subagent 并行写入共享 workflow artifact

### 需求: Subagent prompt and status handling must be structured
**Trace**: R4
**Slice**: opsx-subagent/prompt-status
Subagent contract 必须定义 prompt/message framing、输入边界、输出状态和失败处理，至少覆盖 `DONE`、`DONE_WITH_CONCERNS`、`NEEDS_CONTEXT`、`BLOCKED` 这四类 implementation status，并说明 reviewer 仍使用 OPSX StageResult JSON。

#### 场景: Implementer needs more context
- **当** implementation subagent 输出 `NEEDS_CONTEXT`
- **那么** 主 agent 必须补充上下文后重新派发或暂停，禁止让 subagent 猜测实现

#### 场景: Reviewer produces findings
- **当** reviewer subagent 完成审查
- **那么** 输出必须能被主 agent 汇总为 StageResult / audit-log / review-report 的证据，禁止只依赖不可解析的口头成功描述

### 需求: Missing subagent support must have a fallback
**Trace**: R5
**Slice**: opsx-subagent/fallback
Subagent contract 必须定义运行环境不支持 subagent 时的降级策略：主 agent 可以串行执行同等步骤，但必须说明质量/隔离能力下降，并保留 OPSX gate、验证和审查要求。

#### 场景: Spawn tool is unavailable
- **当** 当前平台没有 Codex `spawn_agent` 或 Claude Code `Task` 等价能力
- **那么** workflow 必须降级为主 agent 串行执行，并明确不能跳过 verify/review gates

### 需求: Contract must be covered by docs, tests, and knowledge map
**Trace**: R6
**Slice**: opsx-subagent/documentation-coverage
Subagent contract 落地时必须更新支持工具文档、测试和 `.aiknowledge/codemap/openspec-skills.md`，确保后续 agent 能发现 Codex-first / Claude-compatible 的长期约束。

#### 场景: Supported tools documentation drifts
- **当** `docs/supported-tools.md` 的 skill 清单或 platform mapping 与实际 skill 源不一致
- **那么** 测试必须失败或文档必须被同步修正

## 修改需求

## 移除需求
