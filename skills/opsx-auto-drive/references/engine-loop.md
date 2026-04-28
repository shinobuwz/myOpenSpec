# opsx-auto-drive Engine Loop

## Phase 1 - 分析

评估当前状态，确定本轮改进方向。

## Phase 2 - 探索

使用 `opsx-explore` 探索方案并收敛设计。

## Phase 3 - 切分与规划

复杂需求先用 `opsx-slice` 创建父 change + subchanges，并写入执行拓扑。随后对当前焦点 subchange 使用 `opsx-plan` 生成或修订 proposal、design、specs。plan-review 通过后由 `opsx-tasks` 生成 tasks，task-analyze 通过后进入实施。

## Phase 4 - 实施

使用 `opsx-implement` 按 tasks 实施。

## Phase 5 - 验证

使用 `opsx-verify` 做合规和验证检查。

## Phase 6 - 度量

运行用户定义的量化标准，记录目标值、实测值和差距。度量完成后立即写 `iter-N.md`。

## Phase 7 - 决策

达标则完成；未达标且未超过迭代上限则进入下一轮。

## 卡住恢复

连续 2 次迭代没有改进时：

- 回退到上一个稳定状态。
- 尝试完全不同的方案。
- 如果仍然卡住，暂停并向用户求助。
