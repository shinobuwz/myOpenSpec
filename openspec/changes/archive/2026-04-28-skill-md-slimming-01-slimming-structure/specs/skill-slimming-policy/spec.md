## ADDED Requirements

### 需求:SKILL.md 入口内容边界
**Trace**: R1
**Slice**: skill-slimming-policy/entry-boundary
仓库必须定义 OPSX `SKILL.md` 入口文件允许保留的内容类型。

#### 场景: 维护者判断入口文件内容是否应保留
- **当** 维护者准备修改任意 `skills/opsx-*/SKILL.md`
- **那么** 维护者能从仓库内稳定文档确认入口文件只保留触发条件、职责边界、读写边界、安全红线、快速入口、reference 导航、下游契约

### 需求:references 内容边界
**Trace**: R2
**Slice**: skill-slimming-policy/reference-boundary
仓库必须定义应从 `SKILL.md` 迁入 `references/` 的内容类型。

#### 场景: 维护者发现入口文件包含长篇材料
- **当** `SKILL.md` 中包含长流程、完整 prompt、输出模板、详细示例、完整参数表、排错说明、领域知识
- **那么** 维护者能从仓库内稳定文档确认这些内容应迁入同 skill 的 `references/` 文件

### 需求:Canonical contract 引用
**Trace**: R3
**Slice**: skill-slimming-policy/canonical-contract
仓库必须定义重复公共契约应通过 canonical source 引用消费。

#### 场景: skill 需要描述 subagent 或 StageResult 规则
- **当** `SKILL.md` 需要使用 subagent 平台映射、StageResult、audit-log、`.aiknowledge` lifecycle
- **那么** 入口文件引用 `skills/opsx-subagent/SKILL.md`、`docs/stage-packet-protocol.md` 或 `.aiknowledge/README.md`，而不是复制完整正文

### 需求:硬性安全规则可见
**Trace**: R4
**Slice**: skill-slimming-policy/safety-visible
瘦身后的 `SKILL.md` 必须继续直接展示本 skill 的硬性安全规则。

#### 场景: agent 只读取入口文件
- **当** agent 根据 `SKILL.md` 执行一个 workflow skill
- **那么** agent 不读取 reference 也能看到本 skill 的禁止写入、硬性门控、错误退出、完成声明前提

### 需求:不改变 workflow 边界
**Trace**: R5
**Slice**: skill-slimming-policy/workflow-boundary
本 subchange 必须保持现有 OPSX skill 名称、stage 顺序、gate 语义不变。

#### 场景: 瘦身结构被实施
- **当** 后续 subchange 按本政策迁移 skill 文案
- **那么** `opsx-explore -> opsx-slice -> opsx-plan -> opsx-plan-review -> opsx-tasks -> opsx-task-analyze -> opsx-implement -> opsx-verify -> opsx-review -> opsx-archive` 的工作流边界保持不变
