## Why

El frontend existe solo como un `<h1>CurateArtAI</h1>`. Sin auth, sin rutas, sin estructura, no hay nada que mostrar ni probar. Este change construye la capa base del frontend: las pantallas de auth, la biblioteca de proyectos y el espacio de trabajo con el visor del sketch — sin agente todavía.

## What Changes

- Implementar auth completa (login, signup, logout, protección de rutas) según `auth-flow` spec
- Añadir router React con rutas `/login`, `/signup`, `/app`, `/app/projects/:id`
- Construir la biblioteca de proyectos: listar, crear, eliminar proyectos del usuario en Supabase
- Construir el workspace: iframe del sketch + panel de controles generados desde `config.yaml`
- Implementar el protocolo postMessage app → iframe según `sketch-contract` spec
- Crear instancia singleton de `supabase` en `front/src/lib/supabase.ts`

## Capabilities

### New Capabilities

- `project-library`: UI para listar, crear y eliminar proyectos del usuario. Lee/escribe en la tabla `projects` de Supabase. Muestra nombre, fecha de actualización y miniatura (futura). Permite crear un proyecto vacío y navegar a él.
- `sketch-workspace`: Espacio de trabajo principal. Renderiza el sketch en un `<iframe>` aislado y genera controles visuales (sliders, chips, swatches) desde `config.yaml`. Implementa el lado app del protocolo postMessage definido en `sketch-contract`.

### Modified Capabilities

<!-- ninguna — auth-flow y sketch-contract se implementan sin cambiar sus requisitos -->

## Impact

- **Archivos nuevos:** `front/src/lib/supabase.ts`, `front/src/hooks/useSession.ts`, componentes en `front/src/components/auth/`, `front/src/components/projects/`, `front/src/components/workspace/`, páginas en `front/src/pages/`
- **Modificados:** `front/src/App.tsx` (añade router), `front/src/main.tsx` (provider si aplica)
- **Dependencias nuevas:** `react-router-dom`, `@supabase/supabase-js`, `js-yaml` (parsear config.yaml)
- **Sin agente:** el workspace en este change muestra el sketch y los controles, pero el panel de chat queda como placeholder
- **Sin backend:** todas las operaciones son directas a Supabase desde el cliente (RLS protege los datos)
