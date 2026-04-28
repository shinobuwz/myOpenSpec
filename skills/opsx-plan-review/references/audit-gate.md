# Plan Review Audit And Gate

主 agent 根据 reviewer 的 StageResult 写入 `audit-log.md` 与 `.openspec.yaml`。

## Pass

追加：

```md
## plan-review | <ISO8601 时间戳> | pass
方向：specs/**/*.md + design.md → tasks.md
修正：无发现
```

随后在 `.openspec.yaml` 的 `gates:` 下写入：

```yaml
plan-review: "<ISO8601 时间戳>"
```

下一步必须是 `opsx-tasks`。

## Pass With Warning Fixes

先修正 specs/design 中的 warning，再追加：

```md
## plan-review | <ISO8601 时间戳> | pass
方向：specs/**/*.md + design.md → tasks.md
修正：
- F1(warning) <修正描述>
```

随后写入 `gates.plan-review`，下一步必须是 `opsx-tasks`。

## Fail

追加：

```md
## plan-review | <ISO8601 时间戳> | fail
方向：specs/**/*.md + design.md → tasks.md
问题：
- <问题列表>
需修正：
- <需修正内容>
```

失败时不写 gates，必须回到 `opsx-plan` 修正。`COARSE_R` 需要拆分 specs 中的需求；`DUPLICATE_R` 需要统一重新编号后重审。
