## 1. Requisito previo (manual)

- [ ] 1.1 Instalar Node 24 con nvm (`nvm install 24`) **sin** cambiar el default global, y confirmar `node --version` tras `nvm use` en el repo
- [ ] 1.2 Habilitar pnpm: Corepack (`corepack enable`) o standalone (`brew install pnpm`), y confirmar `pnpm --version` → 11.9.0

## 2. Configuración de versiones

- [x] 2.1 Añadir campo `"packageManager": "pnpm@11.9.0"` a `front/package.json`
- [x] 2.2 Añadir campo `"packageManager": "pnpm@11.9.0"` a `backend/package.json` (misma versión que front)
- [x] 2.3 Crear `.npmrc` en la raíz con `auto-install-peers=true` y `strict-peer-dependencies=false`
- [x] 2.4 Crear `.nvmrc` en la raíz con `24`
- [x] 2.5 Añadir campo `engines` (node `>=24 <25`, pnpm `>=11`) a `front/package.json`
- [x] 2.6 Añadir campo `engines` (node `>=24 <25`, pnpm `>=11`) a `backend/package.json`

## 3. Regenerar lockfiles

- [x] 3.1 Eliminar `front/package-lock.json`
- [x] 3.2 Eliminar `backend/package-lock.json`
- [ ] 3.3 Con Node 24 activo (`nvm use`), ejecutar `pnpm install` en `front/` para generar `front/pnpm-lock.yaml`
- [ ] 3.4 Con Node 24 activo (`nvm use`), ejecutar `pnpm install` en `backend/` para generar `backend/pnpm-lock.yaml`

## 4. Verificación

- [ ] 4.1 Verificar `pnpm run build` pasa en `front/`
- [ ] 4.2 Verificar `pnpm run build` pasa en `backend/`
- [ ] 4.3 Verificar `pnpm test` pasa en `front/`
- [ ] 4.4 Verificar `pnpm test` pasa en `backend/`
- [ ] 4.5 Si el build falla por dependencias fantasma, declararlas explícitamente en el `package.json` correspondiente y reinstalar

## 5. Actualizar artefactos de changes abiertos

- [x] 5.1 Actualizar `npm test` → `pnpm test` en `openspec/changes/project-conventions/specs/testing-patterns/spec.md` (línea 7)
- [x] 5.2 Actualizar `npm run build`/`npm test` → `pnpm` en `openspec/changes/project-conventions/tasks.md` (tareas 3.7, 4.3, 4.4)
- [x] 5.3 Actualizar "Sin workspaces de npm" → "Sin workspaces de pnpm" en `openspec/changes/project-conventions/design.md` (línea 22)
- [x] 5.4 Actualizar `npm run build` → `pnpm run build` en `openspec/changes/refactor-backend-mastra-supabase/tasks.md` (tarea 9.4)

## 6. Documentación

- [x] 6.1 Reflejar pnpm como gestor oficial en `CLAUDE.md` si menciona comandos de instalación/build (revisado: CLAUDE.md no menciona comandos npm/install/build → sin cambios)
