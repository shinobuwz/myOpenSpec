## 新增需求

### 需求: Fast 边界判定
**Trace**: R1
**Slice**: opsx-fast/classify
`opsx-fast` 必须只接受低风险小改动或边界明确的缺陷修复。

#### 场景: 超出 fast 边界
- **当** 请求涉及新增 capability、兼容性、安全策略、多模块联动、API/CLI/数据格式变更、方案取舍或测试策略不明确
- **那么** agent 停止 fast 路由，并转入 `opsx-slice -> opsx-plan`

### 需求: Fast 来源类型
**Trace**: R2
**Slice**: opsx-fast/source-type
`opsx-fast` 必须用 `source_type: lite | bugfix` 标记需求来源，但不得因此分裂成两套流程。

#### 场景: 低风险小改动来源
- **当** 用户请求范围清晰、低风险、无需设计取舍的小文档、skill 文案、脚本或配置修正
- **那么** fast item 设置 `source_type: lite`

#### 场景: 明确缺陷修复来源
- **当** 用户提供明确症状、预期行为、复现步骤或观察线索
- **那么** fast item 设置 `source_type: bugfix`

### 需求: Fast Item 目录创建
**Trace**: R3
**Slice**: opsx-fast/artifact-root
每个 fast 工作项必须写入 `openspec/fast/<id>/`。

#### 场景: 创建 fast item
- **当** `opsx-fast` 接受一个 fast 工作项
- **那么** 创建 `openspec/fast/<id>/item.md`
- **并且** 创建 `openspec/fast/<id>/.openspec.yaml`

### 需求: Fast 不生成正式规划产物
**Trace**: R4
**Slice**: opsx-fast/artifact-boundary
fast item 不得生成 formal change 的规划产物。

#### 场景: 创建 fast item artifact
- **当** `opsx-fast` 初始化 `openspec/fast/<id>/`
- **那么** 不创建 `proposal.md`、`design.md`、`specs/` 或 `tasks.md`

### 需求: Fast 证据文件
**Trace**: R5
**Slice**: opsx-fast/evidence
fast item 的验证证据必须写入 fast root 下的标准证据文件。

#### 场景: 记录验证证据
- **当** fast item 执行验证命令、人工观察或测试
- **那么** 命令和观察证据写入 `evidence.md`
- **并且** 测试结果写入 `test-report.md`

### 需求: Fast Gate 留档
**Trace**: R6
**Slice**: opsx-fast/gate-artifacts
fast item 的 gate 结论必须复用现有审查留档文件。

#### 场景: 记录 gate 结论
- **当** fast item 通过 verify 或 review gate
- **那么** verify 结论写入 `audit-log.md`
- **并且** review 结论写入 `review-report.md`

### 需求: 中文 Preflight 模板
**Trace**: R7
**Slice**: opsx-fast/preflight-template
fast item 必须在 patch 前使用中文 preflight 模板记录最小思考。

#### 场景: 进入实现前
- **当** agent 准备修改文件
- **那么** `item.md` 必须记录 `意图`、`范围`、`预期影响`、`验证计划` 和 `升级检查`

### 需求: Bugfix 诊断补充模板
**Trace**: R8
**Slice**: opsx-fast/bugfix-diagnostics
`source_type: bugfix` 必须在共同 preflight 之外记录中文诊断补充。

#### 场景: bugfix 来源进入实现前
- **当** fast item 的 `source_type` 为 `bugfix`
- **那么** `item.md` 或 `root-cause.md` 必须记录 `现象`、`预期行为`、`观察/复现`、`根因假设`、`假设证据` 和 `回退触发条件`

### 需求: Preflight Gate 阻止未思考实现
**Trace**: R9
**Slice**: opsx-fast/preflight-gate
preflight 未完成时，agent 不得修改实现文件。

#### 场景: preflight 缺失
- **当** fast item 缺少共同 preflight 字段，或 bugfix 缺少诊断补充字段
- **那么** agent 不得 patch 实现文件

