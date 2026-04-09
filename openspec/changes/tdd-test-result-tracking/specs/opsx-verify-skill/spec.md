## 修改需求

### Requirement: Completeness Verification

The agent SHALL verify that all required work has been completed.

#### Scenario: Task completion check
- **WHEN** verifying completeness
- **THEN** the agent reads tasks.md
- **AND** counts tasks marked `- [x]` (complete) vs `- [ ]` (incomplete)
- **AND** reports completion status with specific incomplete tasks listed

#### Scenario: Spec coverage check
- **WHEN** verifying completeness
- **AND** delta specs exist in `openspec/changes/<name>/specs/`
- **THEN** the agent extracts all requirements from delta specs
- **AND** searches codebase for implementation of each requirement
- **AND** reports which requirements appear to have implementation vs which are missing

#### Scenario: All tasks complete
- **WHEN** all tasks are marked complete
- **THEN** report "Tasks: N/N complete"
- **AND** mark completeness dimension as passed

#### Scenario: Incomplete tasks found
- **WHEN** some tasks are incomplete
- **THEN** report "Tasks: X/N complete"
- **AND** list each incomplete task
- **AND** mark as CRITICAL issue
- **AND** suggest: "Complete remaining tasks or mark as done if already implemented"

#### Scenario: Test report completeness check
- **WHEN** verifying completeness
- **AND** tasks.md contains at least one task tagged `[test-first]` or `[characterization-first]`
- **THEN** the agent checks whether `test-report.md` exists in the change directory
- **AND** verifies each `[test-first]` / `[characterization-first]` task has a corresponding section in `test-report.md`
- **AND** verifies each task section contains both a 🔴 red-phase entry and a 🟢 green-phase entry
- **AND** any missing entry is reported as CRITICAL issue blocking archive

#### Scenario: No TDD tasks present
- **WHEN** verifying completeness
- **AND** tasks.md contains no tasks tagged `[test-first]` or `[characterization-first]`
- **THEN** skip test report check
- **AND** note "No TDD tasks — test-report.md check skipped"

#### Scenario: test-report.md missing when TDD tasks exist
- **WHEN** verifying completeness
- **AND** at least one `[test-first]` or `[characterization-first]` task exists
- **AND** `test-report.md` does not exist
- **THEN** report as CRITICAL issue: "test-report.md missing — TDD results not documented"
- **AND** block archive

## 新增需求

### Requirement: Archive Blocked When Test Report Incomplete

The agent SHALL block archive when TDD tasks exist but test-report.md is incomplete or missing.

#### Scenario: Archive blocked — missing test-report.md
- **WHEN** verification completes
- **AND** at least one `[test-first]` or `[characterization-first]` task exists
- **AND** `test-report.md` is missing or lacks red-phase / green-phase entries for any TDD task
- **THEN** the agent marks the overall verification result as FAILED
- **AND** does NOT suggest running archive
- **AND** displays: "test-report.md incomplete — archive blocked. Complete TDD result documentation first."

#### Scenario: Archive allowed — test-report.md complete
- **WHEN** verification completes
- **AND** all `[test-first]` / `[characterization-first]` tasks have both 🔴 and 🟢 entries in test-report.md
- **THEN** the test report check passes
- **AND** does not block archive on this dimension
