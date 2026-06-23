## Context

Con `frontend-base` el workspace tiene un `ChatPlaceholder` y con `backend-agent` existe el endpoint `POST /api/agent`. Este change conecta ambos: el usuario escribe en el chat, el frontend llama al backend, recibe la respuesta y aplica los cambios al sketch en tiempo real.

El reto técnico principal es la sincronización: el agente puede devolver un nuevo `config.yaml`, un nuevo `sketch.js`, ambos o ninguno, y el workspace tiene que reaccionar de forma distinta en cada caso.

## Goals / Non-Goals

**Goals:**
- Chat panel funcional con historial local de mensajes del thread
- Hook `useAgent` que llama a `POST /api/agent` y maneja estado de carga/error
- Aplicar `appliedConfigYaml`: guardar en Supabase Storage + regenerar controles + enviar `SKETCH_RESTART` al iframe
- Aplicar `appliedSketchJs`: guardar en Supabase Storage + recargar iframe
- Banner de aprobación de `memorySuggestion` con botón Guardar / Ignorar
- Mostrar `pendingQuestion` como mensaje del agente y bloquear input hasta respuesta

**Non-Goals:**
- Streaming de la respuesta (spinner hasta respuesta completa)
- Edición manual del código en el workspace (futura funcionalidad)
- Comparación de versiones del sketch (futura funcionalidad)
- Adjuntar imágenes al chat

## Decisions

### 1. Historial local de mensajes + thread del backend

El frontend mantiene un array de mensajes en estado local (`{ role, content, timestamp }[]`). Esto es solo para renderizar el chat — el historial real y persistente del thread vive en el backend (Mastra + pg). Al montar el workspace, el frontend no carga el historial del backend (el backend lo usa internamente como contexto del agente). Esto simplifica el frontend: no necesita sincronizar historial, solo mostrar la conversación de la sesión actual.

Alternativa descartada: cargar historial del backend al montar — añade una llamada extra y complejidad de hidratación. Se puede añadir en un change posterior.

### 2. `fetch` nativo con el token de Supabase en el header

`useAgent` llama a `fetch(VITE_API_URL + '/api/agent', { method: 'POST', headers: { Authorization: 'Bearer ' + session.access_token }, body: JSON.stringify({...}) })`.

No se añade ninguna librería HTTP. El token de sesión viene de `useSession`.

### 3. Guardar archivos en Supabase Storage desde el frontend

Cuando el agente devuelve `appliedConfigYaml` o `appliedSketchJs`, el frontend los sube a Supabase Storage (`supabase.storage.from('sketches').upload(path, content, { upsert: true })`). La ruta es `{userId}/{projectId}/config.yaml` y `{userId}/{projectId}/sketch.js`.

Alternativa descartada: el backend guarda los archivos — añade complejidad al backend y hace que el agente necesite acceso a Storage. El frontend ya tiene el cliente Supabase y el contexto del usuario.

### 4. Recargar iframe tras cambios del agente

- Solo `appliedSketchJs` → reinyectar `srcdoc` (el iframe se reinicia con el nuevo código)
- Solo `appliedConfigYaml` → `SKETCH_RESTART` (mismo código, nueva config y valores por defecto)
- Ambos → reinyectar `srcdoc` con `SKETCH_INIT` incluido (orden: primero código, luego config)

Esto evita recargas dobles. La lógica vive en `useSketch.applyAgentResponse(result)`.

### 5. `MemorySuggestionBanner` como elemento efímero sobre el panel de chat

Cuando la respuesta incluye `memorySuggestion`, aparece un banner encima del input con el texto sugerido y dos botones: "Guardar en memoria" (escribe en `projects.project_memory`) y "Ignorar". El banner desaparece tras la acción o si el usuario envía un nuevo mensaje.

## Risks / Trade-offs

- **[Riesgo] Latencia larga (~10-30s) sin streaming** → El botón de envío muestra un spinner y se deshabilita. Si tarda más de 60s, muestra un timeout amable. Mitigación: el LLM en producción suele estar cerca de 10s para sketches simples.

- **[Trade-off] Historial solo de sesión actual** → Si el usuario recarga, el chat queda vacío aunque el thread del agente tenga historial. Aceptable en MVP.

- **[Riesgo] Race condition si el usuario envía dos mensajes seguidos** → El input se deshabilita mientras hay una llamada en vuelo. No puede haber dos llamadas paralelas.

- **[Riesgo] Supabase Storage no tiene el bucket `sketches` creado** → La subida falla silenciosamente o con 404. Mitigación: verificar y crear el bucket como tarea de setup en este change.
