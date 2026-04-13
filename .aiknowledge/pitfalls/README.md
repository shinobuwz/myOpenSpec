# 经验知识库

按技术领域组织的可复用工程经验。三层渐进式披露：

## 目录结构

```
.aiknowledge/pitfalls/
├── index.md              ← L1 顶层：领域列表 + 条目数量
├── <领域>/
│   ├── index.md          ← L2 领域：条目标题 + 一句话摘要
│   └── <slug>.md         ← L3 条目：完整描述含 diff
```

## 技术领域

| 目录 | 覆盖范围 |
|------|----------|
| memory | 内存泄漏、OOM、循环引用、野指针 |
| concurrency | 死锁、竞态条件、线程安全、异步陷阱 |
| api | 接口变更、兼容性破坏、序列化 |
| build | 编译错误、依赖冲突、链接问题 |
| testing | 测试陷阱、mock 泄漏、flaky test |
| performance | 性能退化、N+1 查询、渲染卡顿 |
| security | 安全漏洞、注入、权限绕过 |
| platform | 平台差异（Android/iOS/Web）踩坑 |
| data | 数据一致性、脏数据、迁移失败 |
| network | 超时、重试风暴、DNS、证书 |
| lifecycle | 生命周期、初始化顺序、销毁遗漏 |
| config | 配置错误、环境变量、Feature Flag |
| misc | 其他 |

## 条目模板

每条经验包含：现象、根因、修复前 diff、修复后 diff、要点、来源。

## Freshness 机制

pitfall 条目采用事件驱动的 freshness 管理，而不是按时间自动过期。

- `active`：当前可直接作为约束输入
- `stale`：只能作为调查线索，使用前需要复核
- `superseded`：已被新条目替代，默认跳转到替代条目
- `deprecated`：仅保留历史，不参与当前决策

推荐 frontmatter：

```md
---
status: active
created_at: YYYY-MM-DD
created_from: metadata-backfill | change:<name> | commit:<sha>
last_verified_at: YYYY-MM-DD
last_verified_by: opsx-archive | opsx-bugfix | opsx-knowledge
verification_basis: archive | bugfix | review | repository-audit
applies_to:
  - path/or/module
superseded_by:
---
```
