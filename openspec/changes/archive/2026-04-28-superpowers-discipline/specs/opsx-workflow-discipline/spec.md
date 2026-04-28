## 新增需求

### 需求: Bugfix must establish root cause before fixes
**Trace**: R1
**Slice**: opsx-bugfix/root-cause-gate
`opsx-bugfix` 必须要求 agent 在实施修复前完成根因调查、复现或证据收集、单一假设和最小验证；禁止在未说明根因的情况下直接猜测修复。

#### 场景: Root cause is missing
- **当** bugfix 过程只能描述症状但无法说明根因
- **那么** workflow 必须继续调查或要求补充信息，而不是进入修复

#### 场景: Multiple fixes fail
- **当** 同一 bug 已经连续多次修复失败
- **那么** workflow 必须停止叠加补丁，并要求重新审视假设或架构边界

### 需求: Completion claims must use fresh verification evidence
**Trace**: R2
**Slice**: verify-lite/evidence-before-claims
`opsx-verify` 和 `opsx-lite` 必须要求完成、通过、已修复等结论基于当前轮实际执行的验证命令或明确人工验证证据；禁止只凭推断或历史输出宣称完成。

#### 场景: Verification command was not run
- **当** agent 准备输出完成结论但没有当前轮验证命令
- **那么** workflow 必须要求先运行验证或明确说明未验证

### 需求: Tasks must be bite-sized and executable
**Trace**: R3
**Slice**: opsx-tasks/task-quality
`opsx-tasks` 必须生成可执行的最小任务；每个 task 必须只有一个主要动作、无占位符、无空泛验收标准，并包含验证命令或明确验证方法。

#### 场景: Task contains vague acceptance criteria
- **当** task 出现 “处理边界情况”、“添加适当验证”、“完善逻辑” 等无法直接执行或验证的描述
- **那么** workflow 必须要求拆分或重写该 task

### 需求: Verify must own spec compliance and review must own release risk
**Trace**: R4
**Slice**: verify-review/responsibility-split
`opsx-verify` 必须承担 Spec Compliance Review，检查实现是否满足 proposal/design/specs/tasks；`opsx-review` 必须聚焦代码质量和发布风险，禁止重复承担完整 spec compliance。

#### 场景: Implementation misses a requirement during verify
- **当** 实现遗漏了某个需求或 task 缺少实现证据
- **那么** verify 必须输出阻断性 compliance finding

#### 场景: Review discovers compliance drift
- **当** review 阶段发现明显需求遗漏、范围外实现或 task 状态与代码证据不一致
- **那么** review 必须输出 `VERIFY_DRIFT` finding，并要求回退 `opsx-verify`

### 需求: Skill descriptions must describe triggers only
**Trace**: R5
**Slice**: skills/metadata-discipline
被本 change 修改的 OPSX skill description 必须主要描述何时触发，禁止把完整流程摘要塞进 description；详细流程必须保留在正文。

#### 场景: Description summarizes workflow steps
- **当** skill description 同时包含多个执行步骤或流程顺序
- **那么** 应改写为触发条件描述，并把流程细节移入正文
