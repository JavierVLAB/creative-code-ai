## Context

La app está completa en la rama `development`: frontend Vite/React (SPA con React Router) que consume el backend Mastra vía `POST ${VITE_BACKEND_URL}/agent`, y backend Mastra con agente, tools, workflow de guardrails y storage/observabilidad en el Postgres de Supabase. `main` está 163 archivos por detrás.

El objetivo del design de referencia (`refactor-backend-mastra-supabase`) mencionaba Render para el backend; **este change lo sustituye por Mastra Cloud** (nativo de la plataforma, push-to-deploy, empaqueta agente+tools+workflow atómicamente).

Restricciones verificadas en el código:
- Endpoint real: `POST /agent` (ruta custom en `server.apiRoutes`), no la ruta por defecto de Mastra. Auth manual con Bearer token.
- Modelo: `anthropic/claude-sonnet-4-6` (Mastra model router) → requiere `ANTHROPIC_API_KEY` en el backend.
- No hay `server.cors` configurado → el navegador bloquearía las llamadas cross-origin desde Vercel.
- `front/` y `backend/` son workspaces independientes (cada uno su `pnpm-workspace.yaml` y lockfile).

## Goals / Non-Goals

**Goals:**
- Frontend público en Vercel con enrutado SPA correcto.
- Backend de agentes público en Mastra Cloud con push-to-deploy desde `main`.
- Integración funcional en producción: CORS, variables de entorno, auth de Supabase con el dominio de Vercel.
- Orden de despliegue documentado y reproducible.

**Non-Goals:**
- Dominio propio, staging/preview, CI-gating, warm-up.
- Cualquier cambio de lógica de la aplicación (salvo CORS).

## Decisions

### 1. Backend en Mastra Cloud (sustituye a Render)
Mastra Cloud despliega la instancia Mastra directamente (detecta `mastra build`, empaqueta agente/tools/workflow). Se conecta el repo de GitHub con push-to-deploy. Alternativa considerada: Render/Docker. Se descarta porque Mastra Cloud es nativo, sin Dockerfile ni configuración de servidor manual.

### 2. Rama de despliegue: `main`
Se fusiona `development` → `main` y ambos servicios despliegan desde `main` (convención producción). Alternativa: desplegar desde `development`. Se descarta para no dejar `main` como rama muerta.

### 3. Project root por servicio (no monorepo unificado)
Vercel apunta a `front/`; Mastra Cloud apunta a `backend/`. Cada uno resuelve dependencias con su propio lockfile. Es el patrón recomendado por Mastra Cloud (seleccionar el directorio de la app, no la raíz del repo). No se unifica en un lockfile raíz porque los workspaces ya están separados y funcionan.

### 4. CORS explícito en la instancia Mastra
Se añade `server.cors` en `backend/src/mastra/index.ts` con `origin` = dominio de Vercel (más `http://localhost:5173` para dev) y `allowHeaders: ['Content-Type', 'Authorization']`. El origen se lee de una variable (`FRONTEND_ORIGIN` o similar) para no hardcodear la URL de Vercel. Alternativa: `origin: '*'`. Se descarta porque las llamadas llevan `Authorization` y conviene restringir el origen.

### 5. Variables de entorno: mismos nombres que en local
Se reutilizan los nombres de `.env.example` para que el código no cambie. Se configuran en los dashboards (nunca en el repo):

| Servicio | Variables |
|----------|-----------|
| Vercel (front) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_BACKEND_URL` |
| Mastra Cloud (backend) | `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `DATABASE_URL`, `OBSERVABILITY_DATABASE_URL`, `OBSERVABILITY_SCHEMA`, `ANTHROPIC_API_KEY` |

### 6. Orden de despliegue (resuelve la dependencia circular de URLs)
El frontend necesita la URL del backend y el backend necesita el origen del frontend. Orden:
1. Deploy backend en Mastra Cloud → se obtiene su URL estable.
2. Deploy frontend en Vercel con `VITE_BACKEND_URL` = URL del backend → se obtiene el dominio de Vercel.
3. Actualizar `FRONTEND_ORIGIN` (CORS) en Mastra Cloud y redesplegar el backend.
4. Registrar el dominio de Vercel en Supabase Auth (Site URL / Redirect URLs).

### 7. Rewrites SPA en Vercel
`front/vercel.json` con `rewrites` de `/(.*)` → `/index.html` para que las rutas de React Router carguen en refresh/deep-link.

## Risks / Trade-offs

- **[URL del backend cambia entre deploys]** Si Mastra Cloud no fija una URL estable, romper CORS/`VITE_BACKEND_URL`. Mitigación: usar la URL estable de proyecto que ofrece Mastra Cloud y no la de cada deployment.
- **[Secretos mal ubicados]** `SUPABASE_SECRET_KEY` es service role: nunca debe acabar en el frontend. Mitigación: solo variables `VITE_*` en Vercel; el resto solo en Mastra Cloud.
- **[Coste/cuota LLM en producción]** El agente llama a Anthropic en cada turno. Mitigación: aceptado para la entrega; el guardrail limita a 3 tool-calls/turno.
- **[Plan gratuito / cold start]** Posible latencia en la primera llamada. Mitigación: aceptado; sin warm-up en este change.
- **[Divergencia development/main tras el merge]** Trabajar sobre `main` a partir de ahora o mantener flujo de PRs. Mitigación: decisión de flujo fuera de alcance; se documenta que `main` es la rama de deploy.
