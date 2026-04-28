# opsx-lite Workflow

## classify

判断请求是否适合 lite。命中以下任一条件时停止 patch，转入 `opsx-slice -> opsx-plan`：

- 新 capability。
- 多模块或多系统联动。
- 需要方案对比或设计取舍。
- 涉及 API / CLI / 数据格式 / 权限 / 安全 / 兼容性。
- 测试策略不明确。
- 改动范围已经不再小。

## inspect

按 index-first 收集上下文：

1. 读取 `.aiknowledge/codemap/index.md`。
2. 命中模块时读取对应 codemap；未覆盖且需要架构定位时调用 `opsx-codemap`。
3. 读取 `.aiknowledge/pitfalls/index.md`。
4. 命中领域时读取对应领域 index；需要具体约束时再读取 L3 条目。
5. 读取目标文件。

## patch

- 只做本次请求范围内的最小改动。
- 不顺手重构无关代码。
- 发现范围扩大时停止并升级正式流程。

## verify

- 文档/skill 改动：`rg` 引用检查、格式或链接检查。
- 脚本/代码改动：相关测试或最小复现命令。
- 包装/发布改动：按风险运行 `npm test`、`npm pack --dry-run` 等。

验证命令和结果必须写入 lite-run。

## review

用轻量 diff 自查：

- 是否改动超出请求范围。
- 是否破坏兼容性。
- 是否存在未验证项。
- 是否命中已知 pitfalls。
- 是否有 fresh verification evidence 支撑完成声明。

## exit

输出改了什么、验证了什么、lite-run 路径、是否产生 knowledge/codemap 更新、是否建议 commit。
