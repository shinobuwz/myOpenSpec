## 上下文

当前 openspec-tdd skill 要求 AI 执行红→绿→重构循环，每个阶段都会运行测试。但测试运行结果只存在于对话记录中，没有持久化到任何文件。这导致：

1. 归档时无法验证"红→绿"顺序是否真实发生（AI 可能跳过红阶段）
2. 无法追溯某次变更中哪些验收标准被哪些测试覆盖
3. openspec-verify 无法对"测试留档"做任何门控

本次变更在不改变 TDD 核心循环逻辑的前提下，在每次测试运行后立即写入 `test-report.md`，并在 openspec-verify 中新增第四维度做归档前门控。

## 目标 / 非目标

**目标：**
- 每次测试运行后立即更新 `test-report.md`（实时追加，非事后汇总）
- `test-report.md` 记录：时间戳（证明红→绿顺序）、测试用例通过/失败列表、验收标准覆盖对应表、覆盖率数字（如框架支持）
- openspec-verify 新增维度4：检查 `test-report.md` 完整性，不完整则阻止归档

**非目标：**
- 不改变红绿重构循环本身的逻辑
- 不自动执行测试（仍由 AI 手动运行测试命令）
- 不强制要求覆盖率达到某个数值（只记录，不门控数值）

## 需求追踪

- [R1] -> [U1]  （TDD 红阶段运行后写入记录）
- [R2] -> [U1]  （TDD 绿阶段运行后写入记录）
- [R3] -> [U1]  （TDD 重构阶段运行后写入记录）
- [R4] -> [U1]  （test-report.md 格式规范）
- [R5] -> [U2]  （verify 新增测试留档检查维度）
- [R6] -> [U2]  （不完整则阻止归档）

## 实施单元

### [U1] TDD skill 实时写入 test-report.md
- 关联需求: [R1] [R2] [R3] [R4]
- 模块边界:
  - `.claude/skills/openspec-tdd/SKILL.md`（skill 安装产物）
  - `src/core/templates/workflows/tdd.ts`（skill 源码，生成上述产物）
- 验证方式: skill 文本中红、绿、重构三个阶段各有"写入 test-report.md"的明确指令；test-report.md 格式规范有独立章节描述
- 知识沉淀: skill 源码与安装产物必须保持同步，两处都要修改

### [U2] verify skill 新增维度4：测试留档完整性检查
- 关联需求: [R5] [R6]
- 模块边界:
  - `.claude/skills/openspec-verify/SKILL.md`
  - `src/core/templates/workflows/verify.ts`
- 验证方式: verify skill 步骤4（并行 subagent）中新增 Subagent D；退出契约中 CRITICAL 问题列表包含"test-report.md 不完整"条件
- 知识沉淀: verify skill 有优雅降级逻辑（无 tasks 则跳过），测试留档检查同样需要降级——无 TDD task 的变更可跳过

## 决策

**决策1：实时追加 vs 事后汇总**
选择实时追加。每次 `运行测试` 后立即写入，与测试执行绑定。原因：事后汇总依赖 AI 记忆，容易遗漏；实时写入将"测试结果"与"测试运行动作"强绑定，更难作弊。

**决策2：变更级一份文件 vs 任务级多份文件**
选择变更级一份 `test-report.md`（按 task 分节追加）。原因：verify 只需检查一个文件；归档时一目了然；task 间跳转不需要打开多个文件。

**决策3：记录结构化摘要 vs 原始终端输出**
选择结构化摘要（测试用例列表 + 通过/失败状态）。原因：原始输出过长且格式因框架而异；结构化摘要可读性高，verify subagent 也更易解析。

**决策4：verify 中作为独立 Subagent D 还是合并进现有 subagent**
选择独立 Subagent D（与 A/B/C 并行）。原因：职责单一，不污染完整性/正确性/一致性三个维度的语义。

## 风险 / 权衡

- [风险] AI 忘记在测试运行后写入 → 缓解：将"写入 test-report.md"作为每个阶段步骤的最后一条，而非放在退出契约
- [风险] 无 TDD task 的变更触发误报 → 缓解：Subagent D 检查 tasks.md 中是否有 `[test-first]` 或 `[characterization-first]` 标签，无则跳过
- [风险] 覆盖率数字并非所有框架都支持 → 缓解：标注为"如框架支持则记录，否则填 N/A"

## 知识沉淀

- openspec-tdd 和 openspec-verify 的 SKILL.md 是通过 `src/core/templates/workflows/*.ts` 生成的；修改 skill 时两处必须同步，否则下次 `openspec-cn update` 会覆盖手动修改
- test-report.md 不在 openspec schema 的 `applyRequires` 产出物列表中，它是运行时产物而非规划产物，不需要注册进 schema
