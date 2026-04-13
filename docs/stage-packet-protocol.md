# OPSX Stage Packet Protocol v1

将 gate review 的隐式 facts bundle 升级为显式阶段化协议。定义 subagent 的统一输入（StagePacket）和统一输出（StageResult）。

首版覆盖范围：`plan-review` 和 `verify` 两个 gate stage。

## 1. StagePacket Schema

StagePacket 是 assembler 为某阶段构建的**只读事实快照**，供 subagent 消费。

### 1.1 必填字段

| 字段 | 类型 | 说明 | 层级 |
|------|------|------|------|
| `version` | integer | 固定为 `1` | 顶层 |
| `run_id` | string | 本次运行的唯一标识，格式 `<ISO8601>-<short-hash>`；同一 change 复用同一份 `run-report-data.json` 时必须复用既有值 | 顶层 |
| `change_id` | string | change 目录名（如 `2026-04-13-add-auth`） | 顶层 |
| `stage` | string | 阶段名（如 `plan-review`、`verify`） | 顶层 |
| `packet_id` | string | packet 唯一标识，格式 `<stage>-<seq>`（如 `plan-review-001`） | 顶层 |
| `created_at` | string | ISO8601 时间戳 | 顶层 |
| `producer` | string | 组装者标识（如 `main-agent`） | 顶层 |
| `budget` | object | Packet Budget 元数据（见第 2 节） | 顶层 |
| `core_payload` | object | 所有 consumer 必读的共享事实（见 1.3） | 顶层 |
| `optional_refs` | object | 按需回读的文件引用（见 1.4） | 顶层 |

### 1.2 校验规则

- 缺少任一必填字段 → consumer 必须拒绝该 packet 并报错，不得静默降级
- `core_payload` 和 `optional_refs` 必须是两个独立的顶层键

### 1.3 core_payload（所有 consumer 必读）

core_payload 包含结构化事实摘要，consumer 从此获取判断所需的绝大部分信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| `artifact_presence` | object | 各产出物存在性标记：`{proposal: bool, specs: bool, design: bool, tasks: bool, test_report: bool}` |
| `requirements` | array | R 全集，每条：`{id: "R1", summary: "一行摘要"}` |
| `trace_mapping` | array | R→U 映射，每条：`{r_id: "R1", u_ids: ["U1"]}` |
| `units` | array | U 全集，每条：`{id: "U1", title: "标题"}` |

阶段特化字段由 PlanReviewPacket / VerifyPacket 扩展（见第 3 节）。

### 1.4 optional_refs（按需回读引用）

optional_refs 包含文件路径引用，subagent 通过 Lazy Hydration（见第 2 节）按需回读正文。**正文不得复制进 packet。**

#### source_refs

`source_refs` 数组，每条引用：

| 字段 | 类型 | 说明 |
|------|------|------|
| `path` | string | 文件相对路径 |
| `kind` | enum | `proposal` / `spec` / `design` / `tasks` / `test-report` / `context` / `code` |

规则：
- 当前 change 目录下所有**存在的**产出物文件必须出现在 `source_refs` 中
- 不存在的产出物禁止出现在 `source_refs` 中
- `kind` 必须准确反映文件类型
- 当某个 stage 需要验证实现证据时，可额外包含变更影响的实现文件、测试文件或技能文档，统一标记为 `kind: "code"`

#### knowledge_refs

`knowledge_refs` 对象：

| 字段 | 类型 | 说明 |
|------|------|------|
| `codemap` | array | 命中模块，每条：`{module: "模块名", path: ".aiknowledge/codemap/xxx.md"}` |
| `pitfalls` | array | 命中领域，每条：`{domain: "领域名", path: ".aiknowledge/pitfalls/xxx/index.md"}` |

规则：
- 引用只包含路径和标识符，禁止将 `.aiknowledge` 正文复制进 packet
- 无命中时对应数组为空，不得省略字段

## 2. Packet Budget 与 Lazy Hydration Contract

### 2.1 Budget 元数据块

每个 StagePacket 必须包含 `budget` 元数据：

| 字段 | 类型 | 说明 |
|------|------|------|
| `estimated_tokens` | integer | 估算 token 数（公式：字符数 / 4） |
| `soft_limit` | integer | 固定 `2000` |
| `hard_limit` | integer | 固定 `4000` |
| `truncated_fields` | array | 被截断/降维的字段名列表，未截断时为空数组 |
| `shard_count` | integer | 分片数，默认 `1` |

### 2.2 Budget 校验与降维

