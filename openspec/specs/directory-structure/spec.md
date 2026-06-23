## ADDED Requirements

### Requirement: Root structure
The project SHALL have three top-level directories: `front/`, `backend/`, `shared/`.

#### Scenario: Repository layout
- **WHEN** a developer clones the repo
- **THEN** they see `front/`, `backend/`, `shared/` at the root

### Requirement: Frontend structure
`front/` SHALL follow: `src/lib/` (domain logic), `src/components/` (React components), `src/hooks/` (custom hooks), `src/constants/`, `public/` (static assets).

#### Scenario: New feature component
- **WHEN** adding a new component
- **THEN** it goes in `src/components/<area>/` where `<area>` groups related components

### Requirement: Backend structure
`backend/` SHALL follow Mastra conventions: `src/mastra/agents/`, `src/mastra/tools/`, `src/mastra/workflows/`, plus `src/` for app setup.

#### Scenario: New tool
- **WHEN** adding a new Mastra tool
- **THEN** it goes in `src/mastra/tools/<tool-name>.ts` with a Zod schema

### Requirement: Shared types
`shared/` SHALL contain TypeScript types used by both frontend and backend. No logic, no React, no framework imports.

#### Scenario: Add shared type
- **WHEN** a type is needed in both front and back
- **THEN** it goes in `shared/types.ts` or `shared/<domain>/types.ts`
