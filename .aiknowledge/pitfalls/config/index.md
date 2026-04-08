# Config Pitfalls

配置管理、环境变量、Feature Flag、config 数据同步等踩坑经验。

## 条目

| 条目 | 摘要 |
|------|------|
| [migration.ts 作为跨模块 config 同步的粘合层](migration-as-config-glue-layer.md) | migration.ts 适合放置跨 global-config 与 profiles 的幂等升级逻辑；内部清理同步静默执行，不输出日志 |
