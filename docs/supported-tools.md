# 支持的工具

OpenSpec 支持全局 npm launcher、全局 `~/.agents/skills` skill 安装和全局 `~/.opsx/common` 公共契约安装。仓库内只保存 `openspec/` 状态。

## 工作原理

当前仓库采用 skills-first 工作流模型。全局 `opsx` 命令是薄 launcher：

1. **Launcher** — `opsx changes -p <repo> ...`、`opsx install-skills`、`opsx init-project -p <repo>`
2. **技能模板** — 可重用的 `opsx-*` 指令目录，安装到 `~/.agents/skills`
3. **公共契约** — 不直接触发的 workflow contract，安装到 `~/.opsx/common`
4. **Runtime 模板** — schema 和 artifact templates 保留在包内 `runtime/schemas`，由 CLI 初始化命令读取
5. **项目状态** — 每个目标项目只保留 `openspec/config.yaml`、`openspec/changes/` 和 `openspec/fast/`

不再维护单独的 `.claude/commands/opsx/` 斜杠命令绑定层，也不把通用 runtime 复制到每个项目。

## 工具目录参考

| 工具 | 工作流入口 |
|------|------------------|
| Codex | 默认入口。全局 `~/.agents/skills/opsx-*`；subagent 语义按 `spawn_agent` / `wait_agent` / `close_agent` 执行 |
| Claude Code | 兼容入口。全局 `~/.agents/skills/opsx-*` 或项目 adapter `.claude/skills/opsx-*`；subagent 语义按 `Task` tool 执行 |

## Subagent 适配约定

OPSX 的 canonical workflow 文案以 Codex 为默认解释，同时保留 Claude Code 可执行的等价语义。skill 中出现“启动 / 派遣 subagent”时，按下表映射：

| Skill 语义 | Codex 默认 | Claude Code 等价 |
|------------|------------|------------------|
| 启动通用实施 / 审查 subagent | `spawn_agent(agent_type="worker", message=...)` | `Task` tool，`subagent_type: "general-purpose"` |
| 启动探索 subagent | `spawn_agent(agent_type="explorer", message=...)` | `Task` tool，`subagent_type: "Explore"` |
| 等待结果 | `wait_agent` | `Task` 返回结果 |
| 释放完成的 agent | `close_agent` | 无需显式释放 |
| 任务状态跟踪 | `update_plan` | `TodoWrite` |

OPSX 不依赖 Claude 的 named agent registry，也不维护单独的 Codex prompt 产物。需要 reviewer / implementer 时，主 agent 将 skill 内的 prompt 模板或上下文填入 `message` 后派发；Claude Code 可用同一段 prompt 作为 `Task` 内容。

职责类型和默认模型推荐也由 `~/.opsx/common/subagent.md` 维护。当前约定是：简单检索和证据摘要走 `retrieval-explorer` / `gpt-5.3-codex`，明确实现任务走 `implementation-worker` / `gpt-5.4`，gate 或发布风险审查走 `gate-reviewer` / `gpt-5.5`，长上下文审计走 `long-running-auditor` / `gpt-5.2`。具体 prompt 仍由触发的 workflow skill 注入。

详细的 controller 权限、写入边界、status 处理、reviewer 结果、模型升级/降级和 fallback 规则由 `~/.opsx/common/subagent.md` 作为 canonical contract 维护。

## 安装方式

推荐安装全局入口和 skills：

```bash
npm install -g @shinobuwz/opsx
opsx init-project -p /path/to/repo
```

全局 npm 安装会通过 best-effort `postinstall` 自动同步 `~/.agents/skills/opsx-*` 和 `~/.opsx/common`。如需跳过该步骤，设置 `OPSX_SKIP_POSTINSTALL=1`；如需重新同步，运行 `opsx install-skills`。

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
| `opsx-fast` | 统一快速通道，使用 `source_type: lite | bugfix` 标记低风险小改动或明确缺陷修复来源 |
| `opsx-knowledge` | 独立沉淀可复用经验 |
| `opsx-plan` | 创建变更并生成 proposal / specs / design |
| `opsx-verify` | 验证实现与制品是否一致 |
| `opsx-archive` | 归档已完成的变更 |
| `opsx-report` | 从 audit-log / test-report / review-report 生成 HTML 报告 |
| `opsx-plan-review` | 校验 spec、plan、task 的一致性 |
| `opsx-tdd` | 测试先行与特征固化策略 |
| `opsx-implement` | 按 trace 和执行模式逐项实施 |
| `opsx-review` | 独立代码审查 |
| `opsx-task-analyze` | 校验 tasks 与 design/specs 是否对齐 |
| `opsx-tasks` | 生成带 trace 与执行模式标签的 tasks.md |
| `opsx-codemap` | 维护 `.aiknowledge/codemap/` |
| `opsx-auto-drive` | 自动驱动完整工作流 |

当前仓库实际维护的公共 contract 为：

| 公共契约 | 用途 |
|----------|------|
| `~/.opsx/common/git-lifecycle.md` | change branch、checkpoint、归档 merge 和分支清理规则 |
| `~/.opsx/common/subagent.md` | Codex 默认、Claude 兼容的 subagent 派发契约 |
| `~/.opsx/common/subagent-lifecycle.md` | subagent roster、复用、关闭和容量策略 |

Runtime templates 不安装到 `~/.opsx`。它们保留在 npm 包内 `runtime/schemas`，由 `opsx` CLI 负责 materialize；例如 `opsx fast init <id> --source-type lite|bugfix` 会创建 fast item 所需文件。

推荐直接在对话中点名 skill，例如“请使用 `opsx-slice` 先判断怎么拆”、“请使用 `opsx-plan` 创建一个新变更”或“继续用 `opsx-implement` 完成剩余任务”。恢复中断的 change 时，先运行 `opsx changes status` 查看 `Next:`，再点名对应 skill。

---

## 相关内容

- [工作流参考](workflows.md) — 默认主线、旁路与 gate 顺序
- [入门指南](getting-started.md) — 首次设置
