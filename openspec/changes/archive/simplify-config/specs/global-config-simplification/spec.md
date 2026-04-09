## REMOVED Requirements

### 需求:GlobalConfig 包含 profile 字段
**Trace**: R1
**Slice**: global-config/schema
`GlobalConfig` 接口必须不再包含 `profile` 字段；`Profile` 类型必须从 `global-config.ts` 中删除；`DEFAULT_CONFIG` 必须不包含 `profile` 默认值。

**Reason**: profile 系统为多用户套餐切换设计，单用户场景下始终使用全量 workflows，无需此配置。
**Migration**: 无。读取旧 config 文件时静默忽略 `profile` 字段（JSON 解构只取已知字段）。

#### 场景:读取含旧 profile 字段的 config 文件
- **当** `~/.config/openspec/config.json` 包含 `{ "profile": "core", "featureFlags": {} }`
- **那么** `getGlobalConfig()` 返回仅含 `featureFlags` 的对象，不含 `profile` 字段

### 需求:GlobalConfig 包含 delivery 字段
**Trace**: R2
**Slice**: global-config/schema
`GlobalConfig` 接口必须不再包含 `delivery` 字段；`Delivery` 类型必须从 `global-config.ts` 中删除；`DEFAULT_CONFIG` 必须不包含 `delivery` 默认值。

**Reason**: delivery 始终为 `both`（skills + commands），无需配置项。
**Migration**: 无。读取旧 config 文件时静默忽略 `delivery` 字段。

#### 场景:读取含旧 delivery 字段的 config 文件
- **当** `~/.config/openspec/config.json` 包含 `{ "delivery": "skills" }`
- **那么** `getGlobalConfig()` 返回不含 `delivery` 字段的对象

### 需求:GlobalConfig 包含 workflows 字段
**Trace**: R3
**Slice**: global-config/schema
`GlobalConfig` 接口必须不再包含 `workflows` 字段；`DEFAULT_CONFIG` 必须不包含 `workflows` 默认值。

**Reason**: workflows 始终为 `ALL_WORKFLOWS` 全量，无需配置项。
**Migration**: 无。读取旧 config 文件时静默忽略 `workflows` 字段。

#### 场景:读取含旧 workflows 字段的 config 文件
- **当** `~/.config/openspec/config.json` 包含 `{ "workflows": ["explore", "bugfix"] }`
- **那么** `getGlobalConfig()` 返回不含 `workflows` 字段的对象

## REMOVED Requirements

### 需求:profiles 模块导出 profile 系统函数和类型
**Trace**: R4
**Slice**: profiles/exports
`src/core/profiles.ts` 必须删除 `getProfileWorkflows()`、`Profile` 类型、`CORE_WORKFLOWS`、`CoreWorkflowId` 类型的导出；`ALL_WORKFLOWS` 和 `WorkflowId` 类型必须保留。

**Reason**: profile 系统整体删除，但 `ALL_WORKFLOWS` 仍被 init/update 使用。
**Migration**: 所有引用 `getProfileWorkflows`、`Profile`、`CORE_WORKFLOWS` 的文件需更新 import。

#### 场景:其他模块引用已删除导出
- **当** `init.ts` 或 `update.ts` 曾 import `getProfileWorkflows` from profiles
- **那么** 这些 import 必须被删除，调用点改为直接使用 `ALL_WORKFLOWS`

### 需求:profile-sync-drift 模块存在
**Trace**: R5
**Slice**: profile-sync-drift/existence
`src/core/profile-sync-drift.ts` 文件必须被完整删除；所有引用该模块的 import 必须同步删除。`WORKFLOW_TO_SKILL_DIR` 常量不需要迁移：其在 `update.ts` 的消费方（`removeSkillsForRemovedWorkflows`、`removeCommandsForRemovedWorkflows`）随 R10 一同删除；`migration.ts` 的消费方随 R6 一同删除；`init.ts` 已有独立的本地副本。

**Reason**: 该模块仅服务于 profile drift 检测，profile 系统删除后无存在意义。
**Migration**: 无需迁移 `WORKFLOW_TO_SKILL_DIR`，所有消费方均随本次变更删除。

#### 场景:文件删除后构建通过
- **当** `profile-sync-drift.ts` 被删除
- **那么** `pnpm build` 必须无 TypeScript 错误通过

#### 场景:WORKFLOW_TO_SKILL_DIR 无残留 import
- **当** `profile-sync-drift.ts` 被删除
- **那么** 代码库中不存在从 `profile-sync-drift` 导入 `WORKFLOW_TO_SKILL_DIR` 的语句

### 需求:migration 模块包含 profile 相关逻辑
**Trace**: R6
**Slice**: migration/profile-logic
`src/core/migration.ts` 中的 `migrateIfNeeded()`、`syncCoreProfileWorkflows()`、`inferDelivery()` 函数必须被删除；调用这些函数的 init.ts 和 update.ts 中的调用点必须同步删除。

**Reason**: 这些函数负责将旧格式迁移到 profile 系统，profile 系统删除后无需迁移。
**Migration**: 若 migration.ts 删除后无剩余导出，整个文件可一并删除。

#### 场景:init 和 update 不再调用 syncCoreProfileWorkflows
- **当** 执行 `openspec-cn init` 或 `openspec-cn update`
- **那么** 不调用任何 profile migration 或 sync 函数
