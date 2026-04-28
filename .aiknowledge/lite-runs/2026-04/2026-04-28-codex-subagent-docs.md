---
id: 2026-04-28-codex-subagent-docs
created_at: 2026-04-28T03:01:59Z
kind: lite
status: done
source_refs:
  - docs:supported-tools
  - skill:opsx-explore
---

# Codex-first subagent docs

## Intent

Clarify that OPSX can reuse the Superpowers-style subagent description as a platform-neutral workflow idea while making Codex the default execution mapping and Claude Code the compatibility mapping.

## Scope

- `docs/supported-tools.md`
- `skills/opsx-explore/SKILL.md`
- `tests/workflow-discipline.test.mjs`

## Changes

- Added a Codex-first subagent mapping table covering `spawn_agent`, `wait_agent`, `close_agent`, `update_plan`, and Claude Code equivalents.
- Removed the stale `opsx-bootstrap` skill entry from the supported tools list because no matching `skills/opsx-bootstrap/` directory exists.
- Restored the missing `opsx-report` supported-tools entry because `skills/opsx-report/` exists.
- Updated `opsx-explore` wording from Claude-style `subagent_type: "Explore"` only to Codex default plus Claude Code equivalent.
- Added a regression test that the documented skill table matches actual `skills/opsx-*` directories and keeps Codex/Claude mapping text present.

## Verification

- `npm test` passed: 24 tests, 24 pass, 0 fail.
- `rg -n "opsx-bootstrap|opsx-report|spawn_agent|Codex \| 默认入口|Claude Code \| 兼容入口" docs/supported-tools.md tests/workflow-discipline.test.mjs skills/opsx-explore/SKILL.md .aiknowledge/lite-runs/2026-04/2026-04-28-codex-subagent-docs.md` confirmed the stale `opsx-bootstrap` entry is absent from supported docs, `opsx-report` is present, and the Codex/Claude mapping text exists.
- `npm pack --dry-run --silent` passed and reported `shinobuwz-opsx-1.0.1.tgz`.

## Risks

Low. This is documentation and skill wording only. It does not change CLI behavior, skill installation, or OpenSpec change state.

## Knowledge

Updated `.aiknowledge/codemap/openspec-skills.md` to record the Codex-first subagent dispatch mapping and appended the monthly knowledge log.
