# 知识库三层披露的消费侧缺口

**标签**：[workflow, knowledge, aiknowledge, progressive-disclosure]

## 现象

在 `.aiknowledge/pitfalls/` 中写了详细的 L3 条目，但消费侧 skill（continue/ff/bugfix/explore）只读取到 L2 索引（`<领域>/index.md`），导致 L3 详细经验在实际开发中从未被参考。

## 根因

三层渐进式披露设计（L1 领域列表 → L2 条目摘要 → L3 完整内容）在生产侧（写入）完整实现，但消费侧（读取）只走了两层就停下。L2 索引只有标题和一句话摘要，不足以指导实际决策。

## 修复前

```diff
- # skill 中的知识预加载
- Read .aiknowledge/pitfalls/index.md          # L1
- Read .aiknowledge/pitfalls/<领域>/index.md   # L2
- # 到此为止，L3 详细条目从未被读取
```

## 修复后

```diff
+ # skill 中的知识预加载
+ Read .aiknowledge/pitfalls/index.md          # L1 — 定位相关领域
+ Read .aiknowledge/pitfalls/<领域>/index.md   # L2 — 扫描条目摘要
+ # L2 命中相关条目后，继续读取 L3
+ Read .aiknowledge/pitfalls/<领域>/<slug>.md   # L3 — 获取完整经验
```

## 要点

渐进式披露架构必须在消费侧也完整实现，否则详细层级形同虚设。修复方式：在消费侧 skill 的预加载指令中显式要求"L2 命中后继续读 L3 完整条目"。同理适用于 codemap 等其他三层知识结构。

## 来源

change: fix-workflow-consistency（2026-04-13）
