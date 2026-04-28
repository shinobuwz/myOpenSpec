# opsx-knowledge Lifecycle Workflow

## Freshness

pitfall 条目采用事件驱动维护：

- `active`：当前可直接作为约束输入。
- `stale`：只能作为调查线索，使用前需要复核。
- `superseded`：已被新条目替代，默认跳转到替代条目。
- `deprecated`：仅保留历史，不参与当前决策。

## 领域选择

1. 先读 `.aiknowledge/pitfalls/index.md`。
2. 首选已有领域。
3. 次选预定义通用技术领域。
4. 没有完全匹配时使用 `misc/`。
5. 禁止用项目、平台、模块或现象创建专用领域目录。

## 新增或更新条目

1. 收集上下文：用户输入、最近修改、测试结果、提交或 change 产物。
2. 形成稳定 `source_refs`：`change:<name>`、`commit:<sha>`、`audit-log:<path>`、`test-report:<path>`、`review-report:<path>`。
3. 读取领域 index，查找高度相似条目。
4. 相似条目仍成立时刷新验证信息；不再成立时标记 `superseded` 或 `deprecated`。
5. 新条目使用 kebab-case 文件名，写入 `.aiknowledge/pitfalls/<domain>/<slug>.md`。
6. 同步领域 index 和顶层 index。
7. 追加当前月度日志。

## 合并和 tombstone

两个正式索引过的条目表达同一规则时：

- 保留 canonical 条目。
- 被合并条目标记为 `superseded`，填写 `superseded_by`。
- canonical 条目的 `merged_from` 记录来源。
- 默认不删除历史文件。

只有同时满足未索引、未引用、从未正式消费的孤儿文件，才允许删除。

## 索引一致性校验

每次进入或写入后都要确认文件系统与 index 一致：

```bash
ls .aiknowledge/pitfalls/<domain>/*.md | grep -v index.md | wc -l
grep -c '^|.*\\[.*\\](.*\\.md)' .aiknowledge/pitfalls/<domain>/index.md
```

- 文件数大于索引行数：读取孤儿条目，合并、补索引或保留 tombstone。
- 索引行数大于文件数：移除引用不存在文件的幽灵行。
- 修复后更新 L1 index 计数。
