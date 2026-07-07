## 0. Acción operativa inmediata (fuera de código — la ejecuta Javi)

- [x] 0.1 Pausar el Server: innecesario finalmente — con la config nueva el Server hiberna solo en idle
- [x] 0.2 Soporte de Mastra para Studio: innecesario — el problema de Studio era que corría el código viejo (observability on); se resolvió redesplegándolo con la config nueva

## 1. Cambios de código en `backend/src/mastra/index.ts`

- [x] 1.1 Condicionar `observability` para que NO se active en producción (variable `ENABLE_OBSERVABILITY`; activo solo en local vía spread condicional)
- [x] 1.2 Sustituir `storage: PostgresStoreVNext(...)` por `LibSQLStore` local (`file:./mastra.db`), eliminando la conexión persistente a Supabase para el storage del agente
- [x] 1.3 Eliminar imports y variables que quedaron sin uso (`PostgresStoreVNext`, `primaryDatabaseUrl`, `observabilityDatabaseUrl`, `observabilitySchema`); `Observability` se mantiene (uso condicional)

## 2. Limpieza de configuración

- [x] 2.1 Verificado: `DATABASE_URL`/`OBSERVABILITY_*` no se usan ya en código (solo aparecían en el README de evals). Retiradas de `.env.example`; añadido `ENABLE_OBSERVABILITY`; README de evals actualizado; `mastra.db*` añadido a `.gitignore`
- [x] 2.2 `@mastra/pg` retirado (`pnpm remove @mastra/pg`). Además se subió `@mastra/core` a `^1.49.0` (peer-dep requerida por `@mastra/libsql@1.15`)

## 3. Verificación local

- [x] 3.1 `tsc --noEmit` sin errores tras los cambios
- [x] 3.2 `vitest run` sin regresiones (16/16 pass)
- [ ] 3.3 En local: `POST /agent` funciona y (con `ENABLE_OBSERVABILITY=true`) la traza aparece en Studio — cumple `agent-local-observability` (verificación manual de Javi)

## 4. Verificación empírica de la hipótesis (tras redeploy — la ejecuta Javi)

- [x] 4.1 Redesplegados **Server y Studio** con la config nueva (`--skip-preflight`). Clave: había que redesplegar **ambos**; redesplegar solo el Server dejaba Studio con el código viejo (observability on) sin hibernar
- [x] 4.2 Ambos servicios observados en idle en el dashboard
- [x] 4.3 **Criterio de éxito CUMPLIDO**: el contador de CPU dejó de subir (estable en 16.7h con todo en idle)
- [x] 4.4 No aplica — la hipótesis (observability + Postgres externo impedían hibernar) se confirmó
