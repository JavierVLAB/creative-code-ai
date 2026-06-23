## Context

Prototipo actual 100% cliente (Vite + React SPA). El agente llama a LLMs directo desde el navegador vía fetch. Los datos persisten en File System Access API + localStorage. No hay backend, no hay base de datos, no hay auth.

El objetivo es migrar a la arquitectura definida en readme.md: Mastra (backend de agentes) + Supabase (auth, datos, RLS). El frontend se adapta para consumir estos servicios en vez de hacer todo local.

## Goals / Non-Goals

**Goals:**
- Backend Mastra funcional con agentes, tools, guardrails y memoria
- Base de datos Supabase con esquema y RLS
- Auth funcional (registro, login, sesión persistente)
- Frontend conectado a Mastra y Supabase (no más LLM directo ni FS local)
- Todo desplegable (frontend + backend + base de datos)

**Non-Goals:**
- No se añaden funcionalidades nuevas de curación (variaciones por lotes, grid, export) — eso va en otra iteración
- No se cambia el protocolo postMessage ni el contrato del sketch
- No se rediseña la UI (solo los cambios mínimos necesarios)

## Decisions

### 1. Estructura del proyecto: repo único con dos subdirectorios
`front/` (Vite + React SPA) y `backend/` (Mastra + Hono + Postgres). Cada uno con su package.json y configuración. Comparten types via un `shared/` opcional. Alternativa considerada: repos separados. Se descarta por simplicidad en el curso.

### 2. El agente Mastra reemplaza al orquestador ReAct cliente
Las 4 skills actuales (p5js, threejs, params, memory-update) pasan a ser tools de Mastra con nombre similar: `edit-sketch`, `edit-params`, `update-memory`. El loop ReAct lo gestiona Mastra internamente. El orquestador cliente (`orchestrator.ts`) se elimina.

### 3. Salida estructurada del agente con Zod
El agente devuelve `{ response, appliedConfigYaml?, appliedSketchJs?, memorySuggestion?, pendingQuestion? }`. Esto evita el parseo frágil por regex que tiene el prototipo actual.

### 4. Auth delegada a Supabase + @mastra/auth-supabase
Supabase Auth gestiona registro/login. El frontend usa `@supabase/supabase-js`. El backend verifica el token con `@mastra/auth-supabase`. Alternativa considerada: JWT propio. Se descarta porque duplica esfuerzo y Supabase ya lo resuelve.

### 5. Memoria del agente en Postgres via @mastra/pg
Mastra crea automáticamente las tablas de threads/messages en el mismo Postgres de Supabase. Alternativa considerada: memoria en SQLite local. Se descarta porque no escala al cloud.

### 6. Eliminación completa de File System Access API
Ya no se abre una carpeta local. Los proyectos se crean, guardan y recuperan desde Supabase. El explorador de archivos del frontend ahora muestra los archivos del proyecto desde la DB, no del FS local.

### 7. Configuración LLM se mueve al backend
El usuario ya no configura proveedores LLM desde el frontend. El backend decide qué modelo usar (routing manejado por Mastra). Se elimina `aiSettings.ts` y localStorage correspondiente.

## Risks / Trade-offs

- **[Dependencia de servicios cloud]** Mastra y Supabase son servicios gestionados. Mitigación: ambos tienen plan gratuito. Si un servicio cae, el backend entero deja de funcionar.
- **[Primera llamada lenta]** El backend en plan gratuito de Render se suspende por inactividad. Mitigación: aceptado para el curso. Se puede añadir warm-up después.
- **[Pérdida de funcionalidades locales]** File System API permitía trabajar con sketches existentes en disco. Mitigación: el flujo de "subir sketch" se reemplaza por crear/importar desde Supabase.
- **[Curva de Mastra]** Es una plataforma nueva para el equipo. Mitigación: la documentación de Mastra y este spec guían la implementación. El prototipo actual ya tiene la lógica clara.
- **[No hay tests aún]** El prototipo actual tampoco tiene tests. Mitigación: se añaden tests unitarios básicos en backend y frontend durante la implementación (Vitest).
