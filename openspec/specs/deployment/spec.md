# deployment Specification

## Purpose

Definir el despliegue de CurateArtAI: frontend en Vercel, backend de agentes en Mastra Cloud y su integracion (variables de entorno, CORS, auth de Supabase en produccion y orden de operaciones).

## Requirements

### Requirement: Frontend desplegado en Vercel
El frontend (Vite + React SPA) SHALL desplegarse en Vercel con project root `front/`, preset Vite y rama de despliegue `main`, sirviendose desde una URL publica estable.

#### Scenario: Build correcto en Vercel
- **WHEN** se dispara un deploy en Vercel desde `main`
- **THEN** Vercel ejecuta `vite build` en `front/` y publica `dist/` sin errores

#### Scenario: Enrutado SPA en refresh y deep-link
- **WHEN** el usuario recarga o abre directamente una ruta client-side
- **THEN** Vercel sirve `index.html` (rewrite `/(.*)` desde `front/vercel.json`) y React Router resuelve la ruta sin 404

### Requirement: Backend de agentes desplegado en Mastra Cloud
El backend Mastra SHALL desplegarse en Mastra Cloud con project root `backend/`, exponiendo el endpoint `POST /agent` en una URL publica estable.

#### Scenario: Auth requerida en el endpoint
- **WHEN** se llama a `POST /agent` sin Bearer token o con token invalido
- **THEN** el backend responde 401 Unauthorized

#### Scenario: Ejecucion del agente autenticada
- **WHEN** se llama a `POST /agent` con un Bearer token valido de Supabase y un body valido
- **THEN** el workflow `agent-guardrails` se ejecuta y devuelve la respuesta estructurada del agente

### Requirement: El backend hiberna en idle en Mastra Cloud
Para no acumular CPU cuando no se usa, el backend en Mastra Cloud SHALL evitar procesos de fondo y conexiones de red persistentes: la observabilidad NO se activa en el runtime de produccion y el storage del agente usa SQLite local (`LibSQLStore`, no un Postgres externo). Server y Studio MUST desplegarse ambos con esta configuracion.

#### Scenario: Servicios hibernan sin trafico
- **WHEN** ni el Server ni Studio reciben peticiones durante un periodo de inactividad
- **THEN** ambos servicios pasan a idle y el consumo de CPU deja de crecer

#### Scenario: Redespliegue de ambos servicios
- **WHEN** se cambia la configuracion de observabilidad o storage del backend
- **THEN** se redespliegan tanto el Server (`mastra server deploy`) como Studio (`mastra studio deploy`); redesplegar solo uno deja el otro con la config antigua

### Requirement: Variables de entorno por servicio
Cada servicio SHALL configurar sus variables de entorno en su plataforma, sin commitear secretos en el repo.

#### Scenario: Variables del frontend
- **WHEN** se configura Vercel
- **THEN** existen `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` y `VITE_BACKEND_URL`, y ninguna clave secreta de servidor

#### Scenario: Variables del backend
- **WHEN** se configura Mastra Cloud
- **THEN** existen `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `ANTHROPIC_API_KEY` y, para restringir CORS, `FRONTEND_ORIGIN`
- **THEN** NO se define `ENABLE_OBSERVABILITY` (la observabilidad queda desactivada en producción) ni variables de Postgres para el storage del agente

#### Scenario: Sin secretos en el repositorio
- **WHEN** se inspecciona el repo
- **THEN** solo hay archivos `.env.example` (sin valores reales) y `.env` esta en `.gitignore`

### Requirement: CORS entre frontend y backend
El servidor Mastra SHALL aceptar peticiones cross-origin del dominio del frontend desplegado en Vercel.

#### Scenario: Origen permitido
- **WHEN** el frontend de Vercel hace una peticion a `POST /agent` con cabecera `Authorization`
- **THEN** el backend responde con las cabeceras CORS que permiten ese origen y la peticion no es bloqueada por el navegador

### Requirement: Auth de Supabase configurada para produccion
Supabase Auth SHALL reconocer el dominio de Vercel como origen valido para el flujo de autenticacion.

#### Scenario: Login en produccion
- **WHEN** un usuario inicia sesion desde el dominio de Vercel
- **THEN** el dominio esta registrado como Site URL / Redirect URL en Supabase y la sesion se establece correctamente

### Requirement: Orden de despliegue reproducible
El proceso de despliegue SHALL estar documentado con el orden que resuelve la dependencia mutua de URLs entre frontend y backend.

#### Scenario: Secuencia documentada
- **WHEN** alguien despliega desde cero siguiendo el readme
- **THEN** los pasos son: (1) desplegar backend y obtener su URL, (2) desplegar frontend con esa URL, (3) fijar `FRONTEND_ORIGIN` en el backend con el dominio de Vercel y redesplegar, (4) registrar el dominio en Supabase Auth
