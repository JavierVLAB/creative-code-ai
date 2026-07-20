## ADDED Requirements

### Requirement: Session startup harness
The project SHALL provide a short startup harness that tells an agent which project documents, change artifacts, and specialist guidance to read before exploring or implementing changes.

#### Scenario: Start a new session
- **WHEN** an agent begins a new task in this repository
- **THEN** it can identify a short ordered reading path for project context, OpenSpec status, and the relevant specialist guidance without rereading the whole repository documentation

### Requirement: Instruction file responsibilities
The project SHALL separate instruction responsibilities across `AGENTS.md`, `CLAUDE.md`, and `.agents/` so that shared project rules, provider-specific execution guidance, and reusable operational documents are not duplicated in one place.

#### Scenario: Find the right instruction source
- **WHEN** an agent needs project-wide rules, provider-specific guidance, or specialist operating guidance
- **THEN** it can determine which document owns each concern without relying on duplicated content across multiple top-level files
