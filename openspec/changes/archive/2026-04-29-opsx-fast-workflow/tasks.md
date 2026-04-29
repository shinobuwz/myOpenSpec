## Task 1：新增 fast runtime store 和状态展示

**需求追踪**：[R3], [R20], [R21], [R22], [R23], [R28] → [U4]
**执行方式**：[characterization-first]
**涉及文件**：
- `runtime/bin/changes.sh` — runtime store、resolve、list/status、路径校验
- `bin/opsx.mjs` — CLI 分发（如需新增通用 status/fast 命令）
- `tests/changes-helper.test.mjs` — fast runtime 行为测试

**验收标准**：
- [x] `openspec/fast/<id>/.openspec.yaml` 可被 runtime 识别为 active fast item。
- [x] status 输出同时展示 active changes 和 active fast items。
- [x] fast item 缺少 `classify`、`preflight`、`tdd-strategy` 或 `verify` gate 时，Next 分别指向对应 fast stage。
- [x] fast item 已通过 `verify` 且需要风险审查时，Next 指向 `opsx-review`；已通过 `verify` 且不需要风险审查时，Next 指向 `opsx-archive`。
- [x] 同名 `openspec/changes/<id>` 与 `openspec/fast/<id>` 并存时，runtime 不把 fast 解析为 formal change。
- [x] fast id 解析拒绝绝对路径、`..`、隐藏目录名和包含 `/` 的非法组件。
- [x] `openspec/fast/<id>` 下不支持 group/subchange 结构；需要拆分时由 workflow 文档路由多个 fast item 或 formal change。
- [x] formal change 的现有 list/status/resolve 测试不回归。

**验证命令 / 方法**：
- `npm test`，预期：全部 node test 通过。
- `./bin/opsx.mjs changes status`，预期：仍能展示当前 formal change 状态。

**依赖**：无

## Task 2：定义 opsx-fast 薄入口和中文 fast item 模板

**需求追踪**：[R1], [R2], [R4], [R7], [R8], [R9], [R10], [R12], [R13], [R14], [R15], [R27], [R28] → [U1], [U2], [U7]
**执行方式**：[direct]
**涉及文件**：
- `skills/opsx-fast/SKILL.md` — fast 薄入口
- `skills/opsx-fast/references/route.md` — classify 和 source_type 路由
- `skills/opsx-fast/references/item-schema.md` — `item.md`、`.openspec.yaml`、`evidence.md`、`root-cause.md` 模板
- `skills/opsx-fast/references/gate-profile.md` — fast gate profile 和 preflight gate
- `skills/opsx-fast/references/escalation.md` — 升级与三次失败回退
- `runtime/schemas/fast/schema.yaml` — fast schema 定义
- `runtime/schemas/fast/templates/item.md` — fast item 模板
- `runtime/schemas/fast/templates/evidence.md` — fast evidence 模板
- `runtime/schemas/fast/templates/root-cause.md` — bugfix 诊断补充模板
- `openspec/fast/README.md` — fast store 说明
- `skills/opsx-lite/SKILL.md` — 删除旧独立流程入口
- `skills/opsx-bugfix/SKILL.md` — 删除旧独立流程入口
- `README.md` — workflow 入口说明
- `docs/workflows.md` — workflow 拓扑说明
- `docs/supported-tools.md` — skill 清单说明
- `docs/concepts.md` — OpenSpec 概念说明
- `.aiknowledge/codemap/openspec-skills.md` — workflow skill 地图

**验收标准**：
- [x] `opsx-fast` 初始化示例 fast item 时，模板要求创建 `item.md` 和 `.openspec.yaml`。
- [x] `opsx-fast` 初始化 fast item 时不得创建 `proposal.md`、`design.md`、`specs/` 或 `tasks.md`。
- [x] `runtime/schemas/fast/schema.yaml` 定义 fast schema、source_type、status、attempts、test_strategy、gates 和 fallback 字段。
- [x] `runtime/schemas/fast/templates/item.md` 使用中文共同 preflight 模板。
- [x] `runtime/schemas/fast/templates/evidence.md` 包含命令证据、人工观察证据和 TDD 跳过理由位置。
- [x] `runtime/schemas/fast/templates/root-cause.md` 使用中文 bugfix 诊断补充模板。
- [x] `openspec/fast/README.md` 说明 active fast item、archive 位置、source_type 语义和不支持 group/subchange。
- [x] `opsx-fast/SKILL.md` 只保留触发、路由、写入边界和关键护栏，不内联 tdd/verify/review/archive 细节。
- [x] fast 使用 `source_type: lite | bugfix`，并说明二者只是需求来源，不是两套流程。
- [x] 共同 preflight 模板使用中文字段：`意图`、`范围`、`预期影响`、`验证计划`、`升级检查`。
- [x] `source_type: bugfix` 的诊断补充使用中文字段：`现象`、`预期行为`、`观察/复现`、`根因假设`、`假设证据`、`回退触发条件`。
- [x] preflight 未完成时，skill 明确禁止 patch 实现文件。
- [x] fast 必须记录 TDD 策略；`direct` 必须记录跳过 TDD 的理由和替代验证。
- [x] 三次失败后停止 patch，状态转为 `blocked` 或 `escalated`，并路由 `opsx-explore` 或 `opsx-slice`。
- [x] `skills/opsx-lite/` 和 `skills/opsx-bugfix/` 不再作为可安装 skill 目录存在。
- [x] active docs/skills/codemap 不再出现“使用 `opsx-lite`”或“使用 `opsx-bugfix`”这类推荐旧入口的表述。

