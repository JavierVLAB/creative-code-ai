## 1. Setup

- [ ] 1.1 Verificar que `VITE_API_URL` está en `front/.env` apuntando al backend Mastra
- [ ] 1.2 Verificar que el bucket `sketches` existe en Supabase Storage (crear si no)

## 2. Hook de comunicación con el agente

- [ ] 2.1 Crear `front/src/hooks/useAgent.ts` — llama a `POST /api/agent` con Bearer token, maneja estado `loading` / `error`, devuelve la respuesta tipada del agente
- [ ] 2.2 Definir el tipo `AgentResponse` en `front/src/lib/types.ts` (`response`, `appliedConfigYaml?`, `appliedSketchJs?`, `memorySuggestion?`, `pendingQuestion?`)

## 3. Aplicar cambios del agente al sketch

- [ ] 3.1 Añadir `applyAgentResponse(result: AgentResponse)` a `front/src/hooks/useSketch.ts`
- [ ] 3.2 Implementar subida de `sketch.js` a Supabase Storage en `{userId}/{projectId}/sketch.js` (upsert)
- [ ] 3.3 Implementar subida de `config.yaml` a Storage en `{userId}/{projectId}/config.yaml` (upsert)
- [ ] 3.4 Implementar lógica de recarga del iframe según qué cambió (solo código, solo config, ambos)
- [ ] 3.5 Actualizar `projects.updated_at` en Supabase tras guardar archivos

## 4. Panel de chat

- [ ] 4.1 Crear `front/src/components/workspace/ChatPanel.tsx` — contenedor del chat, historial local de mensajes, llama a `useAgent`
- [ ] 4.2 Crear `front/src/components/workspace/ChatMessage.tsx` — renderiza un mensaje con rol (usuario/agente) y contenido
- [ ] 4.3 Implementar input con envío por Enter y botón, spinner durante carga, deshabilitado en vuelo
- [ ] 4.4 Implementar scroll automático al último mensaje
- [ ] 4.5 Mostrar mensaje de bienvenida del sistema al montar el chat vacío

## 5. Flujos especiales del agente

- [ ] 5.1 Detectar `pendingQuestion` en la respuesta y mostrar el placeholder de aclaración en el input
- [ ] 5.2 Crear `front/src/components/workspace/MemorySuggestionBanner.tsx` — banner con texto sugerido y botones "Guardar" / "Ignorar"
- [ ] 5.3 Implementar guardado de `memorySuggestion` en `projects.project_memory` al aprobar

## 6. Integración en el workspace

- [ ] 6.1 Reemplazar `ChatPlaceholder` por `ChatPanel` en `front/src/pages/WorkspacePage.tsx`
- [ ] 6.2 Conectar `useAgent` con `useSketch.applyAgentResponse` en `WorkspacePage`
- [ ] 6.3 Pasar `sketchJs`, `configYaml` y `renderer` actuales a `useAgent` en cada llamada

## 7. Tests

- [ ] 7.1 `front/src/hooks/useSketch.test.ts` — `applyAgentResponse()`: solo `appliedSketchJs` → llama a reinyectar iframe y NO a SKETCH_RESTART; solo `appliedConfigYaml` → llama a SKETCH_RESTART y regenera controles y NO reinyecta iframe; ambos → reinyecta iframe; ninguno → no toca el iframe
- [ ] 7.2 Ejecutar `pnpm test` en `front/` y verificar que todos los tests pasan

## 8. Verificación

- [ ] 7.1 Flujo completo: abrir proyecto → escribir "hazlo más grande" → verificar que el sketch cambia
- [ ] 7.2 Verificar que los archivos aparecen en Supabase Storage tras el cambio
- [ ] 7.3 Verificar que `updated_at` del proyecto se actualiza en la biblioteca
- [ ] 7.4 Probar pregunta conversacional — verificar que el iframe no se recarga
- [ ] 7.5 Ejecutar `tsc --noEmit` sin errores en `front/`
