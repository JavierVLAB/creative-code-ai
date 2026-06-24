## Context

El frontend actual es un `App.tsx` vacío sin router ni auth. Hay specs completas para `auth-flow` y `sketch-contract` que definen el comportamiento esperado. La base de datos (Supabase) ya existe con las tablas `profiles`, `projects`, `snapshots`, `assets` y RLS activado. Este change construye solo el frontend — sin backend Mastra todavía.

## Goals / Non-Goals

**Goals:**
- Router con rutas protegidas (`/login`, `/signup`, `/app`, `/app/projects/:id`)
- Auth completa con Supabase (login, signup, logout, persistencia de sesión)
- Biblioteca de proyectos: listar, crear, eliminar — directo a Supabase desde cliente
- Workspace: iframe del sketch + controles generados desde `config.yaml`
- Implementar lado-app del protocolo postMessage (SKETCH_INIT, SKETCH_UPDATE, SKETCH_RESTART)

**Non-Goals:**
- Panel de chat / agente (placeholder vacío)
- Snapshots (UI reservada, no funcional)
- Subida de archivos del sketch (hardcoded o vacío en este MVP)
- Backend Mastra, SSO, recuperación de contraseña

## Decisions

### 1. `react-router-dom` v6 con BrowserRouter

Supabase Auth redirige al origen después del magic link o OAuth — aunque por ahora solo usamos email/password, el router es necesario para separar login del workspace.

Se usa `createBrowserRouter` + `RouterProvider` (API de datos de v6), no el `BrowserRouter` legacy. Permite loaders en el futuro.

Alternativa descartada: hash router — no alineado con el stack de despliegue (Vercel/Netlify sirven rutas sin hash).

### 2. Supabase singleton en `front/src/lib/supabase.ts`

Un singleton exportado `export const supabase = createBrowserSupabase()`. Todos los hooks y componentes lo importan desde aquí. No se crea ningún Context de Supabase — es innecesario con un singleton.

Alternativa descartada: SupabaseContext — añade indirección sin beneficio real en una SPA sin SSR.

### 3. Datos de proyectos: directo a Supabase, sin caché local en este change

Los hooks de proyecto (`useProjects`, `useProject`) llaman directamente a `supabase.from('projects')`. Sin SWR ni React Query todavía — se añade en un change posterior cuando la latencia sea visible.

Justificación: el MVP necesita verificar que RLS funciona y el flujo de datos es correcto. Añadir caché ahora ocultaría errores de seguridad.

### 4. `js-yaml` para parsear `config.yaml` del sketch

El `config.yaml` viene como texto desde Supabase Storage. Se parsea en cliente con `js-yaml` (6 kB gzipped, bien mantenida). La función `generateControls(config)` devuelve un array tipado de controles (`SliderControl | SelectControl`) que los componentes renderizan.

Alternativa descartada: parsear YAML manualmente — innecesario y frágil.

### 5. Iframe sandboxed con `srcdoc`

El sketch se renderiza en un `<iframe srcdoc={...} sandbox="allow-scripts">`. `srcdoc` inyecta el HTML completo del sketch (incluyendo el CDN de p5.js o three.js) sin necesidad de una URL pública para el sketch. Esto aisla el sketch del DOM principal y del localStorage del usuario.

El origen del iframe cuando se usa `srcdoc` es `null`, por lo que los mensajes postMessage se envían a `'*'` — aceptable porque el sandbox impide acceso a recursos del padre.

Alternativa descartada: iframe con URL de Storage — requiere que los archivos del sketch sean públicos y añade complejidad de URL signing.

### 6. Estructura de carpetas

```
front/src/
  lib/           supabase.ts, yaml.ts (generateControls)
  hooks/         useSession.ts, useProjects.ts, useProject.ts, useSketch.ts
  components/
    auth/        LoginForm, SignupForm, ProtectedRoute, LoadingScreen
    projects/    ProjectList, ProjectCard, CreateProjectDialog
    workspace/   SketchViewer, ControlPanel, ControlSlider, ControlSelect, ChatPlaceholder
    layout/      AppShell, NavBar
  pages/         LoginPage, SignupPage, ProjectsPage, WorkspacePage
```

## Risks / Trade-offs

- **[Riesgo] Sketch vacío en MVP** → El workspace necesita un sketch para renderizar algo. Mitigación: incluir un sketch de demo hardcoded (un círculo p5.js con un parámetro de radio) como fallback cuando el proyecto no tiene archivos.

- **[Riesgo] `srcdoc` tiene límite de tamaño** (~1MB en algunos navegadores) → Mitigación: los sketches MVP son pequeños. Si un sketch supera ese límite en el futuro, se migra a Blob URL.

- **[Trade-off] Sin caché** → Cada navegación a la biblioteca hace un fetch a Supabase. Aceptable en MVP, visible en producción con muchos proyectos. Se resuelve en un change posterior.

- **[Riesgo] RLS mal configurada** → Un bug en RLS podría exponer proyectos de otros usuarios. Mitigación: verificar manualmente que un usuario B no puede leer proyectos del usuario A en la fase de testing.
