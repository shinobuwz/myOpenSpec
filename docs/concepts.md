# 核心概念

本指南解释了 OpenSpec 背后的核心思想以及它们如何协同工作。关于实际使用，请参阅[入门指南](getting-started.md)和[工作流](workflows.md)。

## 设计哲学

OpenSpec 围绕四个原则构建：

```
灵活而非僵化       — 主线强门控，旁路保持轻量
迭代而非瀑布       — 边构建边学习，逐步完善
简单而非复杂       — 轻量级设置，最小化仪式感
棕地优先           — 适用于现有代码库，不限于绿地项目
```

### 为什么这些原则重要

**灵活而非僵化。** OpenSpec 当前采用“强主线 + 明确旁路”的方式保持灵活性。默认主线要求按 `plan -> plan-review -> tasks -> task-analyze -> implement -> verify -> review -> archive` 推进；但对探索、bugfix、恢复中断等场景，仍提供独立 skill 作为旁路，而不是让主线本身变得含糊。

**迭代而非瀑布。** 需求会变化。理解会加深。开始时看似不错的方法在查看代码库后可能不再适用。OpenSpec 拥抱这一现实。

**简单而非复杂。** 一些规范框架需要大量设置、严格格式或重量级流程。OpenSpec 不会妨碍你的工作。几秒钟内初始化，立即开始工作，仅在需要时自定义。

**棕地优先。** 大多数软件工作不是从零开始构建——而是修改现有系统。OpenSpec 基于增量的方法使得指定对现有行为的更改变得容易，而不仅仅是描述新系统。

## 整体架构

OpenSpec 当前将工作组织在一个主区域中：

```
┌──────────────────────────────────────────────────────────────────┐
│                        openspec/                                 │
│                                                                  │
│                  ┌───────────────────────────────┐               │
│                  │         changes/              │               │
│                  │                               │               │
│                  │  活动变更 + 已归档变更           │               │
│                  │  每个变更 = 一个文件夹           │               │
│                  │  包含 proposal/design/tasks/   │               │
│                  │  specs 等制品                  │               │
│                  │                               │               │
│                  └───────────────────────────────┘               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**规范（Specs）** 是当前 change 的行为文档。它们描述“这次变更打算改变什么”。

**变更（Changes）** 是 OpenSpec 的一等公民——每个 change 自带 proposal、specs、design、tasks 以及归档历史。

这种组织方式的关键点是：所有消费方都围绕 change 目录工作。规划、关卡、实施、验证、审查都直接读取当前 change 的制品，而不是依赖项目级主规范目录。

## 规范（Specs）

规范使用结构化的需求和场景来描述本次变更涉及的行为。

### 目录结构

```
openspec/changes/<change-name>/specs/
├── auth/
│   └── spec.md           # 认证相关变更
├── payments/
│   └── spec.md           # 支付相关变更
├── notifications/
│   └── spec.md           # 通知相关变更
└── ui/
    └── spec.md           # UI 相关变更
```

按领域组织规范——为单个 change 创建有意义的逻辑分组。常见模式：

- **按功能区域**：`auth/`、`payments/`、`search/`
- **按组件**：`api/`、`frontend/`、`workers/`
- **按限界上下文**：`ordering/`、`fulfillment/`、`inventory/`

### 规范格式

一个规范包含需求，每个需求都有场景：

```markdown
# 认证规范

## 目的
应用程序的认证和会话管理。

## 需求

### 需求:用户认证
系统应在成功登录时发放 JWT 令牌。

#### 场景:有效凭据
- 给定具有有效凭据的用户
- 当用户提交登录表单时
- 则返回 JWT 令牌
- 并且用户被重定向到仪表板

#### 场景:无效凭据
- 给定无效凭据
- 当用户提交登录表单时
- 则显示错误消息
- 并且不发放令牌

### 需求:会话过期
系统必须在 30 分钟不活动后使会话过期。

