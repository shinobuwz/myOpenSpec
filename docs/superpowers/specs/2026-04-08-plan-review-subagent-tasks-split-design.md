# 设计文档：plan-review/task-analyze subagent 化 + plan 拆分

**日期**：2026-04-08  
**状态**：已批准

---

## 背景

当前工作流存在两个问题：

1. **plan-review 和 task-analyze 由主 agent 内联执行**，刚写完 design/tasks 的 agent 存在认知偏差，可能合理化自己引入的 TRACE_GAP 或 GAP，降低关卡可靠性。

2. **plan 是单体 skill**，通过指令文本自我约束门控（"禁止生成 tasks.md"）。自我约束属于软性门控，可靠性低于显式的 skill 边界。plan-review 退出契约要"回到 openspec-plan 继续生成 tasks.md"，形成逻辑循环，难以理解和维护。

---

## 变更一：plan-review 和 task-analyze 改用 subagent

### 目标

与 `openspec-review` 保持一致——审查工作由独立 subagent 执行，消除主 agent 的创建偏差。

### 审查执行模型

```
主 agent
  ├─ 收集变更名称和产出物路径
  ├─ 启动 subagent（Agent tool）
  │     subagent：只读取产出物文件 → 执行所有审查维度 → 输出报告
  └─ 汇总 subagent 输出 → 执行退出契约
```

主 agent 不参与具体审查判断，只负责参数传递和退出路由。

### 涉及文件

- `src/core/templates/workflows/plan-review.ts`：增加"审查方式"节（subagent 模型）
- `src/core/templates/workflows/task-analyze.ts`：增加"审查方式"节（subagent 模型）

---

## 变更二：plan 拆分，新增 openspec-tasks skill

### 职责重新划分

| Skill | 职责 | 触发方式 |
|---|---|---|
| `openspec-plan` | 生成 proposal + design + specs | 用户调用 |
| `openspec-plan-review` | 审查 specs↔design 一致性 | plan 退出契约触发（subagent 执行） |
| `openspec-tasks`（新） | 生成 tasks.md | plan-review 通过后退出契约触发 |
| `openspec-task-analyze` | 审查 design↔tasks 一致性 | tasks 退出契约触发（subagent 执行） |

`openspec-tasks` 无用户可见的 slash 命令，对用户透明。

### 调用链

```
openspec-plan
  → 退出（生成 proposal + design + specs 后停止）
    → [subagent plan-review]
      → 通过：退出契约触发 openspec-tasks
        → [subagent task-analyze]
          → 通过：退出契约触发 openspec-implement
      → 未通过：退出契约触发 openspec-plan 修正 design
```

### 退出契约变化

**plan.ts（改后）**
- 退出契约：生成 proposal + design + specs 后，必须转入 `openspec-plan-review`
- 不再生成 tasks.md

**plan-review.ts（改后）**
- 通过：退出契约转入 `openspec-tasks`（不再是"回到 openspec-plan 继续"）
- 未通过：退出契约转入 `openspec-plan` 修正 design

**tasks.ts（新建）**
- 职责：仅生成 tasks.md
- 启动条件：确认 plan-review 已通过
- 退出契约：生成后必须转入 `openspec-task-analyze`

**task-analyze.ts（不变逻辑，加 subagent）**
- 通过：退出契约转入 `openspec-implement`
- 未通过：退出契约转入 `openspec-tasks` 修正 tasks

### ff-change 编排更新

ff-change 当前在 plan-review 通过后描述为"openspec-plan 继续生成 tasks"，改为显式调用 `openspec-tasks`：

```
生成 design → [plan-review] → 通过 → 调用 openspec-tasks → 生成 tasks → [task-analyze] → 通过 → 实施
```

### continue-change 门控补齐

continue-change 当前无任何门控逻辑。改后：

- 创建 design 产出物后：在 stop 前自动运行 plan-review（subagent）。通过后展示进度并 stop；未通过则修正后重审。
- 创建 tasks 产出物后：在 stop 前自动运行 task-analyze（subagent）。通过后展示进度并 stop；未通过则修正后重审。

用户感知不变（每次仍然只推进一个产出物），但关卡是内置的。

---

## 涉及文件汇总

| 文件 | 改动类型 | 改动说明 |
|---|---|---|
| `src/core/templates/workflows/plan.ts` | 修改 | 移除 tasks 生成；退出契约指向 plan-review |
| `src/core/templates/workflows/plan-review.ts` | 修改 | 加 subagent 审查模型；退出契约：通过 → openspec-tasks |
| `src/core/templates/workflows/task-analyze.ts` | 修改 | 加 subagent 审查模型 |
| `src/core/templates/workflows/tasks.ts` | 新建 | openspec-tasks skill |
| `src/core/templates/workflows/ff-change.ts` | 修改 | plan-review 通过后显式调用 openspec-tasks |
| `src/core/templates/workflows/continue-change.ts` | 修改 | design/tasks 产出物创建后内置门控 |
| `src/core/templates/skill-templates.ts` | 修改 | 注册 getTasksSkillTemplate |

---

## 不变部分

- openspec-tasks 无 slash 命令，不在 bootstrap 的 skill 发现列表中展示
- task-analyze 的审查维度（GAP / MISMATCH / QUALITY）不变
- plan-review 的审查维度（TRACE_GAP / ORPHAN）不变
- 所有关卡的"硬性门控"语义不变，只是执行方从主 agent 改为 subagent
