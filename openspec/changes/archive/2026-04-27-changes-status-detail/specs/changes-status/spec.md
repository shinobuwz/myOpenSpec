## MODIFIED Requirements

### 需求:changes status 展示诊断视图
**Trace**: R1
系统必须让 `opsx changes status` 输出项目级诊断视图，而不是复用 `opsx changes list` 的紧凑清单。

#### 场景:显示项目和活动变更状态
- **当** 用户运行 `opsx changes -p <repo> status`
- **那么** 输出必须包含目标项目根路径
- **那么** 输出必须包含活动 change 名称
- **那么** 输出必须包含该 change 的当前阶段
- **那么** 输出必须包含 tasks 完成进度（如果存在 `tasks.md`）

#### 场景:list 保持紧凑清单
- **当** 用户运行 `opsx changes -p <repo> list`
- **那么** 输出必须保持活动变更清单格式
- **那么** 输出不得包含 `Project:` 诊断头

### 需求:status 展示 gates 和 reports
**Trace**: R2
系统必须在 `opsx changes status` 中展示每个活动 change 的关键 gate 状态和报告文件存在性。

#### 场景:读取 gate 时间戳
- **当** 活动 change 的 `.openspec.yaml` 包含 `gates.plan-review`、`gates.task-analyze`、`gates.verify` 或 `gates.review`
- **那么** `status` 输出必须展示这些 gate 的时间戳
- **那么** 缺失 gate 必须展示为 `missing`

#### 场景:展示报告文件存在性
- **当** 活动 change 中存在 `audit-log.md`、`test-report.md` 或 `review-report.md`
- **那么** `status` 输出必须展示对应报告为 `yes`
- **那么** 缺失报告必须展示为 `no`

### 需求:status 给出下一步建议
**Trace**: R3
系统必须基于当前 change 的产物和 gate 状态，为 `opsx changes status` 输出最可能的下一步 OPSX skill。

#### 场景:全部 gate 已通过
- **当** 活动 change 已有 `gates.plan-review`、`gates.task-analyze`、`gates.verify` 和 `gates.review`
- **那么** `status` 输出必须建议下一步为 `opsx-archive`

#### 场景:缺失 review gate
- **当** 活动 change 已有 `gates.verify` 但缺少 `gates.review`
- **那么** `status` 输出必须建议下一步为 `opsx-review`

#### 场景:缺失 verify gate
- **当** 活动 change 已有 `tasks.md` 但缺少 `gates.verify`
- **那么** `status` 输出必须建议下一步为 `opsx-verify`
