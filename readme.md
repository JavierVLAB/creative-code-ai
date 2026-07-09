# CurateArtAI — Documentación de producto y diseño técnico

## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### 0.1. Tu nombre completo

Javier Villarroel Freites (JVF).

### 0.2. Nombre del proyecto

CurateArtAI (en la interfaz: *sketch.explorer*).

### 0.3. Descripción breve del proyecto

Plataforma web que separa la capa de exploración de la capa de código: artistas exploran, editan y **curan** sketches generativos (p5.js / three.js) en lenguaje natural, asistidos por un agente de IA, con sus proyectos guardados en la nube.

### 0.4. URL del proyecto

- **App:** https://creative-code-ai.vercel.app
- **Demo público (sin login):** https://creative-code-ai.vercel.app/playground

### 0.5. URL del repositorio

https://github.com/JavierVLAB/AI4Devs-finalproject

---

## 1. Descripción general del producto

### 1.1. Objetivo

El arte generativo de código tiene dos capas que hoy están enredadas. La **capa de código** define el sistema: el algoritmo, sus reglas, su estética. La **capa de exploración** es la búsqueda de la pieza concreta dentro de ese sistema —mover un radio, cambiar una paleta, subir el número de iteraciones— y la curación de las variaciones que merecen la pena. Programar obliga a mezclarlas: para probar una variante hay que volver al editor, editar un número, recargar y mirar. La exploración queda atrapada dentro del flujo de escribir código.

**CurateArtAI separa ambas capas.** Toma un sketch (p5.js / three.js) y lo convierte en una herramienta explorable y curable: expone sus parámetros como controles visuales, deja pedir cambios en lenguaje natural a un agente que edita el código, y permite guardar, comparar y curar las variaciones resultantes.

Resuelve tres problemas a la vez:

- **Quien no programa queda fuera:** un sketch es código, y sin saber editarlo no se puede tocar ni un color.
- **Quien programa pierde tiempo en lo repetitivo:** explorar variaciones es un bucle manual de editar-recargar-mirar.
- **No existe una capa de curación:** cuando una exploración da decenas de resultados, no hay forma cómoda de capturarlos, compararlos y quedarse con los mejores.

CurateArtAI vive **entre escribir código y producir la pieza final**, asistido por IA. No compite con el editor donde se escribe el algoritmo ni con la herramienta donde se publica el resultado: ocupa el hueco intermedio de explorar y curar.

**Para quién:** artistas generativos, creative technologists, diseñadores, educadores, estudiantes y curiosos que quieren explorar y curar variaciones de un sketch sin programar, o programando lo mínimo. Incluye tanto al artista que ya escribe su propio código y quiere acelerar la exploración, como al no-programador que quiere intervenir una pieza sin tocar una línea.

**Qué no es:** no es un IDE generalista, no es una herramienta de live-coding/VJ en tiempo real y no reemplaza al sketch. Lo envuelve: el código sigue siendo la fuente de verdad.

### 1.2. Características y funcionalidades principales

Agrupadas por área. La versión actual cubre un subconjunto; el resto marca la evolución del producto.

- **Cuentas y biblioteca:** registro/login con sesión persistente; biblioteca de proyectos en la nube (crear, abrir, guardar, borrar).
- **Exploración:** visor del sketch en iframe aislado; controles de parámetros generados automáticamente desde la configuración.
- **Agente de IA:** edición de configuración y código en lenguaje natural; generación de un sketch completo desde una descripción; historial de conversación por proyecto; memoria de proyecto que el agente lee y propone actualizar; editor de código y explorador de archivos como apoyo.
- **Curación:** snapshots de parámetros; (visión) generación por lotes de variaciones y grid de comparación con favoritas.
- **Producción y export (visión):** alta resolución, SVG para pen plotter, separación de capas para serigrafía.

**Objetivos del producto**
- Separar la capa de exploración de la capa de código: parametrizar un sketch sin tocar el código.
- Editar el sketch (parámetros y código) con un agente de IA en lenguaje natural.
- Curar variaciones: capturarlas, compararlas y conservar las mejores.
- Guardar y recuperar proyectos por usuario, entre sesiones y dispositivos.

