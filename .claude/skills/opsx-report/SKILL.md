---
name: opsx-report
description: 生成 change 的 RunReport HTML 报告。在任意时刻可按需触发。
---

# RunReport HTML 生成

从 `context/run-report-data.json` 读取 stage packet + results 数据，渲染为 self-contained HTML 报告。

**输入**：变更名称。如果省略，运行 `bash .claude/opsx/bin/changes.sh` 列出变更供用户选择。

**步骤**

1. **读取数据源**

   读取 `openspec/changes/<name>/context/run-report-data.json`。如果不存在，提示用户"尚无审查数据，请先运行 opsx-plan-review 或 opsx-verify"。

   同时读取 `openspec/changes/<name>/.openspec.yaml` 获取 gate 时间戳。

2. **聚合 RunReport 数据模型**

   构建以下结构（参照 `docs/stage-packet-protocol.md` 第 5 节）：

   ```json
   {
     "run_id": "context/run-report-data.json 中保存的稳定 run_id",
     "change_id": "change 目录名",
     "current_stage": "最新执行的 stage 名",
     "gate_status": {
       "plan_review": "pass|fail|pending",
       "verify": "pass|fail|pending"
     },
     "stages": {
       "plan-review": {"packet": {...}, "results": [...]},
       "verify": {"packet": {...}, "results": [...]}
     }
   }
   ```

   - `run_id` 优先取 `context/run-report-data.json` 顶层已有值，不从“最新 stage”推断
   - `gate_status` 判断优先级：`.openspec.yaml` 的 `gates` 有时间戳 → pass；run-report-data.json 的 results 中最新 decision 为 fail → fail；否则 → pending（gates 优先于 results，以避免重跑后数据未同步的误报）
   - 未执行的 stage 状态为 `"pending"`，results 为空数组

3. **渲染 HTML**

   生成 self-contained 单文件 HTML（内联 CSS，无外部依赖，无 JavaScript 框架），写入 `openspec/changes/<name>/context/run-report.html`。

   HTML 包含以下三个板块：

   ### 板块 1：Run Overview
   - change 名称
   - run_id
   - 当前所处阶段
   - 各 gate 的状态标识：
     - pass → 绿色 ● 标识
     - fail → 红色 ● 标识
     - pending → 灰色 ○ 标识
   - 总 findings 数量按 severity 分类计数：critical (红) / warning (黄) / suggestion (蓝)

   ### 板块 2：Trace Overview
   - R→U 追踪矩阵表格：
     | R | 摘要 | U | 状态 |
     - 有对应 U 映射 → ✓
     - 存在 TRACE_GAP finding → 红色高亮，引用 finding ID
   - task 覆盖计数：已追踪 / 总数；若尚无 verify stage，则显示 "task coverage unavailable until verify stage"
   - 缺失追踪计数

   ### 板块 3：Stage Results
   - 按 stage 分组（plan-review / verify）
   - 每个 stage 的 result 一张卡片：
     - agent_role 作为卡片标题
     - summary 文本
     - severity 计数条：critical (红) / warning (黄) / suggestion (蓝)
     - decision 标识
     - findings 列表按 severity 降序排列
     - 每条 finding 显示：dimension、message、evidence_ref（如有）
   - 卡片样式：
     - 有 critical findings → 红色左边框
     - 只有 warnings → 黄色左边框
     - 全部通过 → 绿色左边框

   **首版限制**：只展示 plan-review 和 verify 两个 stage。其他 stage 在 Run Overview 中显示 "not_tracked"。

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
- 三个板块均可在浏览器中渲染
- 无外部依赖（CSS 内联、无 JS 框架、无 CDN）
