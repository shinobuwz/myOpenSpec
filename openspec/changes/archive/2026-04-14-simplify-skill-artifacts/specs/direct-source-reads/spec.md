# Spec: Direct Source Reads

去掉 StagePacket / core_payload 中间层和所有 context/ JSON 文件。subagent 直接读上游产物文件，进度跟踪改用 tasks.md 内的 `[x]` 标记。

## ADDED Requirements

### 需求: opsx-plan-review 直接读源文件
opsx-plan-review 的 subagent 必须直接读 `specs/**/*.md` 和 `design.md`，禁止组装 packet-plan-review.json。

**Trace**: R5

#### 场景: subagent 输入来源
- **当** opsx-plan-review 启动 subagent
- **那么** subagent 收到的输入为文件路径列表（specs/ + design.md），而不是预提取的 JSON core_payload

#### 场景: 无 packet 文件产生
- **当** opsx-plan-review 完成任意一次运行
- **那么** `context/packet-plan-review.json` 文件不存在

---

### 需求: opsx-verify 直接读源文件
opsx-verify 的 subagent 必须直接读 `tasks.md`、`specs/**/*.md`、`design.md` 和代码文件，禁止组装 packet-verify.json。

**Trace**: R6

#### 场景: subagent 输入来源
- **当** opsx-verify 启动 subagent
- **那么** subagent 收到的输入为文件路径列表，而不是预提取的 JSON core_payload

#### 场景: 无 packet 文件产生
- **当** opsx-verify 完成任意一次运行
- **那么** `context/packet-verify.json` 文件不存在

---

### 需求: opsx-implement 用 tasks.md 跟踪进度
opsx-implement 必须通过 `tasks.md` 中的 `[ ]` → `[x]` 更新来跟踪任务进度，禁止创建 `impl-context.json` 或 `impl-progress.json`。

**Trace**: R7

#### 场景: 进度恢复
- **当** opsx-implement 的 subagent 被中断后重新启动
- **那么** 它读取 `tasks.md` 找到第一个 `[ ]` 任务作为恢复起点，不依赖任何 context/ JSON 文件

#### 场景: 无 impl 状态文件产生
- **当** opsx-implement 完成
- **那么** `context/impl-context.json` 和 `context/impl-progress.json` 均不存在

---

### 需求: opsx-tdd 只写 test-report.md
opsx-tdd 必须只将 TDD 留档写入 `test-report.md`，禁止写入 `run-report-data.json`。

**Trace**: R8

#### 场景: TDD 结果落档
- **当** opsx-tdd 完成一个任务的红绿重构循环
- **那么** 结果追加到 `test-report.md`，`run-report-data.json` 不被创建或修改

---

### 需求: opsx-review 写入 review-report.md
opsx-review 必须将代码审查结果写入 `review-report.md`，禁止写入 `run-report-data.json`。

**Trace**: R9

#### 场景: 审查结果落档
- **当** opsx-review 完成审查
- **那么** 结果写入 `review-report.md`（新建或追加），`run-report-data.json` 不被创建或修改

---

### 需求: 简化 stage-packet-protocol.md
`docs/stage-packet-protocol.md` 必须去掉 StagePacket / PlanReviewPacket / VerifyPacket / Budget / Lazy Hydration 等章节，只保留 StageResult schema 和 audit-log 格式规范。

**Trace**: R10

#### 场景: 文档内容
- **当** 阅读 `docs/stage-packet-protocol.md`
- **那么** 文档中不包含 `StagePacket`、`core_payload`、`optional_refs`、`budget` 等字段定义；只包含 StageResult schema 和 audit-log 条目格式
