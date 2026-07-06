## ADDED Requirements

### Requirement: Landing según sesión
La raíz `/` SHALL dirigir a los usuarios con sesión activa a `/app` y a los visitantes sin sesión al demo público `/playground`.

#### Scenario: Visitante sin sesión
- **WHEN** un visitante sin sesión abre `/`
- **THEN** es redirigido a `/playground` (demo público, sin login ni AI)

#### Scenario: Usuario con sesión
- **WHEN** un usuario con sesión activa abre `/`
- **THEN** es redirigido a `/app`

#### Scenario: Sesión resolviéndose
- **WHEN** la raíz `/` se carga mientras la sesión aún se está resolviendo
- **THEN** se muestra la pantalla de carga hasta conocer el estado
