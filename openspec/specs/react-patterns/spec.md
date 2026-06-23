## ADDED Requirements

### Requirement: Components as funciones
All React components SHALL be written as `export function Name()`, never arrow functions. Each component in its own file.

#### Scenario: Button component
- **WHEN** creating a button
- **THEN** `export function Button({ label, onClick }: ButtonProps)` in its own file

### Requirement: Props interface
Props SHALL be defined as `interface ComponentNameProps` just above the component. Callback props prefixed with `on`.

#### Scenario: Props definition
- **WHEN** a component receives props
- **THEN** the interface `CanvasAreaProps { onIframeLoad: () => void }` is defined above the component

### Requirement: File size limit
Component files SHALL NOT exceed 400 lines and SHOULD stay above 200 lines. When a file reaches 400 lines, extract one responsibility.

#### Scenario: Oversized component
- **WHEN** a component file exceeds 400 lines
- **THEN** it SHALL be refactored by extracting a child component or custom hook

### Requirement: Tailwind CSS 4, not inline styles
All styling SHALL use Tailwind utility classes. Inline `style={{}}` is only allowed for dynamic values (e.g., width based on a prop). Hover states use `hover:` classes, not `onMouseEnter/Leave`.

#### Scenario: Styling a button
- **WHEN** styling a button
- **THEN** `className="px-4 py-2 bg-blue-500 hover:bg-blue-600"` is used, not inline styles

### Requirement: Single responsibility per component
Each component SHALL have exactly one responsibility. A component that "renders and fetches and formats" SHALL be split.

#### Scenario: Split concerns
- **WHEN** a component fetches data, formats it, and renders
- **THEN** it SHALL be split into a container (data) and presentational (render)

### Requirement: Custom hooks extract logic
Logic using React hooks SHALL be extracted to `src/hooks/use<Name>.ts`. Hooks return only what's needed, not the full state.

#### Scenario: Fetching projects
- **WHEN** fetching data from Supabase
- **THEN** `function useProjects()`, returns `{ projects, isLoading, error }`
