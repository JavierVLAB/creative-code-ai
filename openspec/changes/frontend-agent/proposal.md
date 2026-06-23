## Why

Con `frontend-base` y `backend-agent` completos, el panel de chat sigue siendo un placeholder. Este change conecta ambos extremos: reemplaza el placeholder por un chat funcional que envía mensajes al agente, recibe su respuesta, aplica los cambios al sketch en tiempo real y persiste los archivos en Supabase.

## What Changes

- Reemplazar `ChatPlaceholder` por un panel de chat completo (historial, input, estado de carga)
- Crear el hook `useAgent` que llama a `POST /api/agent` con el token Bearer del usuario
- Aplicar la respuesta del agente: guardar `config.yaml` y `sketch.js` actualizados en Supabase Storage, refrescar el iframe y los controles
- Aprobar o rechazar `memorySuggestion` del agente y guardarla en `projects.project_memory`
- Mostrar `pendingQuestion` del agente como mensaje en el chat y bloquear el input hasta que el usuario responda

## Capabilities

### New Capabilities

- `agent-chat`: Panel de chat en el workspace. Historial de mensajes del thread, input de texto, envío al backend, estado de carga y display de errores.

### Modified Capabilities

- `sketch-workspace`: El workspace ahora reacciona a la respuesta del agente. Cuando el agente devuelve `appliedConfigYaml` o `appliedSketchJs`, el workspace guarda los archivos en Supabase y recarga el iframe y los controles. Añade también el flujo de aprobación de `memorySuggestion`.

## Impact

- **Archivos nuevos:** `front/src/hooks/useAgent.ts`, `front/src/components/workspace/ChatPanel.tsx`, `front/src/components/workspace/ChatMessage.tsx`, `front/src/components/workspace/MemorySuggestionBanner.tsx`
- **Modificados:** `front/src/components/workspace/ChatPlaceholder.tsx` → eliminado y reemplazado por `ChatPanel.tsx`; `front/src/pages/WorkspacePage.tsx` (conecta `useAgent` con `useSketch`); `front/src/hooks/useSketch.ts` (añade método `applyAgentResponse`)
- **Dependencias nuevas:** ninguna — usa `fetch` nativo para llamar al backend
- **Requiere:** `backend-agent` desplegado y accesible en `VITE_API_URL`
