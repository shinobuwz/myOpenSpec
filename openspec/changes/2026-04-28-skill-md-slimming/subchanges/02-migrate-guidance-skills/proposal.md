# Goal

Slim the guidance-heavy OPSX skills by moving examples, long procedures, templates, and lifecycle detail from `SKILL.md` into per-skill `references/`, while preserving each skill's operational behavior.

# In Scope

- Migrate the highest-volume non-gate guidance skills first:
  - `skills/opsx-explore/SKILL.md`
  - `skills/opsx-knowledge/SKILL.md`
  - `skills/opsx-codemap/SKILL.md`
- Migrate secondary guidance skills as capacity allows, without changing stage boundaries:
  - `skills/opsx-lite/SKILL.md`
  - `skills/opsx-slice/SKILL.md`
  - `skills/opsx-auto-drive/SKILL.md`
  - `skills/opsx-bugfix/SKILL.md`
- Create `references/` files under each affected skill for:
  - detailed workflows
  - example conversations or reports
  - document templates
  - lifecycle and directory-format details
  - long guardrail explanations
- Keep hard boundaries directly visible in `SKILL.md`:
  - `opsx-explore` remains read-only for product code.
  - source-code exploration remains codemap-first.
  - `opsx-knowledge` and `opsx-codemap` continue to reference `.aiknowledge/README.md` before writing knowledge.
  - `opsx-lite` continues to reject non-lite changes and requires fresh verification evidence.
- Preserve Chinese skill prose and existing frontmatter names/descriptions.

# Out of Scope

- Gate-stage skills and reviewer prompts; those are handled by `03-migrate-gate-skills`.
- Changing `.aiknowledge` lifecycle semantics.
- Changing `opsx-slice` delivery-boundary rules.
- Adding new workflow stages.
- Installing or publishing the migrated skills.

# Depends On

- `01-slimming-structure`
- Existing knowledge lifecycle contract: `.aiknowledge/README.md`
- Existing `openspec-skills` codemap entry.

# Done Means

- Affected guidance skills have short, executable `SKILL.md` files with clear reference navigation.
- Long examples, templates, and detailed lifecycle procedures live in `references/`.
- Hard safety rules remain visible in the entry files and are not buried only in references.
- `rg` checks confirm old canonical-contract duplication was removed or replaced by references.
- Line counts for the migrated `SKILL.md` files are materially reduced without deleting behavior.
