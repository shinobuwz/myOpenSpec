## 新增需求

### 需求:RunReport 数据模型
**Trace**: R8
**Slice**: run-report/data-model
系统必须定义 RunReport 数据模型，聚合一次 change 运行中所有 stage 的 StagePacket 和 StageResult。RunReport 包含以下顶层字段：`run_id`、`change_id`、`current_stage`、`gate_status`（各 gate 的 pass/fail/pending 状态）、`stages`（各 stage 的 packet + results 汇总）。

#### 场景:只有 plan-review 和 verify 阶段
- **当** 首版只覆盖 plan-review 和 verify
- **那么** `stages` 只包含这两个 stage 的条目
- **并且** 其他 stage 显示为 "not_tracked"

#### 场景:某 stage 尚未执行
- **当** 某 gate stage 尚未运行
- **那么** 该 stage 的状态显示为 "pending"，results 为空

#### 场景:跨阶段复用同一 run_id
- **当** 同一 change 的 `plan-review` 和 `verify` 在不同会话中追加到同一个 `context/run-report-data.json`
- **那么** 后续 stage 必须复用该文件中已有的 `run_id`
- **并且** 只有在数据文件不存在或用户显式重置报告时，才允许生成新的 `run_id`

### 需求:Run Overview 板块
**Trace**: R9
**Slice**: run-report/overview
HTML 报告必须包含 Run Overview 板块，显示：change 名称、run_id、当前所处阶段、各 gate 的 pass/fail/pending 状态、总 findings 数量（按 severity 分类计数）。

#### 场景:所有 gate 均通过
- **当** plan-review 和 verify 均为 pass
- **那么** Run Overview 显示绿色状态标识

#### 场景:存在未通过的 gate
- **当** 任一 gate 为 fail
- **那么** Run Overview 显示红色状态标识并高亮失败的 gate

### 需求:Trace Overview 板块
**Trace**: R10
**Slice**: run-report/trace
HTML 报告必须包含 Trace Overview 板块，以矩阵形式展示 R（需求）→ U（实施单元）映射关系，以及 task 覆盖计数和缺失追踪计数。数据来源为 StagePacket 中的 `core_payload`。

#### 场景:所有 R 都有 U 映射
- **当** 每个 R 编号都有对应的 U 映射
- **那么** 矩阵中所有行显示为已覆盖

#### 场景:存在 TRACE_GAP
- **当** 某 R 编号在 design 中无对应 U
- **那么** 矩阵中该行高亮为缺失，并引用对应的 finding

#### 场景:仅有 plan-review 数据
- **当** RunReport 中还没有 verify stage，无法获得 task 覆盖计数
- **那么** Trace Overview 必须显示 "task coverage unavailable until verify stage"
- **并且** 不得伪造 0/0 或其他占位计数

### 需求:Reviewer Results 板块
**Trace**: R11
**Slice**: run-report/results
HTML 报告必须包含 Reviewer Results 板块，按 stage 分组展示每个 reviewer 的 summary、severity 计数（critical / warning / suggestion）和 decision。Findings 列表按 severity 降序排列，每条 finding 显示 dimension、message 和 evidence_ref（如有）。

#### 场景:reviewer 无 findings
- **当** 某 reviewer 的 findings 为空
- **那么** 显示 "No issues found" 并标记 decision

#### 场景:reviewer 有 critical findings
- **当** 某 reviewer 存在 critical severity 的 finding
- **那么** 该 reviewer 的卡片以红色边框标识

### 需求:Conflict Board 板块
**Trace**: R12
**Slice**: run-report/conflict
HTML 报告必须包含 Conflict Board 板块。当同一 stage 的不同 reviewer 对同一问题的存在性、severity 或意图产生冲突时，展示冲突点、涉及的 reviewer、各自立场和 arbiter 裁决（如有）。无冲突时显示 "No conflicts detected"。

#### 场景:存在 severity 冲突
- **当** reviewer A 将某问题标记为 critical，reviewer B 标记为 warning
- **那么** Conflict Board 列出该冲突点，展示双方 finding 和 arbiter 裁决

#### 场景:无冲突
- **当** 所有 reviewer 的 findings 不存在冲突
- **那么** Conflict Board 显示 "No conflicts detected"
