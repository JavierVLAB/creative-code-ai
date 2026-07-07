## Context

El backend Mastra desplegado en Mastra Cloud acumula CPU en idle. Diagnóstico verificado:

- **Sin tráfico**: no hay logs de request desde ayer 18:30, pero el contador de CPU hours sigue subiendo → el consumo no viene de peticiones al demo.
- **No hiberna**: a diferencia del proyecto `propelland` del mismo usuario, que sí se duerme cuando no se usa.
- **Única diferencia estructural** entre ambos (verificada leyendo el código de los dos): `curateartai-backend` activa `Observability` y usa `PostgresStoreVNext` contra un Postgres externo (Supabase); `propelland` no tiene observability y usa `LibSQLStore` local.

Fuentes consultadas: la documentación de Mastra Cloud **no documenta** su lógica de hibernación ni confirma que las conexiones persistentes la impidan. Por tanto la causa raíz es una **hipótesis razonada, a verificar empíricamente tras el deploy**, no un hecho documentado.

Requisito del usuario que enmarca las decisiones: **coste cero prioritario; degradar la experiencia en la nube es aceptable.**

## Goals / Non-Goals

**Goals:**
- Que el backend en Mastra Cloud deje de acumular CPU cuando está idle (que pueda hibernar).
- Que la observabilidad no se ejecute en el runtime de producción (alinea con la spec `agent-local-observability`).
- Mantener el desarrollo local intacto (trazas en Studio, memoria del agente).

**Non-Goals:**
- Parar Studio por código (sin comando; vía soporte de Mastra).
- Preservar la memoria/trazas del agente en la nube.
- Cambios en agente, tools, workflow o esquema de datos.

## Decisions

### 1. Observability solo en local (condicionada por entorno)
Se deja de pasar `Observability` a la instancia Mastra cuando corre en Mastra Cloud. Opciones de implementación:
- **(a)** Condicionar el bloque a una variable de entorno (p. ej. activar solo si `NODE_ENV !== 'production'` o una var explícita tipo `ENABLE_OBSERVABILITY`).
- **(b)** Eliminar el bloque del código y activarlo solo en el arranque de desarrollo.

Preferida: **(a)** con variable explícita, para no perder la observabilidad local que exige `agent-local-observability` y poder reactivarla puntualmente. Alternativa (b) es más simple pero borra la capacidad local si no se recuerda reañadirla.

### 2. Storage: alinear con `propelland` (sin conexiones externas persistentes)
Se sustituye `PostgresStoreVNext` (Supabase) por `LibSQLStore` local, replicando el patrón del proyecto que sí hiberna. El comentario del código de `propelland` indica que *"en Mastra Cloud el platform inyecta su propio storage y este se ignora"* — si eso se cumple, la memoria del agente seguiría funcionando con el storage gestionado por la plataforma; si no, la memoria será efímera en la nube. Ambos resultados son **aceptables** por el requisito del usuario.

Alternativa considerada: **managed database de Mastra Cloud** (provisionada en el dashboard). Se descarta por ahora porque sigue siendo una conexión gestionada cuyo efecto sobre la hibernación es incierto, y añade configuración; el objetivo inmediato es coste cero, no preservar memoria.

### 3. Verificación empírica antes de dar por buena la hipótesis
Como la causa raíz no está documentada, el éxito se mide observando el dashboard tras redesplegar: el contador de CPU debe **dejar de subir en idle**. Si sigue subiendo, la hipótesis (conexiones/observability) era incorrecta y el siguiente paso es abrir ticket con soporte de Mastra, no seguir tocando el código a ciegas.

### 3.bis Preflight del deploy: `--skip-preflight` intencional
El preflight de `mastra server deploy` bloquea con `[LOCAL_STORAGE_PATH]` al detectar `file:./mastra.db` (avisa de que un SQLite local no persiste). Es **intencional**: el storage local sin conexiones de red es justo lo que permite hibernar, y la memoria efímera está aceptada. La sugerencia del preflight (Turso/Postgres hosteado) se descarta porque reintroduciría la conexión persistente que causaba el problema. Se despliega con `--skip-preflight`. El warning `[MISSING_ENV_VAR] ENABLE_OBSERVABILITY` es benigno: el código tiene fallback (`=== 'true'`), y su ausencia en cloud es lo deseado (observability off).

### 4. Acción operativa inmediata desacoplada del código
Para "no gastar nada ya", el usuario pausa el Server (`mastra server pause`) **antes** de implementar este change. La pausa es reversible (`mastra server restart`) y no depende de este cambio de código. El change es el arreglo de fondo para cuando el Server vuelva a encenderse.

## Risks / Trade-offs

- **[La hipótesis puede ser incorrecta]** Quitar Postgres externo + observability podría no bastar si Mastra Cloud no hiberna por otro motivo. Mitigación: verificación empírica (Decisión 3) y escalado a soporte.
- **[Pérdida de memoria del agente en la nube]** El agente puede dejar de recordar la conversación entre sesiones en producción. Mitigación: aceptado explícitamente; recuperable en un change futuro si se desea.
- **[Pérdida de trazas en la nube]** Sin observability en cloud no hay debugging remoto. Mitigación: se conserva en local; aceptado.
- **[Variables/dependencias huérfanas]** `OBSERVABILITY_*` y `@mastra/pg`/`DATABASE_URL` podrían quedar sin uso. Mitigación: revisar usos antes de retirar; la gestión de dependencias la hace Javi.
- **[Studio sigue consumiendo]** Este change no lo resuelve. Mitigación: fuera de alcance; gestión vía soporte de Mastra.
