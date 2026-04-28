# Goal

Slim gate, reviewer, implementation, and reporting OPSX skills by extracting repeated prompt templates, StageResult details, audit/report templates, and long rule tables into references or canonical contracts.

# In Scope

- Migrate gate and reviewer-heavy skills:
  - `skills/opsx-plan-review/SKILL.md`
  - `skills/opsx-task-analyze/SKILL.md`
  - `skills/opsx-verify/SKILL.md`
  - `skills/opsx-review/SKILL.md`
- Migrate implementation and execution support skills where they carry long embedded contracts:
  - `skills/opsx-tasks/SKILL.md`
  - `skills/opsx-tdd/SKILL.md`
  - `skills/opsx-implement/SKILL.md`
  - `skills/opsx-archive/SKILL.md`
  - `skills/opsx-report/SKILL.md`
- Move full reviewer prompts, StageResult examples, audit-log snippets, report templates, and TDD report formats into `references/` or existing canonical docs.
- Replace repeated cross-platform subagent wording with references to `skills/opsx-subagent/SKILL.md`.
- Replace repeated StageResult / audit-log schema text with references to `docs/stage-packet-protocol.md`.
- Keep stage-specific hard gates, read/write boundaries, decision rules, and exit contracts visible in each `SKILL.md`.
- Add or update validation checks that prevent reintroducing full StageResult schemas or platform mapping copies into individual workflow skills.

# Out of Scope

- Changing gate pass/fail semantics.
- Changing `.openspec.yaml` schema or gate field names.
- Changing StageResult schema.
- Enabling or implementing parallel worker dispatch beyond the separate parallel-worker policy change.
- Reworking review vs verify responsibility boundaries.

# Depends On

- `01-slimming-structure`
- `docs/stage-packet-protocol.md`
- `skills/opsx-subagent/SKILL.md`
- Active related change for implementation worker wording:
  - `2026-04-28-subagent-workflow-adapter/03-parallel-worker-policy`

# Done Means

- Gate and reviewer skill entry files remain operational but no longer embed full prompt/schema/template bodies.
- Stage-specific review dimensions and hard gates remain easy to see in `SKILL.md`.
- Shared contracts are consumed by reference rather than duplicated.
- Validation catches duplicated StageResult schema text, duplicated platform mapping text, and oversized gate skill entries.
- Existing OPSX gate order remains unchanged: plan-review -> tasks -> task-analyze -> implement -> verify -> review -> archive.
