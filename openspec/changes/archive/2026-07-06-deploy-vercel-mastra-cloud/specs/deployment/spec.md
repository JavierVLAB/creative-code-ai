## ADDED Requirements

### Requirement: Frontend desplegado en Vercel
El frontend (Vite + React SPA) SHALL desplegarse en Vercel con project root `front/`, preset Vite y rama de despliegue `main`, sirviéndose desde una URL pública estable.

#### Scenario: Build correcto en Vercel
- **WHEN** se dispara un deploy en Vercel desde `main`
- **THEN** Vercel ejecuta el build de `front/` (`vite build`) y publica el contenido de `dist/` sin errores

#### Scenario: Enrutado SPA en refresh y deep-link
- **WHEN** el usuario recarga o abre directamente una ruta client-side (p. ej. `/workspace/:id`)
- **THEN** Vercel sirve `index.html` (rewrite `/(.*)` → `/index.html`) y React Router resuelve la ruta sin 404

### Requirement: Backend de agentes desplegado en Mastra Cloud
El backend Mastra SHALL desplegarse en Mastra Cloud con project root `backend/`, integración push-to-deploy desde `main`, exponiendo el endpoint `POST /agent` en una URL pública estable.

#### Scenario: Push-to-deploy
- **WHEN** se hace push a `main`
- **THEN** Mastra Cloud construye y despliega la instancia Mastra (agente, tools y workflow) automáticamente

#### Scenario: Auth requerida en el endpoint
- **WHEN** se llama a `POST /agent` sin Bearer token o con token inválido
- **THEN** el backend responde 401 Unauthorized

#### Scenario: Ejecución del agente autenticada
- **WHEN** se llama a `POST /agent` con un Bearer token válido de Supabase y un body válido
- **THEN** el workflow `agent-guardrails` se ejecuta y devuelve la respuesta estructurada del agente

### Requirement: Variables de entorno por servicio
Cada servicio SHALL configurar sus variables de entorno en su dashboard, sin commitear secretos en el repo.

#### Scenario: Variables del frontend
- **WHEN** se configura Vercel
- **THEN** existen `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` y `VITE_BACKEND_URL` (URL del backend), y ninguna clave secreta de servidor

#### Scenario: Variables del backend
- **WHEN** se configura Mastra Cloud
- **THEN** existen `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `DATABASE_URL`, `OBSERVABILITY_DATABASE_URL`, `OBSERVABILITY_SCHEMA` y `ANTHROPIC_API_KEY`

#### Scenario: Sin secretos en el repositorio
- **WHEN** se inspecciona el repo
- **THEN** solo hay archivos `.env.example` (sin valores reales) y `.env` está en `.gitignore`

### Requirement: CORS entre frontend y backend
El servidor Mastra SHALL aceptar peticiones cross-origin del dominio del frontend desplegado en Vercel.

#### Scenario: Origen permitido
- **WHEN** el frontend de Vercel hace una petición a `POST /agent` con cabecera `Authorization`
- **THEN** el backend responde con las cabeceras CORS que permiten ese origen y la petición no es bloqueada por el navegador

#### Scenario: Preflight
- **WHEN** el navegador envía un preflight `OPTIONS` a `/agent`
- **THEN** el backend responde permitiendo los métodos y cabeceras necesarios (`Content-Type`, `Authorization`)

### Requirement: Auth de Supabase configurada para producción
Supabase Auth SHALL reconocer el dominio de Vercel como origen válido para el flujo de autenticación.

#### Scenario: Login en producción
- **WHEN** un usuario inicia sesión desde el dominio de Vercel
- **THEN** el dominio está registrado como Site URL / Redirect URL en Supabase y la sesión se establece correctamente

### Requirement: Orden de despliegue reproducible
El proceso de despliegue SHALL estar documentado con el orden que resuelve la dependencia mutua de URLs entre frontend y backend.

#### Scenario: Secuencia documentada
- **WHEN** alguien despliega desde cero siguiendo el readme
- **THEN** los pasos son: (1) desplegar backend y obtener su URL, (2) desplegar frontend con esa URL, (3) fijar el origen CORS del backend con el dominio de Vercel y redesplegar, (4) registrar el dominio en Supabase Auth