#### 场景:空闲超时
- 给定已认证的会话
- 当 30 分钟过去且没有活动时
- 则会话失效
- 并且用户必须重新认证
```

**关键元素：**

| 元素 | 目的 |
|---------|---------|
| `## 目的` | 此规范领域的高级描述 |
| `### 需求:` | 系统必须具有的特定行为 |
| `#### 场景:` | 需求在行动中的具体示例 |
| SHALL/MUST/SHOULD | RFC 2119 关键词，表示需求强度 |

### 为什么这样结构化规范

**需求是"做什么"**——它们说明系统应该做什么而不指定实现。

**场景是"何时"**——它们提供可验证的具体示例。好的场景：
- 是可测试的（你可以为它们编写自动化测试）
- 涵盖正常路径和边缘情况
- 使用 Given/When/Then 或类似结构化格式

**RFC 2119 关键词**（SHALL、MUST、SHOULD、MAY）传达意图：
- **MUST/SHALL**——绝对需求
- **SHOULD**——推荐，但存在例外
- **MAY**——可选

### What a Spec Is (and Is Not)

A spec is a **behavior contract**, not an implementation plan.

Good spec content:
- Observable behavior users or downstream systems rely on
- Inputs, outputs, and error conditions
- External constraints (security, privacy, reliability, compatibility)
- Scenarios that can be tested or explicitly validated

Avoid in specs:
- Internal class/function names
- Library or framework choices
- Step-by-step implementation details
- Detailed execution plans (those belong in `design.md` or `tasks.md`)

Quick test:
- If implementation can change without changing externally visible behavior, it likely does not belong in the spec.

### Keep It Lightweight: Progressive Rigor

OpenSpec aims to avoid bureaucracy. Use the lightest level that still makes the change verifiable.

**Lite spec (default):**
- Short behavior-first requirements
- Clear scope and non-goals
- A few concrete acceptance checks

**Full spec (for higher risk):**
- Cross-team or cross-repo changes
- API/contract changes, migrations, security/privacy concerns
- Changes where ambiguity is likely to cause expensive rework

Most changes should stay in Lite mode.

### Human + Agent Collaboration

In many teams, humans explore and agents draft artifacts. The intended loop is:

1. Human provides intent, context, and constraints.
2. Agent converts this into behavior-first requirements and scenarios.
3. Agent keeps implementation detail in `design.md` and `tasks.md`, not `spec.md`.
4. Validation confirms structure and clarity before implementation.

This keeps specs readable for humans and consistent for agents.

## 变更（Changes）

变更是对系统的提议修改，打包为一个包含理解和实施所需所有内容的文件夹。

### 变更结构

```
openspec/changes/add-dark-mode/
├── proposal.md           # 为什么和做什么
├── design.md             # 如何做（技术方案）
├── tasks.md              # 实施清单
├── .openspec.yaml        # 变更元数据（可选）
└── specs/                # 当前 change 的规范文件
    └── ui/
        └── spec.md       # UI 相关行为要求
```

每个变更都是自包含的。它包含：
- **制品**——捕获意图、设计和任务的文档
- **specs 文件**——描述本次 change 关注的行为要求
- **元数据**——此特定变更的可选配置

### 为什么变更组织为文件夹

将变更打包为文件夹有几个好处：

1. **一切在一起。** 提案、设计、任务和规范位于同一位置。无需在不同位置查找。

2. **并行工作。** 多个变更可以同时存在而不会冲突。在 `fix-auth-bug` 进行时，可以同时处理 `add-dark-mode`。

3. **清晰历史。** 归档时，变更会移动到 `changes/archive/` 并保留完整上下文。你可以回顾并理解不仅发生了什么变化，还有为什么变化。

4. **便于审查。** 变更文件夹易于审查——打开它，阅读提案，检查设计，查看 `specs/`。

## 制品（Artifacts）

制品是变更中的文档，用于指导工作。

### 制品流程

```
slice ──────► proposal ──────► specs ──────► design ──────► tasks ──────► implement
   │              │               │             │              │
切哪些 change      为什么           改变什么      如何做          实施步骤
当前做哪个         范围             变化          方法           要执行
```

制品相互构建。每个制品为下一个提供上下文。

### 制品类型

#### 提案（`proposal.md`）

