## Task 1：新增 fast runtime store 和状态展示

**执行方式**：characterization-first

### 红

- 新增 `tests/changes-helper.test.mjs` fast runtime 行为测试：
  - active fast item 与 formal change 同时出现在 status。
  - fast gate next-step 矩阵覆盖 classify、preflight、tdd-strategy、verify、review/optional archive。
  - `resolve-fast` 显式解析 fast item，并与同名 formal change 分离。
  - unsafe fast id 被拒绝。
- 首次运行 `node --test tests/changes-helper.test.mjs` 失败，原因符合预期：runtime 不展示 fast items，且缺少 `resolve-fast` 命令。

### 绿

- 修改 `runtime/bin/changes.sh`：
  - 新增 `FAST_DIR` 和 `resolve-fast`。
  - status/list 识别 `openspec/fast/<id>/.openspec.yaml`。
  - fast next-step 按 `classify -> preflight -> tdd-strategy -> verify -> review? -> archive` 计算。
  - fast id 复用安全组件校验，拒绝绝对路径、`..`、隐藏目录名和 `/`。
- `node --test tests/changes-helper.test.mjs` 通过：12/12。

### 重构

- 运行 `npm test` 通过：57/57。
- 覆盖率：当前项目使用 `node --test`，未配置 coverage 采集；本轮用新增行为测试覆盖 fast runtime 状态、next-step、resolve 和路径安全。

### Verify 修复

- verify 发现 fast schema 示例使用 `gates.<key>.status/at` 嵌套结构，但 runtime 只识别 `gates.<key>: "timestamp"` 标量结构，导致 schema-compliant fast item 不能正确进入 archive。
- 红：新增 `tests/changes-helper.test.mjs` 用例，使用嵌套 gate schema 验证 `review_required: false` + `verify.status: pass` 时 Next 为 `opsx-archive`；首次运行失败。
- 绿：更新 `runtime/bin/changes.sh` 的 `gate_value`，在 `gates:` 段内同时支持标量 gate 和嵌套 gate，嵌套 gate 优先返回非空 `status`，没有 status 时回退 `at`。
- 回归：`node --test tests/changes-helper.test.mjs` 通过：13/13。
- 全量：`npm run check:skill-slimming` 通过：skills=18、oversized=0、duplicates=0；`npm test` 通过：61/61。

### Review 修复

- review 发现 `list_changes()` 在没有 active formal change 时提前返回，导致仅存在 active fast item 的项目执行 `opsx changes list` 不展示 fast item。
- 红：新增 `tests/changes-helper.test.mjs` 用例，验证 fast-only 项目 `list` 输出 `活动 fast items (1)`；首次运行失败。
- 绿：调整 `runtime/bin/changes.sh`，先分别收集 active formal changes 和 active fast items，只有两者都为空才输出 `无活动变更`。
- 回归：`node --test tests/changes-helper.test.mjs` 通过：14/14。
- 全量：`npm run check:skill-slimming` 通过：skills=18、oversized=0、duplicates=0；`npm test` 通过：63/63。

### 验收覆盖

- `openspec/fast/<id>/.openspec.yaml` 可被 runtime 识别为 active fast item：已覆盖。
- status 输出同时展示 active changes 和 active fast items：已覆盖。
- fast item 缺少 `classify`、`preflight`、`tdd-strategy` 或 `verify` gate 时，Next 分别指向对应 fast stage：已覆盖。
- fast item 已通过 `verify` 且需要风险审查时，Next 指向 `opsx-review`；已通过 `verify` 且不需要风险审查时，Next 指向 `opsx-archive`：已覆盖。
- 同名 `openspec/changes/<id>` 与 `openspec/fast/<id>` 并存时，runtime 不把 fast 解析为 formal change：已覆盖。
- fast id 解析拒绝绝对路径、`..`、隐藏目录名和包含 `/` 的非法组件：已覆盖。
- `openspec/fast/<id>` 下不支持 group/subchange 结构；需要拆分时由 workflow 文档路由多个 fast item 或 formal change：以 `resolve-fast parent/child` 拒绝 `/` 形式覆盖 runtime 层。
- formal change 的现有 list/status/resolve 测试不回归：已覆盖。

## Task 2：定义 opsx-fast 薄入口和中文 fast item 模板

**执行方式**：direct

### 执行记录

- 新增 `skills/opsx-fast/` 薄入口和 route / item-schema / gate-profile / escalation references。
- 新增 `runtime/schemas/fast/` schema 与中文 item/evidence/root-cause templates。
- 新增 `openspec/fast/README.md`。
- 删除旧独立 `skills/opsx-lite/` 和 `skills/opsx-bugfix/` 目录。
- 更新 active docs、`opsx-explore` 路由、codemap 和测试基线到 `opsx-fast`。

### 验证

- `npm run check:skill-slimming` 通过：skills=18、oversized=0、duplicates=0。
- `test ! -d skills/opsx-lite && test ! -d skills/opsx-bugfix` 通过。
- `rg -n "使用 \`opsx-lite\`|使用 \`opsx-bugfix\`|转入 \`opsx-lite\`|转入 \`opsx-bugfix\`" skills .aiknowledge/codemap docs README.md` 无命中。
- `test -f runtime/schemas/fast/schema.yaml && test -f openspec/fast/README.md` 通过。
- `find openspec/fast -path '*/proposal.md' -o -path '*/design.md' -o -path '*/specs' -o -path '*/tasks.md'` 无输出。
- `npm test` 通过：57/57。

