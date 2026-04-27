## 为什么

当前 `.aiknowledge` 已经有 codemap / pitfalls 两类长期知识和分层索引，但知识生命周期规则分散在 skill 文案中，缺少统一 schema、来源层、审计日志和明确的合并/废弃语义。结果是 agent 在沉淀知识时容易出现三类问题：

- 直接覆盖 LLM 维护层，无法追溯结论来自哪次 change、commit 或 review。
- 合并相似条目时倾向删除历史文件，长期看会丢失引用和决策脉络。
- `active/stale/superseded/deprecated` 状态存在，但缺少跨 codemap 与 pitfalls 的统一状态机和 lint 规则。

本变更基于 Karpathy LLM Wiki 的思路，将 `.aiknowledge` 明确拆为 source references、LLM-maintained wiki、schema/guardrail 三层，并把更新、合并、废弃规则固化到维护 skill 中。OpenSpec change 和 commit 是默认事实来源，不额外复制 raw source。

## 变更内容

- 为 `.aiknowledge` 增加统一维护说明，定义 source references、月度 log、状态机、frontmatter 字段和 lifecycle 操作。
- 增加 `.aiknowledge/log.md` 作为日志索引，并使用 `.aiknowledge/logs/YYYY-MM.md` 作为 append-only 月度审计日志。
- 更新 `opsx-knowledge`，使 pitfalls 维护遵循 source refs、append-only log、merge tombstone、deprecate reason 和 lint 自检规则。
- 更新 `opsx-codemap`，使 codemap 维护遵循同一套 source/log/status 语义，避免架构地图被静默覆盖。

## 功能 (Capabilities)

### 新增功能
- `aiknowledge-lifecycle`: `.aiknowledge` 必须提供统一的知识生命周期 schema，包括 source references、审计日志、状态机、合并和废弃规则。

### 修改功能
- `openspec-skills`: `opsx-knowledge` 与 `opsx-codemap` 的维护规则必须消费并维护 `.aiknowledge` lifecycle，而不是各自隐式定义知识更新语义。

## 影响

- 影响文档：`.aiknowledge/README.md`、`.aiknowledge/log.md`、`.aiknowledge/logs/YYYY-MM.md`。
- 影响 skill：`skills/opsx-knowledge/SKILL.md`、`skills/opsx-codemap/SKILL.md`。
- 影响长期知识：`.aiknowledge/codemap/openspec-skills.md` 需要记录新的知识生命周期约束。
- 不引入新的复杂 CLI，不改变 `opsx changes` 的运行时行为。
