# opsx-codemap Templates

## 目录结构

```text
.aiknowledge/codemap/
├── index.md
├── <module>.md
└── chains/
    └── <chain-name>.md
```

## index.md

```md
# Codemap

## 模块

| 模块 | 状态 | 最近复核 | 职责 | 入口 |
|------|------|----------|------|------|
| [module](module.md) | active | YYYY-MM-DD | 职责摘要 | src/entry.ts |

## 链路

| 链路 | 状态 | 最近复核 | 涉及模块 | 说明 |
|------|------|----------|----------|------|
| [flow](chains/flow.md) | active | YYYY-MM-DD | module-a, module-b | 跨模块约束 |
```

## 模块文档

```md
---
status: active
created_at: YYYY-MM-DD
created_from: change:<name> | fast:<id>
last_verified_at: YYYY-MM-DD
last_verified_by: opsx-codemap
verification_basis: codemap-refresh
applies_to:
  - src/module
source_refs:
  - change:<name>
  - fast:<id>
superseded_by:
merged_from:
deprecated_reason:
---

# <模块名>

## 职责

## 关键文件
| 文件 | 角色 |
|------|------|
| src/module/index.ts | 入口 |

## 隐式约束
- ...
```

## 链路文档

```md
---
status: active
created_at: YYYY-MM-DD
created_from: change:<name> | fast:<id>
last_verified_at: YYYY-MM-DD
last_verified_by: opsx-codemap
verification_basis: codemap-refresh
applies_to:
  - src/module-a
source_refs:
  - change:<name>
  - fast:<id>
superseded_by:
merged_from:
deprecated_reason:
---

# <链路名称>

## 触发点

## 调用链

## 隐式约束

## 关键分支
```

链路只在跨 3 个以上文件才能追踪出关键约束时创建。
