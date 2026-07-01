## 1. Setup

- [x] 1.1 Verificar que `VITE_API_URL` está en `front/.env` apuntando al backend Mastra
- [x] 1.2 Verificar que el backend expone `POST /agent` y que acepta Bearer token de Supabase
- [x] 1.3 Verificar que la tabla `projects` tiene las columnas reales `sketch_js`, `config_yaml`, `memory` y `updated_at`

## 2. Hook de comunicación con el agente

- [x] 2.1 Crear `front/src/hooks/useAgent.ts` — llama a `POST /agent` con Bearer token, maneja estado `loading` / `error`, devuelve la respuesta tipada del agente
- [x] 2.2 Definir el tipo `AgentResponse` en `front/src/lib/types.ts` (`response`, `appliedConfigYaml?`, `appliedSketchJs?`, `memorySuggestion?`, `pendingQuestion?`)
- [x] 2.3 El request debe enviar `{ projectId, message, sketchJs, configYaml, renderer, previousResponse? }`
- [x] 2.4 El hook debe mostrar un error amable si falta sesión, falla la red, el backend devuelve 401/400 o la respuesta no tiene `response`

## 3. Aplicar cambios del agente al sketch

- [x] 3.1 Añadir una función de aplicación de respuesta del agente en el flujo del workspace (`applyAgentResponse(result: AgentResponse)`)
- [x] 3.2 Si llega `appliedSketchJs`, actualizar `projects.sketch_js` y el estado local del proyecto
- [x] 3.3 Si llega `appliedConfigYaml`, validar/parsear el YAML, actualizar `projects.config_yaml`, regenerar controles y actualizar estado local
- [x] 3.4 Implementar lógica de recarga del iframe según qué cambió: solo código, solo config, ambos o ninguno
- [x] 3.5 Actualizar `projects.updated_at` tras cambios de sketch/config
- [x] 3.6 Si la validación del config falla, mostrar error en el chat y no persistir cambios parciales

## 4. Panel de chat

- [x] 4.1 Conectar `ChatPanel` con el envío real de mensajes desde `WorkspacePage`
- [x] 4.2 Mantener historial local de mensajes de la sesión con mensajes de usuario, agente y errores
- [x] 4.3 Implementar input con envío por Enter y botón, spinner durante carga, deshabilitado en vuelo
- [x] 4.4 Implementar scroll automático al último mensaje
- [x] 4.5 Mostrar mensaje de bienvenida del sistema al montar el chat vacío

## 5. Flujos especiales del agente

- [x] 5.1 Detectar `pendingQuestion` en la respuesta y mostrar el placeholder de aclaración en el input
- [x] 5.2 Usar/adaptar `MemoryProposalCard` para mostrar `memorySuggestion` con acciones "Guardar" / "Ignorar"
- [x] 5.3 Implementar guardado de `memorySuggestion` en `projects.memory` al aprobar
- [x] 5.4 Al guardar memoria, concatenar con la memoria existente de forma legible y actualizar `projects.updated_at`

## 6. Integración en el workspace

- [x] 6.1 Conectar `useAgent` con `WorkspacePage` y `useSketch`
- [x] 6.2 Pasar `projectId`, `sketchJs`, `configYaml` y `renderer` actuales a `useAgent` en cada llamada
- [x] 6.3 Inferir `renderer` desde el código actual (`THREE` → `threejs`, si no `p5js`)
- [x] 6.4 Mantener `previousResponse` para detectar repeticiones si el backend lo necesita

## 7. Tests

- [x] 7.1 Tests de `useAgent`: request correcto a `POST /agent`, Bearer token, errores 401/400/red y respuesta inválida
- [x] 7.2 Tests del flujo de aplicación: solo `appliedSketchJs` → recarga iframe; solo `appliedConfigYaml` → regenera controles y `SKETCH_RESTART`; ambos → recarga iframe con config nueva; ninguno → no toca iframe
- [x] 7.3 Tests de memoria: aprobar `memorySuggestion` actualiza `projects.memory`; ignorar no persiste
- [x] 7.4 Ejecutar `pnpm test` en `front/` y verificar que todos los tests pasan

## 8. Verificación

- [x] 8.1 Flujo completo: abrir proyecto → escribir "hazlo más grande" → verificar que el sketch cambia
- [x] 8.2 Verificar que `projects.sketch_js` y/o `projects.config_yaml` se actualizan tras el cambio
- [x] 8.3 Verificar que `projects.updated_at` del proyecto se actualiza en la biblioteca
- [x] 8.4 Probar pregunta conversacional — verificar que el iframe no se recarga
- [x] 8.5 Probar `memorySuggestion` — guardar actualiza `projects.memory`, ignorar no cambia nada
- [x] 8.6 Ejecutar `tsc --noEmit` sin errores en `front/`
