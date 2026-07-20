# CurateArtAI — CLAUDE.md

## Propósito

Este archivo es el overlay operativo para Claude/OpenCode en este repo.
El contrato general del proyecto vive en [`AGENTS.md`](./AGENTS.md). La navegación corta y los especialistas viven en [`.agents/README.md`](./.agents/README.md).

## Arranque mínimo

Antes de trabajar:

1. Lee `AGENTS.md`.
2. Lee `.agents/README.md`.
3. Comprueba si hay un change activo en OpenSpec.
4. Si la tarea pertenece a un dominio claro, usa el especialista correspondiente antes de improvisar instrucciones.

## Cómo trabajar aquí

- Usa OpenSpec como fuente de verdad para cambios de producto o arquitectura.
- Mantén los cambios pequeños, explícitos y comprobables.
- Si una tarea es exploratoria, quédate en modo exploración hasta que haya una propuesta clara.
- Si una tarea es de implementación, sigue el change activo y marca tareas conforme las cierres.

## Delegación a subagentes

Claude/OpenCode debe preferir especialistas por dominio:

- frontend specialist,
- backend/Mastra specialist,
- database/Supabase specialist,
- deployment/runtime specialist,
- product-design specialist,
- integration specialist,
- spec guardian,
- test strategist,
- sketch creative-coding specialist.

Antes de delegar:

1. Elige el especialista en `.agents/playbooks/`.
2. Pasa contexto mínimo suficiente.
3. Define salida esperada y verificación.
4. Evita que un mismo especialista mezcle frontend y backend si el trabajo puede separarse.

## Skills prioritarios

Consulta [`.agents/skills.md`](./.agents/skills.md).

Regla práctica:

- `openspec-explore` para pensar y mapear.
- `openspec-propose` para formalizar trabajo nuevo.
- `openspec-apply-change` para implementar un change aprobado.
- `openspec-archive-change` para cerrar trabajo completado.
- `mastra` para agents, workflows, evals y runtime.
- `supabase` para auth, RLS, storage y esquema.
- `creative-coding-sketch` como necesidad específica del proyecto, aunque todavía no exista como skill instalada.

## Hooks

Consulta [`.agents/hooks.md`](./.agents/hooks.md) antes de interpretar una petición sobre "hooks".

- Aquí `hooks` significa automation hooks del workflow y del tooling.

## Respuesta y prompting

- Sé directo y breve.
- Si el usuario trae un prompt, revísalo críticamente antes de ejecutarlo.
- Si la mejora es obvia y segura, mejóralo y sigue.
- Si cambia el alcance, pide confirmación.

## Qué no debe pasar

- No duplicar reglas largas que ya viven en `AGENTS.md`.
- No inventar especialistas ad hoc si ya existe uno reusable.
- No saltarse el flujo de propose/aprobación/apply cuando aplique.
