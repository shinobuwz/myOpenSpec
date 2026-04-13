---
status: active
created_at: 2026-04-13
created_from: metadata-backfill
last_verified_at: 2026-04-13
last_verified_by: repository-audit
verification_basis: repository-audit
applies_to:
  - .claude/skills
  - scripts
superseded_by:
---

# Skill 中避免依赖外部 CLI 命令

**标签**：[skill, workflow, 可用性]

## 现象

`opsx-bootstrap` skill 的启动序列调用了 `openspec-cn list --json`。当 `openspec-cn` CLI 被删除（或未安装）后，bootstrap skill 立刻失效，整个会话引导流程中断。

## 根因

Skill 文件是 Markdown 提示词，运行在 AI agent 的 shell 环境中。如果 skill 依赖特定的外部 CLI 命令，该 CLI 的可用性就成为 skill 的隐式前提条件，不满足时会导致 skill 静默失败或报错中断。

## 修复前

```diff
- 2. 执行 `openspec-cn list --json` 获取当前变更列表
```

## 修复后

```diff
+ 2. 执行 `ls openspec/changes/ | grep -v archive` 获取当前变更列表；若无输出则说明无活动变更
```

使用 shell 内置命令 `ls` 和 `grep` 替代外部 CLI，不依赖任何特定工具的安装状态。

## 要点

**Skill 中的操作步骤应优先使用 shell 内置命令（`ls`、`grep`、`cat`、`find`），仅在功能无法替代时才依赖外部 CLI；且依赖的 CLI 应在 skill 注释中明确声明。**

## 来源

commit: drop-cli-use-scripts（2026-04-09）

## 状态

已修复（2026-04-10）。所有 skill 文件中的 CLI 调用已全部替换为直接文件操作。