**Métricas de éxito**
- Un usuario sin conocimientos de código modifica visiblemente un sketch en menos de un minuto desde que abre un proyecto.
- Una instrucción típica al agente ("haz las líneas rojas", "añade un parámetro de velocidad") se resuelve en un solo turno y deja el sketch funcionando.
- El usuario captura al menos una variación como snapshot y la recupera intacta.
- El proyecto se recupera idéntico al reabrirlo en otra sesión.

### 1.3. Diseño y experiencia de usuario

El espacio de trabajo es de tema oscuro con paneles flotantes sobre un fondo de cuadrícula, apoyado en un sistema de diseño por tokens (ver §2). El flujo principal de extremo a extremo:

1. El usuario inicia sesión.
2. Crea un proyecto o abre uno de su biblioteca.
3. Ve el sketch y sus controles, generados desde la configuración.
4. Explora moviendo controles y/o pide un cambio al agente en lenguaje natural.
5. El agente modifica el código o los parámetros y devuelve el resultado.
6. La aplicación aplica el cambio, recarga el sketch y guarda el proyecto.
7. El usuario investiga distintos parámetros para obtener variaciones y curar las mejores piezas.
8. Guarda un snapshot de los resultados más interesantes.
9. Al volver, encuentra su proyecto, parámetros, snapshots e historial intactos.

> Capturas de pantalla y vídeo de la experiencia: pendientes.

### 1.4. Instrucciones de instalación

Requisitos:
- Node.js 24.
- pnpm 11 (el proyecto fija `packageManager: pnpm@11.9.0` en `front/` y `backend/`).
- Proyecto Supabase con las migraciones de `supabase/migrations/` aplicadas.

Instalación del frontend:

```bash
cd front
pnpm install
pnpm dev
```

Variables de entorno del frontend (`front/.env`):

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_API_URL=http://localhost:4111
```

Instalación del backend:

```bash
cd backend
pnpm install
pnpm dev
```

Variables de entorno del backend:

```bash
SUPABASE_URL=...
SUPABASE_SECRET_KEY=...
DATABASE_URL=...
```

Las migraciones versionadas están en `supabase/migrations/`. El despliegue público, sus URLs y las variables finales quedan pendientes.

---

## 2. Arquitectura del sistema

**Stack tecnológico**

| Capa | Tecnología | Rol |
|---|---|---|
| Frontend | Vite + React 19 + TypeScript | Aplicación de página única (SPA) |
| | Tailwind CSS 4 | Estilos |
| | CodeMirror 6 | Editor de código (JS / YAML / JSON) |
| | `js-yaml` | Parseo de la configuración (YAML) |
| | `@supabase/supabase-js` | Autenticación y acceso a datos desde el cliente |
| | `@mastra/client-js` | Cliente del agente sobre la API REST de Mastra |
| Backend | Mastra (Node + Hono) | Servicio de agentes: Agents, Tools, Workflows, Memory |
| | `@mastra/pg` | Memoria conversacional en Postgres |
| | `@mastra/auth-supabase` | Verificación del token de sesión |
| Datos / Auth | Supabase | Postgres, Auth, Storage, RLS |
| Ejecución del arte | p5.js / three.js en `<iframe>` | Renderizado aislado del sketch |
| Infraestructura | Vercel/Cloudflare Pages · Render · Supabase | Frontend · backend · datos |
| Proceso | OpenSpec · ESLint · Vitest · Playwright | Especificación, lint y tests |

### 2.1. Diagrama de arquitectura

El sistema se apoya en servicios gestionados para construir rápido y centrarse en lo propio del producto —la exploración y curación de sketches— en vez de reinventar infraestructura. De ahí tres planos: **cliente**, **servicio de agentes** (Mastra) y **plataforma de datos** (Supabase). El sketch corre en un `<iframe>` aislado porque ejecuta código arbitrario y no debe poder tocar la app ni los datos del usuario.

```mermaid
flowchart TB
    subgraph Client["Cliente — Vite + React (SPA)"]
        UI["UI: auth · biblioteca · canvas · editor · chat"]
        SB["@supabase/supabase-js"]
        MC["@mastra/client-js"]
        Iframe["&lt;iframe&gt; aislado — sketch.js + p5/three"]
    end
    subgraph Backend["Servicio de agentes — Mastra (Node/Hono) · Render"]
        Auth["@mastra/auth-supabase"]
        Agent["Agent + Tools (edit_params · edit_sketch · update_memory)"]
        WF["Workflow de guardrails"]
        Mem["Memory (@mastra/pg)"]
        Route["Model routing → LLM"]
    end
    subgraph Data["Plataforma de datos — Supabase"]
        SAuth["Auth"]
        PG["Postgres"]
        Storage["Storage (assets)"]
    end
    LLM["Proveedor LLM"]

    UI --> SB & MC
    UI <-->|postMessage| Iframe
    SB -->|login / CRUD con RLS| SAuth & PG
    SB --> Storage
    MC -->|HTTPS + Bearer token| Auth
    Auth --> Agent --> WF & Mem & Route
    Mem --> PG
    Route --> LLM
