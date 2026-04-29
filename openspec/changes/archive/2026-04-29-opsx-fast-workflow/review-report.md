## review | 2026-04-29T07:17:51Z | fail

发布风险审查未通过。

### CRITICAL

- `VERIFY_DRIFT`：`.aiknowledge/codemap/index.md` 仍将 `bugfix 旁路` 标记为 `active`，但本次变更已删除 `skills/opsx-bugfix/`。用户或 agent 按 active codemap 定位快速修复入口时，可能被引导到已删除 workflow，无法正确路由到 `opsx-fast`。

### WARNING

- `runtime/bin/changes.sh` 的 `list_changes()` 在没有 active formal change 时提前返回，导致仅存在 active fast item 的项目执行 `opsx changes list` 不展示 fast item。

### 处理要求

- 将 codemap active 链路更新为 `opsx-fast` 快速通道，或将旧 bugfix 旁路标记为 superseded 并指向 fast。
- 调整 `list_changes()` 先同时收集 formal changes 与 fast items，再决定空输出。
- 增加对应回归测试。

## review | 2026-04-29T07:23:54Z | pass

发布风险审查通过。

### Findings

- CRITICAL：无。
- WARNING：无。
- SUGGESTION：无。

### 复查结论

- `.aiknowledge/codemap/index.md` 已将 active 链路改为 `opsx-fast 快速通道`，不再 active 指向已删除的 `opsx-bugfix`。
- `runtime/bin/changes.sh` 的 `list_changes()` 已先收集 formal changes 和 fast items，再统一判断空输出；fast-only 项目会展示 `活动 fast items`，有 formal changes 时原输出不破坏。
- runtime gate parser 已支持 scalar gate 和 nested `status/at` gate；fast `review_required: false` 路由到 archive，archive skill 也明确不要求 `gates.review`。
- `skills/opsx-lite/`、`skills/opsx-bugfix/` 已删除；剩余 `opsx-lite` 命中仅为历史记录或历史 source ref，不是 active 入口。

### 验证

- `npm test` 通过：63/63。
- `npm run check:skill-slimming` 通过：skills=18、oversized=0、duplicates=0。
- `./runtime/bin/changes.sh -p /Users/cc/MyHarness/OpenSpec-cn list/status` 输出正常。
