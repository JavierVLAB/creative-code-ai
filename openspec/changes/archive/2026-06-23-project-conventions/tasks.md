## 1. Crear estructura de directorios

- [x] 1.1 Crear `front/` con `src/lib/`, `src/components/`, `src/hooks/`, `src/constants/`, `public/`
- [x] 1.2 Crear `backend/` con `src/mastra/agents/`, `src/mastra/tools/`, `src/mastra/workflows/`
- [x] 1.3 Crear `shared/` con `types.ts` base
- [x] 1.4 Crear `supabase/migrations/` para migraciones SQL versionadas

## 2. Configuración de herramientas

- [x] 2.1 Crear `front/package.json` con Vite + React 19 + TypeScript + Tailwind + CodeMirror
- [x] 2.2 Crear `front/vite.config.ts`, `front/tsconfig.json`, `front/eslint.config.js`
- [x] 2.3 Crear `backend/package.json` con Mastra + Hono + Zod + Supabase client
- [x] 2.4 Crear `backend/tsconfig.json` (strict, verbatimModuleSyntax)

## 3. Documentar convenciones

- [x] 3.1 Añadir a `CLAUDE.md` referencias a los specs de convenciones
- [x] 3.2 Añadir ejemplo de componente React con Tailwind en `front/src/components/_example/`
- [x] 3.3 Añadir ejemplo de tool Mastra en `backend/src/mastra/tools/_example.ts`
- [x] 3.4 Añadir ejemplo de hook en `front/src/hooks/_example.ts`
- [x] 3.5 Añadir ejemplo de tipo compartido en `shared/_example.ts`
- [x] 3.6 Añadir ejemplo de test en `front/src/lib/_example.test.ts`
- [x] 3.7 Verificar que `pnpm run build` y `pnpm test` pasan en front y backend

## 4. Configurar test runners

- [x] 4.1 Añadir Vitest a `front/package.json` con config `vitest.config.ts`
- [x] 4.2 Añadir Vitest a `backend/package.json` con config
- [x] 4.3 Añadir script `pnpm test` en front y backend
- [x] 4.4 Verificar que `pnpm test` ejecuta y pasa
