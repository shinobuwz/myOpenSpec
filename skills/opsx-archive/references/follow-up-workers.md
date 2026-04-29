# Archive Follow-up Workers

归档移动完成后必须继续执行 knowledge 和 codemap 更新。

## Knowledge Worker

调用 `opsx-knowledge`。上下文：

```text
刚刚归档了变更或 fast item '<logical-name>'，真实归档路径为 `<archive-path>`。
若来源是 fast item，在 `source_refs` 中使用 `fast:<id>`。
从本次变更的实现、修复和审查发现中提取可复用经验。
尽量复用已有 pitfall 条目，对仍然有效的知识刷新 `last_verified_at`，
对已失效的条目标记 `superseded` 或 `deprecated`，而不是静默覆盖。
```

写入边界：

- 只能写授权的 `.aiknowledge/pitfalls/` 条目和必要月度日志。
- 不改归档产物。
- 不改父 group route。

## Codemap Worker

调用 `opsx-codemap`。上下文：

```text
刚刚归档了变更或 fast item '<logical-name>'，真实归档路径为 `<archive-path>`。
若来源是 fast item，在 `source_refs` 中使用 `fast:<id>`。
为本次变更影响的模块创建或更新 codemap。
若现有 codemap 条目与代码不一致，先将其标记为 `stale`，
验证后恢复为 `active` 并更新 `last_verified_at`。
若 codemap 尚不存在，从头创建，不可跳过。
```

写入边界：

- 只能写授权的 `.aiknowledge/codemap/` 条目和必要月度日志。
- 不改归档产物、父 group route 或 gates。
