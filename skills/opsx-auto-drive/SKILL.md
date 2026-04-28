---
name: opsx-auto-drive
description: 自动驱动引擎（Auto-Opt）。设定目标和量化标准后 AI 自主驱动完整 OpenSpec 工作流循环。当用户想要自动迭代优化时使用。
---

Auto-Opt 自动驱动引擎。用户设定目标和量化标准后，AI 自主驱动 OpenSpec 循环并记录每轮结果。

## 输入 / 输出边界

**读取：**
- 用户提供的目标、量化标准、迭代上限、门控级别
- 当前项目状态和相关 OpenSpec 产物
- 下游 skill 的执行结果

**直接写入：**
- `.aiknowledge/auto-drive/<change-name>/iter-*.md`
- `.aiknowledge/auto-drive/<change-name>/summary.md`

**间接副作用：**
- 通过下游 skill 写规划、任务、验证、审查、代码、测试、codemap 和 pitfalls

## 启动信息

必须收集：

- 目标：要优化或实现什么。
- 量化标准：如何衡量成功。
- 迭代次数上限：最多几轮。
- 门控级别：`none` / `design` / `all`。

## 快速循环

1. 分析当前状态。
2. 用 `opsx-explore` 探索方案并收敛设计。
3. 复杂需求先 `opsx-slice`，再对当前焦点执行 `opsx-plan`、plan-review、tasks、task-analyze。
4. 用 `opsx-implement` 实施。
5. 用 `opsx-verify` 验证。
6. 运行量化标准，立即写 `iter-N.md`。
7. 达标则完成，否则继续下一轮。

## 门控和停止

- `none`：完全自主，不暂停询问。
- `design`：设计阶段暂停等待用户确认。
- `all`：每个阶段转换时暂停等待确认。
- 连续 2 轮无改进时，停止叠加同类方案，回退到稳定状态或尝试不同方案；仍卡住则暂停求助。

完成条件：量化标准达标、达到迭代上限或用户手动停止。退出时必须生成 `.aiknowledge/auto-drive/<change-name>/summary.md`。

## Reference 导航

- `references/engine-loop.md`：每轮 Phase 1-7 的详细职责、卡住恢复和下游 skill 顺序。
- `references/record-templates.md`：`iter-N.md` 和 `summary.md` 模板。
