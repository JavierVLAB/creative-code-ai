## Why

El prototipo actual es 100% cliente: el agente llama a LLMs directo desde el navegador y los datos persisten en el sistema de archivos local. Esto no escala, no permite colaboración ni despliegue, y no cumple con la arquitectura objetivo del curso (Mastra + Supabase). Necesitamos migrar a la arquitectura cloud para la Entrega 2.

## What Changes

- **Nuevo backend Mastra** con agentes, tools, guardrails y memoria en Postgres, reemplazando el orquestador ReAct cliente
- **Nueva integración Supabase** con auth, base de datos y RLS, reemplazando la persistencia local
- **Refactor del frontend** para usar `@supabase/supabase-js` y `@mastra/client-js`
- El visor iframe, controles de parámetros y editor CodeMirror se mantienen y adaptan mínimamente

## Capabilities

### New Capabilities

- `mastra-agent`: Agente Mastra con tools (edit-params, edit-sketch, update-memory), salida estructurada, workflow de guardrails y memoria conversacional en Postgres
- `supabase-db`: Esquema de datos (profiles, projects, snapshots, assets) con RLS y migraciones versionadas
- `user-auth`: Registro/login con Supabase Auth, sesión persistente, protección de rutas y llamadas autenticadas al backend

### Modified Capabilities

- `sketch-runner`: El visor iframe y protocolo postMessage se mantienen; se adapta para recibir config desde Supabase en vez del sistema de archivos
- `parameter-controls`: Los controles generados desde config.yaml se mantienen; se adaptan para leer/escribir desde Supabase
- `ai-chat`: La UI del chat se mantiene; el backend cambia del orquestador cliente a Mastra API
- `file-system`: **BREAKING** — Se elimina la dependencia de File System Access API; los proyectos se almacenan y recuperan desde Supabase

## Impact

- **Frontend**: añadir dependencias `@supabase/supabase-js` y `@mastra/client-js`; eliminar dependencia directa de LLMs (Ollama, HuggingFace, OpenRouter); eliminar File System Access API; añadir lógica de auth
- **Backend**: proyecto nuevo (Node/Hono + Mastra + Postgres) con agentes, tools y guardrails
- **Datos**: proyecto nuevo Supabase con migraciones SQL y RLS
- **Skills .md**: Las skills del agente (p5js, threejs, params, memory-update) pasan a ser tools de Mastra o sus prompts; los archivos `.md` se eliminan del frontend
- **Configuración LLM**: Se elimina del frontend (el backend gestiona el routing al LLM)
