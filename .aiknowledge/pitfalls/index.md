# Pitfalls Knowledge Base

开发过程中积累的踩坑经验，按技术领域分类。

事件驱动维护的长期经验知识。仅当相关模块发生变化、workflow 命中该经验、或 review/bugfix 明确推翻旧结论时，才需要复核 freshness。

## 领域索引

| 领域 | Active | Stale | Superseded | 说明 |
|------|--------|-------|-------------|------|
| [api](api/index.md) | 1 | 0 | 0 | 接口变更、兼容性、序列化、可选字段契约 |
| [config](config/index.md) | 4 | 0 | 1 | 配置管理、config 数据同步、migration 模块设计、工作流门控 |
| [data](data/index.md) | 1 | 0 | 0 | 数据一致性、脏数据、文件读写安全 |
| [misc](misc/index.md) | 8 | 0 | 1 | 其他踩坑经验（AI 工具行为、工作流操作、schema 分类等） |
