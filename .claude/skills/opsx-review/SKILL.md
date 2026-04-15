---
name: opsx-review
description: 使用 subagent 进行独立代码审查，输出质量指标和分级问题。当验证通过后需要更深入的代码质量评估时使用。
---

## Change Root 解析

- `<name>` 可以是单个 change、父 change 或 `group/subchange` 简写。
- 执行前先运行 `bash .claude/opsx/bin/changes.sh resolve <name>` 获取真实 change root。
- 后文所有 `proposal.md`、`review-report.md`、`.openspec.yaml` 路径均指 resolved change root。

代码审查 Skill。使用 subagent 进行独立的代码审查，输出质量指标和分级问题列表。

## 输入 / 输出边界

**读取上游产物：**
- `openspec/changes/<name>/.openspec.yaml`
- `git diff`
- `proposal.md`
- `design.md`
- `specs/`
- 命中的 `.aiknowledge/codemap/` 和 `.aiknowledge/pitfalls/`
- `openspec/changes/<name>/review-report.md`（追加时）

**写入自身产物：**
- `openspec/changes/<name>/review-report.md`（新建或追加）
- `openspec/changes/<name>/.openspec.yaml` 的 `gates.review`（仅无 CRITICAL 时）

**边界约束：**
- review 只写审查结果，不复制需求 / 设计上下文到中间文件

## 角色定位

你是一个**发版风险拦截器**，不是代码风格顾问。
职责是找出会导致崩溃、数据损坏、安全漏洞的真实问题，而不是让代码"更好看"。
宁可漏掉一个 SUGGESTION，也不能用误报浪费开发者的信任。

## 启动序列

1. 确认 opsx-verify 验证已通过
2. 收集本次变更的所有代码差异（`git diff`）
3. 读取当前 change 目录下的需求文档作为业务审查上下文：
   - `proposal.md` — 变更动机和目标
   - `design.md` — 设计方案
   - `specs/` — 详细规格说明
4. 按需读取 `.aiknowledge/`：
   - 先读 `.aiknowledge/codemap/index.md`（如存在），识别本次变更涉及的模块
   - 仅读取命中模块的 `<module>.md`，获取模块边界和调用链，避免重新探索
   - 先读 `.aiknowledge/pitfalls/index.md`（如存在），识别领域
   - 仅读取命中领域的 `<domain>/index.md`；如命中与 diff 相关的具体条目，继续读取 L3 条目文件（`<domain>/<slug>.md`），将其现象/根因作为具体核查项

## Diff 边界原则

**只审查 diff 中实际变更的代码**：

| 行类型 | 审查对象？ | 用途 |
|--------|-----------|------|
| `+` 新增行 | ✅ 是 | 核心审查目标 |
| `-` 删除行 | ❌ 否 | 参考用，理解变更意图 |
| 上下文行（无 +/-） | ❌ 否 | 仅理解上下文，**不产生 issue** |
| 纯搬迁/重命名 | ❌ 否 | 代码本身没有变化 |

删除行的审查重点：被删代码是否承担了状态重置、资源清理、事件触发等副作用。

## 审查方式

使用 Agent tool 启动 subagent 进行独立审查。subagent 接收以下上下文：
- 本次变更的 diff
- 需求文档摘要（proposal/design/specs）
- codemap/pitfalls 摘要

subagent 只读取代码和文档，不做任何修改。审查结果由 subagent 汇报，主 agent 汇总输出。

## 审查范围

**只检查以下内容**：

| 类别 | 具体关注点 |
|------|-----------|
| 逻辑错误 | 空指针、越界、死循环、条件反转、off-by-one |
| 资源泄漏 | 内存、文件句柄、网络连接、锁、订阅（检查获取-释放配对，含异常路径） |
| 并发问题 | 数据竞争、死锁、竞态条件（须追踪读写线程并确认无同步机制） |
| 安全问题 | 注入、越权、敏感信息泄露、不安全的反序列化 |
| API 兼容性 | 接口签名变更、行为变更、调用方是否同步更新 |
| 错误处理 | 异常吞没、错误与空值混淆、缺少错误反馈 |
| 业务逻辑 | 对照需求文档检查：条件判断、状态转换、边界行为是否符合设计意图 |
| 异步安全 | 回调时上下文失效、过期结果覆盖、重复触发 |

## 禁止报告的内容

**以下内容绝对不要报告**：

