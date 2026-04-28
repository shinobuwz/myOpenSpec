# opsx-slice Templates

## 切分报告

```md
## 切分结论

### 总判断
- 结论：KEEP_ONE_CHANGE | SPLIT_MULTI_CHANGE | NEED_EXPLORE_FIRST
- 理由：...

### 能力簇
| 簇 | 用户价值 | 主要模块 | 独立交付性 | 备注 |
|----|----------|----------|------------|------|

### 推荐切分 / Subchanges
1. `<slice-name>`
   - 范围：...
   - 不包含：...
   - 依赖：...
   - 建议 subchange 名：`01-...`
   - proposal 关注点：...

### 执行拓扑
- 父 change：`YYYY-MM-DD-...`
- execution_mode：`serial | parallel | mixed`
- recommended_order：`01-a -> 02-b -> 03-c`
- suggested_focus：`01-a`
- 现在应该进入：`opsx-plan <group>/<subchange>`
```

如果结论是 `KEEP_ONE_CHANGE`，也必须说明为什么不拆。

## proposal.md 要求

slice 初始化的正式 `proposal.md` 默认使用中文。代码标识、capability 名称、文件路径、命令和配置键名保持原文。

至少包含：

- 目标
- 范围内
- 范围外
- 依赖
- 完成标准

proposal 的职责是固定 subchange 关注点和边界；后续 `opsx-plan` 可以小修，但不应从零重写。
