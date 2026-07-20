## ADDED Requirements

### Requirement: Hooks refer to workflow automation
Within this harness, hooks SHALL refer to workflow or tooling automation hooks.

#### Scenario: Discuss hooks in the harness
- **WHEN** a collaborator asks to define or review hooks for this project
- **THEN** the harness interprets the request as workflow automation unless the collaborator explicitly says otherwise

### Requirement: Hook catalog
The project SHALL document a catalog of candidate workflow hooks aligned with OpenSpec discipline and operational safety.

#### Scenario: Review hook options
- **WHEN** a collaborator wants to decide which hooks to adopt
- **THEN** the harness provides concrete candidate hooks with their intent and the rule each one would enforce

### Requirement: OpenSpec-aware hooks
Candidate hooks SHALL include automation ideas that reinforce the project's OpenSpec workflow.

#### Scenario: Guard edits outside approved change
- **WHEN** a collaborator reviews the proposed hooks
- **THEN** the catalog includes at least one hook idea that prevents or warns about editing code outside an approved OpenSpec change

### Requirement: Local warning hooks
The project SHALL implement local warning hooks in `.claude/settings.local.json` for editing without an active OpenSpec change and for editing outside the inferred scope of the current change.

#### Scenario: Edit without active change
- **WHEN** the agent attempts a code-editing tool call and `openspec list --json` returns no non-archived changes
- **THEN** the local hook warns that the edit appears to happen outside an active OpenSpec change

#### Scenario: Edit outside inferred scope
- **WHEN** the agent attempts a code-editing tool call and the target path is outside the inferred scope of the current change
- **THEN** the local hook warns that the edit may be outside the change scope without blocking the tool call
