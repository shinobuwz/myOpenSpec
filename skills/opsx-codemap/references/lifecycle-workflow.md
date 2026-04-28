# opsx-codemap Lifecycle Workflow

## Freshness

- `active`：当前可用于定位代码和判断模块边界。
- `stale`：文档可能漂移，只能作为线索，使用前必须刷新。
- `superseded`：已被新条目或新链路替代，默认不直接消费。

发现漂移时先标记 stale，再刷新内容；不要在不确定时直接覆盖旧结论。

## 场景 A：入口初始化

用于 explore 开始时，codemap 缺失或目标模块未覆盖。

1. 根据用户需求识别涉及模块，只覆盖本次需要理解的范围。
2. 读取 `.aiknowledge/codemap/index.md`，确认模块是否存在或 stale。
3. 对缺失或 stale 模块读取入口和核心实现文件。
4. 生成模块文档：职责、关键文件、隐式约束。
5. 如发现复杂跨模块链路，新增 chain。
6. 更新 index 和月度日志。

## 场景 B：出口更新

用于 archive 后，变更涉及模块有代码或架构事实变化。

1. 形成 `source_refs`：`change:<name>`、`audit-log:<path>`、`test-report:<path>`、`review-report:<path>`。
2. 读取受影响模块文档和必要代码。
3. 判断职责、关键文件、隐式约束或 chain 是否漂移。
4. 只刷新变更涉及的部分，并更新 frontmatter verification 字段。
5. 新增或刷新 chains。
6. 同步 index 状态和月度日志。

## stale 判定信号

- 关键文件删除、重命名或移动。
- 模块边界变化，原职责不再准确。
- 链路中的关键调用顺序与代码不一致。
- 文档记录的隐式约束被当前实现推翻。

新增文件但不影响既有边界时，可直接刷新 `last_verified_at`，不必先标 stale。

## 写入规则

- 只更新涉及模块，不全量重写。
- 状态附着在条目 frontmatter，index 只是摘要视图。
- 替代正式条目时保留 tombstone。
- 写入后检查 `superseded_by` 指向真实条目，并确认 index 状态与条目一致。
