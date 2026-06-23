## Why

El proyecto usa npm (con `package-lock.json` en `front/` y `backend/`), pero queremos adoptar pnpm como gestor de paquetes oficial: instalaciones más rápidas, ahorro de disco vía store global con enlaces duros, y un lockfile más estricto que evita dependencias fantasma. Hacerlo ahora —antes de avanzar con los changes abiertos (`project-conventions`, `refactor-backend-mastra-supabase`)— evita reescribir referencias a comandos npm más adelante.

Aprovechamos el mismo change para fijar la versión de Node: el proyecto ya tipa contra `@types/node` ^24, y Node 24 es la Active LTS actual, mientras que Node 22 pasó a mantenimiento. Fijar Node antes de generar los `pnpm-lock.yaml` es importante porque el lockfile registra la versión de Node usada.

## What Changes

- **BREAKING** Sustituir npm por pnpm como único gestor de paquetes. Quien clone el repo deberá usar `pnpm`, no `npm`.
- Eliminar `front/package-lock.json` y `backend/package-lock.json`; generar `pnpm-lock.yaml` en cada paquete.
- Declarar la versión de pnpm con el campo `packageManager` en cada `package.json`.
- Fijar Node 24 como versión del proyecto: añadir `.nvmrc` y el campo `engines` (node + pnpm) en cada `package.json`.
- Añadir un `.npmrc` con la configuración base de pnpm.
- Actualizar las referencias a comandos `npm` en los artefactos de los changes abiertos (`testing-patterns/spec.md`, `project-conventions/tasks.md`, `project-conventions/design.md`, `refactor-backend-mastra-supabase/tasks.md`) a su equivalente `pnpm`.
- No se introducen workspaces de pnpm: se mantienen `front/` y `backend/` como paquetes independientes, igual que hoy.

## Capabilities

### New Capabilities
- `package-manager`: define pnpm como gestor de paquetes oficial del proyecto, la versión de Node del proyecto, la forma de fijar ambas versiones y los comandos canónicos para instalar, construir, testear y desarrollar.

### Modified Capabilities
<!-- Ninguna capability archivada en openspec/specs/ todavía; las referencias a npm en changes abiertos se actualizan como tareas, no como deltas de spec. -->

## Impact

- **Lockfiles**: se borran los dos `package-lock.json` y se crean dos `pnpm-lock.yaml`.
- **package.json**: `front/` y `backend/` añaden los campos `packageManager` y `engines`.
- **Config nueva**: `.npmrc` y `.nvmrc` en la raíz.
- **Artefactos OpenSpec abiertos**: actualizar comandos `npm` → `pnpm` en `project-conventions` y `refactor-backend-mastra-supabase`.
- **Requisito de entorno**: pnpm no está instalado y la máquina corre Node 22; el desarrollador deberá instalar Node 24 (vía nvm, sin cambiar su default global) y habilitar pnpm (Corepack o instalación standalone) antes de regenerar lockfiles. El repo declara las versiones, pero el aislamiento por-proyecto depende del uso de nvm local.
- Sin cambios en código de aplicación ni en dependencias instaladas (solo cambia la herramienta que las gestiona).