| 条件 | 动作 |
|------|------|
| `estimated_tokens` <= `soft_limit` | 原样发送，`truncated_fields` 为空 |
| `soft_limit` < `estimated_tokens` <= `hard_limit` | 记录警告，仍可发送；如未执行预降维则 `truncated_fields` 为空，如执行了预降维则列出被截断字段 |
| `estimated_tokens` > `hard_limit` | **禁止直接发送**，必须按以下固定顺序降维 |

**固定降维顺序：**

1. 将多行摘要降为一行摘要
2. 将 codemap/pitfalls 内容降为纯引用（仅保留 path）
3. 将 task trace 压缩为计数或索引
4. 仍超限则分片（`shard_count` > 1）

每次降维后必须在 `truncated_fields` 中记录被降维的字段名。

### 2.3 降维示例

**降维前**（estimated_tokens: 4500，超过 hard_limit）：

```yaml
core_payload:
  requirements:
    - id: "R1"
      summary: "系统必须定义 StagePacket 基础 schema，包含以下必填字段..."
    - id: "R2"
      summary: "系统必须定义 StageResult 基础 schema，包含以下必填字段..."
  # ... 19 条需求，每条多行摘要
optional_refs:
  knowledge_refs:
    codemap:
      - module: "openspec-skills"
        path: ".aiknowledge/codemap/openspec-skills.md"
        excerpt: "管理 opsx-* skills 的 SKILL.md 文件..."  # 内容摘要
    pitfalls:
      - domain: "misc"
        path: ".aiknowledge/pitfalls/misc/index.md"
        excerpt: "5 条 active pitfalls..."  # 内容摘要
budget:
  estimated_tokens: 4500
  soft_limit: 2000
  hard_limit: 4000
  truncated_fields: []
  shard_count: 1
```

**降维后**（estimated_tokens: 1900）：

```yaml
core_payload:
  requirements:
    - id: "R1"
      summary: "StagePacket 基础 schema"        # 步骤 1：降为一行
    - id: "R2"
      summary: "StageResult 基础 schema"
  # ... 19 条需求，每条一行摘要
optional_refs:
  knowledge_refs:
    codemap:
      - module: "openspec-skills"
        path: ".aiknowledge/codemap/openspec-skills.md"
        # excerpt 已删除                         # 步骤 2：降为纯引用
    pitfalls:
      - domain: "misc"
        path: ".aiknowledge/pitfalls/misc/index.md"
budget:
  estimated_tokens: 1900
  soft_limit: 2000
  hard_limit: 4000
  truncated_fields:
    - "requirements[].summary"
    - "knowledge_refs.codemap[].excerpt"
    - "knowledge_refs.pitfalls[].excerpt"
  shard_count: 1
```

### 2.4 Lazy Hydration Contract

subagent 的文件读取边界由 packet 中的引用严格控制：

| 规则 | 说明 |
|------|------|
| **默认读取范围** | subagent 只能读取 `source_refs` 和 `knowledge_refs` 中列出的文件路径 |
| **禁止全局扫描** | 不允许无边界的 glob/grep/find |
| **扩展读取** | subagent 必须在 StageResult 的 `next_actions` 中声明所需路径，等待主 agent 决策 |
| **arbiter 边界** | arbiter 只能读取冲突相关的 `evidence_refs`，禁止重做全量探索 |

### 2.5 Blind 隔离协议

同一 stage 的多个 reviewer subagent 之间：

| 共享 | 隔离 |
|------|------|
| 同一个 StagePacket | 各自的 StageResult |
| — | 其他 reviewer 的 findings |
| — | 主 agent 的怀疑点或预设严重级别 |

- 每个 reviewer 收到的输入 = StagePacket + 该 reviewer 自身的维度清单
- 主 agent 是唯一能看到全部 reviewer 输出的汇总点

## 3. StageResult Schema

StageResult 是 reviewer subagent 的结构化输出。

### 3.1 必填字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `version` | integer | 固定为 `1` |
| `run_id` | string | 与消费的 StagePacket 的 `run_id` 一致 |
| `change_id` | string | 与消费的 StagePacket 的 `change_id` 一致 |
| `stage` | string | 与消费的 StagePacket 的 `stage` 一致 |
| `packet_id` | string | 与消费的 StagePacket 的 `packet_id` 一致 |
| `agent_role` | string | reviewer 维度标识（如 `trace-reviewer`、`verify-completeness`） |
| `summary` | string | 一句话总结（如 `"2 warnings, no critical"`） |
| `decision` | enum | `pass` / `pass_with_warnings` / `fail` / `skip` |