提案在高级别捕获**意图**、**范围**和**方法**。

```markdown
# 提案：添加深色模式

## 意图
用户要求提供深色模式选项，以在夜间使用时减少眼睛疲劳并匹配系统偏好。

## 范围
包含：
- 设置中的主题切换
- 系统偏好检测
- 在 localStorage 中持久化偏好

不包含：
- 自定义颜色主题（未来工作）
- 每页主题覆盖

## 方法
使用 CSS 自定义属性进行主题化，配合 React context 进行状态管理。在首次加载时检测系统偏好，允许手动覆盖。
```

**何时更新提案：**
- 范围变化（缩小或扩大）
- 意图明确（对问题有更好理解）
- 方法发生根本性变化

#### 规范（`specs/`）

`specs/` 描述本次 change 关心的**行为要求**。它是当前 change 的 artifact，不依赖项目级主规范，也不需要把自己理解成某个“增量层”。

#### 设计（`design.md`）

设计捕获**技术方法**和**架构决策**。

```markdown
# 设计：添加深色模式

## 技术方法
通过 React Context 管理主题状态以避免属性传递。CSS 自定义属性支持运行时切换而无需类切换。

## 架构决策

### 决策：Context 优于 Redux
使用 React Context 管理主题状态的原因：
- 简单的二元状态（浅色/深色）
- 无复杂状态转换
- 避免添加 Redux 依赖

### 决策：CSS 自定义属性优于 CSS-in-JS
使用 CSS 变量而非 CSS-in-JS 的原因：
- 与现有样式表配合使用
- 无运行时开销
- 浏览器原生解决方案

## 数据流
```
ThemeProvider (context)
       │
       ▼
ThemeToggle ◄──► localStorage
       │
       ▼
CSS Variables (应用于 :root)
```

## 文件变更
- `src/contexts/ThemeContext.tsx`（新建）
- `src/components/ThemeToggle.tsx`（新建）
- `src/styles/globals.css`（修改）
```

**何时更新设计：**
- 实施显示方法不可行
- 发现更好的解决方案
- 依赖项或约束条件变化

#### 任务（`tasks.md`）

任务是**实施清单**——带有复选框的具体步骤。

```markdown
# 任务

## 1. 主题基础设施
- [ ] 1.1 创建具有浅色/深色状态的 ThemeContext
- [ ] 1.2 添加 CSS 自定义属性用于颜色
- [ ] 1.3 实现 localStorage 持久化
- [ ] 1.4 添加系统偏好检测

## 2. UI 组件
- [ ] 2.1 创建 ThemeToggle 组件
- [ ] 2.2 在设置页面添加切换器
- [ ] 2.3 更新 Header 包含快速切换

## 3. 样式
- [ ] 3.1 定义深色主题调色板
- [ ] 3.2 更新组件使用 CSS 变量
- [ ] 3.3 测试可访问性的对比度比率
```

**任务最佳实践：**
- 将相关任务分组在标题下
- 使用分层编号（1.1、1.2 等）
- 保持任务足够小，可在一个会话中完成
- 完成任务时勾选复选框

## `specs/` 文件结构

`specs/` 文件描述当前 change 需要表达的行为要求。重点是把这次 change 说清楚，而不是维护某个外部基线。

### 格式

```markdown
# 认证相关规范

## 新增需求

### 需求:双因素认证
系统必须支持基于 TOTP 的双因素认证。

#### 场景:2FA 注册
- 给定未启用 2FA 的用户
- 当用户在设置中启用 2FA 时
- 则显示用于认证器应用设置的二维码
- 并且用户在激活前必须用代码验证

#### 场景:2FA 登录
- 给定已启用 2FA 的用户
- 当用户提交有效凭据时
- 则显示 OTP 挑战
- 并且只有在有效 OTP 后登录才完成

## 修改需求

### 需求:会话过期
系统必须在 15 分钟不活动后使会话过期。
（之前：30 分钟）

#### 场景:空闲超时
- 给定已认证的会话
- 当 15 分钟过去且没有活动时
- 则会话失效

## 删除需求

### 需求:记住我
（已弃用，支持 2FA。用户应在每个会话重新认证。）
```

