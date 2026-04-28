## 1. Slimming Policy Documents

- [x] 1.1 [direct] Create the repository skill slimming policy

  **需求追踪**：[R1][R2][R3][R4][R5] → [U1]
  **执行方式**：[direct]
  **涉及文件**：
  - `docs/skill-slimming-policy.md` — repository-level slimming policy

  **验收标准**：
  - [x] Policy states what stays in `SKILL.md`: trigger, responsibility boundary, read/write boundary, safety red lines, quick entry, reference navigation, downstream contract.
  - [x] Policy states what moves to `references/`: long workflows, full prompts, output templates, examples, parameter tables, troubleshooting, domain knowledge.
  - [x] Policy points subagent, StageResult/audit-log, and `.aiknowledge` lifecycle references to canonical sources instead of copying them.
  - [x] Policy explicitly requires hard safety rules to remain visible in `SKILL.md`.
  - [x] Policy states slimming must not change OPSX skill names, workflow stage order, or gate semantics.

  **验证命令 / 方法**：
  - `rg -n 'SKILL.md|references/|opsx-subagent|stage-packet-protocol|安全|workflow' docs/skill-slimming-policy.md`，预期：命中全部关键政策词。

  **依赖**：无

- [x] 1.2 [direct] Create the baseline skill slimming inventory

  **需求追踪**：[R6] → [U2]
  **执行方式**：[direct]
  **涉及文件**：
  - `docs/skill-slimming-inventory.md` — baseline line-count and priority inventory
  - `skills/*/SKILL.md` — counted source files

  **验收标准**：
  - [x] Inventory lists every current `skills/opsx-*/SKILL.md` file.
  - [x] Inventory records baseline line counts for each listed skill.
  - [x] Inventory assigns risk labels and migration priority.
  - [x] Inventory identifies high-priority oversized or duplicated-contract candidates.

  **验证命令 / 方法**：
  - `wc -l skills/*/SKILL.md`，预期：all `opsx-*` skill files appear in the inventory with matching baseline counts.
  - `rg -n 'opsx-explore|opsx-knowledge|opsx-codemap|Priority|Risk' docs/skill-slimming-inventory.md`，预期：命中优先级和风险字段。

  **依赖**：Task 1.1

## 2. Slimming Validation

- [x] 2.1 [test-first] Add the skill slimming checker and regression tests

  **需求追踪**：[R7][R8][R9] → [U3]
  **执行方式**：[test-first]
  **涉及文件**：
  - `scripts/check-skill-slimming.mjs` — checker implementation
  - `tests/skill-slimming.test.mjs` — node:test regression coverage
  - `package.json` — npm script entry for the checker

  **验收标准**：
  - [x] Checker can report oversized `skills/opsx-*/SKILL.md` entries using a configurable threshold.
  - [x] Checker can report duplicated canonical-contract text outside canonical sources.
  - [x] Checker only uses Node.js standard library and repository files.
  - [x] Test coverage proves the checker reports current oversized entries without failing the baseline migration.
  - [x] Test coverage proves the checker can fail on synthetic duplicated StageResult/platform mapping text.

  **验证命令 / 方法**：
  - `npm test`，预期：全部 tests 通过。
  - `node scripts/check-skill-slimming.mjs --json`，预期：输出 JSON inventory/check result，进程退出码为 0。

  **依赖**：Task 1.2
