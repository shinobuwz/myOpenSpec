---
name: opsx-report
description: 生成 change 的 RunReport HTML 报告。在任意时刻可按需触发。
---

# RunReport HTML

从 OpenSpec 权威产物和 stage 留档生成 self-contained `run-report.html`。数据源解析见 `references/stage-data-sources.md`，HTML/CSS 模板要求见 `references/html-report-template.md`。

## Change Root

- `<name>` 可以是单个 change、父 change 或 `group/subchange` 简写。
- 执行前先运行 `opsx changes resolve <name>` 获取真实 change root。
- 下文 `run-report.html`、`audit-log.md`、`review-report.md`、`.openspec.yaml` 均指 resolved change root。
- `target_kind: fast` 时，使用 `opsx changes resolve-fast <id>` 获取 fast root；缺少 specs/design/tasks 时降级显示，不中断报告。

## 输入 / 输出边界

读取：
- `.openspec.yaml`
- `design.md`
- `specs/**/*.md`
- `tasks.md`
- fast target 的 `item.md`、`evidence.md`、`root-cause.md`（如存在）
- `test-report.md`（如存在）
- `audit-log.md`（如存在）
- `review-report.md`（如存在）

写入：
- `run-report.html`

禁止：
- 不写 gates
- 不改 `audit-log.md`、`test-report.md`、`review-report.md`
- 不读取已废弃的 `run-report-data.json`

## 数据来源

trace、task、requirement 信息必须从权威产物实时读取。gate 状态来自 `.openspec.yaml` 和 stage reports：

- plan-review / task-analyze / verify：`audit-log.md`
- tdd：`test-report.md`
- review：`review-report.md`
- gate 时间戳：`.openspec.yaml`

`.openspec.yaml` gates 优先于 report 中的 decision，避免重跑后数据未同步误报。

## 渲染要求

生成单文件 self-contained HTML，无外部依赖、无 CDN、无 JS 框架。至少包含：

- Run Overview：change、当前阶段、gate 状态、finding 计数。
- Trace Overview：R -> U 追踪矩阵和 task 覆盖。
- Stage Results：plan-review、tdd、verify、review。
- 缺失数据降级显示 pending 或"数据不可用"，不中断其他板块。

## 完成条件

- `run-report.html` 已写入 resolved change root。
- 四个板块均可浏览器渲染。
- 样式内联，报告自包含。

## 输出

告知用户 HTML 已生成，并给出 `run-report.html` 路径。
