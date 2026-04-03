# cli-feedback Specification

## Purpose
Define `openspec feedback` behavior for recording local feedback files inside the current workspace.

## Requirements
### Requirement: Feedback command

The system SHALL provide an `openspec feedback` command that writes a local Markdown feedback file for the current workspace.

#### Scenario: Simple feedback submission

- **WHEN** user executes `openspec feedback "Great tool!"`
- **THEN** the system writes a local Markdown file
- **AND** the file title is `反馈: Great tool!`
- **AND** the command prints the generated file path

#### Scenario: Feedback with body

- **WHEN** user executes `openspec feedback "Title here" --body "Detailed description..."`
- **THEN** the generated Markdown file contains the specified body
- **AND** the file includes metadata for version, platform, and timestamp

### Requirement: Local feedback storage

The system SHALL store feedback in the current workspace without requiring any network service.

#### Scenario: Project already initialized

- **WHEN** the current directory contains an `openspec/` directory
- **THEN** feedback files are written under `openspec/feedback/`

#### Scenario: Project not initialized

- **WHEN** the current directory does not contain an `openspec/` directory
- **THEN** feedback files are written under `.openspec/feedback/`

### Requirement: Metadata safety

The system SHALL include useful runtime metadata without capturing unrelated local secrets.

#### Scenario: Metadata in feedback file

- **WHEN** a feedback file is generated
- **THEN** the file includes:
  - OpenSpec version
  - platform
  - ISO timestamp

#### Scenario: No sensitive metadata

- **WHEN** a feedback file is generated
- **THEN** the file does NOT automatically include:
  - environment variables
  - IP addresses
  - unrelated filesystem paths

### Requirement: Feedback always works

The system SHALL allow feedback recording regardless of telemetry or network state.

#### Scenario: Feedback with telemetry disabled

- **WHEN** user has disabled telemetry via `OPENSPEC_TELEMETRY=0`
- **AND** user runs `openspec feedback "message"`
- **THEN** the feedback file is still created successfully

#### Scenario: Feedback in CI environment

- **WHEN** `CI=true` is set in the environment
- **AND** user runs `openspec feedback "message"`
- **THEN** the feedback file is still created successfully

### Requirement: Feedback skill for agents

The system SHALL provide a `/feedback` skill that guides agents through collecting and recording user feedback.

#### Scenario: Agent-initiated feedback

- **WHEN** user invokes `/feedback` in an agent conversation
- **THEN** the agent gathers context from the conversation
- **AND** drafts a local feedback entry with enriched content
- **AND** presents the draft to the user for approval
- **AND** records it via `openspec feedback` after user confirmation

### Requirement: Shell completions

The system SHALL provide shell completions for the feedback command.

#### Scenario: Command completion

- **WHEN** user types `openspec fee<TAB>`
- **THEN** the shell completes to `openspec feedback`

#### Scenario: Flag completion

- **WHEN** user types `openspec feedback "msg" --<TAB>`
- **THEN** the shell suggests available flags (`--body`)
