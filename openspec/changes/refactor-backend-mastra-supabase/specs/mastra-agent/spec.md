## ADDED Requirements

### Requirement: Agent with structured output
The Mastra agent SHALL receive a user instruction in natural language and return a structured response with the modified sketch files.

#### Scenario: Successful edit
- **WHEN** user sends "cambia el color de fondo a azul"
- **THEN** the agent returns `{ response, appliedSketchJs }` with the modified sketch.js

#### Scenario: Ambiguous request
- **WHEN** user sends a vague instruction
- **THEN** the agent returns `{ pendingQuestion }` asking for clarification

### Requirement: Agent tools
The agent SHALL have three tools: `edit-params` (modify config.yaml), `edit-sketch` (modify sketch.js), `update-memory` (update project memory notes).

#### Scenario: Edit sketch via tool
- **WHEN** the agent decides to modify sketch.js
- **THEN** the `edit-sketch` tool is called and returns valid JavaScript

#### Scenario: Edit params via tool
- **WHEN** the agent decides to modify config.yaml
- **THEN** the `edit-params` tool is called and returns valid YAML

### Requirement: Guardrails workflow
A workflow SHALL enforce three guardrails: cut loops after repeated same-skill calls, force renderer run after param changes affecting code, and stop on repeated failures.

#### Scenario: Loop cutoff
- **WHEN** the same skill is invoked 3+ times consecutively
- **THEN** the workflow forces `done` and returns a message to the user

### Requirement: Memory in Postgres
The agent SHALL persist conversation history per project using `@mastra/pg` with threads keyed by project ID and resources keyed by user ID.

#### Scenario: Resume conversation
- **WHEN** a user reopens a project
- **THEN** the chat history is restored from Postgres
