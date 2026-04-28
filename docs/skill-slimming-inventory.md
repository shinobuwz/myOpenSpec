# Skill Slimming Inventory

Baseline captured on 2026-04-28 from `skills/opsx-*/SKILL.md`. This file now reflects the state after `2026-04-28-skill-md-slimming/03-migrate-gate-skills`.

## Summary

| Metric | Value |
|--------|------:|
| OPSX skills | 19 |
| Total `SKILL.md` lines | 1388 |
| Over 240 lines | 0 |
| 181-240 lines | 0 |
| 121-180 lines | 2 |
| 120 lines or fewer | 17 |
| Oversized at current checker threshold `>180` | 0 |
| Duplicate canonical contract candidates | 0 |

## Inventory

| Skill | Lines | Status | Notes |
|-------|------:|--------|-------|
| `opsx-explore` | 52 | Done in 02 | Detailed workflow, conversation patterns, and codemap-first rules live in `references/`. |
| `opsx-knowledge` | 52 | Done in 02 | Lifecycle workflow and templates live in `references/`; `.aiknowledge/README.md` remains canonical. |
| `opsx-codemap` | 51 | Done in 02 | Lifecycle workflow and codemap templates live in `references/`; codemap-only boundary remains visible. |
| `opsx-lite` | 65 | Done in 02 | Detailed workflow and lite-run template live in `references/`; fresh evidence and upgrade rules remain visible. |
| `opsx-slice` | 56 | Done in 02 | Workflow and report/proposal templates live in `references/`; cohesion and topology rules remain visible. |
| `opsx-auto-drive` | 53 | Done in 02 | Engine loop and record templates live in `references/`; metric/stop rules remain visible. |
| `opsx-bugfix` | 61 | Done in 02 | Detailed workflow lives in `references/`; root-cause and 3-failure stop rules remain visible. |
| `opsx-plan-review` | 60 | Done in 03 | Reviewer prompt and audit/gate templates moved to `references/`; StageResult schema referenced from `docs/stage-packet-protocol.md`. |
| `opsx-task-analyze` | 60 | Done in 03 | Reviewer prompt and audit/gate templates moved to `references/`; gate and implement routing remain visible. |
| `opsx-verify` | 64 | Done in 03 | Verify dimensions and fresh evidence details moved to `references/`; Spec Compliance Review and fresh evidence rule remain visible. |
| `opsx-review` | 68 | Done in 03 | Risk taxonomy and reviewer prompt moved to `references/`; release-risk-only boundary and `VERIFY_DRIFT` remain visible. |
| `opsx-tasks` | 86 | Done in 03 | Task template and forbidden patterns moved to `references/`; TDD label and bite-sized rules remain visible. |
| `opsx-tdd` | 66 | Done in 03 | Red/green/refactor details, report template, and anti-patterns moved to `references/`; no bare `N/A` coverage rule remains visible. |
| `opsx-report` | 63 | Done in 03 | Stage data source rules and HTML/CSS template moved to `references/`; report output boundary remains visible. |
| `opsx-implement` | 78 | Done in 03 | Worker contract and execution rules moved to `references/`; gates, serial-by-default, shared artifact ownership, and evidence rules remain visible. |
| `opsx-archive` | 72 | Done in 03 | Archive routing and follow-up worker prompts moved to `references/`; verify/review gates and grouped subchange rules remain visible. |
| `opsx-plan` | 119 | Healthy | Keep concise; avoid copying slice or task rules. |
| `opsx-continue` | 131 | Acceptable | State routing detail remains centralized; consider splitting only if route matrix grows. |
| `opsx-subagent` | 131 | Canonical source | This is the canonical subagent contract; density is expected. Do not split unless it becomes hard to scan. |

## Validation Targets

`node scripts/check-skill-slimming.mjs --json --fail-on-duplicates` after 03:

- `totalSkills`: 19
- `totalLines`: 1388
- `oversized`: 0
- `duplicates`: 0

## Remaining Risk

No current `SKILL.md` exceeds the checker threshold or copies detected canonical contracts. The two largest remaining entries, `opsx-continue` and `opsx-subagent`, are intentionally dense: `opsx-continue` owns routing state, and `opsx-subagent` is the canonical contract other skills reference.
