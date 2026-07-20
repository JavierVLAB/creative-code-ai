## ADDED Requirements

### Requirement: Project skill catalog
The project SHALL document a catalog of skills aligned with its real technical domains and workflow.

#### Scenario: Choose a domain skill
- **WHEN** an agent needs guidance for Mastra, Supabase, OpenSpec, or sketch-oriented work
- **THEN** the harness shows which skill is relevant for that domain

### Requirement: Available vs desired skills
The project SHALL distinguish between currently available skills and desired future skills.

#### Scenario: Missing sketch skill
- **WHEN** the project needs a creative-coding or sketch specialist capability that is not yet installed as a formal skill
- **THEN** the harness records that need as a desired skill instead of pretending the capability already exists

### Requirement: Non-generic skill coverage
The skill catalog SHALL go beyond generic OpenSpec workflow skills and include project-specific technical areas.

#### Scenario: Review the catalog
- **WHEN** a collaborator reads the skill catalog
- **THEN** it includes domains such as Mastra and sketch creation rather than only generic process skills
