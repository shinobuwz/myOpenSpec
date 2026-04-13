---
status: active
created_at: 2026-04-13
created_from: change:2026-04-13-stage-packet-protocol
last_verified_at: 2026-04-13
last_verified_by: opsx-knowledge
verification_basis: review
applies_to:
  - openspec/verify/VerifyPacket
  - .claude/skills/opsx-verify/
superseded_by:
---

# VerifyPacket source_refs 中协议/工作流文档应使用 kind: "context"

**标签**：[openspec, verify, source_refs, schema]

## 现象

在 VerifyPacket 的 `source_refs` 中，对 `docs/` 下的协议文档和工作流文档使用了 `kind: "code"`，导致消费侧将其按可执行代码处理（如做代码行号定位），而非作为参考上下文读取，分类语义错误。

## 根因

`source_refs` 的 `kind` 字段有明确语义区分：
- `"code"`：可执行源文件、脚本、配置
- `"context"`：协议规范、设计文档、工作流说明

填写者未注意区分，对所有引用统一使用了 `"code"`。

## 修复前

```diff
- source_refs:
-   - path: docs/stage-packet-protocol.md
-     kind: "code"
-   - path: docs/workflows.md
-     kind: "code"
```

## 修复后

```diff
+ source_refs:
+   - path: docs/stage-packet-protocol.md
+     kind: "context"
+   - path: docs/workflows.md
+     kind: "context"
```

## 要点

`docs/` 下的协议文档、工作流说明一律使用 `kind: "context"`；只有可执行的源码文件才用 `kind: "code"`。

## 来源

change: 2026-04-13-stage-packet-protocol（2026-04-13）
