## ADDED Requirements

### Requirement: Registration and login
The system SHALL allow users to register and login with email/password via Supabase Auth.

#### Scenario: Register
- **WHEN** a user registers with email and password
- **THEN** a new auth user is created and a `profiles` row is inserted

#### Scenario: Login
- **WHEN** a registered user logs in
- **THEN** a session token is returned and persisted

### Requirement: Persistent session
The session SHALL persist across page reloads using Supabase's built-in session management.

#### Scenario: Reload
- **WHEN** a logged-in user reloads the page
- **THEN** the session is restored without requiring re-login

### Requirement: Protected routes
The frontend SHALL redirect unauthenticated users to the login page.

#### Scenario: Access without auth
- **WHEN** an unauthenticated user tries to access the workspace
- **THEN** they are redirected to the login/register page

### Requirement: Authenticated API calls
All calls to the Mastra backend SHALL include the Supabase session token as a Bearer token.

#### Scenario: Authorized request
- **WHEN** the frontend calls the Mastra API
- **THEN** the request includes `Authorization: Bearer <session_token>`

#### Scenario: Unauthorized request
- **WHEN** a request without a valid token reaches the backend
- **THEN** the backend returns 401
