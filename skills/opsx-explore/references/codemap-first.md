# Codemap-First Exploration

## 强制协议

任何需要搜索源码的探索，在 glob / grep / 读大量文件之前，必须：

1. 读取 `.aiknowledge/codemap/index.md`。
2. 判断目标模块是否被覆盖。
3. 覆盖且 `active` 时，按 codemap 精确读取关键文件。
4. 缺失、未覆盖或 `stale` 时，先调用 `opsx-codemap` 刷新或初始化地图。
5. 读取 `.aiknowledge/pitfalls/index.md`，命中领域时再读领域 index 或具体条目。

一句话：搜源码之前，先看地图；没有地图，先画地图。

## 状态含义

- `active`：可以作为探索起点。
- `stale`：只能作为线索，依赖前必须刷新。
- `superseded`：优先跳转到替代条目。

## 地图原则

`.aiknowledge/codemap/` 的目标是告诉 agent 去哪里找，而不是替代读代码。

```text
.aiknowledge/codemap/
├── index.md
├── <module>.md
└── chains/
    └── <chain-name>.md
```

- 文件级粒度：关键文件 + 一句话角色。
- 过时即刷新：发现文档与代码不一致时，先视为 stale。
- 不做无边界全局扫描：确需搜索时，用 `rg` 并限制范围。
