# Skill Slimming Inventory

Baseline captured on 2026-04-28 from the current `skills/opsx-*/SKILL.md` files.

## Summary

| Metric | Value |
|--------|------:|
| OPSX skills | 19 |
| Total `SKILL.md` lines | 3414 |
| Over 240 lines | 3 |
| 181-240 lines | 4 |
| 121-180 lines | 9 |
| 120 lines or fewer | 3 |

## Inventory

| Skill | Lines | Priority | Risk | Notes |
|-------|------:|----------|------|-------|
| `opsx-explore` | 432 | P0 | Oversized, examples, duplicated contracts | Move examples, convergence protocol, codemap-first details into references while keeping read-only and slice-before-plan red lines visible. |
| `opsx-knowledge` | 255 | P0 | Lifecycle-heavy, templates | Move directory templates, domain table, index consistency procedure into references; keep `.aiknowledge/README.md` prerequisite visible. |
| `opsx-codemap` | 245 | P0 | Lifecycle-heavy, templates | Move module/chain document templates and stale handling details into references; keep codemap-only write boundary visible. |
| `opsx-verify` | 214 | P0 | StageResult prompt, gate contract | Move reviewer prompt and detailed dimensions into references or `docs/stage-packet-protocol.md`; keep fresh evidence rule visible. |
| `opsx-archive` | 204 | P0 | Long grouped-change flow, follow-up workers | Move detailed archive path algorithm and worker prompt text into references; keep verify/review gates visible. |
| `opsx-review` | 193 | P0 | Long risk taxonomy | Move issue taxonomy and examples into references; keep verify/review boundary visible. |
| `opsx-lite` | 175 | P1 | Workflow detail | Move lite-run template and step detail into references; keep upgrade conditions and fresh evidence rule visible. |
| `opsx-plan-review` | 171 | P1 | StageResult prompt | Move reviewer prompt and output template into references; keep hard gate visible. |
| `opsx-tdd` | 171 | P1 | Report template-heavy | Move full test-report template and anti-pattern table into references; keep red/green/refactor rule visible. |
| `opsx-task-analyze` | 158 | P1 | StageResult/gate detail | Move detailed matrices and fallback wording into references; keep task-analyze gate visible. |
| `opsx-tasks` | 152 | P1 | Task template-heavy | Move full tasks.md template and forbidden-pattern table into references; keep trace/test-first rules visible. |
| `opsx-auto-drive` | 150 | P1 | Long orchestration flow | Move iteration log format and loop detail into references. |
| `opsx-slice` | 149 | P1 | Proposal template detail | Move output/proposal templates into references; keep delivery-boundary rules visible. |
| `opsx-implement` | 133 | P2 | Subagent policy-sensitive | Current size acceptable; ensure parallel-worker wording references `opsx-subagent` rather than duplicating platform mapping. |
| `opsx-subagent` | 131 | P2 | Canonical contract | This is a canonical source, so some density is expected. Do not split unless it becomes hard to scan. |
| `opsx-continue` | 131 | P2 | State routing detail | Keep as-is unless future state matrix grows. |
| `opsx-report` | 122 | P2 | Report/CSS detail | Near threshold; move CSS or report template if it grows. |
| `opsx-plan` | 119 | P2 | Healthy | Keep concise; avoid copying slice or task rules. |
| `opsx-bugfix` | 109 | P2 | Healthy | Keep concise; root-cause red line is already visible. |

## High-Priority Migration Set

P0 files should be handled before broad cleanups:

1. `opsx-explore`
2. `opsx-knowledge`
3. `opsx-codemap`
4. `opsx-verify`
5. `opsx-archive`
6. `opsx-review`

## Validation Targets

The slimming checker should make these conditions visible:

- `SKILL.md` entries above the configured threshold.
- Non-canonical `SKILL.md` files that copy full StageResult schema text.
- Non-canonical `SKILL.md` files that copy full subagent platform mapping tables.
- Non-canonical `SKILL.md` files that copy `.aiknowledge` lifecycle schema instead of referencing `.aiknowledge/README.md`.
