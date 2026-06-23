# CurateArtAI — CLAUDE.md

## Proyecto

Plataforma web que separa exploración y código para arte generativo (p5.js / three.js).
Artistas exploran, editan y curan sketches en lenguaje natural asistidos por un agente de IA.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Vite + React 19 + TypeScript, Tailwind CSS 4, CodeMirror 6 |
| Backend | Mastra (Node + Hono): Agents, Tools, Workflows, Memory |
| Datos | Supabase (Postgres, Auth, Storage, RLS) |
| Sketch | p5.js / three.js en `<iframe>` aislado |

## Workflow OpenSpec

Este proyecto usa OpenSpec obligatoriamente. Skills instaladas en `.opencode/skills/` y `openspec/`.

**Regla de oro: sin propose aprobado no se toca código.**

Flujo obligatorio antes de cualquier cambio importante:

1. **Leer specs** de `openspec/` al empezar cualquier tarea
2. **Propose** — usar el skill `openspec-propose` o `/opsx:new` para crear un change con artefactos
3. **Esperar aprobación explícita** antes de implementar
4. **Apply** — implementar usando el skill `openspec-apply-change`
5. **Archive** — al terminar, condensar memoria con `openspec-archive-change`

"Me gusta la opción X" o "quiero Y" no es autorización para implementar.

---

## Pautas de comportamiento

### 1. Piensa antes de codificar

- Declara suposiciones explícitamente. Si no estás seguro, pregunta.
- Si existen múltiples interpretaciones, preséntalas, no elijas en silencio.
- Si existe un enfoque más simple, dilo. Cuestiona cuando esté justificado.
- Si algo no está claro, para. Nombra lo que confunde. Pregunta.

### 2. Simplicidad primero

- El código mínimo que resuelve el problema. Nada especulativo.
- No incluyas funcionalidades más allá de lo solicitado.
- No crees abstracciones para código de uso único.
- No añadas "flexibilidad" o "configurabilidad" que no se haya solicitado.
- Si escribes 200 líneas y podrían ser 50, reescríbelo.
- Pregúntate: "¿un ingeniero senior diría que esto está sobrecomplicado?"

### 3. Cambios quirúrgicos

- Toca solo lo que debas. Limpia solo tu propio desorden.
- Al editar: no "mejores" código adyacente, comentarios o formato.
- No refactorices cosas que no están rotas.
- Adapta el estilo existente, incluso si lo harías de otra manera.
- Elimina imports/variables/funciones que TUS cambios hayan dejado sin usar.

### 4. Ejecución orientada a objetivos

- Transforma tareas en objetivos verificables.
- "Añadir validación" → "escribir pruebas para entradas inválidas, luego hacer que pasen"
- Para tareas de varios pasos, indica un plan breve con verificación por paso.

---

## Arnes para subagentes

Cuando delegues trabajo a subagentes (task tool), sé explícito:

- **Tipo de subagente**: elige el más ligero que baste (explore para búsquedas, general para implementación).
- **Instrucciones**: incluye stack, convenciones del archivo a editar, y el contexto mínimo necesario.
- **Verificación**: especifica qué comprobar al terminar (lint, typecheck, test).
- **Salida esperada**: di exactamente qué debe devolver el subagente al terminar.
- **No asumas conocimiento compartido**: el subagente no tiene contexto de la conversación actual; dáselo explícitamente.

---

## Mentoría en prompting

Javi está aprendiendo prompt engineering mientras construye el proyecto. Actúa como mentor:

- **Antes de ejecutar** cualquier prompt que me déexit, revísalo críticamente.
- **Diagnostica**: ¿está claro? ¿tiene ambigüedad? ¿le falta contexto, formato de salida, restricciones, ejemplos?
- **Sugiere mejoras** concretas y explica por qué (la razón, no solo "mejor así").
- **Dos versiones**: si tiene sentido, muestra su prompt original y una versión mejorada con lo que cambió y por qué.
- **No retardes**: si el prompt es urgente y está bien, dilo y ejecuta. Si necesita mejora pero es rápido, mejora y ejecuta. Si necesita discusión, para y pregunta.

El objetivo es que Javi escriba mejores prompts con el tiempo, no que yo los reescriba siempre.

## Convenciones del proyecto

Las reglas detalladas están en `openspec/changes/project-conventions/specs/`:

| Spec | Contenido |
|------|-----------|
| `directory-structure` | Organización de front/, backend/, shared/ |
| `typescript-patterns` | Strict mode, DRY, SRP, named exports, interface vs type |
| `react-patterns` | `export function`, Tailwind CSS 4, 200-400 líneas/archivo, hooks |
| `mastra-patterns` | Zod schemas, agente tipado, workflows, thread por proyecto |
| `supabase-patterns` | Cliente tipado, RLS, service role, migraciones SQL |
| `code-documentation` | Comentarios en español, JSDoc, "why not what", sin código comentado |
| `testing-patterns` | Vitest co-locado, tests por ticket, dominio sin mocks |

## Normas de código

- Prioridad: código legible y auditable por humanos e IAs.
- Convenciones del archivo existente > preferencias personales.
- Nombrado claro > comentarios. Los comentarios explican el "por qué", no el "qué".
- Una responsabilidad por módulo. Archivos cortos (200-400 líneas).
- TypeScript estricto. Sin `any`.
- Funciones de 10-50 líneas. Si excede, extraer responsabilidad.
