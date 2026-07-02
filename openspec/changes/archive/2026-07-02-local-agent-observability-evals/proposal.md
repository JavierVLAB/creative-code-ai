## Why

Ahora mismo el desarrollador puede abrir Mastra Studio y ver que existen el agente y el workflow, pero no puede inspeccionar trazas reales ni ejecutar una batería mínima de evaluación local. Eso bloquea el trabajo iterativo sobre guardrails y comportamiento del agente porque no hay una forma corta y repetible de observar qué hace y comprobar si responde bien a prompts representativos.

## What Changes

- Añadir observabilidad local para el backend Mastra, de forma que Studio muestre trazas, tools, tiempos y fallos de las llamadas reales hechas en desarrollo.
- Definir un flujo de evaluación local del agente con una batería inicial de 5 preguntas representativas del producto.
- Hacer que esas 5 preguntas puedan revisarse en Mastra como base para validar comportamiento, guardrails y calidad antes de desplegar cambios.
- Mantener este alcance solo para desarrollo local; la parte de evaluaciones no se extiende a producción en este change.

## Capabilities

### New Capabilities
- `agent-local-observability`: El desarrollador puede ver trazas locales del agente en Mastra Studio y ejecutar una evaluación local inicial con 5 preguntas.

### Modified Capabilities

## Impact

- Backend Mastra en `backend/src/mastra/index.ts` y su configuración de storage/observability local.
- Posibles archivos nuevos para dataset, scorers o scripts de evaluación local en `backend/src/mastra/` o una carpeta de evals equivalente.
- Dependencias de observabilidad/evals de Mastra necesarias para desarrollo local.
- Flujo de desarrollo del equipo para validar el agente antes de tocar producción.
