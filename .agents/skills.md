# Skills del proyecto

Este proyecto necesita algo más que skills genéricas de proceso.
Aquí distinguimos entre skills disponibles hoy y skills deseadas por el tipo de producto que estamos construyendo.

## Skills disponibles y prioritarias

### `openspec-explore`

Para entender, mapear, comparar opciones y detectar riesgos antes de formalizar un cambio.

### `openspec-propose`

Para crear o actualizar un change cuando el trabajo todavía no está formalizado.

### `openspec-apply-change`

Para implementar tareas de un change aprobado.

### `openspec-archive-change`

Para cerrar un change completado y revisado.

### `mastra`

Para cualquier trabajo serio sobre:

- agents,
- tools,
- workflows,
- memory,
- evals,
- Studio,
- problemas de runtime o despliegue relacionados con Mastra.

### `supabase`

Para cualquier trabajo que toque:

- auth,
- RLS,
- esquema,
- storage,
- `supabase-js`,
- SSR o integración con sesiones.

### `product-design`

Como dominio deseable separado del frontend para problemas de:

- layout,
- interacción,
- jerarquía visual,
- flujo del workspace,
- coherencia del sistema visual.

## Skills deseadas para CurateArtAI

Estas necesidades existen aunque todavía no estén cubiertas por una skill formal instalada.

### `creative-coding-sketch`

Especialista en p5.js, three.js, geometría generativa, sistemas visuales, parametrización de sketches y restricciones de creative coding.

Motivación:

- generar y modificar sketches con más criterio artístico y técnico,
- entender mejor el contrato entre `config.yaml`, parámetros y runtime visual,
- evitar que un agente generalista trate el sketch como código web cualquiera.

### `frontend-workspace-ux`

Especialista en la experiencia del workspace: paneles, flujo de edición, chat, snapshots, iframe y ergonomía del producto.

### `database-supabase`

Especialista en modelo de datos, RLS, auth, storage, migraciones y queries reales del proyecto.

### `deployment-runtime`

Especialista en Vercel, Mastra Cloud, entornos, variables, observabilidad y comportamiento operativo.

### `agent-integration`

Especialista en el punto de unión entre frontend y backend:

- contrato `POST /agent`,
- aplicación de respuestas estructuradas,
- persistencia,
- errores,
- memoria y guardrails vistos desde la integración.

### `technical-doc-writer`

Especialista en documentación técnica del producto para README, handoffs, deltas de arquitectura y materiales de entrega.

## Regla práctica

No elegir skill por costumbre.
Elegirla por dominio.

Primero decide qué tipo de problema tienes:

- proceso OpenSpec,
- frontend workspace,
- backend Mastra,
- Supabase,
- datos y auth,
- despliegue y runtime,
- sketch creative coding,
- integración,
- diseño de producto,
- documentación.

Después elige la skill o, si no existe, el especialista documentado más cercano.
