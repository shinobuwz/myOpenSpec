# 快速上手

本指南说明当前仓库的 skill-first 工作流如何使用。这里的入口不是 slash command，而是 `.claude/skills/` 下的 `opsx-*` skills。

## 最短路径

```text
1. 安装到仓库列表     ./scripts/install-repos.sh /path/to/repo-a /path/to/repo-b
2. 复杂需求先切分     请使用 `opsx-slice` 判断是否需要多个 change
3. 规划变更           请使用 `opsx-plan` 创建一个新变更
4. 生成任务           请继续使用 `opsx-tasks`
5. 实施代码           请使用 `opsx-implement`
6. 验证与归档         请使用 `opsx-verify` -> `opsx-review` -> `opsx-archive`
```

如果您希望安装到全局配置目录，可运行 `./scripts/install-global.sh`；它会同步到 `~/.claude`，并将 `~/.codex` 下的相关目录软链接到 `~/.claude`。

## 目录结构

```text
openspec/
├── changes/
│   └── <change-name>/
│       ├── proposal.md
│       ├── design.md
│       ├── tasks.md
│       └── specs/
│           └── <domain>/
│               └── spec.md
└── config.yaml
```

## 关键制品

| 制品 | 作用 |
|------|------|
| `proposal.md` | 说明为什么做、范围是什么 |
| `specs/` | 当前 change 的行为规范 |
| `design.md` | 技术设计与 trace |
| `tasks.md` | 可执行、可勾选的实现清单 |

## 推荐链路

### 需求不清晰

```text
opsx-explore
-> opsx-slice
-> opsx-plan
-> opsx-plan-review
-> opsx-tasks
-> opsx-task-analyze
-> opsx-implement
-> opsx-verify
-> opsx-review
-> opsx-archive
```

### 需求已明确但范围较大

```text
opsx-slice
-> opsx-plan
-> opsx-plan-review
-> opsx-tasks
-> opsx-task-analyze
-> opsx-implement
-> opsx-verify
-> opsx-review
-> opsx-archive
```

### 需求已明确且范围很小

```text
opsx-plan
-> opsx-plan-review
-> opsx-tasks
-> opsx-task-analyze
-> opsx-implement
-> opsx-verify
-> opsx-review
-> opsx-archive
```

## 一个最小示例

```text
你：请使用 `opsx-slice` 判断会员中心改造要不要拆

AI：建议拆成 2 个 change，当前先做 `profile-mvp`

你：请使用 `opsx-plan` 为 profile-mvp 创建新变更

AI：已创建 openspec/changes/2026-04-10-profile-mvp/
     ✓ proposal.md
     ✓ specs/profile/spec.md
     ✓ design.md
     下一步：opsx-plan-review

你：请继续用 `opsx-tasks`

AI：✓ tasks.md
     ✓ task-analyze 已通过
     下一步：opsx-implement

你：请使用 `opsx-implement`

AI：正在处理任务...
     ✓ 1.1 搭建资料页骨架
     ✓ 1.2 接入资料接口
     所有任务完成

你：请使用 `opsx-verify`
你：请使用 `opsx-review`
你：请使用 `opsx-archive`
```

## 注意事项

- `opsx-plan-review`、`opsx-task-analyze`、`opsx-verify` 是强制关卡。
- 涉及全栈、多模块、多 capability 时，先使用 `opsx-slice` 再进入 `opsx-plan`。
- `opsx-continue` 用于恢复中断的 change；它会自动检测当前状态并跳到下一合法步骤。
- 当前仓库不再维护 `.claude/commands/opsx/`。
- 若其他旧文档仍出现 `/opsx:*`，请优先以 [支持的工具](supported-tools.md) 和 [工作流](workflows.md) 为准。

## 下一步

- [支持的工具](supported-tools.md)
- [工作流](workflows.md)
