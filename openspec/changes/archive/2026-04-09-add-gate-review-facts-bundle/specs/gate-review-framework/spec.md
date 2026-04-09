## ADDED Requirements

### 需求:Gate review 共享 facts bundle
**Trace**: R1
**Slice**: gate-review/facts-bundle
系统必须为 gate review 提供 run-scoped 的共享 facts bundle，统一汇总 change 产出物、change-local context 声明和基础任务状态，供 `plan-review` 与 `verify` 复用。

#### 场景:存在 change-local context 文件
- **当** 变更目录包含 `context/knowledge-refs.md`、`context/review-scope.md` 或 `context/artifact-index.md`
- **那么** 系统在生成 gate review facts bundle 时必须读取这些文件并将其作为声明性事实输入

#### 场景:缺失 change-local context 文件
- **当** 变更目录未提供任一 `context/*.md` 文件
- **那么** 系统必须优雅降级为仅使用现有 change 产出物和任务状态构建 facts bundle

### 需求:Plan-review 使用 blind reviewer 共享事实
**Trace**: R2
**Slice**: gate-review/plan-review-blind
系统必须允许 `plan-review` 的 reviewer 共享同一 facts bundle，但禁止在 reviewer 之间共享 findings、怀疑点或预设严重级别。

#### 场景:plan-review 使用 blind reviewer
- **当** `plan-review` 组织 subagent 审查
- **那么** 每个 reviewer 只能读取共享 facts bundle、目标产出物和当前维度的审查清单
- **并且** 不得读取其他 reviewer 的结论或主 agent 的预设判断

### 需求:Verify 使用 blind reviewer 共享事实
**Trace**: R3
**Slice**: gate-review/verify-blind
系统必须允许 `verify` 的多个 reviewer 共享同一 facts bundle 作为事实底座，但禁止在 reviewer 之间共享问题列表、怀疑点或预设严重级别。

#### 场景:verify 使用 blind reviewer
- **当** `verify` 组织完整性、正确性、一致性和测试留档 reviewer
- **那么** 各 reviewer 必须共享同一 facts bundle 作为事实底座
- **并且** reviewer 之间不得共享问题列表或结论摘要

### 需求:冲突时支持可选 arbiter
**Trace**: R4
**Slice**: gate-review/arbiter
系统必须支持在 reviewer 结论存在高价值冲突时追加可选 arbiter，对冲突点进行仲裁而不重做全量审查。

#### 场景:存在 reviewer 结论冲突
- **当** 不同 reviewer 对同一问题的存在性、严重级别或需求意图产生冲突
- **那么** 系统必须允许触发 arbiter 仅基于冲突点与证据进行仲裁

#### 场景:不存在 reviewer 结论冲突
- **当** reviewers 的结论不存在冲突
- **那么** 系统不得强制运行 arbiter
