# Spec: Unified Audit Log

plan-review、task-analyze、verify 三个审查 skill 统一将修正记录写入 `audit-log.md`。审查 skill 的职责是：发现问题 → 修正对应产物文件 → 记录修正了什么。

## ADDED Requirements

### 需求: plan-review 追加修正记录到 audit-log.md
opsx-plan-review 每次运行结束后，必须将修正记录追加到 `audit-log.md`，而不是写入 `run-report-data.json`。

**Trace**: R11

#### 场景: pass 时的记录
- **当** opsx-plan-review 通过
- **那么** 向 `audit-log.md` 追加一条记录，包含 stage、timestamp、decision=pass、"无发现"

#### 场景: fail 后修正再 pass 时的记录
- **当** opsx-plan-review 发现问题并协助修正 design.md 或 specs/，再次审查通过
- **那么** 追加记录包含：发现的问题类型（如 TRACE_GAP）、修正了哪个文件的哪个位置、最终 decision=pass

---

### 需求: task-analyze 追加修正记录到 audit-log.md
opsx-task-analyze 每次运行结束后，必须将修正记录追加到 `audit-log.md`。

**Trace**: R12

#### 场景: pass 时的记录
- **当** opsx-task-analyze 通过
- **那么** 向 `audit-log.md` 追加一条记录，包含 stage、timestamp、decision=pass、"无发现"

#### 场景: 修正 tasks.md 后的记录
- **当** opsx-task-analyze 发现 GAP/MISMATCH 并协助修正 tasks.md
- **那么** 追加记录包含：发现的问题、修正了 tasks.md 的哪个任务

---

### 需求: verify 追加修正记录到 audit-log.md
opsx-verify 每次运行结束后，必须将修正记录追加到 `audit-log.md`，而不是写入 `run-report-data.json`。

**Trace**: R13

#### 场景: pass 时的记录
- **当** opsx-verify 通过
- **那么** 向 `audit-log.md` 追加一条记录，包含 stage、timestamp、decision=pass

#### 场景: 有发现时的记录
- **当** opsx-verify 发现问题并协助修正后通过
- **那么** 追加记录包含：发现的维度（VERIFY_COMPLETENESS 等）、修正了哪个文件

---

### 需求: audit-log.md 条目格式
`audit-log.md` 中每个条目必须遵循统一格式，包含 stage、方向、timestamp、decision、修正列表。

**Trace**: R14

#### 场景: 条目结构
- **当** 任意审查 skill 向 audit-log.md 写入记录
- **那么** 格式为：
  ```
  ## <stage> | <ISO8601 timestamp> | <pass|fail>
  方向：<上游产物> → <下游产物>
  - <修正描述 1>（无发现时写"无发现"）
  ```

#### 场景: 多次审查追加
- **当** 同一 stage 多次运行
- **那么** 每次运行追加新条目到文件末尾，不覆盖历史记录

---

### 需求: opsx-report 从 audit-log.md 读取 gate 结果
opsx-report 渲染 HTML 报告时，必须从 `audit-log.md` 读取 plan-review / task-analyze / verify 的审查结论，不读取 `run-report-data.json`。

**Trace**: R15

#### 场景: gate 状态渲染
- **当** opsx-report 渲染报告
- **那么** gate 状态（pass/fail/pending）从 `audit-log.md` 最后一条对应 stage 记录的 decision 字段读取

#### 场景: audit-log 不存在时
- **当** opsx-report 运行但 `audit-log.md` 不存在
- **那么** 对应 gate 显示为 pending，不报错
