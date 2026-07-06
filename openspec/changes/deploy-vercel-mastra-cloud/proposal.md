## Why

La aplicación ya está completa y funcional en local (agente Mastra + frontend + Supabase, todo en la rama `development`), pero solo corre en la máquina de desarrollo. Para la entrega necesitamos que sea accesible públicamente: el frontend en una URL estable y el backend de agentes ejecutándose como servicio gestionado. Este change define **toda la configuración de despliegue** de ambos y el único cambio de código que falta para producción (CORS).

- **Frontend (Vite + React SPA, React Router)** → **Vercel** (build estático + rewrites SPA).
- **Backend de agentes (Mastra)** → **Mastra Cloud** (push-to-deploy desde GitHub).
- **Datos** → **Supabase** ya existente (no se re-despliega; se reutiliza su Postgres para storage/observabilidad del agente y se ajusta la config de Auth para el dominio de producción).

## What Changes

- **Promoción de código**: fusionar `development` → `main` (el código real vive en `development`; `main` está desactualizado). Vercel y Mastra Cloud despliegan desde `main`.
- **CORS en el backend**: añadir `server.cors` a la instancia Mastra para aceptar el origen del frontend de Vercel (único cambio de código; hoy no existe config de CORS).
- **Despliegue del frontend en Vercel**: project root `front/`, preset Vite, variables `VITE_*`, y `vercel.json` con rewrites para el enrutado client-side de React Router.
- **Despliegue del backend en Mastra Cloud**: integración con GitHub para push-to-deploy, project root `backend/`, y variables de entorno del servidor.
- **Config de Supabase Auth**: registrar el dominio de Vercel como Site URL / Redirect URL para que login/registro funcionen en producción.
- **Documentación de despliegue**: sección de deploy en el readme con el orden de operaciones y las variables por servicio.
- **Cierre**: archivar el change `refactor-backend-mastra-supabase` (ya implementado en `development`).

## Prerequisites / State

- **Código ya implementado en `development`**: agente `sketch-agent` (`anthropic/claude-sonnet-4-6`), tools `edit_params`/`edit_sketch`/`update_memory`, workflow `agent-guardrails`, endpoint custom `POST /agent` con auth manual (Bearer → `supabase.auth.getUser`), storage/observabilidad en Postgres. Frontend consumiendo `POST ${VITE_BACKEND_URL}/agent`.
- **Supabase ya provisionado**: proyecto con esquema, RLS y migraciones (ver `supabase/migrations/` en `development`).

## Capabilities

### New Capabilities

- `deployment`: Configuración reproducible de despliegue para frontend (Vercel), backend (Mastra Cloud) y su integración (CORS, variables de entorno, auth en producción, orden de despliegue).

## Impact

- **Frontend**: nuevo `front/vercel.json` con rewrites SPA. Sin cambios de lógica (ya lee `import.meta.env.VITE_*`).
  - Variables (build-time): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_BACKEND_URL`.
- **Backend**: añadir `server.cors` en `backend/src/mastra/index.ts` para el origen de Vercel. Requiere una instancia Mastra exportada (ya existe).
  - Variables: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `DATABASE_URL`, `OBSERVABILITY_DATABASE_URL`, `OBSERVABILITY_SCHEMA`, `ANTHROPIC_API_KEY`.
- **Supabase**: ajuste de Auth (Site URL / Redirect URLs) al dominio de Vercel. Sin cambios de esquema.
- **Repo**: `front/` y `backend/` tienen workspaces y lockfiles independientes; cada destino de deploy apunta a su propio subdirectorio (no hay lockfile único en la raíz). Merge `development` → `main` como rama de despliegue.
- **Secretos**: ninguna clave se commitea; se gestionan en los dashboards de Vercel y Mastra Cloud. `.env` sigue en `.gitignore`.

## Non-Goals

- Dominio personalizado (se usan las URLs por defecto de Vercel y Mastra Cloud).
- Entornos de staging/preview separados, CI con tests como gate de deploy, o warm-up del backend.
- Cambios en la lógica de agentes, tools, workflow, esquema de datos o UI.
