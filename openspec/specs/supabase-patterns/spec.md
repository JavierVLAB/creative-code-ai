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

### Requirement: Storage buckets for user-uploaded files
User-uploaded files (previews, sketch source images) SHALL live in Supabase Storage buckets, not in Postgres columns. Each bucket SHALL scope object paths by `project_id` (`{project_id}/...`) and SHALL restrict write/delete access to the project's owner via an RLS policy on `storage.objects` that joins the path against `public.projects`. Metadata (name, url, mime type, size) for files the app needs to list SHALL be tracked in `public.assets`, which already has its own RLS.

#### Scenario: Upload an image to a project
- **WHEN** the owner of a project uploads an image via a sketch's image control
- **THEN** the file is stored at `sketch-uploads/{project_id}/{asset_id}.<ext>`
- **THEN** a row is inserted in `public.assets` with the resulting URL

#### Scenario: Another user attempts to write to a project's path
- **WHEN** a user who does not own `project_id` attempts to upload or delete an object under `sketch-uploads/{project_id}/...`
- **THEN** the RLS policy on `storage.objects` rejects the operation
