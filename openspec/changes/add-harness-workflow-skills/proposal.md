# 提案：为 OpenSpec 添加完整工作流 Harness Skills

## 动机

当前 OpenSpec-cn 提供了 spec-driven 的变更管理流程（`/opsx:*` 命令），但缺少覆盖完整开发生命周期的工作流支撑：

1. **没有 TDD 强制机制**：`/opsx:apply` 实施任务时不要求测试先行
2. **没有自动驱动能力**：所有流程需要用户逐步触发，无法设定目标后让 AI 自主迭代
3. **缺少多语言适配**：项目涉及 C++/Java/OC/Python/JS 多语言栈，需要智能探测测试框架
4. **工作流断裂**：从需求探索到归档上线的完整链路缺少 skill 编排

## 目标

基于 OpenSpec 现有 change folder 流程，构建 10 个中文 skill，覆盖从探索到归档的完整开发生命周期，并提供 Auto-Opt 自动驱动引擎。

## 范围

### 包含

- 10 个 skill（启动引导、探索、脑暴、规划、测试先行、实施、验证、代码审查、归档上线、自动驱动）
- SessionStart hook 注入机制
- 多语言 TDD 适配（C++/gtest, Python/pytest, JS/vitest, Java/JUnit, OC/XCTest）
- Auto-Opt 引擎循环（目标→指标→验证→迭代）
- 可配置门控（默认全自主，可切换为需审批）
- 结果日志（TSV 格式）

### 不包含

- 浏览器自动化/Chrome 扩展（gstack 范畴）
- 团队协作功能（定位个人开发）
- OpenSpec CLI 本身的修改（纯 skill 层扩展）
- 新的 schema 定义（复用现有 spec-driven schema）

## 方案

采用 **OpenSpec-Native 架构**：以 OpenSpec change folder 为工作流骨架，每个 skill 的产出天然就是 OpenSpec 格式。skill 通过 `openspec-cn` CLI 查询状态，不自行维护状态。Auto-Opt 引擎作为驱动层，调用同一套 skill 自主完成全流程循环。

## 成功标准

1. 手动模式下能完成一个完整的 change 生命周期（探索→归档）
2. 自动模式下能针对指定指标自主迭代并产出可度量的改进
3. TDD skill 能正确探测至少 3 种语言的测试框架并强制红绿重构
4. 所有 skill 的交付物兼容 OpenSpec change folder 结构
