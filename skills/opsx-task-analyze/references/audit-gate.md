# Task Analyze Audit And Gate

主 agent 根据 reviewer 的 StageResult 写入 `audit-log.md` 与 `.openspec.yaml`。

## Pass

```md
## task-analyze | <ISO8601 时间戳> | pass
方向：specs/**/*.md + design.md → tasks.md
修正：无发现
```

随后写入 `.openspec.yaml`：

```yaml
task-analyze: "<ISO8601 时间戳>"
```

下一步必须是 `opsx-implement`。

## Pass With Quality Fixes

先修正 `tasks.md` 中的 QUALITY warning，再追加：

```md
## task-analyze | <ISO8601 时间戳> | pass
方向：specs/**/*.md + design.md → tasks.md
修正：
- F1(warning) <修正描述>
```

随后写入 `gates.task-analyze`。

## Fail

```md
## task-analyze | <ISO8601 时间戳> | fail
方向：specs/**/*.md + design.md → tasks.md
问题：
- <问题列表>
需修正：
- <需修正内容>
```

失败时不写 gates。普通 `GAP` / `MISMATCH` / `QUALITY` 回到 `opsx-tasks`；`OVERSIZED_CHANGE` 回到 `opsx-plan` 缩小或拆分范围。
