## ADDED Requirements

### 需求:高体量 guidance skills 必须迁出长正文
**Trace**: R1
**Slice**: guidance-skill-slimming/primary-guidance
本变更必须将 `opsx-explore`、`opsx-knowledge`、`opsx-codemap` 中的长流程、模板、示例和生命周期细节迁入同 skill 的 `references/`。

#### 场景: agent 读取主要 guidance skill 入口
- **当** agent 打开 `skills/opsx-explore/SKILL.md`、`skills/opsx-knowledge/SKILL.md` 或 `skills/opsx-codemap/SKILL.md`
- **那么** 入口文件只保留触发条件、职责边界、读写边界、硬性护栏、核心步骤和 reference 导航

### 需求:主要 guidance skill 的硬边界必须留在入口
**Trace**: R2
**Slice**: guidance-skill-slimming/primary-safety
主要 guidance skill 瘦身后不得把执行安全红线只放到 references。

#### 场景: agent 未读取 references 即开始执行
- **当** agent 只读取对应 `SKILL.md`
- **那么** 仍能看到 `opsx-explore` 不写产品代码、源码探索 codemap-first、`opsx-knowledge`/`opsx-codemap` 写入前先读 `.aiknowledge/README.md`、知识维护必须追加月度日志等硬规则

### 需求:次级 guidance skills 应按容量迁移
**Trace**: R3
**Slice**: guidance-skill-slimming/secondary-guidance
本变更应在主要 guidance skill 完成后迁移 `opsx-lite`、`opsx-slice`、`opsx-auto-drive`、`opsx-bugfix` 中适合按需读取的长模板或流程细节。

#### 场景: 次级 guidance skill 包含模板或长流程
- **当** `SKILL.md` 中存在 lite-run 模板、proposal 模板、auto-drive 迭代记录模板、bugfix 详细步骤或长护栏解释
- **那么** 这些内容迁入同 skill `references/`，入口文件只保留执行路径、升级条件、关键安全规则和 reference 导航

### 需求:迁移不得改变 workflow 语义
**Trace**: R4
**Slice**: guidance-skill-slimming/workflow-preservation
本变更只调整文档布局，不得改变 OPSX workflow stage、gate 前置条件或 `.aiknowledge` lifecycle 语义。

#### 场景: 迁移完成后执行现有 workflow
- **当** agent 按 `opsx-explore`、`opsx-slice`、`opsx-lite`、`opsx-knowledge`、`opsx-codemap` 或 `opsx-auto-drive` 执行
- **那么** 原有读写边界、准入/退出条件、升级到正式 change 的条件和知识写入规则保持不变

### 需求:Reference 导航必须可执行
**Trace**: R5
**Slice**: guidance-skill-slimming/reference-navigation
每个被迁移的 `SKILL.md` 必须列出必要 references，并说明何时读取。

#### 场景: agent 需要低频细节
- **当** agent 需要模板、详细步骤、示例、状态表或生命周期细节
- **那么** 能从对应 `SKILL.md` 的 reference 导航定位到同 skill `references/<topic>.md`

### 需求:检查和测试必须锁定迁移结果
**Trace**: R6
**Slice**: guidance-skill-slimming/validation
本变更必须用现有检查脚本、文本测试或 shell 检查验证 guidance skill 瘦身结果。

#### 场景: 维护者验证本变更
- **当** 运行 `npm test` 和 `node scripts/check-skill-slimming.mjs --json`
- **那么** 测试通过，且检查输出反映主要 guidance skills 的行数下降，并且不新增 canonical contract 重复
