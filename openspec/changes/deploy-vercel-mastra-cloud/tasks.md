## 1. Preparación del backend para producción (código)

- [x] 1.1 Añadir `server.cors` en `backend/src/mastra/index.ts`: `origin` desde variable `FRONTEND_ORIGIN` (+ `http://localhost:5173`) en producción; default `'*'` en dev. Métodos y cabeceras se dejan a los defaults de Mastra (ya incluyen `OPTIONS`, `Content-Type`, `Authorization`)
- [x] 1.2 Añadir `FRONTEND_ORIGIN` a `backend/.env.example` (documentación)
- [x] 1.3 Verificar build de producción del backend: typecheck `tsc --noEmit` sin errores
- [x] 1.4 Verificar tests del backend: `vitest run` (16 pass, 0 fail)

## 2. Preparación del frontend para producción (código)

- [x] 2.1 Crear `front/vercel.json` con rewrites SPA (`/(.*)` → `/index.html`)
- [x] 2.2 Crear `front/.env.example` con `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_BACKEND_URL`
- [x] 2.3 Verificar build de producción del frontend: `tsc -b && vite build` sin errores

## 3. Promoción de código a la rama de deploy

- [x] 3.1 Promover a `main` los cambios de CORS y config de deploy (commit `98583a6f "preparando el despliegue"`)
- [x] 3.2 Verificar que `main` contiene el backend completo, el frontend y las migraciones

## 4. Despliegue del backend en Mastra Cloud

- [x] 4.1 Crear proyecto en Mastra Cloud vía CLI (`mastra server deploy --project curateartai-backend` crea el proyecto). Nota: se usó el CLI en lugar del dashboard/GitHub por ser más determinista
- [x] 4.2 Deploy desde `backend/` con `--env-file .env`
- [x] 4.3 Variables subidas vía `.env` (4 presentes; `OBSERVABILITY_DATABASE_URL`, `OBSERVABILITY_SCHEMA` y `FRONTEND_ORIGIN` usan fallback en código)
- [x] 4.4 Deploy OK. Server: `https://curateartai-backend.server.mastra.cloud` · Studio: `https://curateartai-backend.studio.mastra.cloud`
- [x] 4.5 Verificado: `POST /agent` sin token → HTTP 401

## 5. Despliegue del frontend en Vercel

- [x] 5.1 Importar el repo en Vercel con project root = `front/`, framework preset Vite, rama `main`
- [x] 5.2 Configurar variables `VITE_*` (backend URL horneada verificada en el bundle)
- [x] 5.3 Deploy OK. Dominio: `https://creative-code-ai.vercel.app`
- [x] 5.4 Verificado: rutas profundas sirven `index.html` (`/app/projects/abc` → HTTP 200, rewrite SPA OK)

## 6. Integración en producción

- [ ] 6.1 Actualizar `FRONTEND_ORIGIN` en Mastra Cloud con el dominio de Vercel y redesplegar el backend
- [x] 6.2 Registrado el dominio de Vercel en Supabase Auth (Site URL + Redirect URLs)
- [x] 6.3 Verificado: llamada real del frontend a `/agent` sin error de origen (CORS actualmente `'*'`)
- [x] 6.4 E2E verificado en producción: login → abrir proyecto → instrucción al agente → sketch actualizado (nota: proyectos con `config.yaml` vacío dan error de validación `modules` — arista menor)

## 7. Documentación y cierre

- [x] 7.1 Actualizada §2.4 del `readme.md` (Vercel + Mastra Cloud, variables por servicio, comandos CLI y orden) y §0.4 con las URLs reales
- [x] 7.2 Confirmado: ningún `.env` trackeado; `.gitignore` cubre `.env`/`.env.*` y preserva `.env.example`
- [ ] 7.3 Archivar el change `refactor-backend-mastra-supabase` (implementado en `development`)
