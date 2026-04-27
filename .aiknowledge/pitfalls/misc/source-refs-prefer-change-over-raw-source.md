---
status: active
created_at: 2026-04-27
created_from: change:2026-04-27-aiknowledge-lifecycle
last_verified_at: 2026-04-27
last_verified_by: opsx-archive
verification_basis: archive
applies_to:
  - .aiknowledge
  - skills/opsx-knowledge/SKILL.md
  - skills/opsx-codemap/SKILL.md
source_refs:
  - change:2026-04-27-aiknowledge-lifecycle
superseded_by:
merged_from:
deprecated_reason:
---

# source_refs 优先引用 change，避免制造 raw source 目录

**标签**：aiknowledge, source_refs, lifecycle, log

## 现象

在为 `.aiknowledge` 设计生命周期时，容易把 raw source 设计成独立目录和标准流程，导致 agent 每次知识沉淀都额外复制 change、commit 或 review 中已经存在的事实。

## 根因

OpenSpec change 本身已经包含 proposal、design、specs、tasks、audit-log、test-report 和 review-report。再建立默认 raw source 目录会制造重复来源，并增加后续合并、废弃和审计成本。

## 修复前

```diff
- .aiknowledge/sources/README.md
- sources/ 中的 raw source 必须按追加模型维护
- 每次来源不稳定时新增 sources 摘录
```

## 修复后

```diff
+ source_refs 优先指向 change:<id>、commit:<sha>、audit-log:<path>、test-report:<path>、review-report:<path>
+ .aiknowledge/log.md 只作为日志索引
+ 审计记录写入 .aiknowledge/logs/YYYY-MM.md 月度分片
+ 不建立默认 .aiknowledge/sources/ 标准路径
```

## 要点

长期知识库需要来源引用和审计日志，但不应默认复制 raw source；change/commit/report 是默认事实来源，日志主要用于记录而不是日常消费。

## 来源

change: 2026-04-27-aiknowledge-lifecycle（2026-04-27）