### 需求: Fast TDD 策略判定
**Trace**: R10
**Slice**: opsx-fast/tdd-strategy
所有 fast item 必须在 patch 前记录测试策略。

#### 场景: 判定测试策略
- **当** fast item 完成 preflight
- **那么** agent 必须记录 `test-first`、`characterization-first` 或 `direct` 之一

### 需求: 可测试行为优先 TDD
**Trace**: R11
**Slice**: opsx-fast/tdd-required
fast item 涉及可测试行为时必须复用 `opsx-tdd` 执行测试先行或表征测试。

#### 场景: fast item 改变可测试行为
- **当** fast item 影响代码行为、缺陷复现、数据转换、命令输出或 workflow 状态机
- **那么** agent 必须复用 `opsx-tdd`
- **并且** 不得仅以人工检查替代测试

### 需求: Direct 策略必须说明理由
**Trace**: R12
**Slice**: opsx-fast/direct-reason
fast item 选择 `direct` 策略时必须说明为什么不需要 TDD。

#### 场景: 轻微不可测试改动
- **当** fast item 仅修改文字、注释、低风险模板或无法合理自动化验证的材料
- **那么** agent 可以选择 `direct`
- **并且** 必须在 `evidence.md` 记录跳过 TDD 的理由和替代验证命令

### 需求: 失败尝试记录
**Trace**: R13
**Slice**: opsx-fast/attempts
fast item 的失败修复或失败验证必须追加尝试记录。

#### 场景: 一次修复或验证未通过
- **当** fast item 的 patch、测试或 verify 未通过
- **那么** agent 记录 `尝试编号`、`假设`、`改动摘要`、`验证结果` 和 `否定原因`

### 需求: 第三次失败回退
**Trace**: R14
**Slice**: opsx-fast/fallback
fast item 达到三次失败尝试后必须停止继续 patch。

#### 场景: 第三次失败
- **当** fast item 的失败尝试数达到三次
- **那么** agent 必须停止继续 patch
- **并且** 将状态置为 `blocked` 或 `escalated`

### 需求: 失败回退路由
**Trace**: R15
**Slice**: opsx-fast/fallback-route
fast item 触发回退后必须主动审视方案并路由到更合适流程。

#### 场景: fast 回退触发
- **当** fast item 状态变为 `blocked` 或 `escalated`
- **那么** agent 必须审视根因、问题边界、需求定义和架构假设
- **并且** 路由到 `opsx-explore` 或 `opsx-slice`

### 需求: TDD Skill 支持 Fast Target
**Trace**: R16
**Slice**: reusable-skills/tdd-fast
`opsx-tdd` 必须支持以 fast root 作为测试报告目标。

#### 场景: fast 使用 TDD
- **当** fast item 需要 test-first、characterization-first 或 direct 测试策略
- **那么** agent 复用 `opsx-tdd`
- **并且** 测试结果写入 fast root 下的 `test-report.md`

### 需求: Verify Skill 支持 Fast Target
**Trace**: R17
**Slice**: reusable-skills/verify-fast
`opsx-verify` 必须支持 `target_kind: fast`。

#### 场景: fast 验证
- **当** fast item 完成实现
- **那么** agent 复用 `opsx-verify`
- **并且** verify 以 `target_root: openspec/fast/<id>` 读取 fast artifacts

### 需求: Review Skill 支持 Fast Target
**Trace**: R18
**Slice**: reusable-skills/review-fast
`opsx-review` 必须支持 `target_kind: fast`。

#### 场景: fast 风险审查
- **当** fast item 需要风险审查
- **那么** agent 复用 `opsx-review`
- **并且** 不要求 fast item 拥有 formal change 的 proposal/design/spec/tasks

### 需求: Archive Skill 支持 Fast Target
**Trace**: R19
**Slice**: reusable-skills/archive-fast
`opsx-archive` 必须支持关闭 fast item。