### 常见需求分组

| 分组 | 含义 | 在当前模型中的作用 |
|---------|---------|------------------------|
| `## 新增需求` | 新行为 | 记录本次 change 新增的行为切片 |
| `## 修改需求` | 改变的行为 | 记录本次 change 对既有行为的更新表达 |
| `## 删除需求` | 已弃用的行为 | 记录本次 change 移除或废弃的行为 |

这些分组的目的只是帮助作者把 change 内的需求写清楚。它们是表达方式，不代表存在一个必须同步的外部“主规范”。

### 为什么使用 `specs/`

**清晰性。** `specs/` 明确显示本次 change 关注什么行为，减少在 proposal、design、tasks 之间来回猜测。

**避免冲突。** 不同变更各自维护自己的 `specs/` 制品，审查时关注的是本次 change 的行为切片。

**审查效率。** 审查者看到的是当前 change 关心的行为要求，而不是无关背景。专注于重要内容。

**棕地适应性。** 大多数工作都是修改现有行为。`specs/` 允许你在 change 内精确描述这次要动什么。

## 模式（Schemas）

模式定义工作流的制品类型及其依赖关系。

### 模式如何工作

```yaml
# .claude/opsx/schemas/spec-driven/schema.yaml
name: spec-driven
artifacts:
  - id: proposal
    generates: proposal.md
    requires: []              # 无依赖，可首先创建

  - id: specs
    generates: specs/**/*.md
    requires: [proposal]      # 需要提案后才能创建

  - id: design
    generates: design.md
    requires: [proposal]      # 可与规范并行创建

  - id: tasks
    generates: tasks.md
    requires: [specs, design] # 需要规范和设计后才能创建
```

**制品形成依赖图：**

```
                    proposal
                   （根节点）
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
      specs                       design
   （需要：                  （需要：
    proposal）                   proposal）
         │                           │
         └─────────────┬─────────────┘
                       │
                       ▼
                    tasks
                （需要：
                specs, design）
```

**依赖既是建模，也是门控基础。** schema 负责描述制品依赖关系；在当前仓库中，这些依赖再叠加 gate skills，形成可执行的默认主线。对于 `spec-driven`，设计不是可选项，`tasks.md` 也不会在缺少 `design.md` 时进入主线。

### 内置模式

**spec-driven**（默认）

规范驱动开发的标准工作流：

```
slice（复杂需求时） → proposal → specs → design → plan-review → tasks → task-analyze → implement
```

最适合：大多数功能工作，希望在实施前完成需求、设计和任务的一致性检查。

### 自定义模式

为团队工作流创建自定义模式：

```bash
# 从零开始创建
mkdir -p .claude/opsx/schemas/research-first/templates

# 或从现有模式派生
cp -r .claude/opsx/schemas/spec-driven .claude/opsx/schemas/research-first
```

**示例自定义模式：**

```yaml
# .claude/opsx/schemas/research-first/schema.yaml
name: research-first
artifacts:
  - id: research
    generates: research.md
    requires: []           # 首先进行研究

  - id: proposal
    generates: proposal.md
    requires: [research]   # 提案基于研究

  - id: tasks
    generates: tasks.md
    requires: [proposal]   # 跳过规范/设计，直接进入任务
```

上面的示例已经覆盖了自定义模式的基本结构与用法。

## 归档（Archive）

归档通过冻结 change 并移动到历史目录来完成变更。

### 归档时发生什么

```
归档前：

openspec/
└── changes/
    ├── add-2fa/
    │   ├── proposal.md
    │   ├── design.md
    │   ├── tasks.md
    │   └── specs/
    │       └── auth/
    │           └── spec.md
    └── archive/


归档后：

openspec/
└── changes/
    ├── archive/
    │   └── 2025-01-24-add-2fa/    # 为历史保留
    │       ├── proposal.md
    │       ├── design.md
    │       ├── tasks.md
    │       └── specs/
    │           └── auth/
    │               └── spec.md
    └── ...
```

### 归档过程

