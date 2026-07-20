# CurateArtAI — Resumen de sesión (20-jul-2026)

En esta sesión reforzamos el arnés del proyecto antes de pasar al trabajo por pull requests.

Hicimos tres cosas principales:

- reorganizamos `AGENTS.md`, `CLAUDE.md` y `.agents/` para separar contrato del proyecto, operación diaria y playbooks reutilizables;
- redefinimos los subagentes como especialistas por dominio, no como agentes genéricos;
- ampliamos el catálogo de skills y añadimos hooks de advertencia para OpenSpec.

También se implementó el hook compartible en `.claude/settings.json`, con el script en `.claude/hooks/warn_openspec_scope.py`. El comportamiento es no bloqueante: avisa si se edita sin change activo o fuera del scope inferido.


