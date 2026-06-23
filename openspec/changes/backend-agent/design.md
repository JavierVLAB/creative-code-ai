## Context

El backend tiene Mastra instalado (`@mastra/core`, `@mastra/pg`, `@mastra/auth-supabase`) y las carpetas `agents/`, `tools/`, `workflows/` vacías. Las specs `agent-behavior` y `mastra-patterns` definen completamente el comportamiento esperado. Hay que implementarlo y exponerlo como un servidor HTTP que el frontend pueda consumir.

## Goals / Non-Goals

**Goals:**
- Agente Mastra con salida estructurada Zod según `agent-behavior`
- Tres tools: `edit_params`, `edit_sketch`, `update_memory` con schemas Zod
- Workflow de guardrails que envuelve al agente
- Endpoint `POST /api/agent` autenticado con token Bearer de Supabase
- Memoria persistente por thread (proyecto) con `@mastra/pg`

**Non-Goals:**
- WebSockets o streaming (respuesta síncrona en MVP)
- Rate limiting (se añade en fase de producción)
- Múltiples agentes o routing complejo
- Persistir archivos del sketch en Supabase desde el backend — el frontend aplica los cambios

## Decisions

### 1. El agente recibe sketch y config como texto en el request

El frontend envía `{ projectId, threadId, message, sketchJs, configYaml, renderer }` en el body. El backend no accede directamente a Supabase Storage — el frontend le pasa el contenido actual del sketch. Esto simplifica el backend (sin acceso a Storage) y el frontend siempre tiene la versión canónica.

Alternativa descartada: backend fetcha el sketch desde Storage — añade latencia y acoplamiento innecesario en el MVP.

### 2. Mastra Dev Server en desarrollo, Hono en producción

`mastra dev` levanta el servidor de desarrollo con recarga en caliente. Para producción se usa `mastra build` que genera un servidor Hono. El endpoint `/api/agent` vive dentro del servidor Mastra. No se necesita un servidor Express separado.

### 3. Autenticación: `@mastra/auth-supabase` verifica el token en el middleware

Cada request a `/api/agent` lleva el header `Authorization: Bearer <supabase-jwt>`. El middleware de `@mastra/auth-supabase` verifica el token contra Supabase y extrae el `user_id`. Si el token es inválido o ausente, responde 401.

El `user_id` extraído se pasa al agente como contexto, no como campo del body del request — el cliente no puede falsificarlo.

### 4. LLM: `claude-sonnet-4-6` vía `@anthropic-ai/sdk`

Mastra tiene integración nativa con Anthropic. Se configura en la instancia Mastra con `defaultModel`. No se pasan parámetros del modelo por request — es una decisión del sistema.

### 5. Guardrail workflow: wraps el agente, no anida tools

El workflow de guardrails no reimplementa la lógica del agente. Ejecuta el agente como un paso y aplica checks después (conteo de steps, detección de bucle comparando outputs). Si el check falla, el workflow devuelve un error estructurado en lugar del resultado del agente.

### 6. `js-yaml` en el backend para validar el YAML de `edit_params`

La tool `edit_params` valida que el YAML devuelto por el LLM sea parseable antes de incluirlo en la respuesta. Si no lo es, reintenta (máximo 2 reintentos). Esto evita que el frontend reciba un YAML roto.

## Risks / Trade-offs

- **[Riesgo] LLM devuelve sketch.js inválido** → Mitigación: la tool `edit_sketch` valida que el código contenga las palabras clave mínimas (`params`, `addEventListener`). Si no, reintenta. En última instancia, el error llega al frontend como `response` de texto, no como un crash.

- **[Riesgo] `@mastra/pg` requiere PostgreSQL con `pgvector`** → Supabase tiene pgvector activado por defecto. La connection string de Supabase se usa como `DATABASE_URL`. Si la extensión no está, la memoria no persiste pero el agente responde igual (degradación elegante).

- **[Trade-off] Respuesta síncrona** → Para sketches complejos, el LLM puede tardar 10-30s. Sin streaming, el frontend muestra un spinner hasta recibir la respuesta completa. Aceptable en MVP; streaming se añade en un change posterior.

- **[Riesgo] `ANTHROPIC_API_KEY` no está en backend/.env** → El servidor arranca pero todas las llamadas al agente fallan con 401 de Anthropic. Verificar en la tarea de setup.
