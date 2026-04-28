---
name: opsx-codemap
description: 独立维护 .aiknowledge/codemap/ 架构认知地图。初始化缺失模块的 codemap，或在变更后更新受影响模块。
---

执行 codemap 维护工作流。目标是把项目架构认知固化为可复用地图，写入 `.aiknowledge/codemap/`。

## 硬边界

- 写入前必须先读取 `.aiknowledge/README.md`，以它作为 lifecycle canonical source。
- codemap-only：本 skill 只写 `.aiknowledge/codemap/` 和日志，不修改产品代码、测试代码或 OpenSpec gates。
- 采用 index-first：先读 `.aiknowledge/codemap/index.md`，再按需读模块文档或 chains。
- 只更新受影响模块；不做无关全量重写。
- 每次新增、刷新、替代、废弃或 lint 修复后，必须追加当前月度日志 `.aiknowledge/logs/YYYY-MM.md`。
- 替代正式索引过的模块或链路时保留 `superseded` tombstone，禁止静默删除历史文件。

## 输入 / 输出边界

**读取：**
- `.aiknowledge/README.md`
- `.aiknowledge/codemap/index.md`、现有模块文档、现有链路文档
- 与目标模块相关的代码文件
- 相关 change、archive 或 explore 上下文

**写入：**
- `.aiknowledge/codemap/index.md`
- `.aiknowledge/codemap/<module>.md`
- `.aiknowledge/codemap/chains/<chain-name>.md`
- `.aiknowledge/log.md`（仅维护 shard 链接）
- `.aiknowledge/logs/YYYY-MM.md`

## 快速流程

1. 读取 `.aiknowledge/README.md` 和 codemap index。
2. 判断触发场景：入口初始化或归档后出口更新。
3. 只读取目标模块关键文件，记录文件级职责和隐式约束。
4. 需要跨 3 个以上文件才能理解的调用链，写入 `chains/<chain-name>.md`。
5. 同步 index 状态和条目 frontmatter。
6. 追加当前月度日志。

## Reference 导航

- `references/lifecycle-workflow.md`：入口初始化、出口更新、freshness/stale 处理和写入规则。
- `references/templates.md`：codemap 目录结构、index/module/chain 模板和文件级粒度要求。

## 护栏

- 地图而非百科：记录“在哪里”和“怎么连”，不记录实现细节。
- 文件级粒度：关键文件精确到文件 + 一句话角色，不到类/函数。
- source_refs 必须引用稳定来源；不能把无来源推断写成确定事实。
- 发现文档漂移时先标记 stale，再刷新内容。
