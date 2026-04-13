## 修改需求

### 需求:verify assembler 产出 VerifyPacket
**Trace**: R16
**Slice**: opsx-verify/assembler
`opsx-verify` 的主 agent 必须在启动审查前组装 `VerifyPacket`（StagePacket 的阶段特化），其 `core_payload` 包含：task 完成度（completed / total 计数）、R→U→Task 追踪关系、TDD 标签摘要、test-report 存在性标记、artifact 存在性标记。`optional_refs` 包含：tasks.md 引用、各 spec 文件引用、design.md 引用、proposal.md 引用、test-report.md 引用（如存在）、命中的 codemap 引用，以及从 tasks.md“涉及文件”提取的实现证据文件引用（`kind: code`）。组装完成后必须校验 Packet Budget（R5），并填充 StagePacket 全部必填元数据（run_id / packet_id / created_at / producer）。

#### 场景:正常组装 VerifyPacket
- **当** change 目录包含 tasks.md 和至少一个其他产出物
- **那么** assembler 输出的 VerifyPacket 的 `core_payload` 包含 task 完成度和追踪关系
- **并且** `optional_refs` 包含所有存在的产出物文件引用

#### 场景:填充 packet 元数据
- **当** assembler 产出 VerifyPacket
- **那么** packet 必须包含 `version`、`run_id`、`change_id`、`stage`、`packet_id`、`created_at`、`producer`、`budget` 等全部顶层必填字段
- **并且** `run_id` 必须遵循 RunReport 的复用规则

#### 场景:提供代码证据入口
- **当** verify reviewer 需要验证实现代码
- **那么** `optional_refs.source_refs` 必须包含从 tasks.md“涉及文件”提取的实现文件路径，且 `kind` 为 `code`
- **并且** reviewer 只能通过这些 `code` 引用读取实现证据

### 需求:verify subagent 消除双读约束
**Trace**: R19
**Slice**: opsx-verify/no-double-read
`opsx-verify` 的 subagent 消费 VerifyPacket 后禁止自行重读原始文件（消除双读模式），必须从 `core_payload` 获取结构化事实，只通过 Lazy Hydration（R6）按需回读 `optional_refs` 中的路径。

#### 场景:subagent 从 core_payload 获取事实
- **当** subagent 收到 VerifyPacket
- **那么** subagent 从 `core_payload` 获取结构化事实
- **并且** 只在需要验证具体代码证据时通过 `optional_refs` 中的 `code` 路径回读文件

#### 场景:禁止重读已缓存信息
- **当** core_payload 中已包含 task 完成度、追踪关系等结构化事实
- **那么** subagent 禁止重新读取 tasks.md / specs / design 的全文来获取已在 core_payload 中存在的信息

### 需求:verify reviewer 输出 StageResult
**Trace**: R17
**Slice**: opsx-verify/reviewer-result
`opsx-verify` 的 reviewer subagent 必须输出符合 StageResult schema（R2）的结构化结果。`agent_role` 必须标明维度（verify-completeness / verify-correctness / verify-consistency / verify-test-report）。findings 中的 `severity` 必须遵循验证启发式：不确定时优先 suggestion > warning > critical。

#### 场景:completeness reviewer 发现未完成任务
- **当** tasks.md 中存在未勾选的 task
- **那么** StageResult.findings 包含对应的 critical finding，附 task 编号

#### 场景:test-report reviewer 检查 TDD 留档
- **当** 存在 TDD 标签的 task 但缺少 test-report.md
- **那么** StageResult.findings 包含 `{severity: "critical", dimension: "test-report", message: "test-report.md missing"}`

#### 场景:无 specs 时正确性跳过
- **当** change 目录无 specs/
- **那么** verify-correctness 的 StageResult.decision 为 "skip"
- **并且** summary 注明 "No specs found — correctness check skipped"

### 需求:verify 主 agent 汇总与门控
**Trace**: R18
**Slice**: opsx-verify/gate
`opsx-verify` 主 agent 必须收集所有 reviewer 的 StageResult，检测冲突（同一问题不同 severity 或存在性分歧），必要时触发 arbiter。最终合并 findings，生成汇总报告。如无 critical finding 则写入 gate；如有 critical finding 则不写入 gate。无论结果如何，packet + results 必须写入 RunReport 数据源。

#### 场景:reviewer 存在冲突
- **当** 两个 reviewer 对同一文件的同一问题给出不同 severity
- **那么** 触发 arbiter，arbiter 只读取冲突相关的 evidence_refs
- **并且** arbiter 输出的 StageResult 的 `agent_role` 为 "arbiter"

#### 场景:通过门控
- **当** 最终汇总无 critical findings
- **那么** 写入 `.openspec.yaml` 的 `gates.verify` 时间戳
- **并且** 更新 RunReport 数据源

#### 场景:未通过门控
- **当** 存在 critical findings
- **那么** 不写入 gate，列出所有问题
- **并且** 更新 RunReport 数据源（状态为 fail）
