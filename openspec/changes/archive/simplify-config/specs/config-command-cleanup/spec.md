## REMOVED Requirements

### 需求:config profile 子命令存在
**Trace**: R12
**Slice**: config/profile-subcommand
`openspec-cn config profile` 子命令必须被完整删除；执行该命令必须触发 Commander 的 unknown command 错误。

**Reason**: profile 系统删除，交互式 profile 选择器无存在意义。
**Migration**: 无。

#### 场景:执行 config profile
- **当** 执行 `openspec-cn config profile`
- **那么** 命令以非零退出码退出，输出 unknown command 错误信息

#### 场景:config --help 不含 profile 子命令
- **当** 执行 `openspec-cn config --help`
- **那么** 输出中不含 `profile` 子命令条目

### 需求:config.ts 导出 profile 相关辅助函数
**Trace**: R13
**Slice**: config/helper-exports
`src/commands/config.ts` 中的以下导出函数必须被删除：`resolveCurrentProfileState()`、`deriveProfileFromWorkflowSelection()`、`formatWorkflowSummary()`、`diffProfileState()`、`maybeWarnConfigDrift()`。

**Reason**: 这些函数仅服务于 `config profile` 子命令，子命令删除后无用。
**Migration**: 如有测试引用这些函数，对应测试文件必须同步删除或更新。

#### 场景:删除辅助函数后构建通过
- **当** 上述函数被删除
- **那么** `pnpm build` 必须无 TypeScript 错误通过

## ADDED Requirements

### 需求:config list 不显示 profile/delivery/workflows 字段
**Trace**: R14
**Slice**: config/list-output
执行 `openspec-cn config list` 时，输出中必须不含 `profile`、`delivery`、`workflows` 字段及其相关注释行（"档案设置："等）。

#### 场景:config list 输出
- **当** 执行 `openspec-cn config list`
- **那么** 标准输出中不含 `profile`、`delivery`、`workflows`、"档案设置" 等字样

### 需求:config set/get 拒绝 profile/delivery/workflows 键
**Trace**: R15
**Slice**: config/key-validation
`config set profile <value>`、`config set delivery <value>`、`config set workflows <value>` 必须以非零退出码退出，输出"无效的配置键"错误；`config get profile` 等同理。此行为依赖 R16 中 `config-schema.ts` 移除这三个键的 schema 定义后，校验逻辑自动拒绝它们。

#### 场景:config set 无效键
- **当** 执行 `openspec-cn config set profile core`
- **那么** 命令以非零退出码退出，输出包含"无效的配置键"的错误信息

#### 场景:config get 无效键
- **当** 执行 `openspec-cn config get delivery`
- **那么** 命令以非零退出码退出

### 需求:config-schema.ts 包含 profile/delivery/workflows 校验规则
**Trace**: R16
**Slice**: config-schema/validation-rules
`src/core/config-schema.ts` 中 zod schema 对 `profile`、`delivery`、`workflows` 字段的定义必须被删除；`DEFAULT_CONFIG` 中对应的默认值必须被删除；`KNOWN_TOP_LEVEL_KEYS` 集合中的 `workflows` 条目必须被删除。

**Reason**: `GlobalConfig` 不再包含这三个字段，schema 层必须同步清理，否则 `config set profile` 等操作会被 schema 错误地认为是有效键。
**Migration**: 无。

#### 场景:config-schema 不含已删除字段
- **当** 对 `config-schema.ts` 的 schema 定义进行静态检查
- **那么** `profile`、`delivery`、`workflows` 不在 schema 的已知键列表中

#### 场景:config set profile 被正确拒绝
- **当** 执行 `openspec-cn config set profile core`
- **那么** 命令以非零退出码退出，错误信息说明该键无效（而非被 schema 当作合法键接受）
