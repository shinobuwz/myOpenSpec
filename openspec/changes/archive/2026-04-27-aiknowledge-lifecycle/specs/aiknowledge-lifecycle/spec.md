## 新增需求

### 需求: 顶层生命周期契约
**Trace**: R1
**Slice**: aiknowledge/schema
`.aiknowledge` 必须提供顶层维护契约，说明 source references、LLM 维护层、schema/guardrail 的职责边界。

#### 场景: Agent 进入知识维护流程
- **当** agent 需要更新 `.aiknowledge/codemap/` 或 `.aiknowledge/pitfalls/`
- **那么** agent 能先通过 `.aiknowledge/README.md` 理解来源、状态、合并、废弃和日志规则

### 需求: Append-only 审计日志
**Trace**: R2
**Slice**: aiknowledge/log
`.aiknowledge` 必须提供 append-only 审计日志入口，知识维护 skill 在新增、更新、合并、废弃或 lint 修复后必须追加到当前时间分片日志。

#### 场景: 知识条目被合并
- **当** 一个正式知识条目被合并到另一个条目
- **那么** `.aiknowledge/logs/YYYY-MM.md` 包含 merge 操作、来源、目标和理由，且 `.aiknowledge/log.md` 能索引到该日志分片

### 需求: Change 作为默认事实来源
**Trace**: R3
**Slice**: aiknowledge/source-refs
OpenSpec change、commit、audit-log、test-report 和 review-report 必须作为默认事实来源，禁止为了 raw source 目的重复复制 change 内容。

#### 场景: 需要记录来源
- **当** agent 需要为知识条目记录来源
- **那么** agent 优先写入 `source_refs` 指向 change、commit 或 report，而不是创建额外 source 文件

### 需求: 合并保留 Tombstone
**Trace**: R4
**Slice**: aiknowledge/merge
正式索引过的知识条目被合并时，必须保留 tombstone 或 superseded 条目，禁止默认删除历史文件。

#### 场景: 两个 pitfalls 条目表达同一规则
- **当** agent 判断它们应合并
- **那么** agent 保留一个 canonical 条目，并将另一个标记为 `superseded` 且填写替代目标

### 需求: 维护 skill 消费生命周期契约
**Trace**: R5
**Slice**: skills/aiknowledge
`opsx-knowledge` 与 `opsx-codemap` 必须读取并遵守 `.aiknowledge` lifecycle，且在完成写入前执行索引一致性和状态引用自检。

#### 场景: opsx-knowledge 写入经验
- **当** `opsx-knowledge` 新增、更新、合并或废弃 pitfalls 条目
- **那么** 它同步更新索引、追加审计日志，并检查状态引用是否有效

## 修改需求

### 需求: OpenSpec skills 维护长期知识
**Trace**: R6
**Slice**: openspec-skills/aiknowledge
OpenSpec skills 的 codemap 必须记录 `opsx-knowledge` 和 `opsx-codemap` 依赖 `.aiknowledge` lifecycle 的约束。

#### 场景: 后续 agent 调研 knowledge/codemap skill
- **当** agent 读取 `.aiknowledge/codemap/openspec-skills.md`
- **那么** 它能定位 `.aiknowledge/README.md`、`.aiknowledge/log.md` 和受影响 skill 文件

## 移除需求

无。
