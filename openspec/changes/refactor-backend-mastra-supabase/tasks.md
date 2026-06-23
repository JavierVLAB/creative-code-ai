## 1. Supabase — proyecto y esquema

- [ ] 1.1 Crear proyecto Supabase y obtener credenciales (URL, anon key, service role)
- [ ] 1.2 Escribir migración SQL para tablas `profiles`, `projects`, `snapshots`, `assets`
- [ ] 1.3 Escribir políticas RLS con `auth.uid()` y herencia por `project_id`
- [ ] 1.4 Ejecutar migraciones y verificar RLS

## 2. Backend — proyecto Mastra

- [ ] 2.1 Inicializar proyecto Node + Hono + Mastra en `backend/`
- [ ] 2.2 Configurar `@mastra/pg` para memoria (conexión a Postgres de Supabase)
- [ ] 2.3 Configurar `@mastra/auth-supabase` para verificación de tokens
- [ ] 2.4 Definir schema Zod de salida del agente (`response`, `appliedConfigYaml?`, `appliedSketchJs?`, `memorySuggestion?`, `pendingQuestion?`)

## 3. Backend — tools del agente

- [ ] 3.1 Implementar tool `edit-params`: recibe config.yaml actual + instrucción, devuelve config.yaml modificado validado (YAML parseable)
- [ ] 3.2 Implementar tool `edit-sketch`: recibe sketch.js actual + instrucción, devuelve sketch.js modificado con validación sintáctica básica
- [ ] 3.3 Implementar tool `update-memory`: recibe project_memory actual + instrucción, propone actualización

## 4. Backend — agente, guardrails y API

- [ ] 4.1 Definir el agente Mastra con las tres tools y salida estructurada
- [ ] 4.2 Implementar workflow de guardrails: corte de bucles, fallos repetidos, renderer tras cambio de params
- [ ] 4.3 Verificar que el endpoint `/api/agents/{agentId}/generate` responde con auth

## 5. Frontend — dependencias y configuración

- [ ] 5.1 Añadir `@supabase/supabase-js` y `@mastra/client-js` al package.json
- [ ] 5.2 Configurar cliente Supabase con URL y anon key
- [ ] 5.3 Configurar cliente Mastra con URL del backend
- [ ] 5.4 Eliminar dependencias directas de LLM (Ollama, HuggingFace, OpenRouter)

## 6. Frontend — auth

- [ ] 6.1 Crear componentes de Login y Register con Supabase Auth
- [ ] 6.2 Implementar protección de rutas (redirect si no hay sesión)
- [ ] 6.3 Añadir botón de logout y datos del usuario
- [ ] 6.4 Verificar flujo completo: registro → login → sesión persistente

## 7. Frontend — proyectos en Supabase

- [ ] 7.1 Reemplazar `fileSystem.ts` por llamadas a Supabase (CRUD de proyectos)
- [ ] 7.2 Reemplazar File Explorer local por biblioteca de proyectos desde DB
- [ ] 7.3 Adaptar snapshot loading/guardado para usar tabla `snapshots`
- [ ] 7.4 Eliminar File System Access API y código relacionado

## 8. Frontend — agente via Mastra

- [ ] 8.1 Reemplazar `orchestrator.ts` por llamadas a `mastraClient.agent.generate()`
- [ ] 8.2 Adaptar flujo del chat para usar Mastra en vez de LLM directo
- [ ] 8.3 Eliminar `aiSettings.ts` y UI de configuración de proveedores
- [ ] 8.4 Verificar que los cambios del agente se aplican y recargan el sketch
- [ ] 8.5 Verificar que el historial persiste entre sesiones

## 9. Tests y verificación

- [ ] 9.1 Añadir Vitest al proyecto
- [ ] 9.2 Escribir tests unitarios para parseo de config.yaml
- [ ] 9.3 Escribir tests de integración para el endpoint del agente
- [ ] 9.4 Verificar build completo: `pnpm run build` en front y backend
