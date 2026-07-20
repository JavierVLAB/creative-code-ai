## Context

El proyecto ya tiene reglas técnicas útiles en OpenSpec, pero el arnés de trabajo con agentes seguía modelando mal dos necesidades reales.

La primera: los subagentes no deben describirse como ayudantes para tareas simples, sino como especialistas por dominio. La motivación es que un experto en frontend pueda encargarse del frente de un problema, otro del backend/Mastra, otro de integración, otro de specs o tests, evitando que un mismo encargo mezcle demasiadas capas y malgaste tokens.

La segunda: cuando aquí se habla de hooks se habla de hooks de automatización del workflow del agente o del tooling, por ejemplo bloquear un `git push` sin checks previos o impedir editar código fuera de un change de OpenSpec aprobado.

## Goals / Non-Goals

**Goals:**

- Separar el contrato compartido del proyecto de las instrucciones específicas de cada agente.
- Reemplazar playbooks genéricos por roles especialistas de subagentes.
- Definir un catálogo de skills más alineado con CurateArtAI, incluyendo Mastra y creative coding.
- Tratar los hooks como automatizaciones del workflow y proponer hooks concretos para este repo.
- Mantener una ruta de arranque corta y navegable.

**Non-Goals:**

- Implementar hooks compartidos en `.claude/settings.json`.
- Añadir CI, PR templates o políticas de rama.
- Cambiar frontend, backend o base de datos.
- Diseñar una taxonomía infinita de skills o agentes.

## Decisions

### 1. Modelar subagentes como especialistas por dominio

El arnés definirá roles concretos: frontend specialist, backend/Mastra specialist, integration specialist, spec guardian, test strategist y sketch creative-coding specialist. La regla principal será no mezclar frontend y backend dentro del mismo subagente cuando el trabajo pueda separarse.

Alternativas consideradas:

- Mantener playbooks genéricos por tipo de tarea: se descarta porque no captura la motivación de fondo del proyecto.
- Un agente único full-stack para cada encargo: se descarta porque mezcla demasiado contexto y empeora coste y claridad.

### 2. Usar granularidad como herramienta de calidad y ahorro de tokens

La granularidad del arnés no se justifica por simplicidad, sino por especialización. Cada especialista tendrá un scope más estrecho, salidas más concretas y menos contexto irrelevante.

Alternativas consideradas:

- Granularidad mínima solo para reducir riesgo: se descarta por insuficiente.
- Fragmentar cada encargo en exceso: se descarta porque aumentaría coordinación sin aportar claridad.

### 3. Tratar hooks exclusivamente como automation hooks del workflow

En este change, `hooks` significará únicamente automatizaciones del workflow del agente o del tooling local.

Alternativas consideradas:

- Mantener una definición ambigua de hooks: se descarta porque ya generó confusión y no responde a la intención del usuario.

### 4. Ampliar el catálogo de skills hacia necesidades reales del proyecto

Además de OpenSpec, el catálogo debe cubrir:

- `mastra` para agentes, workflows, evals y runtime;
- `supabase` cuando la tarea toque auth, RLS, storage o esquema;
- un rol o skill deseado de `creative-coding-sketch` para trabajar sketches p5.js/three.js;
- skills transversales relacionadas con documentación técnica o inspección del repo cuando aporten valor real.

No todas estas piezas tienen por qué existir hoy como skill instalada, pero el arnés debe distinguir entre skills disponibles y skills deseadas para que no se pierda la necesidad.

### 5. Activar localmente dos hooks de advertencia en `.claude/settings.local.json`

El arnés no solo documentará hooks candidatos: activará localmente dos hooks de advertencia en `.claude/settings.local.json`.

Hooks activados ahora:

- advertir cuando se edita código sin changes OpenSpec no archivados;
- advertir cuando el archivo editado parece quedar fuera del scope inferido del change actual.

La implementación será local y no bloqueante. Para evitar fricción excesiva:

- no denegará tool calls;
- no requerirá aprobación manual adicional;
- mostrará una advertencia al usuario e inyectará contexto al agente.

La detección de "change aprobado" no es verificable de forma estricta desde Claude Code, así que la implementación usará una heurística honesta:

- si `openspec list --json` no devuelve changes no archivados, advertirá;
- si sí hay changes, inferirá un scope provisional a partir de rutas mencionadas en los artefactos del change más reciente y advertirá cuando la edición quede fuera.

## Risks / Trade-offs

- [Riesgo: demasiados especialistas y demasiada coordinación] → Mitigación: mantener un inventario corto y con fronteras claras.
- [Riesgo: documentar skills deseadas sin implementarlas] → Mitigación: separar explícitamente skills disponibles de skills deseadas.
- [Riesgo: convertir los hooks en una lista abstracta] → Mitigación: proponer hooks concretos con intención operativa verificable.
- [Riesgo: volver a duplicar `AGENTS.md` y `CLAUDE.md`] → Mitigación: preservar responsabilidades distintas y enlaces cortos entre ambos.

## Migration Plan

1. Reescribir `AGENTS.md` como contrato estable del proyecto.
2. Reescribir `CLAUDE.md` como overlay operativo específico.
3. Reemplazar los playbooks genéricos por especialistas por dominio.
4. Sustituir la guía de hooks por una guía de automation hooks del workflow.
5. Reescribir el catálogo de skills distinguiendo disponibles y deseadas.
6. Implementar el hook script local y referenciarlo desde `.claude/settings.local.json`.
7. Revisar el arnés completo como si fuera una sesión nueva.

No hay migración de runtime ni rollback complejo: es un cambio documental y estructural.

## Open Questions

- Si el especialista de creative coding debe convertirse más adelante en skill real o seguir como rol documentado.
- Si merece la pena añadir después un especialista de integración front-back separado del revisor general.