1. **冻结制品。** 确认 proposal、specs、design、tasks、验证与审查结果构成完整快照。

2. **移动到归档。** 变更文件夹移动到 `changes/archive/`，带有日期前缀以便按时间顺序排序。

3. **保留上下文。** 所有制品在归档中保持完整。你总是可以回顾以理解为什么进行变更。

### 为什么归档重要

**清洁状态。** 活动变更（`changes/`）仅显示进行中的工作。已完成的工作移出视线。

**审计追踪。** 归档保留每个变更的完整上下文——不仅是发生了什么变化，还有解释为什么的提案、解释如何的设计以及显示所做工作的任务。

**变更历史。** 随着变更被归档，每次行为变化都会以完整制品快照沉淀下来，便于回溯。

## 整体如何协同工作

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              OPENSPEC 流程                                   │
│                                                                              │
│   ┌────────────────┐                                                         │
│   │  1. 切分        │  `opsx-slice` 判断是否拆成多个 change                      │
│   │    变更         │                                                         │
│   └───────┬────────┘                                                         │
│           │                                                                  │
│           ▼                                                                  │
│   ┌────────────────┐                                                         │
│   │  2. 创建        │  `opsx-plan` / `opsx-ff` / `opsx-continue`              │
│   │    制品         │  proposal → specs → design                              │
│   │                │  （continue 用于恢复到当前合法节点）                       │
│   └───────┬────────┘                                                         │
│           │                                                                  │
│           ▼                                                                  │
│   ┌────────────────┐                                                         │
│   │  3. 关卡        │  `opsx-plan-review` → `opsx-tasks` →                    │
│   │    与任务       │  `opsx-task-analyze`                                    │
│   └───────┬────────┘                                                         │
│           │                                                                  │
│           ▼                                                                  │
│   ┌────────────────┐                                                         │
│   │  4. 实施        │  `opsx-implement`                                       │
│   │    任务         │  处理任务，勾选完成项                                      │
│   └───────┬────────┘                                                         │
│           │                                                                  │
│           ▼                                                                  │
│   ┌────────────────┐                                                         │
│   │  5. 验证        │  `opsx-verify` → `opsx-review`                          │
│   │    与审查       │  检查实现是否匹配制品并拦截发版风险                        │
│   └───────┬────────┘                                                         │
│           │                                                                  │
│           ▼                                                                  │
│   ┌────────────────┐     ┌──────────────────────────────────────────────┐   │
│   │  6. 归档        │────►│  变更文件夹移动到 archive/                      │   │
│   │    变更         │     │  所有制品作为历史快照保留                        │  │
│   └────────────────┘     │  后续工作继续基于新的 change 展开                  │   │
│                          └──────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**良性循环：**

1. 变更定义本次要改变的行为
2. 设计和任务把行为变化落到实现路径
3. 实施使变更成为现实
4. 归档保留完整历史快照
5. 下一个变更基于代码现状和历史制品继续构建

## 术语表

| 术语 | 定义 |
|------|------------|
| **制品（Artifact）** | 变更中的文档（提案、specs、设计、任务等） |
| **归档（Archive）** | 完成变更并将其移动到历史目录的过程 |
| **变更（Change）** | 对系统的提议修改，打包为包含制品的文件夹 |
| **specs** | 当前 change 的规范文件集合，用于描述本次 change 的行为要求 |
| **领域（Domain）** | 规范逻辑分组（例如 `auth/`、`payments/`） |
| **需求（Requirement）** | 系统必须具有的特定行为 |
| **场景（Scenario）** | 需求的具体示例，通常采用 Given/When/Then 格式 |
| **模式（Schema）** | 制品类型及其依赖关系的定义 |
| **规范（Spec）** | 描述系统行为的规范，包含需求和场景 |
| **历史快照（Historical snapshot）** | 某个 archived change 中保留的完整制品集合，用于回溯行为、设计与实现决策 |

## 下一步

- [入门指南](getting-started.md) - 实用的第一步
- [工作流](workflows.md) - 常见模式及何时使用
- [支持的工具](supported-tools.md) - 当前仓库维护的 skills 与入口
