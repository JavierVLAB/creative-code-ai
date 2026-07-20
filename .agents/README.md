# Arnes de agentes

Este directorio contiene la capa operativa corta del proyecto.
Sirve para arrancar una sesión nueva sin releer toda la documentación del repo.

## Ruta de arranque

1. Lee [`../AGENTS.md`](../AGENTS.md).
2. Revisa si hay un change activo con `openspec list --json`.
3. Lee el documento mínimo necesario:
   - [`session-start.md`](./session-start.md) para arrancar una sesión.
   - [`skills.md`](./skills.md) para decidir qué skill usar.
   - [`hooks.md`](./hooks.md) si la tarea menciona automation hooks o reglas del workflow.
   - [`playbooks/`](./playbooks/) si vas a delegar a un especialista.

## Qué vive aquí

- `session-start.md`: checklist de arranque.
- `skills.md`: catálogo de skills disponibles y skills deseadas del proyecto.
- `hooks.md`: catálogo de automation hooks del workflow.
- `playbooks/`: especialistas reutilizables por dominio.

## Principio de uso

Lee poco, pero en orden.
Si una tarea requiere profundizar, abre luego las specs o el código relevante; no al revés.
