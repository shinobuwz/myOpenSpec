# HTML Report Template

生成 self-contained HTML，内联 CSS，无外部依赖。

## 板块

### Run Overview

- change 名称、当前阶段
- gate 状态：pass 绿色、fail 红色、pending 灰色
- findings 按 critical / warning / suggestion 计数

### Trace Overview

从 specs 和 design 读取 R -> U：

| R | 摘要 | U | 状态 |
|---|------|---|------|

有对应 U 为通过；存在 TRACE_GAP finding 时高亮。

### Stage Results

按 plan-review -> tdd -> verify -> review 顺序展示 stage 卡片。

- plan-review：来源 `audit-log.md`
- tdd：来源 `test-report.md`
- verify：来源 `audit-log.md`
- review：来源 `review-report.md`

## CSS 要求

- 字体：`system-ui, -apple-system, sans-serif`
- 最大宽度：`960px`，居中
- severity 颜色：
  - critical: `#dc2626`
  - warning: `#d97706`
  - suggestion: `#2563eb`
  - pass: `#16a34a`
  - pending: `#9ca3af`
- 卡片白底、圆角、4px 左边框表示状态
- 表格 zebra striping、紧凑行高
