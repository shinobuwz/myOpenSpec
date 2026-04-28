# Lite Runs（轻量运行记录）

`lite-runs/` 存放 `opsx-lite` 执行后的事实记录。

lite-run 是小改动的轻量审计记录，不是正式 OpenSpec change，不能包含 proposal/design/spec/tasks/gates。

## 语言规则

lite-run 正文默认使用中文，除非用户明确要求英文。路径、命令、配置键名、frontmatter key、状态枚举和稳定标识符保持原文。

## Layout

```
.aiknowledge/lite-runs/
└── YYYY-MM/
    └── YYYY-MM-DD-short-topic.md
```

## 来源引用

知识条目可以这样引用 lite-run：

```yaml
source_refs:
  - lite-run:YYYY-MM-DD-short-topic
```

如果后续已有 commit，优先同时保留两类来源：

```yaml
source_refs:
  - lite-run:YYYY-MM-DD-short-topic
  - commit:<sha>
```

## Template

```md
---
id: YYYY-MM-DD-short-topic
created_at: YYYY-MM-DDTHH:MM:SSZ
kind: lite
status: done
source_refs:
---

# <short-topic>

## 意图

为什么要做这个小改动。

## 范围

改了哪些文件。

## 变更

实际改了什么。

## 验证

运行了什么命令，结果如何。

## 风险

剩余风险或未验证项。

## 知识沉淀

是否沉淀到 `.aiknowledge/pitfalls` 或 `.aiknowledge/codemap`。
```

## Rules

- lite-run 保持事实化、简洁。
- 不复制完整 diff，除非理解问题确实需要。
- 不用 lite-run 承接新功能、多模块变更或设计较重的工作。
- 如果 lite-run 发现可复用知识，创建或更新对应 pitfall/codemap 条目，并引用该 lite-run。
