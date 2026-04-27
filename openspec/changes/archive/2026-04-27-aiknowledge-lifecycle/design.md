## 上下文

`.aiknowledge` 当前由两类 LLM 维护层组成：

- `.aiknowledge/codemap/`：架构地图，记录模块边界、关键文件和跨模块链路。
- `.aiknowledge/pitfalls/`：经验知识库，记录可复用踩坑经验。

两者已经采用 index-first、事件驱动 freshness 和 `active/stale/superseded/deprecated` 状态，但规则仍分散在各自 skill 中。需要一个轻量的统一 lifecycle，使后续 agent 能稳定完成“更新、合并、废弃”，同时保留来源和审计轨迹。

## 目标 / 非目标

**目标：**
- 为 `.aiknowledge` 增加顶层 lifecycle schema，统一 source references、LLM 维护层、审计日志和状态机。
- 将 merge/deprecate/update 的判断规则写入 `opsx-knowledge` 和 `opsx-codemap`。
- 保留现有 index-first 和分层披露模型，不引入数据库或复杂检索服务。

**非目标：**
- 不实现复杂 `opsx knowledge lint` CLI。
- 不批量重写现有所有知识条目。
- 不改变 OpenSpec change runtime 或 gates 数据结构。

## 需求追踪

- [R1] -> [U1]
- [R2] -> [U1]
- [R3] -> [U2]
- [R4] -> [U2]
- [R5] -> [U3]
- [R6] -> [U3]

## 实施单元

### [U1] 知识生命周期 schema
- 关联需求: [R1], [R2]
- 模块边界:
  - `.aiknowledge/README.md`
- `.aiknowledge/log.md`
- `.aiknowledge/logs/YYYY-MM.md`
- 验证方式: 人工检查文档是否覆盖 source refs/log/status/merge/deprecate/lint 规则，且不要求外部服务。
- 知识沉淀: change/commit/report 是默认 source refs，wiki 可演化但必须保留来源引用。

### [U2] Skill lifecycle 约束
- 关联需求: [R3], [R4]
- 模块边界:
  - `skills/opsx-knowledge/SKILL.md`
  - `skills/opsx-codemap/SKILL.md`
- 验证方式: 检查两个 skill 均要求读取 `.aiknowledge/README.md`、追加月度日志 `.aiknowledge/logs/YYYY-MM.md`，并定义 merge/deprecate/supersede 行为。
- 知识沉淀: 合并正式条目时保留 tombstone，不能静默删除历史。

### [U3] Codemap 更新
- 关联需求: [R5], [R6]
- 模块边界:
  - `.aiknowledge/codemap/openspec-skills.md`
- 验证方式: 检查 codemap 记录 `.aiknowledge` lifecycle 对 skills 的约束和入口文件。
- 知识沉淀: skill 规则变化后必须同步刷新 codemap，避免 skill 行为与架构认知漂移。

## 决策

1. 使用 `.aiknowledge/README.md` 作为 schema 和维护契约入口，而不是新建 runtime 配置文件。理由是当前知识库是 Markdown-first，agent 可以直接读取并遵守。
2. 使用 `.aiknowledge/log.md` 作为日志索引，实际日志按月写入 `.aiknowledge/logs/YYYY-MM.md`。理由是日志主要用于记录和审计，日常不需要读取，分片后单文件不会无限膨胀。
3. 不建立默认 `sources/` 标准路径。理由是很多来源已经由 commit/change/review 文件承载，强制复制会制造冗余。
4. 合并正式条目时默认保留 tombstone。只有从未索引、未被引用的孤儿文件，才允许合并后删除。

## 风险 / 权衡

- 规则增加会提高 skill 文案复杂度，但这是维护长期知识一致性的必要成本。
- 不做 CLI lint 会依赖 agent 执行自检，短期足够；未来如果重复出现索引漂移，再单独实现轻量 lint 命令。
- 旧条目 frontmatter 不会在本变更中批量补齐，避免制造大规模低价值 diff。

## 知识沉淀

归档时应沉淀一条 pitfall：知识库合并时不应默认删除历史文件，正式条目应通过 superseded/tombstone 保留引用稳定性。
