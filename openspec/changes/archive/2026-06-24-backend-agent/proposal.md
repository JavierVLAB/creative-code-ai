## Why

El backend existe como scaffolding vacío (carpetas agents/, tools/, workflows/ sin contenido). Sin agente, herramientas ni endpoint, el frontend no tiene con qué hablar. Este change implementa el núcleo inteligente de CurateArtAI: el agente Mastra con sus tres tools y el workflow de guardrails, expuesto vía HTTP.

## What Changes

- Implementar el agente Mastra según la spec `agent-behavior` (árbol de decisión, salida estructurada)
- Crear las tres tools: `edit_params`, `edit_sketch`, `update_memory` con schemas Zod
- Crear el workflow de guardrails (máximo de steps, detección de bucle, fallo consecutivo)
- Exponer un endpoint HTTP `POST /api/agent` con autenticación Supabase Bearer token
- Crear `backend/src/lib/supabase.ts` con `createAdminSupabase()` para operaciones del sistema
- Inicializar la instancia Mastra con `@mastra/pg` para memoria persistente y `@mastra/auth-supabase`

## Capabilities

### New Capabilities

- `agent-api`: Contrato HTTP entre frontend y backend. Define el endpoint `POST /api/agent`, el formato de request/response, la autenticación con token Bearer de Supabase y el manejo de errores.

### Modified Capabilities

<!-- ninguna — agent-behavior y mastra-patterns se implementan sin cambiar sus requisitos -->

## Impact

- **Archivos nuevos:** `backend/src/lib/supabase.ts`, `backend/src/mastra/agents/sketch-agent.ts`, `backend/src/mastra/tools/edit-params.ts`, `backend/src/mastra/tools/edit-sketch.ts`, `backend/src/mastra/tools/update-memory.ts`, `backend/src/mastra/workflows/agent-guardrails.ts`, `backend/src/mastra/index.ts`
- **Modificados:** `backend/src/index.ts` (inicializa Mastra + monta el servidor Hono con la ruta `/api/agent`)
- **Dependencias existentes:** `@mastra/core`, `@mastra/pg`, `@mastra/auth-supabase`, `mastra`, `@supabase/supabase-js` — ya en package.json
- **Dependencias nuevas:** `zod` (si no está ya), `js-yaml` (parsear config.yaml en las tools)
- **Variable de entorno requerida:** `ANTHROPIC_API_KEY` en `backend/.env`
