# Tasks: `opsx-lite` workflow

## Task 1：替换轻量入口 skill

- [x] 1.1 [R1][R2][U1][characterization-first] 将 `opsx-ff` 替换为 `opsx-lite`，并定义轻量流程与升级边界

**需求追踪**：[R1][R2] → [U1]
**执行方式**：[characterization-first]
**涉及文件**：
- `skills/opsx-ff/SKILL.md` — 旧完整规划链路入口，删除或替换
- `skills/opsx-lite/SKILL.md` — 新轻量小改动 workflow
- `openspec/changes/2026-04-27-opsx-lite-workflow/test-report.md` — 记录替换前后的引用搜索结果

**验收标准**：
- [x] `skills/opsx-lite/SKILL.md` 存在，name 为 `opsx-lite`
- [x] `skills/opsx-lite/SKILL.md` 定义 `intent → inspect → patch → verify → review → capture → exit`
- [x] `skills/opsx-lite/SKILL.md` 明确禁止创建正式 proposal/design/spec/tasks/gates
- [x] `skills/opsx-lite/SKILL.md` 定义升级到 `opsx-slice → opsx-plan` 的条件
- [x] `skills/opsx-ff/SKILL.md` 不再作为 active skill 存在

**依赖**：无

## Task 2：新增 lite-run 事实留档规范

- [x] 2.1 [R3][R4][U2][direct] 在 `.aiknowledge` 中新增 lite-run 事实留档规范

**需求追踪**：[R3][R4] → [U2]
**执行方式**：[direct]
**涉及文件**：
- `.aiknowledge/README.md` — 增加 lite-run 位置和 source_refs 规则
- `.aiknowledge/lite-runs/README.md` — lite-run 模板与维护规则
- `.aiknowledge/logs/2026-04.md` — 记录 lifecycle 更新

**验收标准**：
- [x] `.aiknowledge/lite-runs/README.md` 说明 lite-run 是事实留档，不是正式 change
- [x] lite-run 模板包含 Intent、Scope、Changes、Verification、Risks、Knowledge
- [x] `.aiknowledge/README.md` 说明 `lite-run:<run-id>` 可作为 `source_refs`
- [x] `.aiknowledge/logs/2026-04.md` 记录本次 workflow 规则更新

**依赖**：Task 1

## Task 3：更新文档和 codemap 引用

- [x] 3.1 [R5][U3][characterization-first] 将 active 文档、explore 提示和 codemap 从 `opsx-ff` 迁移到 `opsx-lite`

**需求追踪**：[R5] → [U3]
**执行方式**：[characterization-first]
**涉及文件**：
- `README.md` — 如命中旧快速入口则更新
- `docs/workflows.md` — workflow 推荐表
- `docs/supported-tools.md` — skill 工具清单
- `docs/concepts.md` — 工作流概念说明
- `skills/opsx-explore/SKILL.md` — 从探索转入执行的提示
- `.aiknowledge/codemap/openspec-skills.md` — skill 清单和拓扑

**验收标准**：
- [x] active docs/skills/codemap 中不再推荐 `opsx-ff`
- [x] docs 中存在 `opsx-lite` 的用途说明
- [x] codemap skill 清单显示 18 个 skill，包含 `opsx-lite`，不包含 `opsx-ff`
- [x] 工作流拓扑不再出现 `plan / ff`

**依赖**：Task 1, Task 2

## Task 4：验证和留档

- [x] 4.1 [R1][R2][R3][R4][R5][U1][U2][U3][direct] 执行引用检查、测试和结果留档

**需求追踪**：[R1][R2][R3][R4][R5] → [U1][U2][U3]
**执行方式**：[direct]
**涉及文件**：
- `openspec/changes/2026-04-27-opsx-lite-workflow/test-report.md` — 验证记录

**验收标准**：
- [x] `rg "opsx-ff|plan / ff|一次性推进完整规划"` 仅命中历史 archive 或本 change 记录
- [x] `rg "opsx-lite"` 命中新 skill、docs、codemap 和 `.aiknowledge`
- [x] `npm test` 通过
- [x] test-report.md 记录命令和结果

**依赖**：Task 3
