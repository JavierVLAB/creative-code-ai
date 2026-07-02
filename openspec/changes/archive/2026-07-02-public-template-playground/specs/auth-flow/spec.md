## ADDED Requirements

### Requirement: El playground es una ruta publica
La app SHALL permitir acceder a `/playground` sin sesion de Supabase. Las rutas bajo `/app` SHALL seguir protegidas por `ProtectedRoute`.

#### Scenario: Visitante sin sesion abre playground
- **WHEN** un visitante sin sesion navega a `/playground`
- **THEN** la app renderiza el playground sin redirigir a `/login`

#### Scenario: Visitante sin sesion abre app privada
- **WHEN** un visitante sin sesion navega a una ruta bajo `/app`
- **THEN** la app lo redirige a `/login`
