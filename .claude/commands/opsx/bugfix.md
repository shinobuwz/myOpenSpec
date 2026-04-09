---
name: "OPSX: Bugfix"
description: 精简 bugfix 工作流：直接定位、修复、验证并沉淀经验
category: 工作流
tags: [workflow, bugfix, fix]
---

执行精简 bugfix 工作流。

适用于明确缺陷的快速修复，不要求手动依次运行 explore、plan、tdd、review 等完整前置流程。你应当在一次工作流中完成：

定位问题 → 判断测试策略 → 修复 → 验证 → codemap 更新（按需）→ 经验总结

## 输入

`/opsx:bugfix` 后的参数应描述 bug 现象、期望行为或复现线索。例如：

- `/opsx:bugfix 登录超时后仍显示已登录`
- `/opsx:bugfix 修复导出接口空数据时崩溃`

## 执行要求

1. 如果描述不清楚，先询问最少必要信息
2. 读 `.aiknowledge/codemap/index.md` 辅助定位涉及模块
3. 根据情况选择：
   - `[test-first]`
   - `[characterization-first]`
   - `[direct]`
4. 完成修复
5. 运行验证
6. 如 fix 涉及模块边界或调用链变化，调用 `/opsx:codemap` 更新
7. 在 `.aiknowledge/pitfalls/<领域>/` 中补一条经验，必要时调用 `/opsx:knowledge`

## 护栏

- 不把简单 bugfix 膨胀成完整功能开发流程
- 不强制创建 OpenSpec change 文档
- 不默认跳过测试；必须先判断再决定
- 如果范围升级为功能或架构调整，暂停并建议切回常规流程

