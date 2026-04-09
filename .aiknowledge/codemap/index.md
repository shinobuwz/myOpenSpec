# Codemap

## 模块

| 模块 | 职责 | 入口 |
|------|------|------|
| [core-migration](core-migration.md) | 项目迁移到 profile 系统的一次性迁移逻辑，以及 core profile workflows 同步 | src/core/migration.ts |
| [core-init-update](core-init-update.md) | init/update 命令入口，编排工具配置生成、profile 同步与迁移调用 | src/core/init.ts, src/core/update.ts |
| [workflow-instructions](workflow-instructions.md) | apply 指令生成 + gate review facts bundle 构建 | src/commands/workflow/instructions.ts, shared.ts |
| [workflow-templates](workflow-templates.md) | plan-review/verify skill 模板，定义 blind reviewer + arbiter 契约 | src/core/templates/workflows/ |

## 链路

| 链路 | 涉及模块 | 说明 |
|------|----------|------|
