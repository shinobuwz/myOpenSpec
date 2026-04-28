---
id: 2026-04-28-coverage-na-reason
created_at: 2026-04-28T15:04:59+0800
kind: lite
status: done
source_refs:
  - skills/opsx-tdd/SKILL.md
  - skills/opsx-verify/SKILL.md
---

# Coverage N/A Reason

## Intent

Clarify `test-report.md` coverage records so future reports do not use a bare `N/A` that hides whether coverage was unsupported, blocked, not enabled, or replaced by static/manual verification.

## Scope

- `skills/opsx-tdd/SKILL.md`
- `skills/opsx-verify/SKILL.md`
- Installed global copies under `/Users/cc/.agents/skills/opsx-tdd/SKILL.md` and `/Users/cc/.agents/skills/opsx-verify/SKILL.md` via `node bin/opsx.mjs install-skills`

## Changes

- Updated the refactor-stage coverage rule to require real coverage numbers and the command when available.
- For unavailable coverage, required `N/A（<reason>；补救：<next step>）` instead of bare `N/A`.
- Listed required reason categories: coverage disabled, test command blocked, framework unsupported/unconfigured, static-only verification, or manual-only acceptance.
- Updated verify guidance so missing coverage fields and bare coverage `N/A` in `test-report.md` are reported as critical test-report incompleteness instead of silently accepted.

## Verification

- `rg -n '覆盖率.*N/A|裸 \`N/A\`|不可用原因|coverage' skills/opsx-tdd/SKILL.md` confirmed the new wording.
- `rg -n '裸 \`N/A\`|缺失覆盖率字段|采集命令|覆盖率字段' skills/opsx-tdd/SKILL.md skills/opsx-verify/SKILL.md` confirmed the source wording.
- `node --test tests/*.test.mjs` passed 30/30 tests.
- `node bin/opsx.mjs install-skills` installed 19 OPSX skills to `/Users/cc/.agents/skills`.
- `rg -n '禁止只写裸 \`N/A\`|补救：<下一步命令|覆盖率字段：禁止裸写' /Users/cc/.agents/skills/opsx-tdd/SKILL.md skills/opsx-tdd/SKILL.md` confirmed source and installed tdd skill are in sync.
- `rg -n '覆盖率为裸 \`N/A\`|缺失覆盖率字段|采集命令或产物引用' /Users/cc/.agents/skills/opsx-verify/SKILL.md skills/opsx-verify/SKILL.md` confirmed source and installed verify skill are in sync.

## Risks

Historical archived `test-report.md` files remain unchanged because they are factual records from prior runs. The fix affects future TDD report writing.

## Knowledge

No new long-term pitfall entry was added. This is a direct tightening of the canonical `opsx-tdd` skill contract.
