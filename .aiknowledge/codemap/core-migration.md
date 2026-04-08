# core-migration

## 职责

为已有项目提供迁移到 profile 系统的一次性升级逻辑，以及为 core profile 用户在 init/update 时保持 workflows 数组与 `CORE_WORKFLOWS` 同步。

## 关键文件

| 文件 | 角色 |
|------|------|
| src/core/migration.ts | 全部导出逻辑：`migrateIfNeeded`、`scanInstalledWorkflows`、`syncCoreProfileWorkflows` |
| test/core/migration.test.ts | 覆盖迁移场景和 syncCoreProfileWorkflows 各分支的单元测试 |

## 隐式约束

- `migrateIfNeeded`：若全局配置中 `profile` 字段已存在则直接返回，不重复迁移
- `syncCoreProfileWorkflows`：对 `profile !== 'core'` 的配置是 no-op，不修改 custom profile 的 workflows
- `syncCoreProfileWorkflows` 无参数，直接读写全局配置文件；调用方须确保在使用 `getProfileWorkflows` 读取 workflows 之前先调用此函数，否则 core profile 用户可能使用过时的 workflows 数组
- `scanInstalledWorkflows` 只识别 `ALL_WORKFLOWS` 中的 workflowId，忽略自定义 skill 目录和命令文件
