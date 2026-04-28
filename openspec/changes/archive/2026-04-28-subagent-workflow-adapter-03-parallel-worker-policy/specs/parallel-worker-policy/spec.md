## 新增需求

### 需求: Serial Default For Implementation Workers
**Trace**: R1
**Slice**: opsx-implement/worker-policy
`opsx-implement` 必须默认使用串行 implementation worker 策略，并且必须禁止把并行 worker 描述为默认行为。

#### 场景: 默认实施路径
- **当** 用户进入 `opsx-implement` 且 tasks 没有显式满足并行条件
- **那么** workflow 文案要求按顺序实施任务，主 agent 只派发一个 implementation worker 或使用 inline fallback 串行执行

#### 场景: 防止默认并行漂移
- **当** workflow discipline tests 检查 `opsx-implement`
- **那么** 测试能发现无条件 "dispatch multiple workers" 或类似默认并行描述

### 需求: Explicit Disjoint Write Sets For Parallel Workers
**Trace**: R2
**Slice**: opsx-implement/parallel-eligibility
`opsx-implement` 只有在任务簇独立、写入集合不重叠、没有共享接口或配置迁移并发修改、且每个 worker 有明确文件 ownership 时，才允许主 agent 派发多个 implementation workers。

#### 场景: 允许保守并行
- **当** tasks 已被主 agent 明确分成互不依赖的任务簇
- **那么** workflow 文案允许主 agent 为每个簇派发一个 worker，并要求 prompt 中声明读取范围、写入范围和禁止越界文件

#### 场景: 拒绝高风险并行
- **当** 任务涉及 `tasks.md`、`test-report.md`、`.openspec.yaml`、`audit-log.md`、`review-report.md`、共享 public interface、migration、schema、config、package/build scripts 或依赖顺序不清
- **那么** workflow 文案要求保持串行执行

### 需求: Main Agent Owns Parallel Integration
**Trace**: R3
**Slice**: opsx-implement/controller-integration
即使允许多个 implementation workers，主 agent 也必须串行整合 worker 结果，并且必须保留 `tasks.md`、`test-report.md`、diff 检查、最终验证和后续 gates 的 controller ownership。

#### 场景: 串行整合共享 artifact
- **当** 多个 worker 完成局部实现
- **那么** 主 agent 逐个检查 worker diff，串行更新 `tasks.md` 和 `test-report.md`，并禁止 worker 并行写共享 artifact

#### 场景: gate 不下放
- **当** 并行 implementation workers 均报告 `DONE`
- **那么** 主 agent 仍必须运行最终验证命令，并继续进入 `opsx-verify`、`opsx-review`、`opsx-archive` gates

## 修改需求

无。

## 移除需求

无。
