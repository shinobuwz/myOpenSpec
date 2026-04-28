---
name: opsx-knowledge
description: 独立的经验沉淀工作流。将一次修复、开发或排障中的可复用经验整理到 .aiknowledge/ 知识库。
---

执行经验沉淀工作流。目标是把一次具体工作中的可复用信息整理为可检索、可复用的 pitfall 条目。

## 硬边界

- 写入前必须先读取 `.aiknowledge/README.md`，以它作为 lifecycle canonical source。
- OpenSpec change、commit、audit-log、test-report、review-report 是默认事实来源，优先写入 `source_refs`，不要复制 raw source。
- 每次新增、更新、合并、废弃或 lint 修复后，必须更新 L1/L2 index，并追加当前月度日志 `.aiknowledge/logs/YYYY-MM.md`。
- 合并正式索引过的条目时必须保留 `superseded` tombstone；只有未索引、未引用、从未正式消费的孤儿文件才可删除。
- 本 skill 只维护 `.aiknowledge/pitfalls/`，不修改产品代码、测试代码或 OpenSpec gates。

## 输入 / 输出边界

**读取：**
- `.aiknowledge/README.md`
- 用户输入、最近修改、相关测试、相关提交信息
- `.aiknowledge/pitfalls/index.md` 和命中的领域索引
- 需要引用的最小 git diff 片段

**写入：**
- `.aiknowledge/pitfalls/index.md`
- `.aiknowledge/pitfalls/<domain>/index.md`
- `.aiknowledge/pitfalls/<domain>/<slug>.md`
- `.aiknowledge/log.md`（仅维护 shard 链接）
- `.aiknowledge/logs/YYYY-MM.md`

## 快速流程

1. 读取 `.aiknowledge/README.md`，确认 lifecycle 和默认中文规则。
2. 收集事实来源，形成 `source_refs`。
3. 先读 L1 `.aiknowledge/pitfalls/index.md`，选择已有领域；没有完全匹配时优先 `misc/`。
4. 读取目标领域 index，查找相似条目；相似则更新/合并，不重复创建。
5. 创建或更新 L3 条目，并同步 L2/L1 index。
6. 执行索引一致性校验。
7. 追加当前月度日志。

## Reference 导航

- `references/lifecycle-workflow.md`：领域选择、相似条目处理、索引一致性、merge/supersede/deprecate 细节。
- `references/templates.md`：目录结构、预定义领域、条目模板、L1/L2 index 模板和完成自检清单。

## 护栏

- 不把经验总结写成一次性流水账。
- 不重复创建多个高相似度条目。
- 不创建项目特定领域目录；优先复用已有领域，无法归类时用 `misc/`。
- 条目必须聚焦一个问题或一个模式。
- 发现旧条目不成立时，标记 `superseded` 或 `deprecated`，不要静默覆盖历史。
