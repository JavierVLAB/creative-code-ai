## REMOVED Requirements

### Requirement: Direct LLM calls from browser
**Reason**: Replaced by Mastra backend agent. LLM calls now happen server-side, not from the browser.
**Migration**: The chat UI remains. The internal flow changes from `fetch(LLM)` to `mastraClient.agent.generate()`.

## ADDED Requirements

### Requirement: Chat via Mastra client
The chat SHALL send messages to the Mastra backend using `@mastra/client-js` instead of calling LLMs directly.

#### Scenario: Send message
- **WHEN** user sends a message in chat
- **THEN** the frontend calls `/api/agents/{agentId}/generate` with the message, threadId, and resourceId

#### Scenario: Apply agent response
- **WHEN** the agent returns `appliedConfigYaml` or `appliedSketchJs`
- **THEN** the frontend updates the project state and triggers sketch reload

### Requirement: No LLM provider config in frontend
The frontend SHALL NOT have LLM provider configuration. Model routing is handled by Mastra in the backend.

#### Scenario: Remove aiSettings
- **WHEN** the frontend loads
- **THEN** there is no UI for configuring LLM providers
