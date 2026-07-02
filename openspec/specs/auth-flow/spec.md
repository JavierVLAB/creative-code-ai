# auth-flow Specification

## Purpose

Definir la autenticacion en CurateArtAI: clientes Supabase por contexto, flujo de sesion y proteccion de rutas publicas y privadas.

## Requirements

### Requirement: El frontend usa un cliente publico de Supabase
La app SHALL usar un cliente de navegador con `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` para gestionar la sesion del usuario respetando RLS.

#### Scenario: Cliente publico inicializado
- **WHEN** el frontend arranca
- **THEN** crea el cliente Supabase con las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`
- **THEN** la sesion se puede recuperar desde el navegador

### Requirement: El backend usa un cliente administrativo de Supabase
El backend SHALL usar un cliente administrativo con `SUPABASE_URL` y `SUPABASE_SECRET_KEY` para operaciones del sistema y verificacion de tokens.

#### Scenario: Backend verifica un token
- **WHEN** el backend recibe un Bearer token
- **THEN** usa el cliente administrativo para verificar al usuario autenticado

### Requirement: Las rutas privadas bajo `/app` requieren sesion
La app SHALL redirigir a `/login` cuando un visitante sin sesion intente acceder a rutas bajo `/app`.

#### Scenario: Visitante sin sesion abre app privada
- **WHEN** un visitante sin sesion navega a una ruta bajo `/app`
- **THEN** la app lo redirige a `/login`

### Requirement: El playground es una ruta publica
La app SHALL permitir acceder a `/playground` sin sesion de Supabase. Las rutas bajo `/app` SHALL seguir protegidas por `ProtectedRoute`.

#### Scenario: Visitante sin sesion abre playground
- **WHEN** un visitante sin sesion navega a `/playground`
- **THEN** la app renderiza el playground sin redirigir a `/login`

### Requirement: El registro crea automaticamente un perfil
El sistema SHALL crear una fila en `profiles` cuando un usuario nuevo se registra en `auth.users`.

#### Scenario: Nuevo usuario registrado
- **WHEN** Supabase inserta un usuario nuevo en `auth.users`
- **THEN** el trigger `handle_new_user()` crea su fila correspondiente en `profiles`

### Requirement: La autenticacion soporta login, signup y logout
La app SHALL permitir registrarse, iniciar sesion y cerrar sesion desde el frontend.

#### Scenario: Usuario inicia sesion
- **WHEN** un usuario envia email y contraseña validos en `LoginPage`
- **THEN** la app crea la sesion y redirige a `/app`

#### Scenario: Usuario cierra sesion
- **WHEN** un usuario pulsa salir
- **THEN** la app elimina la sesion y redirige a `/login`
