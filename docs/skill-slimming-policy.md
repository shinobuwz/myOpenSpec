# Skill Slimming Policy

本仓库的 OPSX skills 采用渐进式披露：`SKILL.md` 是短入口，详细流程放入同 skill 的 `references/`。本政策落地 `/Users/cc/mySkills/skills/agent-standards/references/skill-design.md`，用于后续瘦身 `skills/opsx-*/SKILL.md`。

## `SKILL.md` 保留内容

每个 `SKILL.md` 只保留执行入口需要立即看到的信息：

- 触发条件：什么时候必须使用这个 skill。
- 职责边界：这个 skill 做什么、不做什么。
- 读写边界：允许读取、允许写入、禁止写入的文件或产物。
- 安全红线：不可违反的门控、错误退出、禁止行为。
- 快速入口：关键命令、核心步骤、必须先读的 reference。
- Reference 导航：指向同 skill `references/` 或 canonical source。
- 下游契约：完成后必须进入哪个 skill、输出什么状态或产物。

硬性规则必须留在入口文件中，不能只放在 reference 中。典型例子包括：`opsx-explore` 不写产品代码、gate skill 不跳过 `.openspec.yaml` gates、archive 不绕过 verify/review、完成声明必须有 fresh evidence。

## `references/` 承载内容

以下内容应迁出 `SKILL.md`，放入同 skill 的 `references/<topic>.md`：

- 长流程和分支流程。
- 完整 prompt 模板。
- 输出模板、报告模板、audit 模板。
- 大量示例和对话样例。
- 参数表、状态表、排错说明。
- 领域知识和长篇背景解释。
- 可按需读取的边界案例。

Reference 文件应围绕单一主题命名，使用 kebab-case，例如 `reviewer-prompt.md`、`report-template.md`、`lifecycle-rules.md`。

## Canonical Contract

公共契约只在 canonical source 中维护。其他 skill 只引用，不复制完整正文。

| 契约 | Canonical source | `SKILL.md` 中的写法 |
|------|------------------|---------------------|
| subagent 平台映射、controller boundary、fallback | `skills/common/subagent.md`，安装到 `~/.opsx/common/subagent.md` | “按 `~/.opsx/common/subagent.md` contract 执行” |
| StageResult schema、audit-log 格式 | `docs/stage-packet-protocol.md` | “输出 StageResult，格式见协议文档” |
| `.aiknowledge` lifecycle、source_refs、日志、tombstone | `.aiknowledge/README.md` | “写入前读取 `.aiknowledge/README.md`” |
| 通用 skill 设计准则 | `../agent-standards/references/skill-design.md` | 仅导航，不复制规则正文 |

如果必须在 `SKILL.md` 重申公共契约，只保留 stage-specific 差异和安全红线，不复制完整表格、schema 或示例。

## Workflow 边界

瘦身只改变文档布局，不改变 OPSX 工作流语义：

```text
opsx-explore -> opsx-slice -> opsx-plan -> opsx-plan-review
  -> opsx-tasks -> opsx-task-analyze -> opsx-implement
  -> opsx-verify -> opsx-review -> opsx-archive
```

不得借瘦身合并 skill、删除 gate、改变 StageResult、改变 review/verify 职责、改变 archive 前置条件。

## 尺寸策略

`SKILL.md` 的目标不是机械压缩到固定行数，而是保持可扫读。默认目标：

- `<= 120` 行：健康入口。
- `121-180` 行：可接受，但应避免继续增长。
- `181-240` 行：需要迁移长流程或模板。
- `> 240` 行：高优先级瘦身对象。

后续迁移完成后，可将检查阈值逐步收紧。

## 迁移顺序

优先迁移同时满足以下条件的文件：

- 行数高。
- 包含 prompt/template/example/lifecycle 长正文。
- 重复 `~/.opsx/common/subagent.md`、StageResult、`.aiknowledge` lifecycle 等 canonical contract。
- 后续 workflow skills 会频繁引用它。

迁移时保留原 frontmatter 的 `name` 和 `description`，保持中文正文风格，命令、路径、JSON key 保持原语言。