### 3.2 可选字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `needs_arbiter` | boolean | 是否建议触发 arbiter |
| `metrics` | object | `{findings_total, critical, warning, suggestion}` 计数 |
| `findings` | array | finding 条目数组（见 3.3） |
| `evidence_refs` | array | 证据文件引用，每条：`{path, line_range?}` |
| `next_actions` | array | 后续动作请求（如需扩展读取的文件路径） |

**消费者缺省规则**：`findings` 缺失时视为空数组 `[]`；`metrics` 缺失时视为全零 `{findings_total:0, critical:0, warning:0, suggestion:0}`。汇总逻辑和 HTML 渲染必须按此缺省处理，不得假设字段必然存在。

### 3.3 Finding 条目结构

每条 finding：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | finding 唯一标识（如 `"F1"`） |
| `severity` | enum | 是 | `critical` / `warning` / `suggestion` |
| `dimension` | string | 是 | 审查维度标签（如 `TRACE_GAP`、`verify-completeness`） |
| `message` | string | 是 | 问题描述 |
| `trace_id` | string | 否 | 关联的 R 编号（如 `"R3"`） |
| `evidence_ref` | string | 否 | 证据文件路径 + 行号 |

## 4. 阶段特化类型

### 4.1 PlanReviewPacket

继承 StagePacket 基础 schema，`stage` 固定为 `"plan-review"`。

**core_payload 扩展字段：** 无额外字段（基础 schema 的 requirements + trace_mapping + units 已满足 plan-review 审查需求）。

**reviewer 角色：**

| agent_role | 维度 | finding dimension |
|---|---|---|
| `trace-reviewer` | 需求进入设计 | `TRACE_GAP` |
| `granularity-reviewer` | 需求颗粒度 | `COARSE_R` |
| `uniqueness-reviewer` | Trace 唯一性 | `DUPLICATE_R` |
| `design-integrity-reviewer` | 设计完整性 | `GHOST_R` / `ORPHAN` |

**示例实例：**

```json
{
  "version": 1,
  "run_id": "2026-04-13T10:00:00Z-a1b2c3",
  "change_id": "2026-04-13-stage-packet-protocol",
  "stage": "plan-review",
  "packet_id": "plan-review-001",
  "created_at": "2026-04-13T10:00:05Z",
  "producer": "main-agent",
  "budget": {
    "estimated_tokens": 1200,
    "soft_limit": 2000,
    "hard_limit": 4000,
    "truncated_fields": [],
    "shard_count": 1
  },
  "core_payload": {
    "artifact_presence": {
      "proposal": true,
      "specs": true,
      "design": true,
      "tasks": false,
      "test_report": false
    },
    "requirements": [
      {"id": "R1", "summary": "StagePacket 基础结构"},
      {"id": "R2", "summary": "StageResult 基础结构"}
    ],
    "trace_mapping": [
      {"r_id": "R1", "u_ids": ["U1"]},
      {"r_id": "R2", "u_ids": ["U1"]}
    ],
    "units": [
      {"id": "U1", "title": "StagePacket / StageResult 基础 schema 定义"}
    ]
  },
  "optional_refs": {
    "source_refs": [
      {"path": "openspec/changes/2026-04-13-stage-packet-protocol/proposal.md", "kind": "proposal"},
      {"path": "openspec/changes/2026-04-13-stage-packet-protocol/specs/stage-packet-schema/spec.md", "kind": "spec"},
      {"path": "openspec/changes/2026-04-13-stage-packet-protocol/design.md", "kind": "design"}
    ],
    "knowledge_refs": {
      "codemap": [],
      "pitfalls": [
        {"domain": "misc", "path": ".aiknowledge/pitfalls/misc/index.md"}
      ]
    }
  }
}
```

### 4.2 VerifyPacket

继承 StagePacket 基础 schema，`stage` 固定为 `"verify"`。

**core_payload 扩展字段：**

| 字段 | 类型 | 说明 | 层级 |
|------|------|------|------|
| `task_completion` | object | `{completed: N, total: M}` | core_payload |
| `task_traces` | array | 每条：`{task_id: "Task 1", r_ids: ["R1"], u_ids: ["U1"]}` | core_payload |
| `tdd_summary` | object | `{test_first: N, characterization_first: M, direct: K}` | core_payload |
| `test_report_present` | boolean | test-report.md 是否存在 | core_payload |

**reviewer 角色：**

| agent_role | 维度 |
|---|---|
| `verify-completeness` | 任务完成情况 + 规范覆盖率 |
| `verify-correctness` | 需求实现映射 + 场景覆盖率 |
| `verify-consistency` | 设计遵循 + 代码模式一致性 |
| `verify-test-report` | TDD 留档检查 |

