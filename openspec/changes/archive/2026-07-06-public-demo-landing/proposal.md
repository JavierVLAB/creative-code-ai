## Why

El demo público (`/playground`, sin login ni AI, con plantillas publicadas) ya existe y está desplegado, pero **no es descubrible**: la raíz `/` redirige a `/app` (protegida) → `/login`. Un visitante sin sesión nunca ve el demo salvo que teclee `/playground` a mano.

## What Changes

- La raíz `/` decide su destino según el estado de sesión:
  - **Con sesión** → `/app` (comportamiento actual).
  - **Sin sesión** → `/playground` (demo público).
- No cambia nada más del flujo de auth ni del propio playground.

## Capabilities

### Modified Capabilities

- `user-auth`: la redirección de la raíz pasa a depender de la sesión (antes siempre a `/app`).

## Impact

- `front/src/main.tsx`: la ruta `/` usa un componente `RootRedirect` en vez de `<Navigate to="/app">`; se limpia el import de `Navigate` si queda sin uso.
- Nuevo `front/src/components/auth/RootRedirect.tsx` (reutiliza `useSession` y `LoadingScreen`, mismo patrón que `ProtectedRoute`).

## Non-Goals

- No se rediseña el demo ni la landing.
- No se añade contenido/plantillas nuevas.
