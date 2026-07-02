# Local Agent Observability And Evals

## Dependencias que faltan

- Instala `@mastra/observability` en `backend/`.
- No hace falta un paquete extra para evals: `@mastra/core/evals` ya viene dentro de `@mastra/core`.

## Configuración local

1. Activa Node 24 en esta carpeta: `nvm use 24`
2. Instala dependencias en `backend/` para actualizar `node_modules` y lockfile.
3. Define `OBSERVABILITY_DATABASE_URL` si quieres una base separada para trazas.
4. Si no defines `OBSERVABILITY_DATABASE_URL`, el backend reutiliza `DATABASE_URL` pero escribe la observabilidad en el esquema `OBSERVABILITY_SCHEMA` para mantenerla aislada a nivel lógico.

## Flujo profesional

1. Arranca Mastra Studio con `pnpm dev` dentro de `backend/`.
2. Desde otra terminal ejecuta `pnpm run eval:local`.
3. El comando sincroniza el dataset `local-agent-observability-evals` y lanza un experiment contra `agent-guardrails`.
4. La revisión real ocurre en Studio:
   - `Datasets` para ver los 5 casos,
   - `Experiments` para ver la ejecución,
   - `Traces` para inspeccionar workflow, agente y tool calls.

## Batería local de 5 preguntas

- Los 5 casos están en [local-agent-eval-cases.ts](/Users/javiervillarroel/Documents/Proyectos/AI4Devs/AI4Devs-finalproject/backend/src/mastra/evals/local-agent-eval-cases.ts).
- Cada caso incluye:
  - el mensaje,
  - el sketch/config base,
  - si debería cambiar `config.yaml`,
  - si debería cambiar `sketch.js`,
  - si debería pedir aclaración,
  - las tools esperadas en la traza,
  - y una nota concreta para revisar el resultado.

## Cómo revisar la batería en Studio

1. Abre `Datasets` y entra en `local-agent-observability-evals`.
2. Comprueba que hay 5 items y que el target es `workflow -> agent-guardrails`.
3. Abre el experimento más reciente del dataset.
4. Para cada item revisa:
   - output final del workflow,
   - score `local-agent-output-expectations`,
   - traceId asociado,
   - tool calls en la traza.
5. Usa el `score` para ver si el output visible cumple expectativas, y la traza para inspeccionar las tools usadas.

## Límite actual

- El scorer valida el output visible del workflow, no deduce automáticamente las tools esperadas.
- La comprobación fina de tools sigue haciéndose dentro de la traza del experimento en Studio, que es donde tiene sentido revisarla.