**消除双读规则：** subagent 从 `core_payload` 获取结构化事实（task_completion、task_traces、tdd_summary 等），只在需要验证具体代码证据时通过 `optional_refs.source_refs` 中 `kind: "code"` 的路径回读文件。禁止重读 tasks.md / specs / design 全文来获取 core_payload 中已存在的信息。

**示例实例：**

```json
{
  "version": 1,
  "run_id": "2026-04-13T14:00:00Z-d4e5f6",
  "change_id": "2026-04-13-stage-packet-protocol",
  "stage": "verify",
  "packet_id": "verify-001",
  "created_at": "2026-04-13T14:00:05Z",
  "producer": "main-agent",
  "budget": {
    "estimated_tokens": 1500,
    "soft_limit": 2000,
    "hard_limit": 4000,
    "truncated_fields": [],
    "shard_count": 1
  },
  "core_payload": {
    "artifact_presence": {
      "proposal": true,
      "specs": true,
      "design": true,
      "tasks": true,
      "test_report": false
    },
    "requirements": [
      {"id": "R1", "summary": "StagePacket 基础结构"},
      {"id": "R2", "summary": "StageResult 基础结构"}
    ],
    "trace_mapping": [
      {"r_id": "R1", "u_ids": ["U1"]},
      {"r_id": "R2", "u_ids": ["U1"]}
    ],
    "units": [
      {"id": "U1", "title": "StagePacket / StageResult 基础 schema 定义"}
    ],
    "task_completion": {"completed": 6, "total": 6},
    "task_traces": [
      {"task_id": "Task 1", "r_ids": ["R1", "R2", "R3", "R4"], "u_ids": ["U1"]}
    ],
    "tdd_summary": {"test_first": 0, "characterization_first": 0, "direct": 6},
    "test_report_present": false
  },
  "optional_refs": {
    "source_refs": [
      {"path": "openspec/changes/2026-04-13-stage-packet-protocol/tasks.md", "kind": "tasks"},
      {"path": "openspec/changes/2026-04-13-stage-packet-protocol/specs/stage-packet-schema/spec.md", "kind": "spec"},
      {"path": "openspec/changes/2026-04-13-stage-packet-protocol/design.md", "kind": "design"},
      {"path": "openspec/changes/2026-04-13-stage-packet-protocol/proposal.md", "kind": "proposal"},
      {"path": ".claude/skills/opsx-verify/SKILL.md", "kind": "code"},
      {"path": ".claude/skills/opsx-plan-review/SKILL.md", "kind": "code"},
      {"path": ".claude/skills/opsx-report/SKILL.md", "kind": "code"},
      {"path": "docs/stage-packet-protocol.md", "kind": "context"},
      {"path": "docs/workflows.md", "kind": "context"}
    ],
    "knowledge_refs": {
      "codemap": [],
      "pitfalls": []
    }
  }
}
```

## 5. RunReport 数据模型

RunReport 聚合一次 change 运行中所有 stage 的 packet + results，持久化到 `context/run-report-data.json`。

### 5.1 顶层字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `run_id` | string | 本次运行标识 |
| `change_id` | string | change 目录名 |
| `current_stage` | string | 当前所处阶段 |
| `gate_status` | object | `{plan_review: "pass"/"fail"/"pending", verify: "pass"/"fail"/"pending"}` |
| `stages` | object | 各 stage 的 `{packet: StagePacket, results: StageResult[]}` |

### 5.2 写入规则

- 文件不存在 → 创建
- 文件已存在且 JSON 合法 → 读取后合并当前 stage 的数据再写回
- **文件已存在但 JSON 解析失败 → 必须中止写入并向用户报错，禁止以"文件不存在"逻辑覆盖；用户须手动确认后才允许重置**
- 同一 stage 重复执行 → 覆盖该 stage 的旧数据（以最新一次为准）
- 首次创建文件的 stage 负责生成 `run_id`；后续 stage 执行时若文件已存在，必须复用文件中的 `run_id`
- 只有用户显式删除或重置 `context/run-report-data.json` 时，才允许开启新 `run_id`
- verify 在 plan-review 之前执行属于合法场景：verify 作为首个 stage 生成 `run_id`，plan_review gate 状态在 opsx-report 中显示为 "pending"

### 5.3 首版覆盖

`stages` 只包含 `plan-review` 和 `verify` 两个条目。其他 stage 在 HTML 中显示为 `"not_tracked"`。

### 5.4 Trace Overview 降级规则

- 如 RunReport 中尚无 `verify` stage，无法从 `task_traces` 计算 task 覆盖计数
- 此时 HTML 必须显示 `"task coverage unavailable until verify stage"`
- 禁止将缺失数据伪装为 `0/0`
