# Goal

Define the repository-level slimming structure for OPSX `SKILL.md` files so each skill entry stays short, executable, and backed by progressive-disclosure references.

# In Scope

- Define the target shape of an OPSX `SKILL.md`:
  - trigger and responsibility boundary
  - read/write boundary and safety red lines
  - required hard gates
  - quick path / command entry points
  - reference navigation
  - downstream or exit contract
- Define what must move out of `SKILL.md` into `references/`:
  - long workflows
  - full prompt templates
  - output/report templates
  - detailed examples
  - large parameter tables
  - repeated public contracts already owned by another canonical source
- Establish a practical inventory and validation approach for current OPSX skills:
  - baseline line counts for `skills/*/SKILL.md`
  - identification of oversized or duplicated sections
  - checks or scripts that make future drift visible
- Align the local rule with `/Users/cc/mySkills/skills/agent-standards/references/skill-design.md`.
- Keep existing skill names and workflow stage boundaries unchanged.

# Out of Scope

- Migrating the long skills themselves; that happens in later subchanges.
- Changing OPSX workflow semantics, gates, schemas, or archive behavior.
- Deleting skills or merging workflow stages.
- Installing skills globally or syncing adapters.

# Depends On

- External design rule: `/Users/cc/mySkills/skills/agent-standards/references/skill-design.md`
- Existing project map: `.aiknowledge/codemap/openspec-skills.md`
- Existing canonical contracts:
  - `skills/opsx-subagent/SKILL.md`
  - `docs/stage-packet-protocol.md`
  - `.aiknowledge/README.md`

# Capabilities

## New Capabilities

- `skill-slimming-policy`
- `skill-slimming-validation`

## Modified Capabilities

- None.

# Done Means

- The slimming policy is captured in a stable repository artifact or validation task.
- The policy says exactly what remains in `SKILL.md` and what belongs in `references/`.
- Current OPSX skills have a visible inventory showing which files should be migrated first.
- Future changes have a concrete way to detect oversized `SKILL.md` files or duplicated canonical contracts.
- No workflow behavior changes are made in this subchange.
