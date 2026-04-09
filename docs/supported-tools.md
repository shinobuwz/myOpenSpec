# 支持的工具

OpenSpec 支持 Claude Code 和 Codex 两种 AI 编码助手。当您运行 `openspec-cn init` 时，系统会提示您选择使用的工具，OpenSpec 将配置相应的集成。

## 工作原理

当前仓库采用 skills-only 工作流模型。项目内只维护一套本地 skill 源：

1. **技能** — 可重用的 `opsx-*` 指令目录，位于 `.claude/skills/`
2. **辅助脚本** — 位于 `.claude/bin/`，供 skill 在本地仓库内调用

不再维护单独的 `.claude/commands/opsx/` 斜杠命令绑定层。

## 工具目录参考

| 工具 | 项目内工作流入口 |
|------|------------------|
| Claude Code | `.claude/skills/opsx-*/SKILL.md` |
| Codex | 复用同一仓库内的 OPSX 文档与 skill 源，不提供单独 prompt 产物 |

## 非交互式设置

对于 CI/CD 或脚本化设置，使用 `--tools` 标志：

```bash
# 配置特定工具
openspec-cn init --tools claude,codex

# 配置所有支持的工具
openspec-cn init --tools all

# 跳过工具配置
openspec-cn init --tools none
```

**可用的工具 ID：** `claude`, `codex`

## 安装内容

当前仓库实际维护的 OPSX skill 为：

| 技能 | 用途 |
|-------|---------|
| `opsx-explore` | 探索思路的思考伙伴 |
| `opsx-bugfix` | 精简 bugfix 工作流 |
| `opsx-knowledge` | 独立沉淀可复用经验 |
| `opsx-plan` | 创建变更并生成 proposal / specs / design |
| `opsx-continue` | 创建下一个制品 |
| `opsx-ff` | 一次性推进完整规划链路 |
| `opsx-apply` | 实施任务 |
| `opsx-verify` | 验证实现与制品是否一致 |
| `opsx-archive` | 归档已完成的变更 |
| `opsx-bootstrap` | 会话启动时的工作流引导 |
| `opsx-plan-review` | 校验 spec、plan、task 的一致性 |
| `opsx-tdd` | 测试先行与特征固化策略 |
| `opsx-implement` | 按 trace 和执行模式逐项实施 |
| `opsx-review` | 独立代码审查 |
| `opsx-task-analyze` | 校验 tasks 与 design/specs 是否对齐 |
| `opsx-tasks` | 生成带 trace 与执行模式标签的 tasks.md |
| `opsx-codemap` | 维护 `.aiknowledge/codemap/` |
| `opsx-auto-drive` | 自动驱动完整工作流 |

推荐直接在对话中点名 skill，例如“请使用 `opsx-plan` 创建一个新变更”或“继续用 `opsx-apply` 完成剩余任务”。完整列表请参阅 [技能参考](commands.md)。

---

## 相关内容

- [CLI 参考](cli.md) — 终端命令
- [技能参考](commands.md) — OPSX skills 与用法
- [入门指南](getting-started.md) — 首次设置
