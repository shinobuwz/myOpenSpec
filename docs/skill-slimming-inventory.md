# Skill Slimming Inventory

Baseline captured on 2026-04-28 from `skills/opsx-*/SKILL.md`. This file now reflects the state after `2026-04-28-skill-md-slimming/02-migrate-guidance-skills`.

## Summary

| Metric | Value |
|--------|------:|
| OPSX skills | 19 |
| Total `SKILL.md` lines | 2289 |
| Over 240 lines | 0 |
| 181-240 lines | 3 |
| 121-180 lines | 8 |
| 120 lines or fewer | 8 |
| Oversized at current checker threshold `>180` | 3 |
| Duplicate canonical contract candidates | 2 |

## Inventory

| Skill | Lines | Priority | Risk | Notes |
|-------|------:|----------|------|-------|
| `opsx-explore` | 52 | Done in 02 | Thin entry | Detailed workflow, conversation patterns, and codemap-first rules moved to `references/`. |
| `opsx-knowledge` | 52 | Done in 02 | Thin entry | Lifecycle workflow and templates moved to `references/`; `.aiknowledge/README.md` remains the canonical lifecycle source. |
| `opsx-codemap` | 51 | Done in 02 | Thin entry | Lifecycle workflow and codemap templates moved to `references/`; codemap-only write boundary remains visible. |
| `opsx-lite` | 65 | Done in 02 | Thin entry | Detailed workflow and lite-run template moved to `references/`; fresh evidence and upgrade rules remain visible. |
| `opsx-slice` | 56 | Done in 02 | Thin entry | Workflow and report/proposal templates moved to `references/`; cohesion and topology rules remain visible. |
| `opsx-auto-drive` | 53 | Done in 02 | Thin entry | Engine loop and record templates moved to `references/`; metric/stop rules remain visible. |
| `opsx-bugfix` | 61 | Done in 02 | Thin entry | Detailed workflow moved to `references/`; root-cause and 3-failure stop rules remain visible. |
| `opsx-verify` | 214 | P0 for 03 | StageResult prompt, gate contract | Move reviewer prompt and detailed dimensions into references or `docs/stage-packet-protocol.md`; keep fresh evidence rule visible. |
| `opsx-archive` | 204 | P0 for 03 | Long grouped-change flow, follow-up workers | Move detailed archive path algorithm and worker prompt text into references; keep verify/review gates visible. |
| `opsx-review` | 193 | P0 for 03 | Long risk taxonomy | Move issue taxonomy and examples into references; keep verify/review boundary visible. |
| `opsx-plan-review` | 171 | P1 for 03 | StageResult prompt | Move reviewer prompt and output template into references; keep hard gate visible. |
| `opsx-tdd` | 171 | P1 for 03 | Report template-heavy | Move full test-report template and anti-pattern table into references; keep red/green/refactor rule visible. |
| `opsx-task-analyze` | 158 | P1 for 03 | StageResult/gate detail | Move detailed matrices and fallback wording into references; keep task-analyze gate visible. |
| `opsx-tasks` | 152 | P1 for 03 | Task template-heavy | Move full tasks.md template and forbidden-pattern table into references; keep trace/test-first rules visible. |
| `opsx-implement` | 133 | P2 | Subagent policy-sensitive | Current size acceptable; keep parallel-worker wording referencing `opsx-subagent` rather than duplicating platform mapping. |
| `opsx-subagent` | 131 | P2 | Canonical contract | This is a canonical source, so density is expected. Do not split unless it becomes hard to scan. |
| `opsx-continue` | 131 | P2 | State routing detail | Keep as-is unless the state matrix grows. |
| `opsx-report` | 122 | P2 | Report/CSS detail | Near threshold; move CSS or report template if it grows. |
| `opsx-plan` | 119 | P2 | Healthy | Keep concise; avoid copying slice or task rules. |

## Remaining High-Priority Migration Set

`03-migrate-gate-skills` should handle the remaining oversized or duplicate-prone gate/reviewer entries:

1. `opsx-verify`
2. `opsx-archive`
3. `opsx-review`
4. `opsx-plan-review`
5. `opsx-task-analyze`
6. `opsx-tasks`
7. `opsx-tdd`

## Validation Targets

The slimming checker should make these conditions visible:

- `SKILL.md` entries above the configured threshold.
- Non-canonical `SKILL.md` files that copy full StageResult schema text.
- Non-canonical `SKILL.md` files that copy full subagent platform mapping tables.
- Non-canonical `SKILL.md` files that copy `.aiknowledge` lifecycle schema instead of referencing `.aiknowledge/README.md`.

Current `node scripts/check-skill-slimming.mjs --json` output after 02:

- `totalSkills`: 19
- `totalLines`: 2289
- `oversized`: 3 (`opsx-archive`, `opsx-review`, `opsx-verify`)
- `duplicates`: 2 (`opsx-plan-review`, `opsx-verify`, both StageResult schema copies to be handled by 03)