- **格式类**：缩进、对齐、import 顺序、注释格式（应由格式化工具处理）
- **风格偏好类**：命名风格争论（项目内一致即可）、语法糖偏好、early return vs 嵌套
- **假设性优化类**："这里可以加缓存"/"建议换数据结构"但无任何调用路径分析和量化数据
- **超出项目版本的特性**：如 C++11 项目建议 `std::optional`（C++17）

## 问题分级

### CRITICAL（P0 — 阻断发版）

必须同时满足三要素：
1. **可触发性** — 在当前环境下能实际触发，不能基于"未来可能"的假设
2. **无保护** — 不存在 try-catch、guard return、锁、条件编译等外部防护
3. **严重后果** — 触发后确实导致崩溃、数据损坏、安全漏洞

三要素缺一不可。既有代码搬迁不算新增 P0；Demo/测试代码标准低于核心代码。

典型场景：内存安全（泄漏/野指针/use-after-free）、线程安全（数据竞争/死锁）、API 破坏性变更、运行时崩溃

### WARNING（P1 — 警告）

- 性能退化：有量化数据支撑（调用频率 × 单次耗时 = 实际影响）
- 数据源不一致：更新了临时副本而非 UI 绑定的数据源
- 状态不闭环：标志位缺少 设置→使用→清理 完整周期
- 删除代码有副作用：被删代码承担状态重置/资源清理功能
- 新增 TODO/FIXME 标记

### SUGGESTION（P2 — 建议）

- 代码清晰度：magic number、过长函数（仅针对 diff 中新增代码）
- 潜在性能隐患：能指出具体调用路径和影响方向，但缺少精确量化数据

## 核心审查原则

1. **证据驱动** — 提出问题前必须先证明问题存在。不能基于"可能"、"也许"报告。须精确指出行号、执行路径和具体后果
2. **适度原则** — 只建议必要的改动，不为"假设的未来"重构
3. **尊重项目上下文** — 建议必须在项目实际技术栈内可落地，观察项目的命名风格和错误处理模式
4. **区分代码角色** — SDK 核心 > 生产代码 > Demo/测试代码，文件路径含 test/demo/example 时降低标准
5. **跨文件推断需验证** — 没看到变更 ≠ 没有变更，同一 commit 范围内的变更通常是同步的

## Pitfalls 使用指导

读取 `.aiknowledge/pitfalls/` 后，将已知易错点作为**重点核对清单**：

- 对于 diff 中涉及相关领域的代码，**主动核对**是否命中已知坑
- 仅 `active` 条目可直接作为高权重核查项
- `stale` 条目只能作为调查线索，不得直接当作结论
- `superseded` / `deprecated` 条目默认不作为当前依据
- 命中时提高审查权重，在 issue 描述中引用 pitfall ID
- 如果 diff 证明某个 `active` 条目已不再成立，输出一个 `knowledge drift` 问题，建议归档前更新 `.aiknowledge/`
- 未命中的领域不强行审查，避免噪声

常见的共性坑类型（即使项目无 pitfalls 也应关注）：
- **平台兼容性**：API 在不同平台/引擎的行为不一致
- **事件竞态**：多层 emit 导致事件重复触发、需去重保护
- **生命周期/状态机**：初始化/重连的标志位设计不闭环
- **静默失败**：属性拼写错误返回 undefined 而不抛异常

## 完成条件

- 审查范围内所有类别完成检查
- 所有问题已按 CRITICAL/WARNING/SUGGESTION 分级并记录
- 每个 CRITICAL 问题包含：行号、执行路径、具体后果、修复建议
- 审查报告已生成

## 退出契约

- 输出审查报告，包含质量指标和问题列表
- **如果没有 CRITICAL 问题**：
  1. 写入门控状态：`yq -i '.gates.review = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' openspec/changes/<name>/.openspec.yaml`
  2. 将审查结果追加到 `openspec/changes/<name>/review-report.md`（新建或追加），追加一节：
     ```
     ## code-review | <ISO8601 时间戳> | pass/pass_with_warnings
     findings：
     - <每条 finding，格式：[severity] category: message (file_path)>
     无发现时写"无发现"
     ```
  3. 必须转入 **opsx-archive** 归档。这不是建议，是强制要求。
- **如果有 CRITICAL 问题**：
  1. 不写入 gates
  2. 将审查结果追加到 `openspec/changes/<name>/review-report.md`（新建或追加），追加一节：
     ```
     ## code-review | <ISO8601 时间戳> | fail
     findings：
     - <每条 finding，格式：[CRITICAL] category: message (file_path)>
     ```
  3. 列出必须修复的项目
