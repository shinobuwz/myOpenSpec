# OPSX Stage Protocol v2

定义 gate stage 审查结论的输出结构和留档格式。

- **权威产物**：`proposal.md`、`specs/`、`design.md`、`tasks.md`、`test-report.md`、代码文件
- **最小状态**：`.openspec.yaml` 中的 schema / gates
- **审查留档**：`audit-log.md`（追加式），记录链路正确性校验结论

## 1. StageResult Schema

StageResult 是 reviewer subagent 的结构化输出。

### 1.1 必填字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `version` | integer | 固定为 `1` |
| `run_id` | string | 唯一标识，格式 `<ISO8601>-<short-hash>` |
| `change_id` | string | change 目录名（如 `2026-04-13-add-auth`） |
| `stage` | string | 阶段名（如 `plan-review`、`verify`） |
| `agent_role` | string | stage 级 reviewer 标识（如 `plan-reviewer`、`verify-reviewer`） |
| `summary` | string | 一句话总结 |
| `decision` | enum | `pass` / `pass_with_warnings` / `fail` / `skip` |

### 1.2 可选字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `metrics` | object | `{findings_total, critical, warning, suggestion}` 计数 |
| `findings` | array | finding 条目数组（见 1.3） |
| `evidence_refs` | array | 证据文件引用，每条：`{path, line_range?}` |
| `next_actions` | array | 后续动作请求 |

消费者缺省规则：

- `findings` 缺失时视为空数组 `[]`
- `metrics` 缺失时视为全零 `{findings_total: 0, critical: 0, warning: 0, suggestion: 0}`

### 1.3 Finding 条目结构

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | finding 唯一标识（如 `"F1"`） |
| `severity` | enum | 是 | `critical` / `warning` / `suggestion` |
| `dimension` | string | 是 | 审查维度标签（如 `TRACE_GAP`、`VERIFY_COMPLETENESS`） |
| `message` | string | 是 | 问题描述 |
| `trace_id` | string | 否 | 关联的 R 编号（如 `"R3"`） |
| `evidence_ref` | string | 否 | 证据文件路径 + 行号 |

## 2. audit-log.md 格式规范

`audit-log.md` 是 change 级链路正确性审查留档，追加模式写入，不覆盖历史。

### 2.1 条目格式

每条审查结果追加一节：

```
## <stage> | <ISO8601 timestamp> | <pass|fail>
方向：<上游产物> → <下游产物>
修正：
- <修正描述 1>
- <修正描述 2>
无发现时写"无发现"
```

**示例（通过）：**
```
## plan-review | 2026-04-14T10:30:00Z | pass
方向：specs/**/*.md + design.md → tasks.md
修正：无发现
```

**示例（失败）：**
```
## verify | 2026-04-14T14:00:00Z | fail
方向：tasks.md + specs/**/*.md + design.md + 代码文件 → 验证未通过
问题：
- Task 3 未完成 [x]
- R5 需求缺少实现证据
需修正：
- 完成 Task 3 实现
- 在 src/auth.ts 添加 R5 对应的权限校验逻辑
```

### 2.2 写入规则

| 条件 | 动作 |
|------|------|
| 文件不存在 | 创建文件并写入第一条条目 |
| 文件已存在 | 追加到文件末尾，不覆盖历史 |
| 文件存在但无法追加（损坏） | 中止并向用户报错，禁止覆盖 |

- 不需要 JSON 解析，格式为纯 markdown
- 每次运行追加新条目，同一 stage 可有多条历史记录
- `opsx-report` 读取时取每个 stage 最后一条记录的 decision

### 2.3 写入者

| stage | 写入者 | 写入时机 |
|-------|--------|----------|
| `plan-review` | opsx-plan-review | 审查完成后（pass 和 fail 均写入） |
| `task-analyze` | opsx-task-analyze | 分析完成后（pass 和 fail 均写入） |
| `verify` | opsx-verify | 验证完成后（pass 和 fail 均写入） |

`opsx-tdd` 不写 `audit-log.md`，其状态在 `test-report.md` 中留档。  
`opsx-review` 不写 `audit-log.md`，其状态在 `review-report.md` 中留档。
