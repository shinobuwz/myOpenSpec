# Design: 删除 TypeScript CLI，改用 shell 脚本

## Context

当前 OpenSpec-cn 是一个完整的 TypeScript/Node.js CLI 包（~7000 行源码），包含：
- `init`/`update`：将 skill 文件同步到目标仓库，同时生成 codex commands
- `config`：管理 profile/delivery/workflows 全局配置（交互式套餐切换系统）
- `show`/`change`：查看/列出 `openspec/changes/` 中的变更
- `validate`/`schema`/`workflow`：spec 校验和工作流管理
- 复杂的 migration、legacy-cleanup、profile-sync-drift 逻辑

实际使用场景：单人、固定工具（Claude Code + Codex）、固定全量 workflow，从不切换 profile。

**约束**：
- 目标用户只有一人（作者本人）
- 固定使用 macOS/zsh 环境
- 只需同步到少量几个已知仓库

## Goals / Non-Goals

**Goals**:
- 删除整个 TypeScript 构建链和运行时依赖
- 用极简 shell 脚本替代 `init`/`update` 功能
- 修复 bootstrap skill 中对 `openspec-cn list` 的依赖
- 废弃 `openspec/changes/simplify-config`（目标已被超越）

**Non-Goals**:
- 保留任何 CLI 命令
- 保留跨平台（Windows）支持
- 保留 npm 分发能力
- 保留 `validate`/`schema`/`workflow` 等工具命令

## Requirements Trace

- [R1] -> [U1] sync.sh 复制 skill 文件
- [R2] -> [U1] sync.sh 同步 codex commands
- [R3] -> [U2] sync-all.sh 批量同步
- [R4] -> [U3] 修改 bootstrap skill
- [R5] -> [U4] 删除 TypeScript 构建链
- [R6] -> [U5] 废弃 simplify-config 变更

## Implementation Units

### [U1] scripts/sync.sh

关联需求：R1、R2

脚本接受一个参数 `<target-dir>`，执行：
1. 检查参数是否提供，否则打印用法并退出
2. `mkdir -p "$TARGET/.claude/skills"`
3. `cp .claude/skills/openspec-*.md "$TARGET/.claude/skills/"`
4. 如果 `.codex/commands/` 存在：`mkdir -p "$TARGET/.codex/commands"` 并 `cp .codex/commands/opsx*.md "$TARGET/.codex/commands/"`
5. 打印 `✓ synced: $TARGET`

验证方式：手动运行验证文件已复制到目标目录。

### [U2] scripts/sync-all.sh

关联需求：R3

脚本内部硬编码仓库路径列表（数组），对每个路径：
1. 检查目录是否存在，不存在则打印警告跳过
2. 调用 `./scripts/sync.sh "$REPO"` 并捕获退出码
3. 打印成功/失败状态

验证方式：手动运行，确认输出每个仓库的状态。

### [U3] 修改 openspec-bootstrap.md

关联需求：R4

将 bootstrap skill 中的启动序列第 2 步从：
```
执行 `openspec-cn list --json` 获取当前变更列表
```
改为：
```
执行 `ls openspec/changes/` 获取当前变更列表（排除 archive 目录）
```

验证方式：在无 `openspec-cn` 命令的环境中触发 bootstrap，确认变更列表正常输出。

### [U4] 删除 TypeScript 构建链

删除以下文件/目录：
- `src/` — 整个 TypeScript 源码
- `bin/` — CLI 入口点
- `dist/` — 编译产物
- `build.js` — 构建脚本
- `tsconfig.json` — TypeScript 配置
- `vitest.config.ts` + `vitest.setup.ts` — 测试配置
- `test/` — 测试文件
- `eslint.config.js` — lint 配置
- `node_modules/` — 依赖
- `pnpm-lock.yaml` + `package-lock.json`
- `Makefile`（如果只包含 npm 命令包装）
- `package.json` — Node 包配置

保留（可作为参考文档）：
- `schemas/` — spec schema 定义（可选，用于文档参考）
- `docs/` — 如果有有价值的内容

### [U5] 废弃 simplify-config 变更

将 `openspec/changes/simplify-config/` 移动到 `openspec/changes/archive/simplify-config/`，表示该变更已被超越而非实施。

## Decisions

**决策1：脚本语言选择 bash 而非 Node.js**
- 选择：bash/shell
- 原因：删除 Node.js 依赖是本次变更的核心目标，用 Node 脚本替代 Node CLI 没有意义
- 替代方案：保留一个最小化 Node 脚本 → 否决，引入依赖

**决策2：硬编码仓库路径**
- 选择：在 `sync-all.sh` 中硬编码
- 原因：用户是单一作者，路径固定，无需配置文件抽象
- 替代方案：读取配置文件 → 否决，过度设计

**决策3：不保留 codex command 生成逻辑**
- 选择：直接 `cp .codex/commands/opsx*.md`（假设 `.codex/` 中已有维护好的源文件）
- 原因：当前 CLI 中的生成逻辑是从 skill 内容转换格式，但实际上 `.codex/commands/` 本身就是可以直接维护的源文件
- 替代方案：在 shell 中重写转换逻辑 → 否决，复杂度高且无必要

## Risks / Trade-offs

- [风险：bootstrap 改动影响现有会话] → 缓解：修改简单（只改一行命令），可快速验证
- [风险：删除太多，遗漏某个实际用到的命令] → 缓解：先用 `git log` 确认最近哪些命令被实际使用

## Migration Plan

1. 废弃 `simplify-config` 变更（移到 archive）
2. 创建 `scripts/sync.sh` 和 `scripts/sync-all.sh`
3. 修改 `openspec-bootstrap.md`
4. 删除 TypeScript 构建链（一次性删除，不需要分阶段）
5. 验证：手动运行 `sync.sh` 到一个测试仓库，确认文件到位

**回滚**：git revert 即可，变更均在 git 追踪下。

## Knowledge Capture

- shell 脚本做 skills 同步比 TypeScript CLI 简单 10 倍以上，对单人使用场景完全够用
- bootstrap skill 中不应依赖外部 CLI 命令，优先用 shell 内置命令

## Open Questions

- `sync-all.sh` 中的仓库列表需要用户在实施时填写具体路径
- `schemas/` 和 `docs/` 是否需要保留（不影响主要功能，可以在实施时决定）