**验证命令 / 方法**：
- `npm run check:skill-slimming`，预期：skill 入口未超出瘦身约束。
- `test ! -d skills/opsx-lite && test ! -d skills/opsx-bugfix`，预期：命令成功。
- `rg -n "使用 `opsx-lite`|使用 `opsx-bugfix`|转入 `opsx-lite`|转入 `opsx-bugfix`" skills .aiknowledge/codemap docs README.md`，预期：无命中。
- `test -f runtime/schemas/fast/schema.yaml && test -f openspec/fast/README.md`，预期：命令成功。
- `find openspec/fast -path '*/proposal.md' -o -path '*/design.md' -o -path '*/specs' -o -path '*/tasks.md'`，预期：active fast item 下无 formal artifacts。

**依赖**：Task 1

## Task 3：适配 tdd/verify/review/archive 到 fast target

**需求追踪**：[R5], [R6], [R10], [R11], [R12], [R16], [R17], [R18], [R19], [R24] → [U3], [U5]
**执行方式**：[characterization-first]
**涉及文件**：
- `skills/opsx-tdd/SKILL.md`、`skills/opsx-tdd/references/` — fast target 测试报告目标
- `skills/opsx-verify/SKILL.md`、`skills/opsx-verify/references/` — fast artifacts 验证和 `audit-log.md`
- `skills/opsx-review/SKILL.md`、`skills/opsx-review/references/` — fast review 不要求 formal artifacts
- `skills/opsx-archive/SKILL.md`、`skills/opsx-archive/references/` — fast archive root 和 follow-up prompt
- `skills/opsx-report/SKILL.md`、`skills/opsx-report/references/` — fast report 读取缺少 design/tasks 时不报错
- `runtime/bin/changes.sh` — fast archive root 解析和归档路径辅助
- `tests/archive-skill.test.mjs`、`tests/workflow-discipline.test.mjs`、`tests/skill-slimming.test.mjs` — 相关契约测试

**验收标准**：
- [x] fast 的命令执行证据和人工观察证据写入 `evidence.md`，并包含命令/观察内容、时间和结果。
- [x] `opsx-tdd` 明确 fast root 下 `test-report.md` 是测试结果写入目标。
- [x] `opsx-verify` 支持 `target_kind: fast`，读取 `item.md`、`evidence.md`、`root-cause.md`、`test-report.md`，不要求 specs/design/tasks。
- [x] `opsx-review` 支持 `target_kind: fast`，聚焦 code quality / release risk / 验证遗漏，不做 formal spec compliance。
- [x] `opsx-archive` 根据 target kind 将 fast item 归档到 `openspec/fast/archive/<id>/`，不写入 `openspec/changes/archive/`。
- [x] runtime 中 fast archive root 解析与 `opsx-archive` 使用的路径一致。
- [x] archive follow-up worker prompt 使用真实归档路径，避免 knowledge/codemap 记录错误来源。
- [x] `opsx-report` 读取 fast item 时不因缺少 formal artifacts 报错。

**验证命令 / 方法**：
- `npm test`，预期：全部 node test 通过。
- `npm run check:skill-slimming`，预期：skill 入口未超出瘦身约束。

**依赖**：Task 1、Task 2

## Task 4：迁移 aiknowledge source_refs 与 lite-runs 职责

**需求追踪**：[R25], [R26] → [U6]
**执行方式**：[direct]
**涉及文件**：
- `.aiknowledge/README.md` — source_refs 和运行状态归属说明
- `.aiknowledge/lite-runs/README.md` — 历史保留说明
- `skills/opsx-knowledge/SKILL.md`、`skills/opsx-knowledge/references/` — `fast:<id>` 来源支持
- `skills/opsx-codemap/SKILL.md`、`skills/opsx-codemap/references/` — `fast:<id>` 来源支持
- `.aiknowledge/logs/2026-04.md` — 本次知识生命周期记录

**验收标准**：
- [x] `.aiknowledge` 文档支持 `source_refs: fast:<id>`。
- [x] `.aiknowledge/lite-runs/` 标记为历史记录路径，不再承接新增 workflow 状态。
- [x] `opsx-knowledge` 和 `opsx-codemap` 的模板允许 fast item 作为事实来源。
- [x] 不删除历史 `lite-run:<id>` 引用。

**验证命令 / 方法**：
- `rg "fast:<id>|lite-runs" .aiknowledge skills/opsx-knowledge skills/opsx-codemap`，预期：能看到 fast 来源支持和 lite-runs 历史保留说明。
- `npm run check:skill-slimming`，预期：skill 入口未超出瘦身约束。

**依赖**：Task 2、Task 3
