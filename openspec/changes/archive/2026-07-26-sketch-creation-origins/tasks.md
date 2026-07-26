## 1. Boilerplate en blanco

- [x] 1.1 Crear `front/src/lib/blankSketch.ts` con `BLANK_SKETCH_JS` y `BLANK_CONFIG_YAML` (ver `design.md`)
- [x] 1.2 Test: el boilerplate cumple `sketch-contract` (contiene `params`, `addEventListener`, emite `SKETCH_READY`, `config.yaml` parseable con canvas válido)

## 2. `useProjects.createProject` con origen

- [x] 2.1 Definir tipo `ProjectOrigin` (`blank` | `template`) en `front/src/lib/types.ts`
- [x] 2.2 Extender `createProject(name, origin)` en `front/src/hooks/useProjects.ts`: origen blanco inserta el boilerplate; origen plantilla copia `sketch_js`/`config_yaml` de la plantilla (vía helper puro `resolveOriginContent`, exportado y testeado — el hook no se testea directamente porque el proyecto no usa `@testing-library/react`)
- [x] 2.3 Test: `createProject` con origen blanco inserta el boilerplate correcto
- [x] 2.4 Test: `createProject` con origen plantilla copia el contenido de la plantilla elegida

## 3. `CreateProjectDialog` — selector de origen

- [x] 3.1 Modal único (sin pasos): input de nombre arriba, selector de origen (radio/chips: blanco / IA / plantilla) debajo, con estilo consistente con el resto de diálogos del proyecto (tokens `--bg1`, `--line`, `--radius-lg`)
- [x] 3.2 Origen "blanco": no añade ninguna sección extra
- [x] 3.3 Origen "IA": aparece inline un textarea de descripción del sketch
- [x] 3.4 Origen "plantilla": aparece inline una lista simple (título, sin miniaturas) de plantillas publicadas (reutiliza `usePublishedTemplates`)
- [x] 3.5 Botón "Crear" único al fondo, deshabilitado si falta nombre o si el origen es plantilla sin selección
- [x] 3.6 `onConfirm(name, origin, initialPrompt?)` — actualizar props y tests existentes del diálogo

## 4. Flujo de navegación y primer mensaje automático

- [x] 4.1 `ProjectsPage.tsx`: `handleCreate` pasa `origin` a `createProject` y navega con `state: { initialPrompt }` cuando aplica
- [x] 4.2 `WorkspacePage.tsx`: al montar, si `location.state?.initialPrompt` existe y el proyecto ya cargó, invoca `handleChatSend(initialPrompt)` una sola vez y limpia el state de navegación (`navigate(location.pathname, { replace: true })`)
- [x] 4.3 Test: **no automatizado** — `WorkspacePage.tsx` no tiene tests hoy (página integrada con múltiples hooks/efectos, sin infraestructura de render tipo `@testing-library/react` en el proyecto). Se verifica manualmente en la tarea 7.3 (crear proyecto con origen "IA" en el navegador y confirmar que el primer mensaje se envía solo).

## 5. Plantillas nuevas (contenido)

- [x] 5.1 Diseñar y escribir 4 sketches nuevos siguiendo `sketch-contract`, todos en `p5js` (three.js queda fuera: `buildSrcdoc` solo inyecta la librería p5.js hoy — ver `design.md`): "Ondas de Perlin", "Mandala geométrico", "Lluvia de cuadrados", "Campo de vectores"
- [x] 5.2 Migración de contenido `supabase/migrations/20260726000000_add_more_templates.sql` con INSERTs `on conflict (slug) do update`, `is_published = true`
- [x] 5.3 Migración aplicada por Javi en el SQL Editor de Supabase (7 plantillas confirmadas en `templates`). **Nota importante**: Javi no aprobó el contenido creativo de estas 4 plantillas — se escribieron sin pasar por su revisión directa, solo por el proposal aprobado a alto nivel. Quedan en la tabla como contenido funcional (cumplen `sketch-contract`, se ven en el playground), pero se rediseñarán en un change aparte con su input directo antes de considerarlas definitivas.

## 6. Specs

- [x] 6.1 Actualizar `openspec/specs/project-library/spec.md` con el requirement de selección de origen
- [x] 6.2 Actualizar `openspec/specs/template-library/spec.md` con el requirement de reutilización en creación de proyectos autenticados

## 7. Verificación final

- [x] 7.1 `pnpm test` en verde: front 47/47, backend 16/16
- [x] 7.2 `tsc -b && vite build` en `front` limpio (solo warning preexistente de bundle >500kB); `tsc` en `backend` limpio
- [x] 7.3 Probado manualmente por Javi en el navegador: los 3 orígenes funcionan (blanco, IA, plantilla). En el camino se encontró y arregló un bug preexistente de `frontend-agent`: el agente no tenía `Memory` configurada pese a que el workflow siempre pasaba `threadId`/`resourceId` — ver commit del fix en `backend/src/mastra/agents/sketch-agent.ts` y `backend/src/mastra/index.ts` (se añadió `@mastra/memory` como dependencia nueva, autorizada por Javi).
