# core-init-update

## 职责

`init` 和 `update` 命令的实现，负责编排工具检测、legacy 清理、profile 迁移与同步、技能与命令文件的生成/删除。

## 关键文件

| 文件 | 角色 |
|------|------|
| src/core/init.ts | `InitCommand` 类，首次安装或重新配置 OpenSpec 工具 |
| src/core/update.ts | `UpdateCommand` 类，刷新已安装工具的 skills/commands，支持 profile-aware 增量更新 |

## 隐式约束

- 两个命令均在读取 profile 配置（`getProfileWorkflows`）之前调用 `syncCoreProfileWorkflows()`，确保 core profile 用户的 workflows 数组已更新到最新 `CORE_WORKFLOWS`
- `init` 仅在 `extendMode`（目录已存在）时调用 `migrateIfNeeded`；全新安装不触发迁移
- `update` 每次执行都调用 `migrateIfNeeded`，先于 legacy 清理和 profile 配置读取
- `syncCoreProfileWorkflows` 在 `init` 中的调用位于 `generateSkillsAndCommands` 内部，晚于工具选择；在 `update` 中的调用位于步骤 2，早于所有 profile 相关决策
