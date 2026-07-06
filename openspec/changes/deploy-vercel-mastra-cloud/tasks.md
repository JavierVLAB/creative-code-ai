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

- [ ] 3.1 Fusionar `development` → `main` (con los cambios de CORS y config de deploy)
- [ ] 3.2 Verificar que `main` contiene el backend completo, el frontend y las migraciones

## 4. Despliegue del backend en Mastra Cloud

- [ ] 4.1 Crear proyecto en Mastra Cloud y conectar el repo de GitHub (integración push-to-deploy)
- [ ] 4.2 Configurar project root = `backend/` y rama de deploy = `main`
- [ ] 4.3 Configurar variables de entorno: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `DATABASE_URL`, `OBSERVABILITY_DATABASE_URL`, `OBSERVABILITY_SCHEMA`, `ANTHROPIC_API_KEY`
- [ ] 4.4 Lanzar el primer deploy y obtener la URL estable del backend
- [ ] 4.5 Verificar el endpoint: `POST {backend}/agent` sin token → 401; con token válido → respuesta del agente

## 5. Despliegue del frontend en Vercel

- [ ] 5.1 Importar el repo en Vercel con project root = `front/`, framework preset Vite, rama `main`
- [ ] 5.2 Configurar variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_BACKEND_URL` = URL del backend (paso 4.4)
- [ ] 5.3 Lanzar el deploy y obtener el dominio de Vercel
- [ ] 5.4 Verificar que la SPA carga y que las rutas profundas funcionan en refresh (rewrites)

## 6. Integración en producción

- [ ] 6.1 Actualizar `FRONTEND_ORIGIN` en Mastra Cloud con el dominio de Vercel y redesplegar el backend
- [ ] 6.2 Registrar el dominio de Vercel en Supabase Auth (Site URL y Redirect URLs)
- [ ] 6.3 Verificar CORS: llamada real desde el frontend desplegado al `/agent` sin error de origen
- [ ] 6.4 Verificar flujo E2E en producción: registro/login → abrir proyecto → instrucción al agente → cambio aplicado al sketch → historial persiste

## 7. Documentación y cierre

- [ ] 7.1 Añadir sección "Despliegue" al `readme.md`: servicios, project roots, variables por servicio y orden de operaciones
- [ ] 7.2 Confirmar que ningún secreto está commiteado (`.env` en `.gitignore`, solo `.env.example` en el repo)
- [ ] 7.3 Archivar el change `refactor-backend-mastra-supabase` con `/opsx:archive`