#### 场景: fast 关闭
- **当** fast item 达到关闭条件
- **那么** agent 复用 `opsx-archive`
- **并且** archive 不要求 fast item 拥有 formal change 的 proposal/design/spec/tasks

### 需求: Fast Status 展示
**Trace**: R20
**Slice**: openspec-runtime/fast-status
OpenSpec runtime 必须能展示 active fast items。

#### 场景: 查看项目状态
- **当** 用户运行状态命令
- **那么** 输出同时展示 active changes 和 active fast items

### 需求: Fast Next Step
**Trace**: R21
**Slice**: openspec-runtime/fast-next
OpenSpec runtime 必须按 fast gates 计算 fast item 的下一步。

#### 场景: 查看 fast 下一步
- **当** fast item 缺少 classify、preflight、verify 或 review gate
- **那么** status 输出对应的下一个 fast stage

### 需求: Fast 与 Formal 消歧
**Trace**: R22
**Slice**: openspec-runtime/fast-resolve
runtime 必须区分同名 fast item 和 formal change。

#### 场景: changes 和 fast 并存
- **当** 项目同时存在 `openspec/changes/<id>` 和 `openspec/fast/<id>`
- **那么** runtime 必须用目标类型或命令上下文消歧
- **并且** 不得把 fast item 解析为 formal change

### 需求: Fast 路径安全
**Trace**: R23
**Slice**: openspec-runtime/path-safety
runtime 必须拒绝不安全的 fast id。

#### 场景: 解析 fast id
- **当** 用户解析 fast id
- **那么** runtime 必须拒绝绝对路径、`..`、隐藏目录名和包含 `/` 的非法组件

### 需求: Fast Archive 位置
**Trace**: R24
**Slice**: openspec-runtime/fast-archive-root
fast item 必须归档到 fast 专属 archive root。

#### 场景: 归档 fast item
- **当** archive skill 关闭 fast item
- **那么** fast item 必须归档到 `openspec/fast/archive/<id>/`
- **并且** 不得移动到 `openspec/changes/archive/`

### 需求: Fast Source Refs
**Trace**: R25
**Slice**: aiknowledge/fast-source-refs
新增知识沉淀必须支持 `fast:<id>` 来源引用。

#### 场景: fast 产生可复用经验
- **当** agent 将 fast item 的经验沉淀到 `.aiknowledge`
- **那么** `source_refs` 可以引用 `fast:<id>`

### 需求: 停止新增 Lite Runs
**Trace**: R26
**Slice**: aiknowledge/lite-runs-retired
新增工作流状态不得继续写入 `.aiknowledge/lite-runs/`。

#### 场景: fast item 完成
- **当** `opsx-fast` 完成一个工作项
- **那么** agent 不创建新的 `.aiknowledge/lite-runs/` 记录

## 修改需求

### 需求: 工作流拓扑更新
**Trace**: R27
**Slice**: openspec-skills/topology
active docs、skills 和 codemap 必须将 lite/bugfix 旁路更新为 `opsx-fast` 统一快速通道。

#### 场景: agent 查找轻量流程
- **当** agent 读取 active workflow 文档或 codemap
- **那么** 它看到 `opsx-fast` 是统一入口
- **并且** 不再看到独立 `opsx-lite` 或 `opsx-bugfix` 被推荐为流程入口

### 需求: Fast 不支持 Group/Subchange
**Trace**: R28
**Slice**: opsx-fast/scope
fast item 必须保持单工作项模型，不支持 formal change 的 group/subchange 拓扑。

#### 场景: fast 工作项需要拆分
- **当** 一个 fast item 自然拆成多个独立交付单元、多个 bug 或多个验证闭环
- **那么** agent 必须创建多个 fast item 或升级到 formal change
- **并且** 不得在 `openspec/fast/<id>` 下创建 group/subchange 结构

## 移除需求

无。
