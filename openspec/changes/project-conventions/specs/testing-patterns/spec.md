## ADDED Requirements

### Requirement: Testing framework
The project SHALL use Vitest for unit and integration tests. E2E tests SHALL use Playwright.

#### Scenario: Run tests
- **WHEN** running `pnpm test` in front or backend
- **THEN** Vitest executes

### Requirement: What to test
Unit tests SHALL cover domain logic: config parsing, parameter validation, postMessage protocol. Integration tests SHALL cover Mastra agent endpoint. Component and E2E tests are lower priority.

#### Scenario: Test domain logic
- **WHEN** testing `parseConfig()`
- **THEN** test valid YAML, invalid YAML, missing required fields, extra fields

### Requirement: Test file naming
Test files SHALL use `.test.ts` suffix and be co-located with the source file.

#### Scenario: Test config
- **WHEN** testing `src/lib/config.ts`
- **THEN** test file is `src/lib/config.test.ts`

### Requirement: Test structure
Tests SHALL use describe/it blocks. Descriptions in Spanish, following the pattern: "describe(qué)" / "it(cuándo → qué espera)".

#### Scenario: Test structure
- **WHEN** writing tests for `parseConfig`
- **THEN** `describe('parseConfig')` with `it('devuelve SketchConfig con valores correctos')`, `it('lanza error si el YAML es inválido')`

### Requirement: No mocks for domain logic
Domain logic (config parsing, validation) SHALL be tested without mocks. Pure functions with inputs/outputs.

#### Scenario: Test pure function
- **WHEN** testing `extractDefaultValues(config)`
- **THEN** pass a real config object, check the returned values

### Requirement: Mock external services
Calls to Mastra API and Supabase SHALL be mocked in integration tests using Vitest mocks or MSW.

#### Scenario: Test agent call
- **WHEN** testing a component that calls the Mastra agent
- **THEN** the API call is mocked with `vi.fn()`

### Requirement: Tests as part of each ticket
Tests SHALL be written as part of each implementation task, not deferred to a separate "write tests" phase.

#### Scenario: Implement config parsing
- **WHEN** implementing `parseConfig()`
- **THEN** tests for valid/invalid/edge cases are written in the same PR

### Requirement: Coverage target
No mandatory coverage percentage. The rule is: every exported function that contains logic (not just type coercion) MUST have at least one test.

#### Scenario: New function
- **WHEN** adding a new exported function with logic
- **THEN** at least one test exists for it
