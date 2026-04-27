# 工作流

当前仓库使用的是 skill-first OPSX 工作流。工作流由 `opsx-*` skills 驱动，不再依赖 `.claude/commands/opsx/`。

## 基本原则

- 行动单元是 skill，不是阶段化命令。
- 强制关卡写在 skill 本身里，以 skill 为真相源。
- 每个 skill 必须明确声明自己读取哪些上游产物、写入哪些自身产物。
- 规划、任务、实现、验证可以串成闭环，但不再需要额外命令包装层。
- `change` 的默认粒度是**单一交付单元**；一个 change 下允许有多个 spec，但不应把多个可独立排期、独立上线的目标硬塞进同一个 change。
- 多模块、全栈、多 capability 需求，优先使用 `opsx-slice` 做切分，再进入 `opsx-plan`。
- 是否拆成多个 change，优先在 `opsx-slice` 和 `opsx-plan` 的 proposal/specs 初稿后判断；`opsx-task-analyze` 只做超大 change 的兜底拦截。
- 共享状态保持最小化：可从权威产物稳定重建的内容，不应再缓存成中间知识。

## 公用知识如何共享

当前工作流中的“公用知识”分三层：

1. **项目级上下文**
   - `openspec/config.yaml` 的 `context:` 和 `rules:` 会为规划类产出物提供统一约束。

2. **长期共享知识**
   - `.aiknowledge/codemap/` 保存模块地图、关键文件和跨模块链路，供 `explore`、`slice`、`plan`、`implement`、`bugfix` 复用。
   - `.aiknowledge/pitfalls/` 保存可复用经验，供 `slice`、`plan`、`tdd`、`bugfix` 复用。
   - `archive` 结束时会强制回写 `knowledge` 和 `codemap`，让后续 workflow 继续复用这些知识。
   - 这两类知识都采用**事件驱动 freshness 管理**：命中时复核、漂移时标记 `stale`、被推翻时标记 `superseded`，而不是按时间自动过期。

3. **change 级运行状态与留档**

   change 运行期间产生的共享文件：

   | 文件 | 写入者 | 消费者 | 说明 |
   |------|--------|--------|------|
   | `.openspec.group.yaml` | slice / continue / archive | slice / plan / continue | 父 change 的最小拓扑与路由状态；保存 `execution_mode`、`recommended_order`、`suggested_focus` 及可选 `active_subchange` |
   | `.openspec.yaml` | slice / plan / plan-review / task-analyze / verify / review | continue / tasks / implement / verify / review / archive / report | subchange 的 common config；只保存 schema / gates 等最小状态 |
   | `test-report.md` | opsx-tdd（红/绿/重构追加） | opsx-verify（检查存在性与完整性） | TDD 任务的实时测试留档；无 TDD 任务时不产出 |
   | `audit-log.md` | opsx-plan-review、opsx-task-analyze、opsx-verify（追加） | opsx-report（渲染 HTML） | 各 gate stage 链路正确性校验留档；pass 和 fail 均追加写入 |
   | `review-report.md` | opsx-review（追加） | opsx-report（渲染 HTML） | 代码审查结论留档；与结构符合性审查分开存放 |
   | `run-report.html` | opsx-report | 人工阅读 | self-contained HTML 报告，按需生成 |

   grouped change 场景下，父级只保留 `.openspec.group.yaml` 这个最小路由状态；subchange 下的 `proposal.md`、`specs/`、`design.md`、`tasks.md`、`test-report.md` 和代码本身仍是权威源。执行 `archive` 时，归档单元默认也是 resolved subchange root，目标落在顶层 `openspec/changes/archive/<archive-dir>/`；若 `<group>-<subchange>` 已带 `YYYY-MM-DD-` 前缀则不再重复加日期。不得在活动父 group 下创建 `subchanges/archive/`。若仍有剩余 subchange，父 group 会被清理为只剩 `.openspec.group.yaml` 与 `subchanges/`；若最后一个 subchange 也归档完成，则直接删除父 group 目录。

   **Gate Review Protocol**（详见 `docs/stage-packet-protocol.md`）：

   - reviewer subagent 直接读取上游权威产物（specs/、design.md、tasks.md、代码文件），不经过 JSON 中间层
   - **StageResult**：reviewer subagent 的结构化输出（decision / findings / metrics）
   - 审查结论追加写入 `audit-log.md`（plan-review / task-analyze / verify）或 `review-report.md`（review）
   - **Single Reviewer**：每个 gate stage 固定 1 个 reviewer subagent，不做多 reviewer 仲裁

   按需使用 `/opsx-report` 从 `audit-log.md`、`test-report.md`、`review-report.md` 生成 HTML 报告。

## 典型模式

### 1. 探索后落地

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

适合：

- 需求不明确
- 需要先调查代码库
- 需要先做方案对比

### 2. 先切分再推进

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

适合：

- 需求已经明确，但 scope 涉及多个模块
- 需要先判断是一个 change 还是多个 change
- 不希望把多个独立交付单元硬塞进同一个计划

### 3. 直接推进

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

### 4. 明确缺陷修复

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
slice -> plan -> plan-review -> tasks -> task-analyze -> implement -> verify -> review -> archive
```

## 示例

```text
你：请使用 `opsx-slice` 看看 lucky-guess 应该怎么拆
AI：已创建父 change `2026-04-14-lucky-guess`，并写入 execution_mode=serial、recommended_order=01-mvp,02-tasks,03-rank

你：请使用 `opsx-plan` 为 2026-04-14-lucky-guess 继续规划
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
| 全栈 / 多模块需求，先判断怎么拆 | `opsx-slice` |
| 创建新 change | `opsx-plan` |
| 恢复中断的当前 change | `opsx-continue` |
| 一次性推进完整规划 | `opsx-ff` |
| 开始主线实施 | `opsx-implement` |
| 做最终一致性检查 | `opsx-verify` |
| 归档 | `opsx-archive` |
| 快速修复 bug | `opsx-bugfix` |

## 注意

- 当前仓库没有独立的 `opsx-sync`、`opsx-onboard`、`opsx-bulk-archive` skill。
- `opsx-continue` 不再维护独立状态机；它只读取 group/subchange 的真实文件状态和 `gates.*` 来恢复流程。
- 如需判断当前真相源，请优先看 `skills/opsx-*/SKILL.md`。
