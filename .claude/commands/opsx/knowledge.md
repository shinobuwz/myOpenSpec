---
name: "OPSX: Knowledge"
description: 独立沉淀可复用经验到 .aiknowledge/pitfalls/
category: 工作流
tags: [workflow, knowledge, pitfall, pattern, testing]
---

执行独立经验沉淀工作流。

适用于一次 bugfix、开发、review 或排障结束后，把可复用经验写入 `.aiknowledge/pitfalls/` 知识库。

## 输入

`/opsx:knowledge` 后可提供一段总结、标题或背景。例如：

- `/opsx:knowledge iOS 首帧音频前必须先等待 session ready`
- `/opsx:knowledge 登录超时问题的回归测试套路`

## 执行要求

1. 如信息不足，先询问最少必要背景
2. **先读 `.aiknowledge/pitfalls/index.md`**，获取已有领域列表（不存在则从头创建）
3. 判断技术领域，按以下优先级选择：
   - **首选：** 从 L1 index 中已有的领域选（优先复用现有分类）
   - **次选：** 从预定义列表选：`memory` / `concurrency` / `api` / `build` / `testing` / `performance` / `security` / `platform` / `data` / `network` / `lifecycle` / `config` / `misc`
   - **没有匹配：** 一律归入 `misc/`，**禁止**创建项目特定目录（如 `audio-conn/`、`miniprogram/`）
4. 先读该领域 `index.md`，检查是否有可归并的已有条目
5. 在 `.aiknowledge/pitfalls/<领域>/` 下创建或更新条目
6. 使用统一模板：现象 → 根因 → 修复前 diff → 修复后 diff → 要点 → 来源
7. 更新 L2 领域 index.md 和 L1 顶层 index.md
8. 保持内容简洁、可复用、可检索

## 完成前强制自检

每次写入后逐项确认，有任何一项未完成则必须补全：

```
[ ] 条目写入的领域属于：已有领域 OR 预定义列表 中的某一个
[ ] 未创建项目特定的自定义目录名
[ ] L2 领域 index.md 已存在且本条目已加入表格
[ ] L1 pitfalls/index.md 已更新，条目数准确
[ ] 条目使用了标准模板（含现象/根因/修复前/修复后/要点/来源）
```

## 护栏

- 不把一次性过程记录当作知识沉淀
- 不重复制造多个高重合条目
- 每次必须同步更新索引
- **绝对禁止**：以问题现象或模块名命名领域目录（如 `audio-conn/`、`session-bug/`）

