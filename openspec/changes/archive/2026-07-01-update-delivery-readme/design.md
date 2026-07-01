## Context

El README debe cumplir una plantilla externa de entrega con ficha, producto, arquitectura, modelo de datos, API, historias, tickets y PRs. El proyecto ya tiene informacion tecnica actualizada en `readme.md` y contenido de producto mas completo en `readme-doc-refactor.md`.

## Goals / Non-Goals

**Goals:**
- Consolidar en `readme.md` lo necesario para la entrega.
- Reutilizar contenido de producto existente sin introducir contradicciones con la rama actual.
- Documentar como pendiente lo que aun no esta cerrado, especialmente despliegue, URLs, demo visual y PRs.
- Mantener instrucciones de ejecucion local con pnpm y sin lanzar servidores desde Codex.

**Non-Goals:**
- No cambiar codigo de aplicacion.
- No inventar URLs, despliegues, credenciales ni PRs.
- No eliminar el bloque final `Lidr Creative Demo 26`.

## Decisions

- Usar el README actual como fuente tecnica principal porque ya refleja `POST /agent`, `projects.memory` y la estructura frontend/backend/Supabase.
- Tomar de `readme-doc-refactor.md` solo contenido de producto estable: vision, problema, posicionamiento, objetivos y metricas.
- Mantener tickets representativos en vez de copiar los 30 tickets completos; la plantilla pide tres y el README actual ya documenta cuatro relevantes.
- Dejar despliegue como pendiente cuando no haya datos confirmados, pero explicar la arquitectura prevista.

## Risks / Trade-offs

- Pendientes visibles en la entrega -> Mitigacion: marcarlos explicitamente como pendientes y no presentarlos como hechos.
- Documento demasiado largo -> Mitigacion: incorporar producto de forma compacta y conservar los detalles tecnicos que ya cumplen la plantilla.
