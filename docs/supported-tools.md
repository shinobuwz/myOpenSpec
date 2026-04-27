# 支持的工具

OpenSpec 支持全局 npm launcher 和全局 `~/.agents/skills` 安装。仓库内只保存 `openspec/` 状态。

## 工作原理

当前仓库采用 skills-first 工作流模型。全局 `opsx` 命令是薄 launcher：

1. **Launcher** — `opsx changes -p <repo> ...`、`opsx install-skills`、`opsx init-project -p <repo>`
2. **技能模板** — 可重用的 `opsx-*` 指令目录，位于包内 `skills/`
3. **项目状态** — 每个目标项目只保留 `openspec/config.yaml` 和 `openspec/changes/`

不再维护单独的 `.claude/commands/opsx/` 斜杠命令绑定层，也不把通用 runtime 复制到每个项目。

## 工具目录参考

| 工具 | 工作流入口 |
|------|------------------|
| Claude Code | 全局 `~/.agents/skills/opsx-*` 或项目 adapter `.claude/skills/opsx-*` |
| Codex | 复用同一 OPSX 文档与 skill 源，不提供单独 prompt 产物 |

## 安装方式

推荐安装全局入口和 skills：

```bash
npm install -g @shinobuwz/opsx
opsx install-skills
opsx init-project -p /path/to/repo
```

源码 checkout 调试：

```bash
./scripts/install-global.sh
./scripts/install-repos.sh /path/to/repo-a /path/to/repo-b
```

其中 `install-repos.sh` 只把 `skills/opsx-*` 同步为目标仓库 `.claude/skills/opsx-*` adapter，不同步 runtime scripts 或 schemas。

如果不需要安装，可跳过此步骤。

## 安装内容

当前仓库实际维护的 OPSX skill 为：

| 技能 | 用途 |
|-------|---------|
| `opsx-explore` | 探索思路的思考伙伴 |
| `opsx-slice` | 在 plan 前切分交付单元，判断是否需要多个 change |
| `opsx-bugfix` | 精简 bugfix 工作流 |
| `opsx-knowledge` | 独立沉淀可复用经验 |
| `opsx-plan` | 创建变更并生成 proposal / specs / design |
| `opsx-continue` | 恢复中断的当前 change，并路由到下一合法步骤 |
| `opsx-ff` | 一次性推进完整规划链路 |
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

推荐直接在对话中点名 skill，例如“请使用 `opsx-slice` 先判断怎么拆”、“请使用 `opsx-plan` 创建一个新变更”、“请使用 `opsx-continue` 恢复当前 change”或“继续用 `opsx-implement` 完成剩余任务”。

---

## 相关内容

- [工作流参考](workflows.md) — 默认主线、旁路与 gate 顺序
- [入门指南](getting-started.md) — 首次设置
