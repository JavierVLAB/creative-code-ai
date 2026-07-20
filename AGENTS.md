# CurateArtAI — AGENTS.md

## Proyecto

CurateArtAI es una app para realizar experimentos de programación creativa.
El producto combina un frontend React, un backend de agentes AI en Mastra y persistencia en Supabase para explorar, editar y curar sketches con ayuda de IA.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Vite + React 19 + TypeScript, Tailwind CSS 4, CodeMirror 6 |
| Backend | Mastra (Node + Hono): agents, tools, workflows, memory |
| Datos | Supabase (Postgres, Auth, Storage, RLS) |
| Sketch | p5.js / three.js en `<iframe>` aislado |

## Arranque de sesión

Antes de explorar o implementar:

1. Lee [`.agents/README.md`](./.agents/README.md).
2. Comprueba el estado de OpenSpec y el change activo.
3. Lee solo las specs y los especialistas relevantes para la tarea.

La ruta corta de arranque y los documentos operativos viven en `.agents/`.

## Workflow OpenSpec

Este proyecto usa OpenSpec de forma obligatoria.

**Regla de oro: sin propose aprobado no se toca código.**

Flujo base:

1. Leer las specs relevantes en `openspec/`.
2. Crear o actualizar el change con `openspec-propose` cuando haga falta formalizar trabajo nuevo.
3. Esperar aprobación explícita antes de implementar.
4. Implementar con `openspec-apply-change` o equivalente.
5. Archivar con `openspec-archive-change` cuando el trabajo esté completo.

"Me gusta la opción X" o "quiero Y" no es autorización para implementar.

## Límites operativos estables

- Toca solo lo necesario. Nada de refactors laterales sin pedirlo.
- No instales dependencias; si falta una, indícalo y espera confirmación.
- No lances servidores, watchers ni procesos largos.
- No hagas commits, pushes, borrados o acciones destructivas sin aprobación explícita.
- Si hay ambigüedad real, para y aclárala antes de seguir.

## Principios de trabajo

- Declara suposiciones importantes.
- Prioriza soluciones simples y auditables.
- Convenciones del proyecto por encima de preferencias personales.
- Los cambios deben ser verificables, no solo plausibles.
- Si aparece un enfoque más simple o menos arriesgado, propónlo.

## Subagentes

Los criterios de delegación y los especialistas concretos viven en [`.agents/playbooks/`](./.agents/playbooks/).

Norma general:

- Delegar por dominio, no por vaguedad.
- Un especialista de frontend no debe encargarse también del backend si el trabajo puede separarse.
- Un especialista de backend/Mastra no debe arrastrar contexto visual o de UI innecesario.
- Diseño de producto no es lo mismo que frontend; si el problema es de interacción o jerarquía visual, trátalo como dominio aparte.
- Dar solo el contexto mínimo que su dominio necesita.
- Exigir salida concreta y verificable.
- No asumir contexto compartido.

## Skills y hooks

- El catálogo de skills del proyecto vive en [`.agents/skills.md`](./.agents/skills.md).
- La propuesta de automation hooks del workflow vive en [`.agents/hooks.md`](./.agents/hooks.md).

## Convenciones del proyecto

Las reglas detalladas viven en `openspec/specs/`:

| Spec | Contenido |
|------|-----------|
| `directory-structure` | Organización de `front/`, `backend/`, `shared/` |
| `typescript-patterns` | Strict mode, DRY, SRP, named exports, interface vs type |
| `react-patterns` | `export function`, Tailwind CSS 4, extracción a hooks, tamaño de archivos |
| `mastra-patterns` | Zod schemas, agente tipado, workflows, thread por proyecto |
| `supabase-patterns` | Cliente tipado, RLS, service role, migraciones SQL |
| `code-documentation` | Comentarios en español, JSDoc, "why not what", sin código comentado |
| `testing-patterns` | Vitest co-locado, tests por ticket, dominio sin mocks |

## Normas de código

- Código legible y auditable por humanos e IAs.
- TypeScript estricto. Sin `any`.
- Una responsabilidad por módulo.
- Funciones de 10-50 líneas cuando sea razonable.
- Nombrado claro antes que comentarios; los comentarios explican el porqué.

## Mentoría en prompting

Cuando el usuario traiga un prompt para ejecutar:

- Revísalo antes si hay riesgo de ambigüedad.
- Señala huecos de contexto, formato o restricciones.
- Si la mejora es pequeña, corrígelo y ejecútalo.
- Si la mejora cambia decisiones importantes, para y consúltalo.
