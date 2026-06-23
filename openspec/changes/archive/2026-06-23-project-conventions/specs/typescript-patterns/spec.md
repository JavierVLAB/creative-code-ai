## ADDED Requirements

### Requirement: Strict mode
TypeScript SHALL run in strict mode with `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `noFallthroughCasesInSwitch` enabled.

#### Scenario: Unused variable
- **WHEN** a variable is declared but not used
- **THEN** the build fails

### Requirement: Named exports
All modules SHALL use named exports. `export default` is only allowed for the app entry point (`main.tsx`).

#### Scenario: Export component
- **WHEN** creating a new component
- **THEN** `export function CanvasArea()` not `export default`

### Requirement: No `any`
The `any` type SHALL NOT be used. Use `unknown` with type narrowing, or define a proper type.

#### Scenario: Unknown API response
- **WHEN** handling a response of unknown shape
- **THEN** the type is `unknown` with Zod validation

### Requirement: Interface vs type
`interface` SHALL be used for objects (props, entities). `type` SHALL be used for unions, intersections, and primitive aliases.

#### Scenario: Define entity
- **WHEN** defining a project entity
- **THEN** `interface Project { id: string; name: string }`

#### Scenario: Define union
- **WHEN** defining a parameter type
- **THEN** `type ParamType = 'range' | 'select'`

### Requirement: Single responsibility per function
Every function SHALL do exactly one thing. If a function does multiple things, extract.

#### Scenario: Parse and validate
- **WHEN** a function parses config and validates it
- **THEN** `parseConfig()` parses, `validateConfig()` validates

### Requirement: No duplicated logic (DRY)
If the same logic appears twice, extract to a shared function. If it appears in frontend and backend, put it in `shared/`.

#### Scenario: Shared validation
- **WHEN** both frontend and backend validate config YAML
- **THEN** the validation function lives in `shared/config-validation.ts`

### Requirement: Functions between 10-50 lines
Functions SHALL NOT exceed 50 lines. If a function is longer, it has too many responsibilities.

#### Scenario: Long function
- **WHEN** a function exceeds 50 lines
- **THEN** it SHALL be refactored into smaller functions

### Requirement: Document always
Every file SHALL start with a comment explaining its responsibility. Every public function SHALL have a JSDoc comment. Use Spanish for all documentation.

#### Scenario: New file
- **WHEN** creating `src/lib/config.ts`
- **THEN** the file starts with `// Parsing y validación del config de un sketch (YAML o JSON como fallback).`

#### Scenario: Public function
- **WHEN** writing a function used by other modules
- **THEN** it has JSDoc: `/** Parsea un string YAML y devuelve un SketchConfig validado */`

### Requirement: Imports ordenados
Imports SHALL be grouped: (1) módulos externos, (2) módulos internos del proyecto, (3) types. Each group separated by blank line.

#### Scenario: Import ordering
- **WHEN** importing dependencies
- **THEN** external imports first, then internal, then `import type`
