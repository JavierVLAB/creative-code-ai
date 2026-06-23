## ADDED Requirements

### Requirement: Tool with Zod schema
Every Mastra tool SHALL define its input and output schemas using Zod.

#### Scenario: Edit sketch tool
- **WHEN** defining the `edit-sketch` tool
- **THEN** input schema validates `{ sketchJs, instruction }`, output schema validates `{ modifiedSketchJs }`

### Requirement: Agent with typed output
Every Mastra agent SHALL define its output schema with Zod. The output MUST be a discriminated union or object, not free text.

#### Scenario: Agent response
- **WHEN** defining a Mastra agent
- **THEN** it returns `{ response, appliedConfigYaml?, appliedSketchJs?, memorySuggestion?, pendingQuestion? }`

### Requirement: Workflow for guardrails
Guardrails SHALL be implemented as Mastra workflows, not as logic inside tool implementations.

#### Scenario: Loop cutoff
- **WHEN** implementing guardrails
- **THEN** a workflow wraps the agent call and applies rules (loop detection, failure count)

### Requirement: Thread per project
Mastra threads SHALL use the project UUID as `threadId` and the user UUID as `resourceId`. One thread per project.

#### Scenario: Create thread
- **WHEN** a user starts chatting in a project
- **THEN** the thread is created with `threadId = project.id`, `resourceId = user.id`
