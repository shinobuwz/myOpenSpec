# Spec: Explicit I/O Boundaries

每个 skill 必须在文件顶部声明自己的「读取」和「产出」列表，subagent 和下游 skill 只读取声明范围内的文件。

## ADDED Requirements

### 需求: opsx-plan 声明 I/O 边界
opsx-plan 必须在 SKILL.md 中包含正式的「读取 / 产出」边界声明。

**Trace**: R1

#### 场景: 读取声明
- **当** opsx-plan 启动
- **那么** 它只读取 `.aiknowledge/codemap/` 和 `.aiknowledge/pitfalls/`（按需）

#### 场景: 产出声明
- **当** opsx-plan 完成
- **那么** 产出物为 `proposal.md`、`design.md`、`specs/<cap>/spec.md`、`.openspec.yaml`，且不产出任何 `context/` 目录下的文件

---

### 需求: opsx-tasks 声明 I/O 边界
opsx-tasks 必须在 SKILL.md 中包含正式的「读取 / 产出」边界声明。

**Trace**: R2

#### 场景: 读取声明
- **当** opsx-tasks 启动
- **那么** 它只读取 `.openspec.yaml`、`proposal.md`、`design.md`、`specs/**/*.md`、`.aiknowledge/pitfalls/`（按需）

#### 场景: 产出声明
- **当** opsx-tasks 完成
- **那么** 产出物仅为 `tasks.md`，且不产出任何 `context/` 目录下的文件

---

### 需求: opsx-task-analyze 声明 I/O 边界
opsx-task-analyze 必须在 SKILL.md 中包含正式的「读取 / 产出」边界声明。

**Trace**: R3

#### 场景: 读取声明
- **当** opsx-task-analyze 启动
- **那么** 它只读取 `specs/**/*.md`、`design.md`、`tasks.md`

#### 场景: 产出声明
- **当** opsx-task-analyze 完成
- **那么** 产出物为 `audit-log.md`（追加）和 `.openspec.yaml` gates.task-analyze（仅通过时）

---

### 需求: opsx-implement 声明 I/O 边界
opsx-implement 必须在 SKILL.md 中包含正式的「读取 / 产出」边界声明。

**Trace**: R4

#### 场景: 读取声明
- **当** opsx-implement 启动
- **那么** 它只读取 `.openspec.yaml`、`tasks.md`、`design.md`、`specs/**/*.md`、`.aiknowledge/`（按需）

#### 场景: 产出声明
- **当** opsx-implement 完成
- **那么** 产出物为代码文件、测试文件、`tasks.md` 完成状态更新、`test-report.md`，且不产出任何 `context/` 目录下的文件
