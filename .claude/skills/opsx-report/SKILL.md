---
name: opsx-report
description: 生成 change 的 RunReport HTML 报告。在任意时刻可按需触发。
---

# RunReport HTML 生成

从 `context/run-report-data.json` 读取各 stage 的判定结果，结合产出物文件（specs/、design.md、tasks.md）渲染为 self-contained HTML 报告。

**输入**：变更名称。如果省略，运行 `bash .claude/opsx/bin/changes.sh` 列出变更供用户选择（含 archive 目录）。

**步骤**

1. **读取数据源**

   - 读取 `openspec/changes/<name>/context/run-report-data.json`。如果不存在，提示用户"尚无审查数据，请先运行 opsx-plan-review 或 opsx-verify"。
   - 读取 `openspec/changes/<name>/.openspec.yaml` 获取 gate 时间戳。
   - 按需读取产出物文件（specs/、design.md、tasks.md）用于渲染 Trace 矩阵和 task 列表；文件不存在时对应板块显示"数据不可用"。

2. **聚合 gate_status**

   对 4 个 gate（plan_review / tdd / verify / review）分别判断：
   - `.openspec.yaml` 的 `gates` 字段有对应时间戳 → **pass**
   - `run-report-data.json` 中对应 stage 的最新 decision 为 fail → **fail**
   - 否则 → **pending**
   - tdd 的 pass 判断：`stages.tdd.all_green === true`（而非 gates 时间戳，因 tdd 不写 gates）
   - `.openspec.yaml` gates 优先于 results decision，避免重跑后数据未同步的误报

3. **渲染 HTML**

   生成 self-contained 单文件 HTML（内联 CSS，无外部依赖，无 JavaScript 框架），写入 `openspec/changes/<name>/context/run-report.html`。

   ### 板块 1：Run Overview
   - change 名称、run_id、当前所处阶段
   - 4 个 gate 的状态标识：pass → 绿色 ●、fail → 红色 ●、pending → 灰色 ○
   - 总 findings 数量按 severity 分类计数（critical 红 / warning 黄 / suggestion 蓝）

   ### 板块 2：Trace Overview
   - R→U 追踪矩阵表格（从 specs/ + design.md 实时读取）：
     | R | 摘要 | U | 状态 |
     - 有对应 U 映射 → ✓；存在 TRACE_GAP finding → 红色高亮
   - task 覆盖计数（从 tasks.md 读取）：已追踪 / 总数
   - 若产出物文件不存在，显示"数据不可用"

   ### 板块 3：Stage Results
   按顺序展示 4 个 stage 的卡片：**plan-review → tdd → verify → review**

   **plan-review 卡片**：
   - decision、summary、findings 列表（按 severity 降序）、metrics 计数条
   - 卡片样式：有 critical → 红色左边框；只有 warning → 黄色左边框；全通过 → 绿色左边框；pending → 灰色左边框

   **tdd 卡片**：
   - 汇总统计：total_tasks / completed_tasks / all_green
   - 每个 task 的三阶段状态（红/绿/重构）用颜色标识：通过 → 绿色 ✓，失败 → 红色 ✗
   - 覆盖率（如有）
   - stages.tdd 不存在时显示"无 TDD 任务"
   - 卡片样式：all_green → 绿色左边框；有失败 → 红色左边框；不存在 → 灰色左边框

   **verify 卡片**：同 plan-review 卡片格式

   **review 卡片**：
   - decision、findings 列表（按 severity 降序）、metrics 计数条
   - stages.review 不存在时显示"未执行审查"
   - 卡片样式同上

   ### stage 数据缺失处理
   - JSON 中某个 stage 数据不存在：显示灰色 pending 卡片
   - JSON 中某个 stage 数据损坏（无法解析）：显示错误提示，不中断其他 stage 渲染

4. **输出**

   告知用户 HTML 已生成，给出文件路径：`openspec/changes/<name>/context/run-report.html`。

## CSS 样式规范

HTML 必须自带以下内联样式：

```
- 字体：system-ui, -apple-system, sans-serif
- 最大宽度：960px，居中
- 颜色体系：
  - critical: #dc2626 (红)
  - warning: #d97706 (黄)
  - suggestion: #2563eb (蓝)
  - pass: #16a34a (绿)
  - pending: #9ca3af (灰)
- 卡片：白色背景、圆角、左边框 4px 表示状态颜色
- 表格：zebra striping、紧凑行高
```

## 完成条件

- HTML 文件已写入 `context/run-report.html`
- 四个板块均可在浏览器中渲染
- 无外部依赖（CSS 内联、无 JS 框架、无 CDN）
