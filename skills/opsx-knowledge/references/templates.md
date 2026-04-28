# opsx-knowledge Templates

## 目录结构

```text
.aiknowledge/pitfalls/
├── index.md
├── api/
│   ├── index.md
│   └── <short-slug>.md
└── misc/
    ├── index.md
    └── <short-slug>.md
```

## 预定义领域

| 目录 | 覆盖范围 |
|------|----------|
| `memory/` | 内存泄漏、OOM、循环引用、野指针、引用计数 |
| `concurrency/` | 死锁、竞态条件、线程安全、异步陷阱 |
| `api/` | 接口变更、兼容性破坏、序列化、版本适配 |
| `build/` | 编译错误、依赖冲突、链接问题、打包陷阱 |
| `testing/` | 测试陷阱、mock 泄漏、flaky test、覆盖率盲区 |
| `performance/` | 性能退化、N+1 查询、渲染卡顿、CPU/IO 瓶颈 |
| `security/` | 注入、权限绕过、密钥泄露 |
| `platform/` | Android/iOS/Web/小程序等平台差异 |
| `data/` | 数据一致性、脏数据、迁移失败、缓存不一致 |
| `network/` | 超时、重试风暴、DNS、证书、代理 |
| `lifecycle/` | 生命周期管理、初始化顺序、销毁遗漏、状态机 |
| `config/` | 配置错误、环境变量、Feature Flag、灰度 |
| `misc/` | 不属于以上类别的其他经验 |

## 条目模板

```md
---
status: active
created_at: YYYY-MM-DD
created_from: metadata-backfill | change:<name> | commit:<sha>
last_verified_at: YYYY-MM-DD
last_verified_by: opsx-knowledge | opsx-archive | opsx-bugfix
verification_basis: archive | bugfix | review | repository-audit
applies_to:
  - module/or/path
source_refs:
  - change:<name>
superseded_by:
merged_from:
deprecated_reason:
---

# <简短描述>

**标签**：[语言/平台标签]

## 现象

## 根因

## 修复前

```diff
- 问题片段
```

## 修复后

```diff
+ 修复片段
```

## 要点

## 来源
```

## Index 模板

L2 领域 index：

```md
| ID | 标题 | 状态 | 最近复核 | 关键词 |
|----|------|------|----------|--------|
| slug | [标题](slug.md) | active | YYYY-MM-DD | keyword |
```

L1 顶层 index：

```md
| 领域 | Active | Stale | Superseded | 说明 |
|------|--------|-------|-------------|------|
| [misc](misc/index.md) | N | 0 | 0 | 其他经验 |
```

## 完成自检

- 条目领域属于已有领域或预定义领域。
- L2 index 已添加条目，表格行数与文件数一致。
- L1 index 计数已同步。
- frontmatter 包含 status、verification、applies_to、source_refs。
- merge 保留 tombstone，deprecate 填写原因。
- 当前月度日志已追加中文摘要。
