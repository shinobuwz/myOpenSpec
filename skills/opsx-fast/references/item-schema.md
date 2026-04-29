# Fast Item Schema

fast item 位于 `openspec/fast/<id>/`。初始化时使用 `runtime/schemas/fast/templates/` 中的模板。

## `.openspec.yaml`

```yaml
schema: fast
kind: fast
id: <id>
source_type: lite
created: YYYY-MM-DD
status: in_progress
attempts:
  count: 0
  max_fast_attempts: 3
test_strategy:
  mode: direct
  reason: ""
  alternative_verification: ""
gates:
  classify:
    status: pass
    at: ""
  preflight:
    status:
    at:
  tdd-strategy:
    status:
    at:
  verify:
    status:
    at:
  review:
    status:
    at:
fallback:
  trigger:
  status:
  route:
  reason:
```

`source_type` 只能是 `lite` 或 `bugfix`。`status` 使用 `in_progress`、`blocked`、`escalated`、`verified`、`archived`。

## `item.md`

必须包含共同 preflight 字段：

- `意图`
- `范围`
- `预期影响`
- `验证计划`
- `升级检查`

还必须记录 TDD 策略。可选值：

- `test-first`
- `characterization-first`
- `direct`

`direct` 必须说明跳过 TDD 的理由，并在 `evidence.md` 写替代验证。

## `evidence.md`

用于记录：

- 命令证据：命令、时间、退出状态、结果。
- 人工观察证据：观察内容、时间、结果。
- TDD 策略证据：策略、理由、替代验证。
- 被否定的尝试：尝试编号、假设、改动摘要、验证结果、否定原因。

## `root-cause.md`

`source_type: bugfix` 必需，字段：

- `现象`
- `预期行为`
- `观察/复现`
- `根因假设`
- `假设证据`
- `回退触发条件`
