# Skill Slimming Inventory

Baseline captured on 2026-04-28 from `skills/opsx-*/SKILL.md`. This file now reflects the state after the 2026-04-29 recovery-skill removal.

## Summary

| Metric | Value |
|--------|------:|
| OPSX skills | 17 |
| Total `SKILL.md` lines | 1241 |
| Over 240 lines | 0 |
| 181-240 lines | 0 |
| 121-180 lines | 1 |
| 120 lines or fewer | 16 |
| Oversized at current checker threshold `>180` | 0 |
| Duplicate canonical contract candidates | 0 |

## Inventory

| Skill | Lines | Status | Notes |
|-------|------:|--------|-------|
| `opsx-explore` | 52 | Done in 02 | Detailed workflow, conversation patterns, and codemap-first rules live in `references/`. |
| `opsx-knowledge` | 52 | Done in 02 | Lifecycle workflow and templates live in `references/`; `.aiknowledge/README.md` remains canonical. |
| `opsx-codemap` | 51 | Done in 02 | Lifecycle workflow and codemap templates live in `references/`; codemap-only boundary remains visible. |
| `opsx-fast` | 50 | Done in fast workflow | Route, item schema, gate profile, and escalation rules live in `references/`; source_type, preflight, TDD strategy, fresh evidence, and fallback rules remain visible. |
| `opsx-slice` | 56 | Done in 02 | Workflow and report/proposal templates live in `references/`; cohesion and topology rules remain visible. |
| `opsx-auto-drive` | 53 | Done in 02 | Engine loop and record templates live in `references/`; metric/stop rules remain visible. |
| `opsx-plan-review` | 60 | Done in 03 | Reviewer prompt and audit/gate templates moved to `references/`; StageResult schema referenced from `docs/stage-packet-protocol.md`. |
| `opsx-task-analyze` | 60 | Done in 03 | Reviewer prompt and audit/gate templates moved to `references/`; gate and implement routing remain visible. |
| `opsx-verify` | 66 | Done in 03 | Verify dimensions and fresh evidence details moved to `references/`; Spec Compliance Review, fast target support, and fresh evidence rule remain visible. |
| `opsx-review` | 70 | Done in 03 | Risk taxonomy and reviewer prompt moved to `references/`; release-risk-only boundary, fast target support, and `VERIFY_DRIFT` remain visible. |
| `opsx-tasks` | 86 | Done in 03 | Task template and forbidden patterns moved to `references/`; TDD label and bite-sized rules remain visible. |
| `opsx-tdd` | 70 | Done in 03 | Red/green/refactor details, report template, and anti-patterns moved to `references/`; fast target and no bare `N/A` coverage rule remain visible. |
| `opsx-report` | 65 | Done in 03 | Stage data source rules and HTML/CSS template moved to `references/`; report output boundary and fast target degradation remain visible. |
| `opsx-implement` | 78 | Done in 03 | Worker contract and execution rules moved to `references/`; gates, serial-by-default, shared artifact ownership, and evidence rules remain visible. |
| `opsx-archive` | 74 | Done in 03 | Archive routing and follow-up worker prompts moved to `references/`; verify/review gates, grouped subchange rules, and fast archive root remain visible. |
| `opsx-plan` | 119 | Healthy | Keep concise; avoid copying slice or task rules. |
| `opsx-subagent` | 174 | Canonical source | This is the canonical subagent contract; density is expected. Do not split unless it becomes hard to scan. |

## Validation Targets

`node scripts/check-skill-slimming.mjs --json --fail-on-duplicates` after recovery-skill removal:

- `totalSkills`: 17
- `totalLines`: 1241
- `oversized`: 0
- `duplicates`: 0

## Remaining Risk

No current `SKILL.md` exceeds the checker threshold or copies detected canonical contracts. `opsx-subagent` remains intentionally dense because it is the canonical contract other skills reference.
