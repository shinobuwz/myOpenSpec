# Lite-run Template

lite-run 路径：

```text
.aiknowledge/lite-runs/YYYY-MM/<run-id>.md
```

自然语言默认使用中文，除非用户明确要求英文。路径、命令、配置键名、frontmatter key 和稳定标识符保持原文。

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

为什么改。

## 范围

改了哪些文件。

## 变更

实际改了什么。

## 验证

运行了什么命令，结果如何。

## 风险

剩余风险或未验证项。

## 知识沉淀

是否沉淀到 `.aiknowledge/pitfalls` / `.aiknowledge/codemap`。
```
