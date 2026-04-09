# Design: 裁剪全局 profile/delivery 配置体系

## 架构决策

### 核心决策：硬编码替代配置

将以下两个运行时配置改为编译期常量：

| 原配置项 | 新值 | 位置 |
|----------|------|------|
| `delivery` | `'both'`（始终生成 skills + commands） | `src/core/update.ts` / `src/core/init.ts` 内联常量 |
| `workflows` | `ALL_WORKFLOWS`（始终全量安装） | 直接引用 `profiles.ts` 中已有常量 |

`ALL_WORKFLOWS` 常量保留在 `src/core/profiles.ts`，但 `getProfileWorkflows`、`Profile`、`CORE_WORKFLOWS` 等 profile 系统类型/函数全部删除。

---

## 删除边界

### 完整删除的文件

| 文件 | 原因 |
|------|------|
| `src/core/profile-sync-drift.ts` | 仅服务于 profile drift 检测，无其他用途 |

### 删除的模块内容（保留文件）

**`src/core/global-config.ts`**
- 删除：`Profile` 类型、`Delivery` 类型
- 删除：`GlobalConfig` 中的 `profile`、`delivery`、`workflows` 字段
- 删除：`DEFAULT_CONFIG` 中的 profile/delivery 默认值
- 保留：`featureFlags`、文件读写逻辑、XDG 路径逻辑

**`src/core/profiles.ts`**
- 删除：`Profile` 类型、`CORE_WORKFLOWS`、`getProfileWorkflows()`、`CoreWorkflowId`
- 保留：`ALL_WORKFLOWS`、`WorkflowId`

**`src/core/migration.ts`**
- 删除：`migrateIfNeeded()`（profile 迁移逻辑）
- 删除：`syncCoreProfileWorkflows()`
- 删除：`inferDelivery()` 等辅助函数
- 保留：`migrateIfNeededShared()` 调用方可直接内联为空操作，或完整删除该文件

**`src/commands/config.ts`**
- 删除：`config profile` 子命令（约 250 行交互式选择器）
- 删除：`resolveCurrentProfileState()`、`deriveProfileFromWorkflowSelection()`、`formatWorkflowSummary()`、`diffProfileState()`、`maybeWarnConfigDrift()`
- 删除：相关 import（`Profile`、`Delivery`、`CORE_WORKFLOWS`、`getProfileWorkflows`、`hasProjectConfigDrift`）
- 保留：`config get/set/list/path/edit/reset/unset` 子命令

**`src/core/config-schema.ts`**（如有 profile/delivery 校验逻辑）
- 删除：profile、delivery、workflows 的 schema 校验规则
- 保留：featureFlags 校验

### 修改的文件（移除 profile/delivery 分支）

**`src/core/update.ts`**
- 删除：`syncCoreProfileWorkflows()` 调用
- 删除：读取 `globalConfig.profile` / `globalConfig.delivery` / `globalConfig.workflows`
- 删除：`shouldGenerateSkills` / `shouldGenerateCommands` 条件判断（改为始终两者都生成）
- 删除：`removeSkillsForRemovedWorkflows()`、`removeCommandsForRemovedWorkflows()` 等删除逻辑（不再按 profile 删除）
- 删除：`displayExtraWorkflowsNote()` 方法
- 替换：`profileWorkflows` → 直接使用 `ALL_WORKFLOWS`
- 保留：legacy cleanup、版本检测、工具检测逻辑

**`src/core/init.ts`**
- 删除：`--profile` CLI 选项及 `profileOverride` 字段
- 删除：`resolveProfileOverride()` 方法
- 删除：`syncCoreProfileWorkflows()` 调用
- 删除：`getProfileWorkflows()` 调用
- 替换：所有 `delivery !== 'commands'` / `delivery !== 'skills'` 条件 → 移除，始终两者都生成
- 保留：工具选择、skill/command 文件生成逻辑

---

## 接口变更

### `GlobalConfig` before → after

```typescript
// Before
interface GlobalConfig {
  featureFlags?: Record<string, boolean>;
  profile?: Profile;
  delivery?: Delivery;
  workflows?: string[];
}

// After
interface GlobalConfig {
  featureFlags?: Record<string, boolean>;
}
```

### `InitCommand` options before → after

```typescript
// Before
interface InitCommandOptions {
  tool?: string;
  profile?: string;  // ← 删除
  force?: boolean;
}

// After
interface InitCommandOptions {
  tool?: string;
  force?: boolean;
}
```

---

## 依赖关系

```
删除的依赖链：
global-config (Profile/Delivery) ← profiles (getProfileWorkflows) ← init/update
                                  ← migration (syncCoreProfileWorkflows)
                                  ← config.ts (config profile 命令)
profile-sync-drift ← update, config.ts

保留的依赖链：
profiles (ALL_WORKFLOWS) ← skill-generation (getSkillTemplates filter)
                         ← init/update (直接使用全量)
```

---

## 迁移兼容性

现有用户全局 config 文件（`~/.config/openspec/config.json`）可能包含 `profile`/`delivery`/`workflows` 字段。处理方式：

- `getGlobalConfig()` 读取时**静默忽略**未知字段（JSON 解构只取已知字段）
- 不需要写入迁移逻辑，多余字段下次 `config set` 写入时自然消失

---

## 代码量变化预估

| 文件 | 变化 |
|------|------|
| `src/core/profile-sync-drift.ts` | 删除 -252 行 |
| `src/commands/config.ts` | 删除约 -350 行 |
| `src/core/migration.ts` | 删除约 -130 行（或整文件） |
| `src/core/global-config.ts` | 删除约 -20 行 |
| `src/core/profiles.ts` | 删除约 -20 行 |
| `src/core/update.ts` | 删除约 -150 行 |
| `src/core/init.ts` | 删除约 -80 行 |
| **净变化** | **约 -1000 行** |
