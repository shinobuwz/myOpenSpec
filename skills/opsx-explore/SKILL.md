---
name: opsx-explore
description: 当用户想在实现前或实现中途探索想法、调查问题、比较方向、澄清需求或收敛设计时使用。
---

进入探索模式。目标是把模糊想法、卡住点或方案分歧澄清到可判断的下一步。

## 硬边界

- explore 默认只读，禁止写产品代码、测试代码、脚手架代码和 gates。
- 在设计获得用户批准之前，绝不编写代码；探索不是编码通道。
- 只有用户明确同意时，才可写 OpenSpec 思考产物：`proposal.md`、`design.md`、`specs/<capability>/spec.md`。
- 正式变更探索结束后，下一步必须是 `opsx-slice`；低风险小改动或明确缺陷修复可建议转入 `opsx-fast`。禁止从 explore 直接跳转到 `opsx-plan`。
- 需要搜索源码前必须 codemap-first：先读 `.aiknowledge/codemap/index.md`；目标模块缺失或 stale 时先调用 `opsx-codemap`。
- 大范围只读探索按 `~/.opsx/common/subagent.md` explorer contract 委托；主 agent 保持 controller，负责收敛判断和用户可见结论。
- `request_user_input` 只是增强能力；Default mode 或工具不可用时，降级为普通文本中的单个关键问题。

## 输入 / 输出边界

**读取：**
- 用户当前问题相关的代码、文档、OpenSpec 产出物
- `.aiknowledge/codemap/` 和 `.aiknowledge/pitfalls/`

**默认写入：**无

**明确同意后可写入：**
- `proposal.md`
- `design.md`
- `specs/<capability>/spec.md`

## 快速流程

1. 先判断处于开放探索还是收敛阶段。
2. 如需源码调查，执行 codemap-first 搜索协议。
3. 开放探索时自然追问、画图、比较方向，不强迫产出。
4. 收敛阶段一次只问一个关键问题，提出 2-3 个方案，逐段确认设计。
5. 发现值得记录的见解时，只提议捕获到 OpenSpec 产物，由用户决定。
6. 结束时给出清晰下一步：`opsx-fast` 或 `opsx-slice`。

## Reference 导航

- `references/workflow.md`：OpenSpec 上下文检查、不同切入点、收敛阶段和退出规则。
- `references/conversation-patterns.md`：探索姿态、问询协议、示例对话和输出结构。
- `references/codemap-first.md`：源码搜索前的 codemap-first 规则、stale 处理和项目地图维护。

## 关键护栏

- 不要实施；探索不是编码通道。
- 不要自动捕捉见解；先提议，再等用户确认。
- 不要在没有地图的情况下大范围 glob/grep。
- 不要把多个问题一次性抛给用户；每轮最多一个会改变设计判断的问题。
- 不要为满足形式继续追问；用户方向明确时直接收束。
