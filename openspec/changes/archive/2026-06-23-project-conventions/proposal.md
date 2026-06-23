## Why

El proyecto va a tener código de verdad en los próximos changes. Sin convenciones claras, cada change escribirá código con su propio estilo, y en tres meses tendremos un monstruo inconsistente. Definir las reglas ahora, antes de implementar, asegura que el refactor y todo el código futuro sea legible, mantenible y escalable desde el día 1.

## What Changes

- Definir estructura de directorios canónica para `front/`, `backend/`, `shared/`
- Establecer convenciones de TypeScript, naming, imports/exports y manejo de errores
- Definir patrones de componentes React (cuándo un archivo, cuándo una carpeta, estado, props)
- Definir cómo se estructuran agents, tools y workflows en Mastra
- Definir patrón de acceso a datos en Supabase (client, queries, RLS)
- Establecer workflow de git (ramas, commits, PRs)

## Capabilities

### New Capabilities

- `directory-structure`: Organización de carpetas y archivos en front/, backend/, shared/
- `typescript-patterns`: Strict mode, types vs interfaces, naming conventions, imports ordenados, manejo de errores sin `throw` genérico
- `react-patterns`: Componentes (presentacionales vs contenedores), hooks custom, estado global vs local, props naming
- `mastra-patterns`: Estructura de agentes, tools (Zod schemas), workflows, memoria
- `supabase-patterns`: Cliente tipado, queries seguras, RLS policies, migraciones SQL
- `code-documentation`: Reglas de documentación: comentarios, JSDoc, lenguaje, qué documentar y qué no
- `testing-patterns`: Estrategia de tests: Vitest, qué testear, naming, cobertura, cuándo escribir tests

### Modified Capabilities

Ninguna (es la primera vez que se definen convenciones en el proyecto).

## Impact

- Afecta a todo el código futuro del proyecto
- No hay código legacy que migrar (el prototipo de curateartai/ se toma como referencia, no se migra)
- El change de refactor deberá cumplir estas convenciones
