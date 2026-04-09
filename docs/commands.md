# OPSX 技能参考

本仓库当前采用 skills-only 工作流模型。项目内不再维护 `.claude/commands/opsx/` 斜杠命令层；工作流入口统一为 `.claude/skills/opsx-*/SKILL.md`。

## 如何使用

直接在对话中点名对应 skill 即可，例如：

```text
请使用 `opsx-plan` 为 dark mode 创建一个新变更
请继续用 `opsx-continue` 生成下一个制品
请使用 `opsx-apply` 完成剩余任务
请用 `opsx-verify` 检查当前实现
```

文中的 `opsx-*` 都是 skill ID，不是 slash command。

## 核心工作流

| Skill | 用途 | 典型时机 |
|------|------|------|
| `opsx-explore` | 探索问题、澄清需求、收敛方案 | 需求不明确、需要先调查 |
| `opsx-plan` | 创建 change，并生成 proposal / specs / design | 需求已明确，准备进入规划 |
| `opsx-plan-review` | 检查 specs 和 design 的 trace 一致性 | `opsx-plan` 后 |
| `opsx-tasks` | 生成带 trace 与执行模式标签的 `tasks.md` | plan-review 通过后 |
| `opsx-task-analyze` | 校验 tasks 与 design/specs 是否一致 | tasks 生成后 |
| `opsx-implement` | 逐项实施 `tasks.md` | 进入编码前 |
| `opsx-apply` | 以变更为中心推进实现与任务勾选 | 实施进行中 |
| `opsx-verify` | 三维验证实现与制品是否一致 | 实施完成后 |
| `opsx-review` | 独立代码审查 | verify 通过后 |
| `opsx-archive` | 归档变更、沉淀知识、更新 codemap | 收尾阶段 |

## 辅助技能

| Skill | 用途 |
|------|------|
| `opsx-bootstrap` | 会话启动引导，注入工作流优先级 |
| `opsx-bugfix` | 明确缺陷的轻量修复路径 |
| `opsx-knowledge` | 把一次工作沉淀到 `.aiknowledge/pitfalls/` |
| `opsx-codemap` | 维护 `.aiknowledge/codemap/` |
| `opsx-tdd` | 执行 test-first / characterization-first 循环 |
| `opsx-continue` | 基于当前 change 状态只前进一步 |
| `opsx-ff` | 一次性推进完整规划链路 |
| `opsx-auto-drive` | 自动驱动完整闭环 |

## 推荐路径

### 完整功能开发

```text
opsx-explore -> opsx-plan -> opsx-plan-review -> opsx-tasks
-> opsx-task-analyze -> opsx-implement / opsx-apply
-> opsx-verify -> opsx-review -> opsx-archive
```

### 直接进入规划

```text
opsx-plan -> opsx-plan-review -> opsx-tasks -> opsx-task-analyze
-> opsx-apply -> opsx-verify -> opsx-review -> opsx-archive
```

### 明确 bug 修复

```text
opsx-bugfix -> opsx-knowledge
```

## 约束说明

- `opsx-plan-review`、`opsx-task-analyze`、`opsx-verify` 是强制关卡。
- 当前仓库没有独立的 `opsx-sync`、`opsx-onboard`、`opsx-bulk-archive` 等 skill。
- 若文档中仍出现旧的 `/opsx:*` 示例，应以这里的 `opsx-*` skills 为准。

## 相关内容

- [工作流](workflows.md)
- [快速上手](getting-started.md)
- [CLI](cli.md)
