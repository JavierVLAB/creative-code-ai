## Context

Con `frontend-base`, `workspace-ui` y `backend-agent`, el workspace tiene visor, controles, editor, snapshots y un `ChatPanel` visual, pero el chat sigue desconectado del backend. El backend actual expone un endpoint custom `POST /agent` desde Mastra y espera el contexto completo del sketch en cada request.

Este change conecta ambos: el usuario escribe en el chat, el frontend llama a `POST /agent`, recibe la respuesta estructurada y aplica los cambios al sketch en tiempo real.

El reto técnico principal es la sincronización: el agente puede devolver un nuevo `config.yaml`, un nuevo `sketch.js`, ambos o ninguno, y el workspace tiene que reaccionar de forma distinta en cada caso.

## Goals / Non-Goals

**Goals:**
- Chat panel funcional con historial local de mensajes del thread
- Hook `useAgent` que llama a `POST /agent` y maneja estado de carga/error
- Enviar al backend `projectId`, `message`, `sketchJs`, `configYaml`, `renderer` y `previousResponse?`
- Aplicar `appliedConfigYaml`: guardar en `projects.config_yaml` + regenerar controles + enviar `SKETCH_RESTART` al iframe
- Aplicar `appliedSketchJs`: guardar en `projects.sketch_js` + recargar iframe
- Banner de aprobación de `memorySuggestion` con botón Guardar / Ignorar
- Mostrar `pendingQuestion` como mensaje del agente y bloquear input hasta respuesta
- Actualizar `projects.updated_at` tras cambios del agente

**Non-Goals:**
- Streaming de la respuesta (spinner hasta respuesta completa)
- Edición manual del código en el workspace (futura funcionalidad)
- Comparación de versiones del sketch (futura funcionalidad)
- Adjuntar imágenes al chat
- Migrar `sketch.js` / `config.yaml` a Supabase Storage
- Hidratar el historial visual del chat desde Mastra al montar el workspace

## Decisions

### 1. Historial local de mensajes + thread del backend

El frontend mantiene un array de mensajes en estado local (`{ role, content, timestamp }[]`). Esto es solo para renderizar el chat — el historial real y persistente del thread vive en el backend (Mastra + pg). Al montar el workspace, el frontend no carga el historial del backend (el backend lo usa internamente como contexto del agente). Esto simplifica el frontend: no necesita sincronizar historial, solo mostrar la conversación de la sesión actual.

Alternativa descartada: cargar historial del backend al montar — añade una llamada extra y complejidad de hidratación. Se puede añadir en un change posterior.

### 2. `fetch` nativo con el token de Supabase en el header

`useAgent` llama a `fetch(VITE_API_URL + '/agent', { method: 'POST', headers: { Authorization: 'Bearer ' + session.access_token }, body: JSON.stringify({...}) })`.

No se añade ninguna librería HTTP. El token de sesión viene de `useSession`.

Mastra también expone rutas built-in como `POST /api/agents/:agentId/generate`, pero este change mantiene la ruta custom `POST /agent` porque ya encapsula el contrato específico del producto: autenticación Supabase, `threadId = projectId`, `resourceId = user.id`, workflow de guardrails y salida estructurada lista para el frontend.

### 3. Persistir el sketch en columnas del proyecto

Cuando el agente devuelve `appliedConfigYaml` o `appliedSketchJs`, el frontend actualiza la fila del proyecto:

- `appliedConfigYaml` → `projects.config_yaml`
- `appliedSketchJs` → `projects.sketch_js`
- cualquier cambio del sketch → `projects.updated_at`

Alternativa descartada para este MVP: subir `config.yaml` y `sketch.js` a Supabase Storage. El proyecto actual ya usa columnas `text` como fuente de verdad, el editor existente persiste contra esas columnas y mantener ese camino reduce migraciones y superficie de fallo.

### 4. Recargar iframe tras cambios del agente

- Solo `appliedSketchJs` → reinyectar `srcdoc` (el iframe se reinicia con el nuevo código)
- Solo `appliedConfigYaml` → `SKETCH_RESTART` (mismo código, nueva config y valores por defecto)
- Ambos → actualizar estado con nuevo código y nueva config, reinyectar `srcdoc` y enviar `SKETCH_INIT` con la config nueva cuando el iframe esté listo

Esto evita recargas dobles. La lógica vive en `useSketch.applyAgentResponse(result)`.

### 5. `MemoryProposalCard` como elemento efímero sobre el panel de chat

Cuando la respuesta incluye `memorySuggestion`, aparece una tarjeta encima del chat con el texto sugerido y botones para guardar o ignorar. Guardar escribe en `projects.memory`; ignorar descarta la sugerencia. La tarjeta desaparece tras la acción o si el usuario envía un nuevo mensaje.

La memoria conversacional de Mastra (`@mastra/pg`) y la memoria curatorial del proyecto (`projects.memory`) son cosas distintas:

- Mastra guarda el historial del thread para contexto conversacional.
- `projects.memory` guarda notas explícitas aprobadas por el usuario sobre decisiones del proyecto.

## Risks / Trade-offs

- **[Riesgo] Latencia larga (~10-30s) sin streaming** → El botón de envío muestra un spinner y se deshabilita. Si tarda más de 60s, muestra un timeout amable. Mitigación: el LLM en producción suele estar cerca de 10s para sketches simples.

- **[Trade-off] Historial solo de sesión actual** → Si el usuario recarga, el chat queda vacío aunque el thread del agente tenga historial. Aceptable en MVP.

- **[Riesgo] Race condition si el usuario envía dos mensajes seguidos** → El input se deshabilita mientras hay una llamada en vuelo. No puede haber dos llamadas paralelas.

- **[Trade-off] Ruta custom en vez de ruta built-in de Mastra** → Se pierde algo de estandarización del SDK, pero se gana un contrato simple y específico para el producto. Se puede migrar a `POST /api/agents/:agentId/generate` en un change posterior si compensa.

- **[Riesgo] Config inválido devuelto por el agente** → Antes de persistir `appliedConfigYaml`, el frontend debe parsearlo con la lógica existente. Si falla, muestra error en el chat y no actualiza el proyecto.
