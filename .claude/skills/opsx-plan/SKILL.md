---
name: opsx-plan
description: 创建 OpenSpec change 并生成规划产出物（proposal/design/specs）。当需求已明确、准备进入规划阶段时使用。
---

规划 Skill。创建 OpenSpec change 并生成规划阶段的产出物集合。

## 启动序列

1. 确认需求已经过脑暴或探索阶段的澄清
2. 执行 `bash .claude/opsx/bin/changes.sh` 检查是否已有相关变更（含阶段和进度）
3. 先读 `.aiknowledge/codemap/index.md`，判断目标模块是否已有 codemap；已有则继续读对应 `<module>.md` 和必要的 `chains/*.md`，没有则先调用 `opsx-codemap`
4. 读取 `.aiknowledge/pitfalls/index.md` 和相关领域的 `index.md`，在设计中规避已知陷阱
5. 收集必要的上下文信息

## 流程

### 1. 创建变更
- 使用 `bash .claude/opsx/bin/changes.sh init YYYY-MM-DD-<name> spec-driven` 创建新变更目录结构
- **变更名称必须带日期前缀**（如 `2026-04-03-add-auth`），便于按时间追溯
- 名称部分简洁、描述性强，使用 kebab-case

### 2. 指令循环
逐个生成以下产出物，每个都经过用户确认：

**proposal.md** - 提案
- 问题陈述和目标
- 范围界定（做什么、不做什么）
- 成功标准

**design.md** - 设计
- 架构方案和关键决策
- 接口定义和数据模型
- 依赖关系和集成点
- **R 编号铁律**：design.md 中出现的所有 R 编号必须来自 specs/ 中的 `**Trace**: R?` 声明，禁止在 design 中自行发明 R 编号。实现细节不需要单独的 R 编号，归入对应需求的实施单元（U）即可
- **实施单元铁律**：每个 `[U?]` 必须包含 `模块边界` 字段，列出涉及的具体文件路径；缺少 `模块边界` 的实施单元视为不完整，不得进入 plan-review

**specs/** - 规格说明
- 按能力拆分的详细规格
- 每个 spec 包含输入、输出、行为描述
- 边缘情况和错误处理
- **颗粒度自检**：每条需求只描述一个独立的可验证行为。如果一条需求中出现"并且"、"同时"、"以及"等连接词，或描述了多个独立场景，应主动拆分为多条需求
- **Trace 唯一性铁律**：当 `specs/` 下存在多个 `spec.md` 时，必须把它们视为同一个 change 的统一编号空间；所有 `**Trace**: R<number>` 必须全局唯一，禁止在不同 spec 文件里重复使用同一个 `R<number>`

### 3. 逐个提交
- 每个产出物完成后单独提交到 git
- 提交信息遵循项目规范

## 完成条件

- 所有产出物已生成并获得用户确认
- 所有产出物已提交到 git

## 硬性门控

**在 design.md 和 specs/ 生成后，必须转入 opsx-plan-review 进行 spec↔plan 审查。** plan-review 通过后由 opsx-tasks 生成 tasks.md，禁止在 plan skill 内部生成 tasks.md。

## 退出契约

- 输出变更摘要（proposal.md、design.md、specs/ 概述）
- **必须**转入 **opsx-plan-review** 审查 spec↔plan 一致性。这不是建议，是强制要求。
