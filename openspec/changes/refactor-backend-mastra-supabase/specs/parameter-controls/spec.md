## MODIFIED Requirements

### Requirement: Snapshots in Supabase
Snapshots SHALL be stored in the `snapshots` table in Supabase, not in `parameters.json` on the local file system.

#### Scenario: Save snapshot
- **WHEN** user saves a snapshot
- **THEN** a row is inserted into `snapshots` with `project_id` and the current values

#### Scenario: Load snapshot
- **WHEN** user loads a snapshot
- **THEN** the values from the `snapshots` table are applied

### Requirement: Config from Supabase
The `config.yaml` SHALL be read from the `projects.config_yaml` column, not from a local file.

#### Scenario: Open project
- **WHEN** a user opens a project
- **THEN** `config_yaml` from the `projects` table is parsed to generate controls
