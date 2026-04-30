# Fast Item：2026-04-30-opsx-lifecycle-cli-gates

正文默认使用中文；路径、命令、配置键名、frontmatter key 和状态枚举保持原文。

## 元数据

- source_type: lite
- status: in_progress
- created: 2026-04-30

`source_type` 只能是 `lite` 或 `bugfix`，只表示需求来源；两者共用同一套 fast 流程。

## Preflight

### 意图

把 change/fast 的分支、checkpoint 和 archive merge-back 约束从纯 skill 文档升级为 opsx CLI 可执行门控，减少 agent 漏执行。

### 范围

- `bin/opsx.mjs` / `runtime/bin/changes.sh` 的 lifecycle 支撑命令与 metadata 写入。
- `skills/common/git-lifecycle.md`、`skills/opsx-fast/SKILL.md`、`skills/opsx-archive/SKILL.md` 的调用契约同步。
- 针对 CLI 行为补充单元测试。

### 预期影响

- 正式 change 初始化时在 Git 仓库内强制使用本地 change branch，并记录 git metadata。
- fast item 初始化保留轻量默认，但 CLI 提供可强制切分支的入口，由 fast classify/preflight 后按实际风险调用。
- 归档前如果 metadata 记录过 branch，CLI 可执行强制 merge-back 并写回 merge 证据。

### 验证计划

- 先新增失败测试覆盖 change init 自动建分支与 metadata、fast branch opt-in、archive merge-back。
- 实现后运行相关 Node 测试。

### 升级检查

- 是否涉及新增 capability、兼容性、安全策略、多模块联动、API/CLI/数据格式变更、方案取舍或测试策略不明确: 涉及 CLI 行为和 workflow metadata，但边界集中且可用 fast + 测试覆盖。
- 若命中，路由: 保持 fast；若实现发现 archive merge 需要完整 OpenSpec 迁移再升级。

## TDD 策略

- 策略: test-first
- 理由: CLI lifecycle 行为可通过临时 Git 仓库端到端验证，适合先锁定期望。
- 替代验证（direct 必填）:

## Patch 边界

- 允许修改: `bin/opsx.mjs`、`runtime/bin/changes.sh`、`tests/*`、`skills/opsx-*`、`skills/common/git-lifecycle.md`、本 fast item 记录。
- 禁止修改: 与 lifecycle 无关的 schema、历史 archive 内容、发布包配置。
