---
name: opsx-report
description: 生成 change 的 RunReport HTML 报告。在任意时刻可按需触发。
---

## Change Root 解析

- `<name>` 可以是单个 change、父 change 或 `group/subchange` 简写。
- 执行前先运行 `opsx changes resolve <name>` 获取真实 change root。
- 后文所有 `run-report.html`、`audit-log.md`、`review-report.md`、`.openspec.yaml` 路径均指 resolved change root。

# RunReport HTML 生成

从 `audit-log.md`、`test-report.md`、`review-report.md` 读取各 stage 的判定结果，结合产出物文件（specs/、design.md、tasks.md）渲染为 self-contained HTML 报告。

## 输入 / 输出边界

**读取：**
- `openspec/changes/<name>/.openspec.yaml`
- `openspec/changes/<name>/design.md`
- `openspec/changes/<name>/specs/**/*.md`
- `openspec/changes/<name>/tasks.md`
- `openspec/changes/<name>/test-report.md`（如存在）
- `openspec/changes/<name>/audit-log.md`（如存在）
- `openspec/changes/<name>/review-report.md`（如存在）

**写入：**
- `openspec/changes/<name>/run-report.html`

**边界约束：**
- trace / task / requirement 信息必须从权威产物实时读取

**输入**：变更名称。如果省略，运行 `opsx changes` 列出变更供用户选择（含 archive 目录）。

**步骤**

1. **读取数据源**

   - 读取 `openspec/changes/<name>/.openspec.yaml` 获取 gate 时间戳。
   - 读取 `openspec/changes/<name>/audit-log.md`（如存在）提取各 stage 的 decision。如果不存在，所有 gate 显示 pending，不报错。
   - 读取 `openspec/changes/<name>/test-report.md`（如存在）获取 TDD 数据。
   - 读取 `openspec/changes/<name>/review-report.md`（如存在）获取代码审查数据。
   - 按需读取产出物文件（specs/、design.md、tasks.md）用于渲染 Trace 矩阵和 task 列表；文件不存在时对应板块显示"数据不可用"。

2. **聚合 gate_status**

   从 `audit-log.md` 解析各 stage 最后一条记录：

   对 4 个 gate（plan-review / tdd / verify / review）分别判断：
   - `audit-log.md` 中该 stage 最后一条记录的 decision 为 pass 或 pass_with_warnings → **pass**（同时用 `.openspec.yaml` 中 gates 时间戳校验）
   - `audit-log.md` 中该 stage 最后一条记录的 decision 为 fail → **fail**
   - `audit-log.md` 不存在，或该 stage 在 audit-log.md 中无记录 → **pending**
   - tdd 的 pass 判断：从 `test-report.md` 读取，所有 TDD task 均有 green 阶段通过记录 → pass
   - review 的 pass 判断：从 `review-report.md` 最后一条记录的 decision 读取
   - `.openspec.yaml` gates 优先于 audit-log.md decision，避免重跑后数据未同步的误报

3. **渲染 HTML**

   生成 self-contained 单文件 HTML（内联 CSS，无外部依赖，无 JavaScript 框架），写入 `openspec/changes/<name>/run-report.html`。

   ### 板块 1：Run Overview
   - change 名称、当前所处阶段
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

   **plan-review 卡片**（数据来源：`audit-log.md` 最后一条 plan-review 记录）：
   - decision、修正列表、metrics 计数条
   - 卡片样式：fail → 红色左边框；pass_with_warnings → 黄色左边框；pass → 绿色左边框；pending → 灰色左边框

   **tdd 卡片**（数据来源：`test-report.md`）：
   - 汇总统计：task 数 / 通过 task 数
   - 每个 TDD task 的三阶段状态（红/绿/重构）用颜色标识：通过 → 绿色 ✓，失败 → 红色 ✗
   - test-report.md 不存在时显示"无 TDD 任务"
   - 卡片样式：全绿 → 绿色左边框；有失败 → 红色左边框；不存在 → 灰色左边框

   **verify 卡片**（数据来源：`audit-log.md` 最后一条 verify 记录）：同 plan-review 卡片格式

   **review 卡片**（数据来源：`review-report.md` 最后一条记录）：
   - decision、findings 列表（按 severity 降序）
   - review-report.md 不存在时显示"未执行审查"
   - 卡片样式同上

   ### stage 数据缺失处理
   - audit-log.md 不存在或某 stage 无记录：显示灰色 pending 卡片，不报错
   - 某 stage 数据无法解析（格式异常）：显示错误提示，不中断其他 stage 渲染

4. **输出**

   告知用户 HTML 已生成，给出文件路径：`openspec/changes/<name>/run-report.html`。

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

- HTML 文件已写入 `openspec/changes/<name>/run-report.html`
- 四个板块均可在浏览器中渲染
- 无外部依赖（CSS 内联、无 JS 框架、无 CDN）
