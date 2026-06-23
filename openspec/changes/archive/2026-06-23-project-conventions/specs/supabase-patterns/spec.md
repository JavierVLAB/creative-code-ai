## ADDED Requirements

### Requirement: typed Supabase client
The frontend SHALL use a typed Supabase client generated from the database schema.

#### Scenario: Query projects
- **WHEN** querying the `projects` table
- **THEN** the result is typed with the generated types

### Requirement: RLS for all tables
Every application table SHALL have RLS enabled. Policies SHALL use `auth.uid()` to isolate by user.

#### Scenario: User access
- **WHEN** a user queries their projects
- **THEN** RLS filters by `user_id = auth.uid()`

### Requirement: Backend access via service role
The Mastra backend SHALL use the Supabase service role key for operations that bypass RLS (e.g., agent memory tables). The frontend SHALL use only the anon key.

#### Scenario: Agent memory
- **WHEN** the backend reads/writes agent memory tables
- **THEN** it uses the service role key

### Requirement: Migrations in SQL files
All schema changes SHALL be SQL files in `supabase/migrations/` with timestamp prefix. No direct DDL from the dashboard.

#### Scenario: Add table
- **WHEN** adding a new table
- **THEN** a migration file `YYYYMMDDHHmmss_add_<table>.sql` is created
