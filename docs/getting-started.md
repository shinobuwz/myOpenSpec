# 快速上手

本指南说明当前仓库的 skill-first 工作流如何使用。全局 `opsx` 命令只负责 launcher、项目路径和 skills 安装；实际规划和实施仍由 `opsx-*` skills 驱动。

## 最短路径

```text
1. 安装全局入口       npm install -g @shinobuwz/opsx && opsx install-skills
2. 初始化项目状态     opsx init-project -p /path/to/repo
3. 复杂需求先切分     请使用 `opsx-slice` 判断是否需要多个 change
4. 规划变更           请使用 `opsx-plan` 创建一个新变更
5. 生成任务           请继续使用 `opsx-tasks`
6. 实施代码           请使用 `opsx-implement`
7. 验证与归档         请使用 `opsx-verify` -> `opsx-review` -> `opsx-archive`
```

从源码 checkout 调试时，可运行 `./scripts/install-global.sh` 安装当前工作区的 skills。仓库级 `scripts/install-repos.sh` 只同步 `.claude/skills/opsx-*` adapter，不复制 runtime 或模板。

## 目录结构

```text
openspec/
├── changes/
│   └── <change-name>/
│       ├── .openspec.group.yaml      # active_subchange 等最小路由状态
│       └── subchanges/
│           └── <subchange-name>/
│               ├── proposal.md
│               ├── design.md
│               ├── tasks.md
│               ├── .openspec.yaml
│               └── specs/
│                   └── <domain>/
│                       └── spec.md
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

AI：已创建父 change 和 2 个 subchange，execution_mode=serial，recommended_order=01-profile-mvp,02-profile-security

你：请使用 `opsx-plan` 为 2026-04-10-profile-center 开始规划

AI：已在 openspec/changes/2026-04-10-profile-center/subchanges/01-profile-mvp/
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
- `opsx-continue` 用于恢复中断的 change；如果你传入父 change，它会先看 `active_subchange`，否则再按 `suggested_focus` / `recommended_order` / 唯一 subchange 路由。
- grouped change 执行 `opsx-archive` 时，默认归档的是当前 resolved subchange，目标应为顶层 `openspec/changes/archive/YYYY-MM-DD-<group>-<subchange>/`；不要在活动 group 下创建 `subchanges/archive/`。归档后父 group 只保留 `.openspec.group.yaml` 与 `subchanges/`；如果最后一个 subchange 也已归档，则直接删除父 group。
- 当前仓库不再维护 `.claude/commands/opsx/`。
- 项目内只保留 `openspec/` 状态；通用 runtime 由全局 `opsx` npm 包提供。
- 若其他旧文档仍出现 `/opsx:*`，请优先以 [支持的工具](supported-tools.md) 和 [工作流](workflows.md) 为准。

## 下一步

- [支持的工具](supported-tools.md)
- [工作流](workflows.md)
