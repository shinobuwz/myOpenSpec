## 新增需求

### 需求:StagePacket 基础结构
**Trace**: R1
**Slice**: stage-packet/base-structure
系统必须定义 StagePacket 基础 schema，包含以下必填字段：`version`（固定为 1）、`run_id`、`change_id`、`stage`、`packet_id`、`created_at`、`producer`。payload 必须分为 `core_payload`（所有 consumer 必读）和 `optional_refs`（按需回读引用）两层，schema 中必须显式标注每个字段所属层级。

#### 场景:组装一个合法的 StagePacket
- **当** assembler 为某阶段构建 StagePacket
- **那么** 输出的 JSON 必须包含所有必填字段
- **并且** `core_payload` 和 `optional_refs` 必须是两个独立的顶层键

#### 场景:缺少必填字段
- **当** StagePacket 缺少任一必填字段
- **那么** consumer 必须拒绝该 packet 并报错，不得静默降级

### 需求:StageResult 基础结构
**Trace**: R2
**Slice**: stage-packet/result-structure
系统必须定义 StageResult 基础 schema，包含以下必填字段：`version`（固定为 1）、`run_id`、`change_id`、`stage`、`packet_id`、`agent_role`、`summary`、`decision`（枚举：pass / pass_with_warnings / fail / skip）。可选字段包括：`needs_arbiter`、`metrics`（含 findings_total / critical / warning / suggestion 计数）、`findings` 数组、`evidence_refs` 数组、`next_actions` 数组。

#### 场景:reviewer subagent 输出 StageResult
- **当** subagent 完成审查
- **那么** 必须输出符合 StageResult schema 的 JSON
- **并且** `decision` 必须是枚举值之一

#### 场景:findings 条目结构
- **当** StageResult 包含 findings
- **那么** 每条 finding 必须包含 `id`、`severity`（critical / warning / suggestion）、`dimension`、`message`、`evidence_ref`（可选）
- **并且** 如果 finding 关联到需求，必须包含 `trace_id`（R 编号）

### 需求:source_refs 声明
**Trace**: R3
**Slice**: stage-packet/source-refs
StagePacket 必须包含 `source_refs` 数组，每条引用包含 `path`（文件路径）和 `kind`（枚举：proposal / spec / design / tasks / test-report / context / code）。`source_refs` 是 `optional_refs` 层的一等公民，正文不得复制进 packet，只保留路径引用和最小摘要。

#### 场景:source_refs 列出所有相关产出物
- **当** assembler 构建 packet
- **那么** 当前 change 目录下所有存在的产出物文件必须出现在 `source_refs` 中
- **并且** 每条引用的 `kind` 必须准确反映文件类型

#### 场景:verify 需要代码证据
- **当** 某 stage 需要验证实现代码、技能文档或测试文件作为证据
- **那么** `source_refs` 必须额外包含这些实现文件的路径引用，并标记 `kind: code`
- **并且** consumer 只能通过这些 `code` 引用读取实现证据

#### 场景:不存在的产出物不得出现在 source_refs
- **当** 某产出物文件不存在（如无 design.md）
- **那么** `source_refs` 中禁止包含该文件的引用

### 需求:knowledge_refs 声明
**Trace**: R4
**Slice**: stage-packet/knowledge-refs
StagePacket 必须包含 `knowledge_refs` 对象，分为 `codemap`（模块路径引用数组）和 `pitfalls`（领域路径引用数组）两组。引用只包含路径和标识符，禁止将 `.aiknowledge` 正文复制进 packet。

#### 场景:存在命中的 codemap 模块
- **当** assembler 识别到与当前 change 相关的 codemap 模块
- **那么** `knowledge_refs.codemap` 必须包含每个命中模块的 `module` 名称和 `path`

#### 场景:无命中的 pitfalls
- **当** 无相关 pitfalls 条目
- **那么** `knowledge_refs.pitfalls` 必须为空数组，不得省略该字段

### 需求:Packet Budget 约束
**Trace**: R5
**Slice**: stage-packet/budget
StagePacket 必须内置 `budget` 元数据块，包含 `estimated_tokens`（估算 token 数）、`soft_limit`（固定 2000）、`hard_limit`（固定 4000）。超过 hard_limit 的 packet 禁止直接发给 subagent，必须按固定降维顺序截断。

#### 场景:packet 未超限
- **当** estimated_tokens <= soft_limit
- **那么** packet 原样发送，`budget.truncated_fields` 为空数组

#### 场景:packet 超过 soft_limit 但未超 hard_limit
- **当** soft_limit < estimated_tokens <= hard_limit
- **那么** assembler 必须记录警告但仍可发送
- **并且** 如未执行预降维，`budget.truncated_fields` 必须为空数组
- **并且** 如执行了可选预降维，`budget.truncated_fields` 必须列出被截断的字段名

#### 场景:packet 超过 hard_limit
- **当** estimated_tokens > hard_limit
- **那么** assembler 必须按以下固定顺序降维直到 <= hard_limit：
  1. 将多行摘要降为一行摘要
  2. 将 codemap/pitfalls 内容降为纯引用
  3. 将 task trace 压缩为计数或索引
  4. 仍超限则分片（`budget.shard_count` > 1）
- **并且** `budget.truncated_fields` 必须记录每个被降维的字段名

### 需求:Lazy Hydration Contract
**Trace**: R6
**Slice**: stage-packet/lazy-hydration
系统必须强制执行 Lazy Hydration 协议：subagent 默认只能读取 packet 中 `source_refs` 和 `knowledge_refs` 列出的文件路径，禁止无边界全局扫描。扩展读取必须由主 agent 显式追加 ref 后重新派发。

#### 场景:subagent 在 refs 范围内读取
- **当** subagent 需要读取某个产出物的正文
- **那么** 该文件路径必须存在于当前 packet 的 `source_refs` 或 `knowledge_refs` 中

#### 场景:subagent 需要读取 refs 范围外的文件
- **当** subagent 在审查中发现需要读取 packet 未列出的文件
- **那么** subagent 必须在 StageResult 的 `next_actions` 中声明所需路径
- **并且** 禁止自行读取该文件，等待主 agent 决策

#### 场景:arbiter 的读取边界
- **当** arbiter 被触发处理冲突
- **那么** arbiter 只能读取冲突相关的 `evidence_refs`，禁止重新做全量探索

### 需求:blind 隔离协议
**Trace**: R7
**Slice**: stage-packet/blind-isolation
在同一 stage 的多个 reviewer subagent 之间，系统必须保证 blind 隔离：所有 reviewer 共享同一个 StagePacket 作为输入，但禁止任何 reviewer 读取其他 reviewer 的 StageResult、主 agent 的怀疑点或预设严重级别。

#### 场景:多个 reviewer 并行审查
- **当** 同一 stage 派发多个 reviewer subagent
- **那么** 每个 reviewer 收到的输入只包含 StagePacket + 该 reviewer 自身的维度清单
- **并且** 不包含其他 reviewer 的任何输出

#### 场景:主 agent 汇总结果
- **当** 所有 reviewer 完成审查
- **那么** 主 agent 收集所有 StageResult 后统一汇总
- **并且** 只有主 agent 能看到全部 reviewer 的输出
