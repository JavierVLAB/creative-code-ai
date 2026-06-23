## 1. Setup y configuración

- [ ] 1.1 Verificar que `ANTHROPIC_API_KEY` está en `backend/.env` y en `.env.example`
- [ ] 1.2 Verificar que `DATABASE_URL` (Supabase connection string con pgvector) está en `backend/.env`
- [ ] 1.3 Verificar dependencias: `zod`, `js-yaml` — instalar si no están en `backend/package.json`

## 2. Cliente Supabase admin

- [ ] 2.1 Crear `backend/src/lib/supabase.ts` con `createAdminSupabase()` (secret key, sin persistir sesión)

## 3. Tools del agente

- [ ] 3.1 Crear `backend/src/mastra/tools/edit-params.ts` — schema Zod de input/output, valida YAML parseable, reintenta hasta 2 veces si el YAML es inválido
- [ ] 3.2 Crear `backend/src/mastra/tools/edit-sketch.ts` — schema Zod de input/output, valida que el output contiene `params` y `addEventListener`, acepta renderer `p5js` | `threejs`
- [ ] 3.3 Crear `backend/src/mastra/tools/update-memory.ts` — schema Zod de input/output, devuelve fragmento de texto de 2-5 líneas

## 4. Agente Mastra

- [ ] 4.1 Crear `backend/src/mastra/agents/sketch-agent.ts` con el system prompt de `agent-behavior` (árbol de decisión, identidad, guardrails)
- [ ] 4.2 Configurar el agente con salida estructurada Zod: `{ response, appliedConfigYaml?, appliedSketchJs?, memorySuggestion?, pendingQuestion? }`
- [ ] 4.3 Registrar las tres tools en el agente

## 5. Workflow de guardrails

- [ ] 5.1 Crear `backend/src/mastra/workflows/agent-guardrails.ts` que envuelve la llamada al agente
- [ ] 5.2 Implementar detección de bucle: si el output de dos pasos consecutivos es idéntico, abortar y devolver error
- [ ] 5.3 Implementar conteo de fallo consecutivo: si una tool falla 2 veces seguidas, abortar
- [ ] 5.4 Implementar límite de 3 tool-calls por turno

## 6. Instancia Mastra y servidor

- [ ] 6.1 Crear `backend/src/mastra/index.ts` — registrar agente, tools, workflow y configurar `@mastra/pg` como memory store y `@mastra/auth-supabase`
- [ ] 6.2 Actualizar `backend/src/index.ts` para inicializar Mastra y exponer `POST /api/agent`
- [ ] 6.3 Implementar validación del body del request (400 si faltan campos requeridos)
- [ ] 6.4 Implementar middleware de auth: verificar Bearer token → extraer `user_id` → pasar al agente como contexto

## 7. Tests

- [ ] 7.1 `backend/src/mastra/tools/edit-params.test.ts` — YAML válido devuelto por el LLM pasa la validación; YAML inválido dispara reintento; tras 2 reintentos fallidos devuelve error estructurado
- [ ] 7.2 `backend/src/mastra/tools/edit-sketch.test.ts` — output que contiene `params` y `addEventListener` es válido; output sin `params` dispara reintento; output sin `addEventListener` dispara reintento
- [ ] 7.3 `backend/src/mastra/tools/update-memory.test.ts` — output de más de 5 líneas se considera inválido; output vacío se considera inválido
- [ ] 7.4 Ejecutar `pnpm test` en `backend/` y verificar que todos los tests pasan

## 8. Verificación

- [ ] 7.1 Llamada manual a `POST /api/agent` con curl/Postman con mensaje conversacional — verificar `response` sin campos opcionales
- [ ] 7.2 Llamada con "cambia el color a azul" — verificar que `appliedConfigYaml` o `appliedSketchJs` aparece según el sketch de prueba
- [ ] 7.3 Llamada sin token — verificar respuesta 401
- [ ] 7.4 Ejecutar `tsc --noEmit` sin errores en `backend/`