```

**Patrón.** No es un monolito con API REST a medida, sino una composición de servicios gestionados: el cliente habla con Supabase (datos/auth) y con Mastra (agente) de forma independiente.

**Beneficios.** Menos código de infraestructura (auth, base de datos, memoria del agente y observabilidad vienen resueltos); secretos del LLM custodiados en el backend; el sketch aislado no compromete la app.

**Sacrificios / déficits.** Dependencia de servicios gestionados (acoplamiento a Supabase y Mastra); el backend en plan gratuito se suspende por inactividad y el primer acceso es lento; ejecutar código de sketch de terceros es una superficie de riesgo, mitigada con el `<iframe>` aislado; algunas funciones de exploración pueden depender de APIs solo disponibles en navegadores Chromium.

### 2.2. Descripción de componentes principales

| Componente | Responsabilidad | Tecnología |
|---|---|---|
| **Cliente** | UI, estado de pantalla, render del sketch, acceso a datos y llamadas al agente. | Vite + React + TypeScript |
| **Servicio de agentes** | Aloja el agente, sus tools y el workflow de guardrails; verifica el token y ejecuta la inferencia. | Mastra (Node/Hono) |
| **Plataforma de datos** | Identidad, persistencia (proyectos/snapshots/assets), memoria del agente y control de acceso por RLS. | Supabase |
| **iframe del sketch** | Ejecuta el código del sketch de forma aislada, comunicándose por el protocolo `postMessage`. | p5.js / three.js |

### 2.3. Descripción de alto nivel del proyecto y estructura de ficheros

A alto nivel, el proyecto se organiza en dos servicios desplegables por separado:

- **`front/`** — la SPA de React (UI, visor del sketch, controles, chat, editor).
- **`backend/`** — el servicio de agentes Mastra (Agent, tools, workflow, memoria).
- **`shared/`** — tipos TypeScript compartidos entre frontend y backend.
- **`supabase/migrations/`** — esquema SQL versionado, RLS y cambios de datos.
- **`openspec/`** — especificaciones, propuestas y cambios del proceso OpenSpec.

```txt
.
├── front/                 # SPA Vite + React + TypeScript
│   ├── src/components/    # Componentes React por área
│   ├── src/hooks/         # Hooks de sesión, proyectos, sketch y agente
│   ├── src/lib/           # Lógica de dominio: YAML, Supabase, agente, sync del sketch
│   └── public/            # Assets estáticos
├── backend/               # Servicio Mastra
│   └── src/mastra/        # Agents, tools y workflows
├── shared/                # Tipos compartidos
├── supabase/migrations/   # Migraciones SQL
└── openspec/              # Especificaciones y cambios
```

### 2.4. Infraestructura y despliegue

| Pieza | Plataforma | Project root |
|---|---|---|
| Frontend | Vercel (build estático de Vite, preset Vite) | `front/` |
| Backend (Mastra) | Mastra Cloud (Server + Studio) | `backend/` |
| Datos / Auth / Storage | Supabase (Postgres gestionado) | — |

Cada servicio se despliega en su propia nube; no se usan contenedores propios. Los secretos (clave de LLM, `SUPABASE_SECRET_KEY` y `DATABASE_URL`) viven solo en el backend; el cliente usa la clave publicable de Supabase.

**Variables por servicio**

| Servicio | Variables |
|---|---|
| Vercel (front) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_BACKEND_URL` |
| Mastra Cloud (backend) | `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `DATABASE_URL`, `OBSERVABILITY_DATABASE_URL`, `OBSERVABILITY_SCHEMA`, `ANTHROPIC_API_KEY`, `FRONTEND_ORIGIN` |

`DATABASE_URL` debe usar el connection string del **pooler** de Supabase (`*.pooler.supabase.com`), no el directo (solo IPv6).

**Despliegue del backend** (CLI de Mastra, desde `backend/`):

```bash
npx mastra auth login
npx mastra server deploy --project curateartai-backend --env-file .env
npx mastra studio deploy  --project curateartai-backend --env-file .env   # opcional: Studio
```

**Despliegue del frontend**: importar el repo en Vercel con project root `front/`, preset Vite y las tres variables `VITE_*` (con `VITE_BACKEND_URL` apuntando al Server de Mastra). El `front/vercel.json` añade el rewrite SPA para React Router.

**Orden de despliegue** (resuelve la dependencia mutua de URLs):
1. Desplegar backend → obtener su URL estable.
2. Desplegar frontend con `VITE_BACKEND_URL` = URL del backend → obtener el dominio de Vercel.
3. Fijar `FRONTEND_ORIGIN` en el backend con el dominio de Vercel y redesplegar (restringe CORS).
4. Registrar el dominio de Vercel en Supabase Auth (Site URL / Redirect URLs).

### 2.5. Seguridad

- **Aislamiento del sketch.** Corre en un `<iframe>` aislado; no puede acceder a la app, las claves ni los datos del usuario. La configuración se parsea, nunca se evalúa como código.
- **Secretos en el servidor.** Las claves del LLM y la `service_role` de Supabase residen solo en el backend. El cliente usa la `anon key` pública.
- **Control de acceso por capas.** Las tablas de aplicación se protegen con Row Level Security (un usuario solo accede a sus filas). Las tablas de memoria de Mastra se acceden solo desde el backend, que aísla por usuario tras verificar el token de sesión. (Detalle en §3.)

### 2.6. Tests

Pruebas previstas y parcialmente implementadas:

- **Unitarios** (Vitest): parseo de `config.yaml`, generación de controles, sincronización del sketch, hook del agente y tools del backend.
- **Integración**: CRUD con RLS y contrato del agente.
- **E2E** (pendiente): flujo principal login → crear → editar con el agente → persistir → recuperar.

---

## 3. Modelo de datos

La entidad central es el **proyecto**: un sketch con su código, configuración, parámetros e historial. Un usuario posee muchos proyectos; cada proyecto agrupa sus snapshots, variaciones y assets. Borrarlo arrastra todo lo suyo.

La persistencia se divide en dos grupos de tablas que conviven en la **misma base de datos de Supabase**: las **de aplicación** (las gestiona la app, se acceden desde el cliente con RLS) y las **de memoria de Mastra** (las gestiona Mastra, se acceden solo desde el backend).

### 3.1. Diagrama del modelo de datos

```mermaid
erDiagram
    AUTH_USERS ||--|| PROFILES : "1:1"
    AUTH_USERS ||--o{ PROJECTS : "posee"
    PROJECTS ||--o{ SNAPSHOTS : "agrupa"
    PROJECTS ||--o{ VARIATIONS : "agrupa"
    PROJECTS ||--o{ ASSETS : "agrupa"
    AUTH_USERS ||--o{ MASTRA_THREADS : "resource"
    MASTRA_THREADS ||--o{ MASTRA_MESSAGES : "contiene"

    PROFILES {
        uuid id PK
        text display_name
        timestamptz updated_at
    }
    PROJECTS {
        uuid id PK
        uuid user_id FK
        text name
        text description
        text sketch_js
        text config_yaml
        text renderer
        text memory
        timestamptz created_at
        timestamptz updated_at
    }
    SNAPSHOTS {
        uuid id PK
        uuid project_id FK
        text label
        jsonb values
        timestamptz created_at
    }
    VARIATIONS {
        uuid id PK
        uuid project_id FK
        jsonb values
        text preview_path
        boolean is_favorite
        timestamptz created_at
    }
    ASSETS {
        uuid id PK
        uuid project_id FK
        text storage_path
        text mime_type
        text kind
        timestamptz created_at
    }
```

> `VARIATIONS` y el campo `kind` de `ASSETS` dan soporte a la visión de curación y producción; no forman parte de la versión actual.

### 3.2. Descripción de entidades principales

Esquema en Postgres. El proyecto es el agregado raíz; `snapshots`, `variations` y `assets` se borran en cascada con él. El sketch se guarda como dos columnas de texto en `projects` (`config_yaml` y `sketch_js`), cuyo contenido sigue el contrato de §4.

```sql
-- Perfil 1:1 con el usuario de Supabase Auth.
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  updated_at   timestamptz not null default now()
);

-- Agregado raíz. Guarda código y configuración como texto.
create table projects (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,
  description    text,
  sketch_js      text not null default '',
  config_yaml    text not null default '',
  renderer       text not null default 'p5js' check (renderer in ('p5js', 'threejs')),
  memory         text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index on projects (user_id);

-- Combinación de valores guardada y recuperable. values = { paramId: number|string }.
create table snapshots (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  label      text,
  values     jsonb not null,
  created_at timestamptz not null default now()
);
create index on snapshots (project_id);

-- Binarios del sketch y exports de producción en Supabase Storage.
create table assets (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  storage_path text not null,
  mime_type    text,
  kind         text not null default 'asset' check (kind in ('asset', 'export')),
  created_at   timestamptz not null default now()
);
create index on assets (project_id);
```

**Memoria del agente.** El historial de chat lo gestiona Mastra (`@mastra/pg`) en el mismo Postgres de Supabase. Organiza la conversación en *resource* (el usuario), *thread* (el proyecto, un hilo por proyecto) y *message* (cada turno). Mastra crea esas tablas automáticamente.

**Seguridad (RLS).** Las tablas de aplicación tienen RLS activado: un usuario solo accede a filas con `user_id = auth.uid()`; `snapshots`, `variations` y `assets` heredan el acceso por su `project_id`. Las tablas de memoria de Mastra no pasan por RLS: las consulta el backend con privilegios elevados, aislando por `resourceId`/`threadId` tras verificar el token.

---

## 4. Especificación de la API

El agente se expone desde el backend Mastra mediante una **ruta custom** que encapsula el contrato específico de CurateArtAI: autenticación con token de Supabase, contexto completo del sketch, `threadId = projectId`, `resourceId = user.id`, ejecución del workflow de guardrails y respuesta estructurada lista para el frontend.

Mastra también publica rutas built-in como `POST /api/agents/{agentId}/generate`, pero esta aplicación usa `POST /agent` para mantener un contrato más simple entre el workspace y el backend.

```yaml
openapi: 3.0.0
info:
  title: CurateArtAI — API del agente (Mastra)
  version: 0.1.0
paths:
  /agent:
    post:
      summary: Envía una instrucción en lenguaje natural y devuelve los archivos del sketch modificados.
      security:
        - bearerAuth: []          # token de sesión de Supabase
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [projectId, message, sketchJs, configYaml, renderer]
              properties:
                projectId:        { type: string, format: uuid, description: "id del proyecto; también threadId del agente" }
                message:          { type: string, description: "instrucción del usuario" }
                sketchJs:         { type: string, description: "sketch.js actual completo" }
                configYaml:       { type: string, description: "config.yaml actual completo" }
                renderer:         { type: string, enum: [p5js, threejs] }
                previousResponse: { type: string, description: "respuesta anterior, opcional, para detectar repeticiones" }
      responses:
        '200':
          description: Respuesta del agente.
          content:
            application/json:
              schema:
                type: object
                required: [response]
                properties:
                  response:          { type: string, description: "texto para el usuario" }
                  appliedConfigYaml: { type: string, description: "config.yaml completo, si cambió" }
                  appliedSketchJs:   { type: string, description: "sketch.js completo, si cambió" }
                  memorySuggestion:  { type: string, description: "propuesta de nota de memoria" }
                  pendingQuestion:   { type: string, description: "si el agente necesita aclaración" }
        '401':
          description: Token de sesión ausente o inválido.
        '400':
          description: Body inválido o incompleto.
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

Otros contratos del sistema, fuera de esta API REST:

- **Datos y auth (Supabase).** Acceso desde el cliente con `@supabase/supabase-js`, gobernado por RLS (no son endpoints propios; ver §3).
- **Protocolo `postMessage` (app ↔ iframe).** Salientes: `SKETCH_INIT`, `SKETCH_UPDATE`, `SKETCH_RESTART` con `{ config, values }`. Entrantes: `SKETCH_READY`, `SKETCH_ERROR { message }`.
- **Contrato del sketch.** `config.yaml` (describe canvas y parámetros: `range` → slider, `select` → selector) y `sketch.js` (lee los valores de `window.__SKETCH__.values`, escucha `postMessage`, emite `SKETCH_READY`/`SKETCH_ERROR`). El **renderer** se infiere del código (`THREE` → `threejs`; si no, `p5js`).

---

## 5. Historias de usuario

> Historias principales del producto, separando lo implementado en la versión actual de la visión pendiente.

### Historias implementadas

#### Historia de Usuario 1 — Registro e inicio de sesión

**Como** artista, **quiero** crear una cuenta e iniciar sesión, **para** tener mis proyectos asociados a mí y accesibles desde cualquier dispositivo.

**Criterios de aceptación**
- Registro con email/contraseña.
- Sesión persistente entre recargas.
- Las acciones con cuenta son inaccesibles sin sesión.
- Los datos quedan aislados por usuario mediante RLS.

#### Historia de Usuario 2 — Parámetros con controles visuales

**Como** artista sin experiencia en código, **quiero** mover sliders y selectores, **para** explorar variaciones sin programar.

**Criterios de aceptación**
- Los controles se generan automáticamente desde `config.yaml`.
- Mover un control actualiza el sketch en tiempo real.
- Cambiar el canvas reinicia el sketch.

#### Historia de Usuario 3 — Edición con el agente de IA

**Como** usuario, **quiero** pedir cambios en lenguaje natural, **para** que el agente edite el sketch por mí.

**Criterios de aceptación**
- La instrucción va al backend autenticado.
- El agente devuelve configuración o código validados.
- El cambio se aplica, el sketch se recarga y el proyecto se guarda.
- El historial se conserva por proyecto.
- Ante fallo, el usuario recibe un mensaje claro sin pérdida de trabajo.
- La memoria de proyecto se lee como contexto y solo se actualiza con aprobación.

#### Historia de Usuario 4 — Snapshots de parámetros

**Como** usuario explorando variaciones, **quiero** guardar combinaciones de valores, **para** recuperarlas más tarde.

**Criterios de aceptación**
- Un snapshot captura los valores actuales con etiqueta y fecha.
- Cargar un snapshot restaura los valores y actualiza el sketch.
- Los snapshots quedan asociados al proyecto y se recuperan al reabrirlo.

### Historias pendientes / visión de curación

#### Historia de Usuario 5 — Variaciones por lotes

**Como** artista explorando, **quiero** generar N variaciones barriendo rangos de parámetros, **para** ver muchas direcciones de golpe sin moverlas a mano una a una.

**Criterios de aceptación**
- El usuario elige qué parámetros varían y en qué rango.
- El sistema genera N variaciones.
- Cada variación guarda sus valores y una previsualización.

#### Historia de Usuario 6 — Comparación y curación

**Como** usuario con muchas variaciones, **quiero** verlas en un grid lado a lado y marcar mis favoritas, **para** quedarme con las mejores piezas.

**Criterios de aceptación**
- El usuario ve un grid de variaciones del proyecto.
- Puede marcar y desmarcar favoritas.
- Las favoritas se conservan y se recuperan al reabrir.

#### Historia de Usuario 7 — Playground público de plantillas

**Como** visitante sin cuenta, **quiero** abrir un playground público con ejemplos de sketches, **para** probar la experiencia de exploración antes de registrarme.

**Criterios de aceptación**
- El visitante accede a una ruta pública de playground sin iniciar sesión.
- El playground muestra una biblioteca de plantillas o ejemplos publicados.
- Al abrir una plantilla, el sketch se carga en un workspace efímero con sus controles visuales.
- Mover controles actualiza el sketch en tiempo real.
- Los cambios del visitante no se guardan en Supabase ni modifican la plantilla original.
- La IA aparece deshabilitada en el playground público, con una indicación clara de que estará disponible en demos invitadas.
- El playground ofrece una llamada a crear cuenta o iniciar sesión para guardar un proyecto propio desde una plantilla.

---

## 6. Tickets de trabajo

> Tickets principales del desarrollo actual.

**Ticket 1 (Base de datos) — Esquema Supabase + RLS**
- **Historias:** H1, biblioteca y persistencia.
- **Descripción:** crear el proyecto Supabase y el esquema de datos de aplicación (`profiles`, `projects`, `snapshots`, `assets`) con políticas RLS por usuario.
- **Tareas:** escribir migraciones SQL versionadas (DDL de §3.2); activar RLS en todas las tablas; políticas con `auth.uid()`; herencia de acceso por `project_id`; índices por `user_id`/`project_id`; borrado en cascada.
- **Criterios de aceptación:** un usuario solo ve sus filas y el acceso cruzado queda bloqueado; borrar un proyecto arrastra sus snapshots y assets; las migraciones son reproducibles desde cero.

**Ticket 2 (Backend) — Agente Mastra con salida estructurada**
- **Historia:** H3 (edición con el agente).
- **Descripción:** agente que recibe una instrucción en lenguaje natural y devuelve `config.yaml`/`sketch.js` modificados, con salida estructurada, tools y guardrails.
- **Tareas:** definir el Agent y las tools `edit_params`, `edit_sketch`, `update_memory`; schema Zod de salida (`response`, `appliedConfigYaml?`, `appliedSketchJs?`, `memorySuggestion?`, `pendingQuestion?`); workflow de guardrails A/B/C; verificación del token Supabase en la ruta custom `POST /agent`; memoria con `@mastra/pg`.
- **Criterios de aceptación:** devuelve un objeto válido según el schema; cada tool valida su salida (YAML parseable / JS sin errores evidentes); los guardrails cortan bucles y fallos repetidos; una petición sin token válido devuelve 401; el historial se recupera al reabrir el proyecto.

**Ticket 3 (Frontend) — Visor del sketch**
- **Historia:** Historia 2 (controles visuales) / render.
- **Descripción:** componente que monta el sketch en un `<iframe>` aislado, le inyecta los valores y gestiona la comunicación por `postMessage`.
- **Tareas:** iframe sandboxed con su HTML de arranque; inyección de `window.__SKETCH__` (config + valores); manejo de `SKETCH_READY`/`SKETCH_ERROR`; ciclo de vida de las blob URLs (crear/revocar); recarga al cambiar el canvas; actualización en tiempo real al mover un control.
- **Criterios de aceptación:** el sketch monta y renderiza; mover un control actualiza el sketch al instante; un error del sketch se muestra sin romper la app; no se filtran blob URLs entre recargas.

**Ticket 4 (Frontend + Agente) — Chat del workspace conectado al agente**
- **Historia:** H3 (edición con el agente).
- **Descripción:** conectar el panel de chat del workspace con `POST /agent` para enviar instrucciones en lenguaje natural, aplicar la respuesta estructurada del agente al sketch y persistir los cambios del proyecto.
- **Tareas:** crear `useAgent`; enviar `{ projectId, message, sketchJs, configYaml, renderer, previousResponse? }` con Bearer token; mantener historial local de la sesión; mostrar loading, errores y `pendingQuestion`; persistir `appliedSketchJs` en `projects.sketch_js` y `appliedConfigYaml` en `projects.config_yaml`; regenerar controles o recargar iframe según qué cambió; guardar `memorySuggestion` aprobado en `projects.memory`; actualizar `projects.updated_at`.
- **Criterios de aceptación:** el usuario puede pedir un cambio desde el chat y verlo reflejado en el sketch; una respuesta conversacional no recarga el iframe; una configuración inválida no se persiste; las sugerencias de memoria solo se guardan con aprobación explícita; errores de red/auth se muestran sin romper el workspace.

**Ticket 5 (Frontend + Datos) — Playground público de plantillas sin IA**
- **Historia:** H7 (playground público de plantillas).
- **Descripción:** crear una experiencia pública para explorar sketches de ejemplo sin cuenta, usando plantillas publicadas como punto de partida y manteniendo todos los cambios en estado efímero.
- **Tareas:** definir el modelo mínimo de plantilla publicada (`title`, `description`, `sketch_js`, `config_yaml`, `renderer`, `thumbnail_url`, `tags`, `is_published`); añadir la ruta pública `/playground`; listar plantillas publicadas; reutilizar el visor y los controles del workspace en modo no persistente; bloquear o deshabilitar el chat de IA en esta ruta; evitar escrituras en `projects`, `snapshots`, `memory` y `updated_at`; añadir CTA para crear cuenta e iniciar un proyecto real desde una plantilla.
- **Criterios de aceptación:** cualquier visitante puede abrir el playground y probar una plantilla; los controles modifican el sketch solo en la sesión actual; recargar la página restaura el estado original de la plantilla; no se realizan escrituras de usuario en Supabase; la IA queda claramente deshabilitada; el diseño deja preparado el camino para una demo futura con IA habilitada por token.

---

## 7. Pull requests

En esta fase del proyecto no se ha seguido todavía un flujo formal de pull requests por ticket. Los cambios se han integrado directamente en `main`, así que la trazabilidad real de esta entrega queda mejor reflejada por commits.

- **Ticket 1 (Base de datos)**
  - `8fd850c4` — `feat: prepare changes for front and backend refactorin`
    - Añade la migración inicial `20260623000000_initial_schema.sql` y las specs base del refactor.
  - `91068683` — `feat: workspace UI flotante con design system tokenizado`
    - Añade `20260627000000_add_snapshot_values.sql` para snapshots.
  - `62bc4dfa` — `feat: playground public`
    - Añade `20260702120000_add_public_templates.sql` para plantillas públicas.

- **Ticket 2 (Backend)**
  - `775c779c` — `feat: design system and agent api`
    - Implementa el backend inicial del agente en Mastra: `POST /agent`, tools, workflow de guardrails y tests.

- **Ticket 3 (Frontend)**
  - `f45474ef` — `feat: Frontend base`
    - Construye la base del visor del sketch, controles, autenticación y páginas principales.
  - `91068683` — `feat: workspace UI flotante con design system tokenizado`
    - Completa la UI del workspace, snapshots y componentes principales del editor.

- **Ticket 4 (Frontend + Agente)**
  - `daed879d` — `feat: frontend-agent`
    - Conecta el workspace con el backend del agente, añade `useAgent`, validación de respuestas y persistencia.
  - `17159d6c` — `feat: frontend-agent 2`
    - Ajusta y consolida las specs del chat y del workspace tras la integración.

- **Ticket 5 (Frontend + Datos)**
  - `62bc4dfa` — `feat: playground public`
    - Implementa `/playground`, biblioteca de plantillas, modo efímero y desactivación de IA en la demo pública.
