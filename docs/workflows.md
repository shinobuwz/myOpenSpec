# 工作流

当前仓库使用的是 skill-first OPSX 工作流。工作流由 `opsx-*` skills 驱动，不再依赖 `.claude/commands/opsx/`。

## 基本原则

- 行动单元是 skill，不是阶段化命令。
- 强制关卡写在 skill 本身里，以 skill 为真相源。
- 规划、任务、实现、验证可以串成闭环，但不再需要额外命令包装层。
- `change` 的默认粒度是**单一交付单元**；一个 change 下允许有多个 spec，但不应把多个可独立排期、独立上线的目标硬塞进同一个 change。
- 是否拆成多个 change，优先在 `opsx-plan` 的创建前和 proposal/specs 初稿后判断；`opsx-task-analyze` 只做超大 change 的兜底拦截。

## 公用知识如何共享

当前工作流中的“公用知识”分三层：

1. **项目级上下文**
   - `openspec/config.yaml` 的 `context:` 和 `rules:` 会为规划类产出物提供统一约束。

2. **长期共享知识**
   - `.aiknowledge/codemap/` 保存模块地图、关键文件和跨模块链路，供 `explore`、`plan`、`implement`、`bugfix` 复用。
   - `.aiknowledge/pitfalls/` 保存可复用经验，供 `plan`、`tdd`、`bugfix` 复用。
   - `archive` 结束时会强制回写 `knowledge` 和 `codemap`，让后续 workflow 继续复用这些知识。
   - 这两类知识都采用**事件驱动 freshness 管理**：命中时复核、漂移时标记 `stale`、被推翻时标记 `superseded`，而不是按时间自动过期。

3. **change 级共享事实（Stage Packet Protocol）**
   - `openspec/changes/<name>/context/knowledge-refs.md`
   - `openspec/changes/<name>/context/review-scope.md`
   - `openspec/changes/<name>/context/artifact-index.md`
   - `openspec/changes/<name>/test-report.md`
   - `openspec/changes/<name>/context/run-report-data.json`（stage packet + result 数据）
   - `openspec/changes/<name>/context/run-report.html`（HTML 报告）

   这些文件只作为当前 change 的声明层或留档层；权威源仍然是 `tasks.md`、`specs/`、`design.md`。

   在 gate review 中，`plan-review` 和 `verify` 使用 **Stage Packet Protocol**（详见 `docs/stage-packet-protocol.md`）：
   - **StagePacket**：assembler 从产出物中组装的只读事实快照，分为 `core_payload`（结构化摘要）和 `optional_refs`（文件路径引用），供 subagent 消费
   - **StageResult**：reviewer subagent 的结构化输出，包含 findings、metrics、decision
   - **Packet Budget**：soft limit 2K / hard limit 4K tokens，超限按固定顺序降维
   - **Lazy Hydration**：subagent 只能读取 packet 中列出的文件路径，禁止无边界全局扫描
   - **Single Reviewer**：每个 gate stage 固定使用 1 个 reviewer subagent，避免多 reviewer 汇总开销

   首版覆盖：plan-review 和 verify 两个 gate stage。按需使用 `/opsx:report` 生成 HTML 报告。

## 典型模式

### 1. 探索后落地

```text
opsx-explore
-> opsx-plan
-> opsx-plan-review
-> opsx-tasks
-> opsx-task-analyze
-> opsx-implement
-> opsx-verify
-> opsx-review
-> opsx-archive
```

适合：

- 需求不明确
- 需要先调查代码库
- 需要先做方案对比

### 2. 直接推进

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

适合：

- 功能边界已经明确
- 只需要快速进入规划和实现

### 3. 明确缺陷修复

```text
opsx-bugfix
-> opsx-knowledge
```

适合：

- 现象明确
- 影响范围小
- 不值得新建完整 change 文档

## 强制关卡

以下 skill 不能跳过：

- `opsx-plan-review`
- `opsx-task-analyze`
- `opsx-verify`

推荐顺序：

```text
plan -> plan-review -> tasks -> task-analyze -> implement -> verify -> review -> archive
```

## 示例

```text
你：请使用 `opsx-plan` 为 add-dark-mode 创建变更
AI：已生成 proposal / specs / design

你：请使用 `opsx-tasks`
AI：已生成 tasks.md，task-analyze 已通过

你：请使用 `opsx-implement`
AI：正在按 tasks.md 推进实现

你：请使用 `opsx-verify`
AI：验证通过

你：请使用 `opsx-review`
AI：审查完成，无阻断问题

你：请使用 `opsx-archive`
AI：已归档，知识与 codemap 已更新
```

## 选哪个 Skill

| 场景 | 推荐 skill |
|------|------------|
| 需求模糊，先聊思路 | `opsx-explore` |
| 创建新 change | `opsx-plan` |
| 恢复中断的当前 change | `opsx-continue` |
| 一次性推进完整规划 | `opsx-ff` |
| 开始主线实施 | `opsx-implement` |
| 做最终一致性检查 | `opsx-verify` |
| 归档 | `opsx-archive` |
| 快速修复 bug | `opsx-bugfix` |

## 注意

- 当前仓库没有独立的 `opsx-sync`、`opsx-onboard`、`opsx-bulk-archive` skill。
- `opsx-continue` 不再维护独立状态机；它只读取真实文件状态和 `gates.*` 来恢复流程。
- 如需判断当前真相源，请优先看 `.claude/skills/opsx-*/SKILL.md`。
