## Context

El repo tiene dos paquetes independientes (`front/`, `backend/`), cada uno con su `package.json` y su `package-lock.json` de npm. No hay root `package.json`, ni workspaces, ni CI, ni README. La convención actual (en el change `project-conventions`) es explícita: "Sin workspaces de npm para mantenerlo simple". Hay dos changes abiertos cuyos artefactos referencian comandos `npm`.

pnpm no está instalado en la máquina de desarrollo. La vía recomendada para fijar su versión es Corepack (incluido con Node ≥ 16.9), que lee el campo `packageManager` del `package.json`.

La máquina corre Node 22 (Maintenance LTS), pero el proyecto tipa contra `@types/node` ^24 y Node 24 es la Active LTS actual. Se fija Node 24 dentro de este mismo change porque el `pnpm-lock.yaml` registra la versión de Node usada al generarlo: conviene fijar Node *antes* de regenerar los lockfiles.

## Goals / Non-Goals

**Goals:**
- Adoptar pnpm como gestor oficial sin cambiar las dependencias instaladas ni el código.
- Fijar versiones reproducibles de pnpm y de Node entre desarrolladores.
- Dejar los artefactos de los changes abiertos coherentes con pnpm.

**Non-Goals:**
- No se introducen workspaces de pnpm (se respeta la convención de paquetes independientes).
- No se actualizan versiones de dependencias.
- No se crea CI ni se automatiza la instalación de pnpm.
- No se modifica la versión de Node por defecto del sistema; el aislamiento es por-proyecto.

## Decisions

**1. Fijar pnpm vía Corepack + campo `packageManager`.**
Se añade `"packageManager": "pnpm@<versión>"` a `front/package.json` y `backend/package.json`. Corepack garantiza que todos usen la misma versión sin instalación global manual.
- *Alternativa descartada*: instalar pnpm globalmente sin fijar versión → deriva en versiones distintas entre máquinas.

**2. Mantener dos paquetes independientes (sin workspace).**
Cada paquete conserva su propio `pnpm-lock.yaml`. Se respeta la convención existente y se evita refactorizar la estructura.
- *Alternativa descartada*: `pnpm-workspace.yaml` en la raíz → cambio mayor de estructura, fuera de alcance.

**3. `.npmrc` en la raíz con configuración base de pnpm.**
Se añade un `.npmrc` con opciones conservadoras (p. ej. `auto-install-peers=true`, `strict-peer-dependencies=false`) para evitar fricción con peer deps al regenerar lockfiles. pnpm respeta `.npmrc`.
- *Alternativa descartada*: dejar la configuración por defecto → mayor riesgo de fallos por peer deps estrictas al primer `pnpm install`.

**4. Regenerar lockfiles, no convertirlos a mano.**
Se borran los `package-lock.json` y se ejecuta `pnpm install` en cada paquete para generar `pnpm-lock.yaml` desde los rangos de versiones del `package.json`.

**5. Fijar Node 24 vía `.nvmrc` + `engines`, aislado por proyecto.**
Se añade `.nvmrc` con `24` en la raíz y `engines` (node + pnpm) en cada `package.json`. El desarrollador instala Node 24 con nvm (`nvm install 24`) y lo activa por proyecto (`nvm use`), **sin** cambiar su default global. El repo declara la versión; el aislamiento real lo da nvm local.
- *Alternativa descartada*: cambiar el Node por defecto del sistema → afectaría a otros proyectos, contrario a lo pedido.
- *Alternativa descartada*: fijar versión exacta en `.nvmrc` (p. ej. `24.x.y`) → más mantenimiento; el major `24` basta y coge la última 24 instalada.

**6. pnpm disponible globalmente, versión por proyecto.**
La vía recomendada es Corepack (`corepack enable`), que deja pnpm disponible en cualquier proyecto pero con la versión que fija cada `packageManager`. Si se prefiere pnpm totalmente desligado de Node, instalación standalone (`brew install pnpm`); en ese caso `packageManager` queda como documentación. Esta elección es de la máquina del desarrollador, no del repo.

## Risks / Trade-offs

- **pnpm no instalado en la máquina** → Mitigación: el desarrollador habilita pnpm (Corepack: `corepack enable && corepack prepare pnpm@<versión> --activate`, o instalación global) antes de regenerar lockfiles. Es un paso manual previo a la implementación.
- **Dependencias fantasma** (paquetes usados sin declararse, que npm permitía por su node_modules plano) podrían romper el build con la estructura estricta de pnpm → Mitigación: verificar `pnpm run build` y `pnpm test` en front y backend tras la migración; declarar explícitamente cualquier dependencia que falte.
- **Resolución de peer deps más estricta** → Mitigación: `.npmrc` con `strict-peer-dependencies=false` inicialmente; endurecer más adelante si se desea.
- **Versión de pnpm fijada**: pnpm 11.9.0 (última estable al implementar).
- **Cambio de Node 22 → 24** podría exponer APIs deprecadas o cambios de comportamiento en runtime → Mitigación: el stack (Vite 8, Mastra 1.x, Vitest 3) soporta Node 24; se verifica build y test tras el cambio.
- **`engines` no se fuerza por defecto** (sin `engine-strict`): es declarativo, no bloquea instalación → se puede endurecer con `engine-strict=true` en `.npmrc` más adelante si se desea.

## Migration Plan

1. (Manual) Instalar Node 24 con nvm (`nvm install 24`, sin cambiar el default) y habilitar pnpm (Corepack o standalone).
2. Añadir `packageManager` y `engines` a los dos `package.json`; crear `.npmrc` y `.nvmrc`.
3. Borrar `front/package-lock.json` y `backend/package-lock.json`.
4. `nvm use` + `pnpm install` en `front/` y en `backend/` → genera `pnpm-lock.yaml` con Node 24.
5. Verificar `pnpm run build` y `pnpm test` en ambos.
6. Actualizar referencias `npm` → `pnpm` en los artefactos de los changes abiertos.

**Rollback**: restaurar los `package-lock.json` desde git, borrar `pnpm-lock.yaml`, `.npmrc` y `.nvmrc`, y revertir los `package.json`. Sin impacto en código de aplicación. La versión de Node del sistema no se tocó, así que no hay nada que revertir ahí.

## Open Questions

- Ninguna pendiente. Decisiones cerradas: pnpm 11.9.0, Node 24 (major en `.nvmrc`), `.npmrc` único en la raíz, sin `engine-strict` por ahora.
