---
name: OPSX: Bugfix
description: "精简 bugfix 工作流：直接定位、修复、验证并沉淀经验"
argument-hint: "[command arguments]"
---

执行精简 bugfix 工作流。

适用于明确缺陷的快速修复，不要求手动依次运行 explore、plan、tdd、review 等完整前置流程。你应当在一次工作流中完成：

定位问题 → 判断测试策略 → 修复 → 验证 → 经验总结

## 输入

`/opsx:bugfix` 后的参数应描述 bug 现象、期望行为或复现线索。例如：

- `/opsx:bugfix 登录超时后仍显示已登录`
- `/opsx:bugfix 修复导出接口空数据时崩溃`

## 执行要求

1. 如果描述不清楚，先询问最少必要信息
2. 根据情况选择：
   - `[test-first]`
   - `[characterization-first]`
   - `[direct]`
3. 完成修复
4. 运行验证
5. 在 `.aiknowledge/pitfalls/<领域>/` 中补一条经验，必要时调用 `/opsx:knowledge`
   - **写之前先 `ls .aiknowledge/pitfalls/`**，确认目标目录是否已存在再决定新建还是追加
   - 不得按平台名（微信/抖音等）细分子目录，平台内容统一归入 `platform/`
   - 新增或追加后必须同步更新该领域 index.md 和顶层 index.md

## 护栏

- 不把简单 bugfix 膨胀成完整功能开发流程
- 不强制创建 OpenSpec change 文档
- 不默认跳过测试；必须先判断再决定
- 如果范围升级为功能或架构调整，暂停并建议切回常规流程

