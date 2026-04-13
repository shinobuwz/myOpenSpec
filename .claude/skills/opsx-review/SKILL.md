---
name: opsx-review
description: 使用 subagent 进行独立代码审查，输出质量指标和分级问题。当验证通过后需要更深入的代码质量评估时使用。
license: MIT
compatibility: 需要 openspec CLI。
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.2.0-cc.4"
---

代码审查 Skill。使用 subagent 进行独立的代码审查，输出质量指标和分级问题列表。

## 启动序列

1. 确认 opsx-verify 验证已通过
2. 收集本次变更的所有代码差异
3. 读取相关的设计文档和规格说明
4. 按需读取 `.aiknowledge/`：
   - 先读 `.aiknowledge/codemap/index.md`（如存在），识别本次变更涉及的模块
   - 仅读取命中模块的 `<module>.md`，获取模块边界和调用链，避免重新探索
   - 先读 `.aiknowledge/pitfalls/index.md`（如存在），识别领域
   - 仅读取命中领域的 `<domain>/index.md`，审查时重点核对已知易错点

## 审查方式

使用 Agent tool 启动 subagent 进行独立审查。subagent 接收上方 codemap/pitfalls 摘要作为上下文，只读取代码和文档，不做任何修改。审查结果由 subagent 汇报，主 agent 汇总输出。

## 审查维度

| 维度 | 关注点 |
|------|--------|
| 安全 | SQL 注入、XSS、敏感信息泄露、权限绕过、输入验证 |
| 性能 | 算法复杂度、内存泄漏、N+1 查询、不必要的计算 |
| 可维护性 | 代码复杂度、命名清晰度、模块耦合度、注释质量 |
| 测试 | 覆盖率、测试质量、边缘情况、mock 合理性 |

## 问题分级

每个发现的问题按以下级别分类：

- **CRITICAL** - 必须修复。安全漏洞、数据丢失风险、严重逻辑错误
- **WARNING** - 建议修复。性能问题、潜在 bug、不良实践
- **SUGGESTION** - 可选改进。代码风格、命名优化、架构建议

## 完成条件

- 四个审查维度全部完成
- 所有问题已分级并记录
- 审查报告已生成

## 退出契约

- 输出审查报告，包含质量指标和问题列表
- 如果没有 CRITICAL 问题，建议用户使用 opsx-archive 归档
- 如果有 CRITICAL 问题，列出必须修复的项目
