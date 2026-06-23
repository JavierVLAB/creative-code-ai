## Context

Vamos a escribir código desde cero en este repo. El prototipo de curateartai/ existe como referencia, pero no se migra línea a línea. Es el momento de decidir cómo queremos que sea el código: legible, consistente, fácil de navegar.

Las decisiones aquí no son sobre qué hace el sistema (eso va en otros specs) sino sobre cómo se organiza y escribe.

## Goals / Non-Goals

**Goals:**
- Estructura de directorios predecible para cualquier persona que abra el proyecto
- Convenciones de código que hagan el código legible y auditable por humanos e IAs
- Patrones que eviten errores comunes (estado inconsistente, imports huérfanos, errores silenciosos)

**Non-Goals:**
- No se define qué hace la aplicación (eso es el refactor y otros changes)
- No se define el diseño de UI
- No se imponen herramientas que no estén ya en el stack (Vite, React, Mastra, Supabase, Tailwind)

## Decisions

### 1. Monorepo sin workspaces
`front/` y `backend/` comparten `shared/` para tipos. Cada uno con su `package.json`. Sin workspaces de pnpm para mantenerlo simple.

### 2. TypeScript estricto en toda la base de código
Sin `any`, sin `@ts-ignore`, sin `eslint-disable` sin justificar. `verbatimModuleSyntax` obligatorio. Misma configuración que el prototipo: strict, noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch.

### 3. named exports siempre, default solo para entry point
Igual que el prototipo: `export function Componente()`, no `export default`. La única excepción es `main.tsx` con `import App`.

### 4. Límite de 200-400 líneas por archivo
Si un archivo excede 400 líneas, se extrae responsabilidad. Esta regla es verificable y evita God Components (el `App.tsx` del prototipo tiene 571 líneas — viola esta regla).

### 5. Tailwind CSS 4 en vez de inline styles
El prototipo usa `style={{}}` con tokens CSS. En la nueva versión se usa Tailwind utility classes. Los tokens de diseño (colores, espaciados) se definen con variables CSS en Tailwind. El hover con `onMouseEnter/Leave` inline del prototipo se reemplaza por clases Tailwind (`hover:`).

### 6. Comentarios en español, siempre
Siguiendo el patrón del prototipo: responsabilidad del archivo al inicio, secciones con `//`, JSDoc en funciones públicas. La diferencia: documentar SIEMPRE, no solo en funciones complejas.

## Risks / Trade-offs

- **[Migrar de inline styles a Tailwind]** Es un cambio grande respecto al prototipo. Mitigación: se hace en el refactor, no se migra el prototipo línea a línea — se escribe desde cero con Tailwind.
- **[Límite 400 líneas]** Puede forzar extracciones que parecen prematuras. Mitigación: 400 líneas es generoso. Si un archivo llega a 400, probablemente ya tiene más de una responsabilidad.
