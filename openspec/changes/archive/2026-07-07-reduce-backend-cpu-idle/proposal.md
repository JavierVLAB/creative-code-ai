## Why

El backend en Mastra Cloud **acumula CPU (16,2 h en menos de un día) sin que nadie use el demo**: el contador sube aunque no haya tráfico (sin logs desde ayer 18:30). El objetivo del usuario es explícito: **no quiere gasto**, y acepta que la experiencia en la nube se degrade con tal de conseguirlo.

Comparando con otro proyecto Mastra del usuario (`propelland`) que **sí** hiberna cuando está idle, la única diferencia estructural está en la config de la instancia Mastra (`backend/src/mastra/index.ts`):

| | `propelland` (hiberna) | `curateartai-backend` (no hiberna) |
|---|---|---|
| Observability | ausente | `new Observability({ enabled: true })` |
| Storage | `LibSQLStore` (local) | `PostgresStoreVNext` → Supabase externo |

**Hipótesis** (no documentada por Mastra, a verificar empíricamente): las **conexiones persistentes al Postgres externo** —más los flushers de observability escribiendo a ese mismo Postgres— mantienen el proceso "ocupado" e impiden que Mastra Cloud lo hiberne. `propelland` usa SQLite local, sin conexiones de red salientes persistentes, por eso puede quedar realmente inactivo y dormirse.

Además, la spec `agent-local-observability` ya define la observabilidad como un asunto **local de desarrollo**; el código actual la activa también en producción, lo que contradice esa intención.

## What Changes

- **Observability solo en local**: dejar de activar `Observability` en el runtime de Mastra Cloud. Se mantiene disponible en desarrollo (donde es gratis y útil para ver trazas en Studio, según `agent-local-observability`).
- **Storage sin conexiones persistentes externas**: sustituir `PostgresStoreVNext` (apuntando a Supabase) por el patrón de `propelland` (`LibSQLStore` local / storage que gestiona la plataforma), para eliminar las conexiones que impiden la hibernación.
- **Verificación empírica de la hipótesis**: tras redesplegar, observar si el contador de CPU deja de subir en idle. Si NO deja de subir, la hipótesis era incorrecta y se escala a soporte de Mastra.

## Prerequisites / State

- **Acción operativa inmediata (fuera de código, para coste cero ya)**: pausar el Server con `npx mastra server pause --project curateartai-backend`. Studio no tiene comando de pausa; se gestiona con soporte de Mastra por separado.
- El agente usa memoria de conversación por proyecto (`memory: { thread, resource }` en `agent-guardrails.ts`), hoy persistida en el Postgres de Supabase. Este change asume que su degradación en la nube es **aceptable** (requisito explícito del usuario).
- Config afectada única: `backend/src/mastra/index.ts` (bloques `observability` y `storage`).

## Capabilities

### Modified Capabilities

- `deployment`: el backend en Mastra Cloud debe poder hibernar en idle; la observabilidad no se ejecuta en el runtime de producción.

## Impact

- **Backend**: `backend/src/mastra/index.ts` — se elimina/condiciona `observability`; se cambia `storage` de `PostgresStoreVNext` a `LibSQLStore` (o equivalente local gestionado por la plataforma).
- **Variables de entorno**: dejan de usarse en producción `OBSERVABILITY_DATABASE_URL` y `OBSERVABILITY_SCHEMA`. `DATABASE_URL` (pooler de Supabase) deja de ser necesaria para el storage del agente en cloud (revisar si se usa en otro punto antes de retirarla).
- **Memoria del agente en la nube**: puede dejar de persistir entre sesiones (aceptado). En local sigue igual.
- **Trazas en la nube**: dejan de estar disponibles en Mastra Cloud (aceptado). En local siguen visibles en Studio.
- **Dependencias**: si se abandona por completo `PostgresStoreVNext`/`@mastra/pg`, evaluar retirar la dependencia (la instalación/retirada la hace Javi).

## Non-Goals

- Resolver el consumo de **Studio** por código (no tiene comando de pausa; se gestiona con soporte de Mastra).
- Optimizar coste de LLM (Anthropic) o warm-up/cold-start.
- Rediseñar la memoria del agente para que persista sin conexiones externas (posible trabajo futuro si se quiere recuperar la experiencia en la nube).
