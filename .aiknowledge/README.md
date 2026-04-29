# AI 知识生命周期

`.aiknowledge` 是给 agent 渐进式加载的长期知识库。它分为三层：

1. **Source references（来源引用）**：事实来源的稳定引用。默认使用 `change:<id>`、`fast:<id>`、`commit:<sha>`、`audit-log:<path>`、`review-report:<path>` 等现有产物作为来源，不复制一份 raw source。
2. **LLM-maintained wiki（模型维护知识层）**：可维护知识层，包括 `codemap/` 和 `pitfalls/`。这层可以更新、合并、废弃，但必须保留来源和审计记录。
3. **Schema / guardrails（结构与护栏）**：本文件、各级 `index.md`、skill 规则和 lint 自检，约束 agent 如何维护知识。

## 语言规则

`.aiknowledge` 的正文、日志摘要、lite-run 说明默认使用中文，除非用户明确要求英文。路径、命令、配置键名、frontmatter key、JSON key、状态枚举和稳定标识符保持原文。

## 目录

```
.aiknowledge/
├── README.md                 # 生命周期契约
├── log.md                    # 审计日志索引
├── logs/
│   └── YYYY-MM.md            # append-only 月度审计日志
├── lite-runs/
│   └── YYYY-MM/              # 历史 lite-run 留档；新增运行状态写 openspec/fast/
├── codemap/                  # 架构地图
└── pitfalls/                 # 经验知识库
```

## 状态机

| 状态 | 含义 | 消费规则 |
|------|------|----------|
| `active` | 当前可直接作为约束输入 | 可以直接用于设计、实现和审查 |
| `stale` | 可能漂移，需要复核 | 只能作为线索，依赖前必须刷新 |
| `superseded` | 已被新条目替代 | 默认跳转到 `superseded_by` |
| `deprecated` | 历史保留，不再参与当前决策 | 只用于追溯，不作为约束 |

## 标准 Frontmatter

`codemap/` 与 `pitfalls/` 下的正式条目应尽量包含：

```yaml
---
status: active
created_at: YYYY-MM-DD
created_from: change:<change-id> | fast:<fast-id> | commit:<sha> | source:<source-id> | metadata-backfill
last_verified_at: YYYY-MM-DD
last_verified_by: opsx-knowledge | opsx-codemap | opsx-archive | opsx-fast
verification_basis: archive | bugfix | review | repository-audit | codemap-refresh
applies_to:
  - path/or/module
source_refs:
  - change:<change-id>
  - fast:<fast-id>
  - commit:<sha>
superseded_by:
merged_from:
deprecated_reason:
---
```

旧条目可以逐步补齐，不要求一次性批量迁移。

## 来源引用

OpenSpec change 和 fast item 本身就是默认事实来源。知识条目的 `source_refs` 应优先引用：

- `change:<id>`：首选，包含 proposal/design/spec/tasks/audit/test/review 等上下文。
- `fast:<id>`：快速工作项来源，包含 item/evidence/root-cause/test/audit/review 等上下文。
- `commit:<sha>`：代码事实来源。
- `audit-log:<path>`：stage 决策来源。
- `test-report:<path>`：验证事实来源。
- `review-report:<path>`：审查事实来源。
- `lite-run:<id>`：历史 lite-run 事实留档；仅用于追溯旧记录，新增工作流状态不再使用。

不要为了“raw source”重复复制 change 内容。只有来源无法稳定定位且确实需要保留时，才考虑新增单独摘录；当前仓库不建立默认 `sources/` 标准路径。

## Lite Runs（历史轻量运行记录）

`.aiknowledge/lite-runs/` 仅保留历史 `opsx-lite` 事实记录。新增快速工作项必须写入 `openspec/fast/<id>/`，并通过 `fast:<id>` 作为知识来源引用。

lite-run 只记录实际发生的事实，自然语言默认使用中文：
- 意图
- 范围
- 变更
- 验证
- 风险
- 知识沉淀

lite-run 不包含 proposal/design/spec/tasks/gates，不参与当前状态流；不要新增 lite-run 承接 workflow runtime 状态。

## 生命周期操作

### 更新

当原条目仍成立，只是补充证据或刷新验证：

- 保持 `status: active`。
- 刷新 `last_verified_at`、`last_verified_by`、`verification_basis`。
- 追加或修正 `source_refs`。
- 更新对应 L1/L2 index。
- 追加当前月度日志，例如 `.aiknowledge/logs/2026-04.md`。

### 合并

当两个正式索引过的条目表达同一规则：

- 选择命名更稳定、内容更完整的条目作为 canonical。
- 将另一条目标记为 `superseded`，填写 `superseded_by`。
- 在 canonical 条目的 `merged_from` 记录来源条目。
- 保留被合并条目作为 tombstone，禁止默认删除。

只有未被索引、未被引用、从未正式消费的孤儿文件，才允许合并后删除。

### 替代

当旧规则被新规则取代：

- 旧条目标记为 `superseded`。
- 填写 `superseded_by` 指向新条目。
- index 保留旧条目，但状态必须同步。

### 废弃

当旧经验不再适用且没有直接替代：

- 标记为 `deprecated`。
- 填写 `deprecated_reason`。
- index 保留旧条目，但默认不参与当前决策。

### 校验

每次维护 `.aiknowledge` 后，至少检查：

- L1/L2 index 是否引用不存在文件。
- 条目文件是否缺关键 frontmatter。
- `superseded_by` 是否指向真实文件或稳定条目 ID。
- `active` 条目之间是否表达明显冲突规则。
- 是否存在未索引孤儿文件。
- index 中 Active/Stale/Superseded 计数是否与实际条目一致。

## 审计日志

每次新增、更新、合并、废弃或 lint 修复知识后，必须向当前月度日志追加记录，并在 `.aiknowledge/log.md` 中保留该 shard 的链接：

自然语言字段必须用中文填写：

```md
## YYYY-MM-DDTHH:MM:SSZ | <operation> | <agent-or-skill>
- target: <path-or-id>
- source_refs: <change/commit/source refs>
- summary: <中文一句话摘要>
- reason: <中文说明为什么需要本次维护>
```

月度日志是 append-only。除修复格式损坏外，不重写历史记录。Agent 日常消费知识时不需要读取历史日志；日志主要用于审计。
