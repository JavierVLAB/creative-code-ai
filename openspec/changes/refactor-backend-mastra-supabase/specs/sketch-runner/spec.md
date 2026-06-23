## MODIFIED Requirements

### Requirement: Load sketch from Supabase
The runner SHALL receive sketch content from Supabase (not from local file system). The `config` and `sketchJs` come from the `projects` table.

#### Scenario: Load stored project
- **WHEN** a user opens a project from their library
- **THEN** the iframe loads with `sketch_js` and `config_yaml` from the `projects` table

### Requirement: Protocol unchanged
The postMessage protocol (SKETCH_INIT, SKETCH_UPDATE, SKETCH_RESTART) remains identical to the existing implementation.

#### Scenario: Update parameter
- **WHEN** user moves a slider
- **THEN** SKETCH_UPDATE is sent with the new values (unchanged flow)

### Requirement: No file system dependency
The runner SHALL NOT depend on blob URLs created from local file handles. Sketch content is passed as strings from Supabase data.

#### Scenario: Create blob URL
- **WHEN** a sketch loads
- **THEN** the HTML is built from `sketch_js` string and `p5.min.js` local asset, served as a blob URL
