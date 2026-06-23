## ADDED Requirements

### Requirement: Application tables
The system SHALL have the following tables in Supabase: `profiles`, `projects`, `snapshots`, `assets` as defined in readme.md §3.2.

#### Scenario: Create project
- **WHEN** a user creates a new project
- **THEN** a row in `projects` is inserted with `user_id = auth.uid()`

#### Scenario: Cascade delete
- **WHEN** a user deletes a project
- **THEN** all related snapshots and assets are deleted (cascade)

### Requirement: RLS policies
Every table SHALL have Row Level Security enabled. A user SHALL only see rows where `user_id = auth.uid()`.

#### Scenario: Isolated access
- **WHEN** user A queries projects
- **THEN** only user A's projects are returned, even if user B has projects with the same IDs

### Requirement: Migrations versioned
All schema changes SHALL be SQL migration files versioned and reproducible from scratch.

#### Scenario: Fresh setup
- **WHEN** the project is deployed to a new Supabase instance
- **THEN** running all migrations creates the exact schema