### 验收覆盖

- `opsx-fast` 初始化示例 fast item 时，模板要求创建 `item.md` 和 `.openspec.yaml`：已覆盖。
- `opsx-fast` 初始化 fast item 时不得创建 `proposal.md`、`design.md`、`specs/` 或 `tasks.md`：已覆盖。
- fast schema、中文模板、薄入口、TDD 策略、direct 理由、三次失败回退、旧入口删除和 active docs/codemap 更新：已覆盖。

## Task 3：适配 tdd/verify/review/archive 到 fast target

**执行方式**：characterization-first

### 红

- 新增/调整契约测试：
  - `tests/workflow-discipline.test.mjs` 检查 `opsx-tdd`、`opsx-verify`、`opsx-review`、`opsx-report` 支持 `target_kind: fast`，且不要求 formal artifacts。
  - `tests/archive-skill.test.mjs` 检查 `opsx-archive` 单独记录 fast archive root 和 follow-up worker 真实归档路径。
- 首次运行 `node --test tests/archive-skill.test.mjs tests/workflow-discipline.test.mjs` 失败，原因符合预期：可复用 skills 尚未声明 fast target 契约。

### 绿

- 更新 `opsx-tdd`：fast root 下 `test-report.md` 是测试报告目标。
- 更新 `opsx-verify`：`target_kind: fast` 读取 `item.md`、`evidence.md`、`root-cause.md`、`test-report.md`，不要求 specs/design/tasks。
- 更新 `opsx-review`：fast target 不要求 proposal/design/specs/tasks，只做发布风险和验证遗漏审查。
- 更新 `opsx-archive`：fast item 归档到 `openspec/fast/archive/<archive-dir>/`，follow-up workers 使用真实归档路径和 `fast:<id>`。
- 更新 `opsx-report`：fast item 缺少 specs/design/tasks 时降级显示，不中断报告。

### 重构

- `node --test tests/archive-skill.test.mjs tests/workflow-discipline.test.mjs` 通过。
- `npm run check:skill-slimming` 通过：skills=18、oversized=0、duplicates=0。
- `npm test` 通过：59/59。
- 覆盖率：当前项目未配置 coverage 采集；本轮以契约测试覆盖 fast target 文案与 archive/report 降级规则。

### Verify 修复

- verify 发现 no-review fast item 已通过 `verify` 后会被 runtime 路由到 `opsx-archive`，但 `opsx-archive` 仍无条件要求 `gates.review`。
- 红：新增 `tests/archive-skill.test.mjs` 用例，要求 `opsx-archive` 记录 `review_required: false` 时只校验 `gates.verify`、不要求 `gates.review`；首次运行失败。
- 绿：更新 `skills/opsx-archive/SKILL.md` 和 `skills/opsx-archive/references/archive-routing.md`，将 archive gate 判定拆成 formal change、fast review-required、fast no-review 三种情况。
- 回归：`node --test tests/archive-skill.test.mjs` 通过：3/3。
- 全量：`npm run check:skill-slimming` 通过：skills=18、oversized=0、duplicates=0；`npm test` 通过：60/60。

### 验收覆盖

- `evidence.md` 命令和观察证据模板、fast root `test-report.md`、verify/review/archive/report fast target 支持均已覆盖。

## Task 4：迁移 aiknowledge source_refs 与 lite-runs 职责

**执行方式**：direct

### 执行记录

- 更新 `.aiknowledge/README.md`：新增 `fast:<id>` 来源引用，说明 `.aiknowledge/lite-runs/` 仅历史保留。
- 更新 `.aiknowledge/lite-runs/README.md`：明确不要新增 lite-run 承接 workflow runtime 状态。
- 更新 `opsx-knowledge` 和 `opsx-codemap` lifecycle/template references：允许 `fast:<id>` 作为事实来源。
- 追加 `.aiknowledge/logs/2026-04.md` 中文审计记录。

### 验证

- `rg "fast:<id>|lite-runs" .aiknowledge skills/opsx-knowledge skills/opsx-codemap` 通过，能看到 fast 来源支持和 lite-runs 历史保留说明。
- `npm run check:skill-slimming` 通过：skills=18、oversized=0、duplicates=0。
- `npm test` 通过：59/59。

### Review 修复

- review 发现 `.aiknowledge/codemap/index.md` 仍将 `bugfix 旁路` 标记为 active，而本次变更已删除 `skills/opsx-bugfix/`。
- 红：新增 `tests/workflow-discipline.test.mjs` 用例，要求 active 链路路由到 `opsx-fast 快速通道`，并禁止 `bugfix 旁路` 保持 active；首次运行失败。
- 绿：更新 `.aiknowledge/codemap/index.md`，将 active 链路改为 `opsx-fast 快速通道`，说明 lite / bugfix 需求来源共用 fast 流程。
- 回归：`node --test tests/workflow-discipline.test.mjs` 通过：21/21。
- 全量：`npm run check:skill-slimming` 通过：skills=18、oversized=0、duplicates=0；`npm test` 通过：63/63。

### 验收覆盖

- `.aiknowledge` 文档支持 `source_refs: fast:<id>`：已覆盖。
- `.aiknowledge/lite-runs/` 标记为历史记录路径，不再承接新增 workflow 状态：已覆盖。
- `opsx-knowledge` 和 `opsx-codemap` 的模板允许 fast item 作为事实来源：已覆盖。
- 历史 `lite-run:<id>` 引用未删除：已覆盖。
