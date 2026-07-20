## ADDED Requirements

### Requirement: Domain specialist subagents
The project SHALL define subagents as domain specialists rather than generic helper tasks.

#### Scenario: Assign frontend ownership
- **WHEN** a task is primarily about UI, routes, components, client state, or frontend architecture
- **THEN** the harness assigns that work to a frontend specialist instead of a generic full-stack subagent

### Requirement: Frontend and backend separation
The project SHALL avoid assigning frontend and backend implementation to the same subagent when the work can be decomposed into specialist responsibilities.

#### Scenario: Split a cross-stack feature
- **WHEN** a task affects both frontend and backend
- **THEN** the harness defines separate specialist ownership or a follow-up integration review instead of one mixed subagent doing both domains at once

### Requirement: Specialist briefing contract
Every documented specialist SHALL define scope, required context, expected output, verification, and explicit boundaries.

#### Scenario: Launch a backend specialist
- **WHEN** an agent delegates a backend or Mastra task
- **THEN** the specialist guidance specifies the briefing fields and the exact shape of the expected response

### Requirement: Token-aware specialization
The project SHALL use specialization and scope boundaries to reduce unnecessary context and token usage in delegated work.

#### Scenario: Reduce token waste
- **WHEN** a delegated task only requires one domain
- **THEN** the harness avoids loading unrelated frontend, backend, or product context into that specialist request
