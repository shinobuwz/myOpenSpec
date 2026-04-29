# Fast Gate Profile

fast 复用 gate 协议，不复用 formal change artifact 套餐。

```text
fast: classify -> preflight -> tdd-strategy -> patch -> verify -> review? -> archive
```

## Gate Key

- `classify`：确认请求适合 fast，并确定 `source_type`。
- `preflight`：确认中文共同 preflight 完成；bugfix 来源还要确认诊断补充完成。
- `tdd-strategy`：确认 patch 前已记录测试策略。
- `verify`：由 `opsx-verify` 写入。
- `review`：需要风险审查时由 `opsx-review` 写入。

fast 不使用 `plan-review` 和 `task-analyze`。

## Preflight Gate

preflight 缺失时禁止 patch 实现文件。共同字段：

- `意图`
- `范围`
- `预期影响`
- `验证计划`
- `升级检查`

bugfix 补充字段：

- `现象`
- `预期行为`
- `观察/复现`
- `根因假设`
- `假设证据`
- `回退触发条件`

## TDD 策略 Gate

所有 fast item 都必须在 patch 前记录：

- 策略：`test-first`、`characterization-first` 或 `direct`。
- 选择理由。
- 验证计划。

涉及可测试行为时必须使用 `opsx-tdd`。选择 `direct` 时必须在 `evidence.md` 记录跳过 TDD 的理由和替代验证命令。
