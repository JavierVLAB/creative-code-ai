## Why

El arnés actual todavía no refleja la motivación real del proyecto. No se busca delegar tareas genéricas y simples, sino repartir el trabajo entre especialistas por dominio para mejorar calidad, reducir mezcla de contexto entre frontend y backend y bajar el consumo de tokens con encargos más granulares. Además, la conversación sobre hooks no trata de React, sino de automatizaciones del workflow del agente que hoy solo existen como reglas escritas.

## What Changes

- Redefinir el arnés documental del proyecto para separar responsabilidades entre `AGENTS.md`, `CLAUDE.md` y `.agents/`.
- Sustituir los playbooks genéricos por roles especialistas de subagentes con fronteras claras entre frontend, backend, integración, specs, testing y creative coding.
- Documentar un catálogo de skills del proyecto que incluya OpenSpec, Mastra, Supabase y necesidades específicas de CurateArtAI como creative coding para sketches.
- Definir el espacio de automation hooks del workflow y activar localmente dos advertencias en `.claude/settings.local.json`: edición sin change activo y edición fuera del scope inferido del change.
- Mantener un arranque de sesión corto y una navegación clara para que cualquier agente use el arnés sin releer todo el repo.

## Capabilities

### New Capabilities
- `developer-harness`: contrato operativo del proyecto para sesiones de agentes, documentos de arranque y separación de responsabilidades entre archivos de instrucciones.
- `specialist-subagents`: sistema de roles expertos por dominio con fronteras de trabajo y formatos de salida específicos.
- `workflow-hooks`: catálogo y definición de hooks de automatización para el workflow del agente en este proyecto.
- `project-skill-catalog`: catálogo de skills instalados, skills prioritarios y skills deseados para las necesidades reales del proyecto.

### Modified Capabilities

Ninguna.

## Impact

- Afecta a `AGENTS.md`, `CLAUDE.md` y a nuevos documentos bajo `.agents/`.
- Afecta también a `.claude/settings.local.json` y a scripts locales de hooks dentro de `.claude/`.
- No cambia APIs, modelo de datos ni dependencias.
- Prepara mejor el proyecto para trabajo multiagente especializado y para futuras automatizaciones del workflow sin mezclar todavía CI o PRs.
