## ADDED Requirements

### 需求:Execution support skills 必须迁出长模板
**Trace**: R6
**Slice**: execution-support-slimming/templates
`opsx-tasks`、`opsx-tdd`、`opsx-report` 必须将完整输出模板、报告模板、CSS/HTML 样式规范和长禁止模式表迁入同 skill `references/`。

#### 场景: agent 需要生成 tasks、test-report 或 RunReport
- **当** agent 读取对应 `SKILL.md`
- **那么** 入口文件提供可执行的核心规则和 reference 导航；完整模板按需从 `references/` 读取

### 需求:Implementation 和 archive skills 必须保持共享 artifact 串行规则
**Trace**: R7
**Slice**: execution-support-slimming/artifact-ownership
`opsx-implement` 和 `opsx-archive` 瘦身后必须继续直接展示共享 artifact 的主 agent 串行写入责任和 worker 禁止越界规则。

#### 场景: agent 执行 implementation 或 archive
- **当** skill 需要派发 worker 或执行 follow-up
- **那么** `SKILL.md` 仍明确说明主 agent 负责 gates、`tasks.md`、`test-report.md`、`audit-log.md`、`review-report.md`、父 group route 和最终完成声明

### 需求:TDD 和任务生成核心规则必须留在入口
**Trace**: R8
**Slice**: execution-support-slimming/tdd-core
瘦身不得隐藏 TDD 红绿重构铁律、TDD 标签选择、测试不是独立 task、以及完成任务验收勾选规则。

#### 场景: agent 只读取 `opsx-tasks`、`opsx-tdd` 或 `opsx-implement` 入口
- **当** agent 生成 tasks 或执行 implementation
- **那么** 仍能直接看到测试先行、任务粒度、验收证据和未验证 `[manual]` 项处理规则

### 需求:Archive 路径和 group 路由规则必须保持不变
**Trace**: R9
**Slice**: execution-support-slimming/archive-routing
`opsx-archive` 瘦身不得改变 grouped change 的 subchange 归档目标和父 group route 更新规则。

#### 场景: agent 归档 grouped subchange
- **当** resolved change root 是 `openspec/changes/<group>/subchanges/<subchange>`
- **那么** 归档目标仍是顶层 `openspec/changes/archive/<group>-<subchange>/`，父 group 只保留 `.openspec.group.yaml` 与剩余 `subchanges/`，且 active/suggested/recommended_order 不指向已归档 subchange
