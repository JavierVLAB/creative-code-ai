## Why

Con `frontend-base`, `workspace-ui` y `backend-agent` completos, el workspace ya tiene visor, controles, editor, snapshots y un panel de chat visual, pero el chat todavía no está conectado al agente. Este change conecta ambos extremos: el usuario escribe una instrucción, el frontend envía el estado actual del sketch al backend Mastra, recibe una respuesta estructurada, aplica los cambios al sketch y persiste el proyecto en Supabase.

El contrato se alinea con el backend actual: endpoint custom `POST /agent`, contexto completo del sketch en el body y persistencia en las columnas `projects.sketch_js`, `projects.config_yaml` y `projects.memory`. Supabase Storage queda fuera de este change.

## What Changes

- Conectar el `ChatPanel` existente con un hook `useAgent`
- Crear el hook `useAgent` que llama a `POST /agent` con el token Bearer del usuario
- Enviar al agente `projectId`, `message`, `sketchJs`, `configYaml`, `renderer` y `previousResponse?`
- Aplicar la respuesta del agente: persistir `config.yaml` y/o `sketch.js` en `projects.config_yaml` / `projects.sketch_js`, refrescar el iframe y regenerar controles cuando corresponda
- Aprobar o rechazar `memorySuggestion` del agente y guardarla en `projects.memory`
- Mostrar `pendingQuestion` del agente como mensaje en el chat y bloquear el input hasta que el usuario responda
- Actualizar `projects.updated_at` cuando el agente modifique el sketch o la memoria

## Capabilities

### New Capabilities

- `agent-chat`: Panel de chat en el workspace. Historial local de la sesión, input de texto, envío al backend, estado de carga, display de errores, preguntas aclaratorias y sugerencias de memoria.

### Modified Capabilities

- `sketch-workspace`: El workspace ahora reacciona a la respuesta del agente. Cuando el agente devuelve `appliedConfigYaml` o `appliedSketchJs`, el workspace guarda las columnas del proyecto en Supabase, recarga el iframe o reinicia el sketch según el caso, y regenera los controles cuando cambia el config.

## Impact

- **Archivos nuevos:** `front/src/hooks/useAgent.ts`
- **Modificados:** `front/src/pages/WorkspacePage.tsx` (conecta `useAgent` con `useSketch` y Supabase); `front/src/hooks/useSketch.ts` (añade soporte para aplicar respuestas del agente); `front/src/lib/types.ts` (añade `AgentResponse`); `front/src/components/workspace/ChatPanel.tsx` y `MemoryProposalCard.tsx` si necesitan props/estados adicionales
- **Dependencias nuevas:** ninguna — usa `fetch` nativo para llamar al backend
- **Requiere:** `backend-agent` desplegado y accesible en `VITE_API_URL`
- **Fuera de alcance:** migrar sketches a Supabase Storage, hidratar el historial visual desde Mastra, streaming de respuestas
