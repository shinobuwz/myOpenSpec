---
status: active
created_at: 2026-04-27
created_from: change:2026-04-27-changes-status-detail
last_verified_at: 2026-04-27
last_verified_by: opsx-archive
verification_basis: archive
applies_to:
  - runtime/bin/changes.sh
superseded_by:
---

# status 命令不应退化为 list 别名

**标签**：workflow, cli, diagnostics

## 现象

`opsx changes list` 和 `opsx changes status` 输出完全相同，用户无法通过 `status` 判断当前 change 的 gates、reports 或下一步动作。

## 根因

命令分支把 `list|status` 映射到同一个 `list_changes` 函数，导致语义上应为诊断视图的 `status` 退化成目录清单。

## 修复前

```diff
-  list|status)
-    list_changes
-    ;;
```

## 修复后

```diff
+  list)
+    list_changes
+    ;;
+  status)
+    status_changes
+    ;;
```

## 要点

CLI 中 `list` 应保持紧凑清单，`status` 应显示诊断信息和下一步建议；否则用户会把“能列出”误判为“状态清楚”。

## 来源

change: 2026-04-27-changes-status-detail（2026-04-27）
