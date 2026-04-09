## ADDED Requirements

### 需求:init/update 始终生成全量 skills
**Trace**: R7
**Slice**: init-update/skill-generation
`openspec-cn init` 和 `openspec-cn update` 必须始终为所有 `ALL_WORKFLOWS` 中的 workflow 生成 skill 文件，不受任何配置影响。

#### 场景:init 生成全量 skills
- **当** 执行 `openspec-cn init`
- **那么** `.claude/skills/` 目录下必须包含所有 `ALL_WORKFLOWS` 对应的 skill 目录

#### 场景:update 生成全量 skills
- **当** 执行 `openspec-cn update`
- **那么** `.claude/skills/` 下所有 `ALL_WORKFLOWS` 对应的 skill 目录必须被更新

### 需求:init/update 始终生成全量 commands
**Trace**: R8
**Slice**: init-update/command-generation
`openspec-cn init` 和 `openspec-cn update` 必须始终为所有支持 commands 的 workflow 生成 command 文件（如 codex prompts），不受任何配置影响。

#### 场景:init 生成全量 commands
- **当** 执行 `openspec-cn init`
- **那么** codex adapter 必须写出所有 `COMMAND_IDS` 中的 command 文件

#### 场景:update 生成全量 commands
- **当** 执行 `openspec-cn update`
- **那么** codex adapter 必须更新所有 `COMMAND_IDS` 中的 command 文件

## REMOVED Requirements

### 需求:init 接受 --profile CLI 选项
**Trace**: R9
**Slice**: init/cli-options
`openspec-cn init` 命令必须不再提供 `--profile` 选项；传入 `--profile` 必须触发 Commander 的 unknown option 错误。

**Reason**: profile 概念删除，固定使用全量 workflows。
**Migration**: 无。

#### 场景:传入 --profile 选项
- **当** 执行 `openspec-cn init --profile core`
- **那么** 命令以非零退出码退出，输出 unknown option 错误信息

### 需求:init/update 按 delivery 配置决定生成 skills 还是 commands
**Trace**: R10
**Slice**: init-update/delivery-branching
`init.ts` 和 `update.ts` 中基于 `delivery` 值的条件分支（`delivery !== 'commands'`、`delivery !== 'skills'`）必须全部删除；删除 skills 目录或 command 文件的逻辑（`removeSkillsForRemovedWorkflows`、`removeCommandsForRemovedWorkflows`）必须全部删除。

**Reason**: 始终生成 both，无需按 delivery 分支。
**Migration**: 无。

#### 场景:update 不删除任何已有 skill 目录
- **当** 执行 `openspec-cn update`
- **那么** update 不调用任何 remove skill/command 的方法

### 需求:update 显示额外 workflow 提示
**Trace**: R11
**Slice**: update/extra-workflows-note
`update.ts` 中的 `displayExtraWorkflowsNote()` 方法必须被删除；执行 `openspec-cn update` 时不再输出"有 N 个额外工作流不在当前配置文件中"的提示。

**Reason**: profile 概念删除，不存在"额外 workflow"的概念。
**Migration**: 无。

#### 场景:update 输出不含额外 workflow 提示
- **当** 执行 `openspec-cn update`
- **那么** 标准输出中不含"额外工作流"或"config profile"相关文字
