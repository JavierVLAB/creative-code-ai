## ADDED Requirements

### Requirement: File-level comment
Every source file SHALL start with a comment explaining its responsibility in 1-3 lines. Written in Spanish.

#### Scenario: New utility file
- **WHEN** creating `src/lib/config.ts`
- **THEN** it starts with `// Parsing y validación del config de un sketch (YAML o JSON como fallback).`

### Requirement: Public functions with JSDoc
Every function exported from a module SHALL have a JSDoc comment describing what it does, not how. Parameters and return value documented when not obvious.

#### Scenario: Exported function
- **WHEN** writing `parseConfig(yaml: string): SketchConfig`
- **THEN** it has `/** Parsea un string YAML y devuelve un SketchConfig validado. @param yaml - Raw YAML string @returns SketchConfig validado o lanza ValidationError */`

### Requirement: Internal functions can skip JSDoc
Functions not exported (module-private) MAY skip JSDoc if their purpose is obvious from the name. If the logic is complex, add a brief comment.

#### Scenario: Helper function
- **WHEN** writing `function mergeDefaults(config)`
- **THEN** a brief `// Combina valores actuales con defaults para parámetros nuevos` is sufficient

### Requirement: Comment the "why", not the "what"
Comments SHALL explain why something is done a certain way, not what the code does. Code should be self-documenting for the "what".

#### Scenario: Workaround comment
- **WHEN** writing a workaround for a browser quirk
- **THEN** `// Chrome no soporta structuredClone en workers, usamos JSON.parse/stringify como fallback`

#### Scenario: Obvious code
- **WHEN** writing `const total = price * quantity`
- **THEN** NO comment like `// Calcula el total` — the code is clear

### Requirement: Section comments in long files
Files over 150 lines SHALL use section comments with `// ---` separators to group related code.

#### Scenario: Grouping functions
- **WHEN** a file has multiple related groups
- **THEN** `// --- Snapshot management ---` before snapshot functions

### Requirement: No commented-out code
Commented-out code SHALL NOT be committed. If code is not needed, delete it. Git history preserves it.

#### Scenario: Removing feature
- **WHEN** removing an old feature
- **THEN** delete the code entirely, don't comment it out

### Requirement: Language
All documentation and comments SHALL be in Spanish. Code identifiers (variables, functions, types) in English.

#### Scenario: Bilingual clarity
- **WHEN** writing a comment
- **THEN** `// Extrae los valores por defecto de todos los parámetros` not `// Extracts default values`
- **WHEN** naming a variable
- **THEN** `const defaultValues` not `const valoresPorDefecto`
