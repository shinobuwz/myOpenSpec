# 支持的工具

OpenSpec 支持 Claude Code 和 Codex 两种 AI 编码助手。当您运行 `openspec-cn init` 时，系统会提示您选择使用的工具，OpenSpec 将配置相应的集成。

## 工作原理

对于您选择的每个工具，OpenSpec 会安装：

1. **技能** — 可重用的指令文件，用于驱动 `/opsx:*` 工作流命令
2. **命令** — 特定于工具的斜杠命令绑定

## 工具目录参考

| 工具 | 技能位置 | 命令位置 |
|------|-----------------|-------------------|
| Claude Code | `.claude/skills/` | `.claude/commands/opsx/` |
| Codex | `.codex/skills/` | `~/.codex/prompts/`\* |

\* Codex 命令安装到全局主目录（`~/.codex/prompts/` 或 `$CODEX_HOME/prompts/`），而不是项目目录。

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

对于每个工具，OpenSpec 默认会生成完整工作流所需的 23 个技能文件：

| 技能 | 用途 |
|-------|---------|
| `openspec-explore` | 探索思路的思考伙伴 |
| `openspec-bugfix` | 精简 bugfix 工作流 |
| `openspec-knowledge` | 独立沉淀可复用经验 |
| `openspec-new-change` | 开始新的变更 |
| `openspec-continue-change` | 创建下一个制品 |
| `openspec-ff-change` | 快速跳过所有规划制品 |
| `openspec-apply-change` | 实施任务 |
| `openspec-verify-change` | 验证实施完整性 |
| `openspec-sync-specs` | 将增量规范同步到主线（可选—如需要可归档提示词） |
| `openspec-archive-change` | 归档已完成的变更 |
| `openspec-bulk-archive-change` | 一次归档多个变更 |
| `openspec-onboard` | 通过完整工作流周期的引导式入职 |
| `openspec-bootstrap` | 会话启动时的工作流引导 |
| `openspec-brainstorm` | 需求澄清与方案脑暴 |
| `openspec-plan` | 生成带 trace 的增强规划制品 |
| `openspec-plan-review` | 校验 spec、plan、task 的一致性 |
| `openspec-tdd` | 测试先行与特征固化策略 |
| `openspec-implement` | 按 trace 和执行模式逐项实施 |
| `openspec-verify-enhanced` | 增强版三维验证检查 |
| `openspec-review` | 独立代码审查 |
| `openspec-ship` | 归档上线闭环 |
| `openspec-auto-drive` | 自动驱动完整工作流 |

这些技能中，OPSX 命令对应的 slash command 仍然通过 `/opsx:new`、`/opsx:apply` 等触发；其余增强型 skill 作为默认安装的工作流能力存在，用于补足更细粒度的规划、TDD、审查与交付闭环。完整列表请参阅[命令](commands.md)。

---

## 相关内容

- [CLI 参考](cli.md) — 终端命令
- [命令](commands.md) — 斜杠命令和技能
- [入门指南](getting-started.md) — 首次设置
