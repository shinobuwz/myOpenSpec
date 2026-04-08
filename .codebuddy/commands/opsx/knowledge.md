---
name: OPSX: Knowledge
description: "独立沉淀可复用经验到 .aiknowledge/pitfalls/"
argument-hint: "[command arguments]"
---

执行独立经验沉淀工作流。

适用于一次 bugfix、开发、review 或排障结束后，把可复用经验写入 `.aiknowledge/pitfalls/` 知识库。

## 输入

`/opsx:knowledge` 后可提供一段总结、标题或背景。例如：

- `/opsx:knowledge iOS 首帧音频前必须先等待 session ready`
- `/opsx:knowledge 登录超时问题的回归测试套路`

## 执行要求

1. 如信息不足，先询问最少必要背景
2. 判断技术领域，归入对应目录：
   - `memory` / `concurrency` / `api` / `build` / `testing`
   - `performance` / `security` / `platform` / `data`
   - `network` / `lifecycle` / `config` / `misc`
3. 先读该领域 `index.md`，检查是否有可归并的已有条目
4. 在 `.aiknowledge/pitfalls/<领域>/` 下创建或更新条目
5. 使用统一模板：现象 → 根因 → 修复前 diff → 修复后 diff → 要点 → 来源
6. 更新 L2 领域 index.md 和 L1 顶层 index.md
7. 保持内容简洁、可复用、可检索

## 护栏

- 不把一次性过程记录当作知识沉淀
- 不重复制造多个高重合条目
- 每次必须同步更新索引

