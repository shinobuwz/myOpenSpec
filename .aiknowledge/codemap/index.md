# Codemap

## 模块

| 模块 | 职责 | 入口 |
|------|------|------|
| [core-migration](core-migration.md) | 项目迁移到 profile 系统的一次性迁移逻辑，以及 core profile workflows 同步 | src/core/migration.ts |
| [core-init-update](core-init-update.md) | init/update 命令入口，编排工具配置生成、profile 同步与迁移调用 | src/core/init.ts, src/core/update.ts |

## 链路

| 链路 | 涉及模块 | 说明 |
|------|----------|------|
