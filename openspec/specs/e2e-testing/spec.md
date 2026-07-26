# e2e-testing Specification

## Purpose

Definir la suite de tests E2E del proyecto: herramienta (Playwright), ubicación, autenticación de test y el primer escenario cubierto (golden path de creación de proyecto y workspace interactivo).

## Requirements

### Requirement: El proyecto tiene una suite E2E con Playwright
El proyecto SHALL tener una suite de tests E2E basada en Playwright, ubicada en `front/e2e/`, separada de los tests unitarios de Vitest, ejecutable con un comando independiente.

#### Scenario: Ejecutar la suite E2E
- **WHEN** Javi ejecuta `pnpm test:e2e` en `front/` con el servidor de desarrollo ya corriendo
- **THEN** Playwright ejecuta los tests en `front/e2e/` y reporta el resultado

#### Scenario: La suite E2E no interfiere con Vitest
- **WHEN** se ejecuta `pnpm test` (Vitest)
- **THEN** los archivos de `front/e2e/` no se incluyen en esa corrida

### Requirement: La suite E2E no arranca servidores por sí misma
La configuración de Playwright SHALL asumir que el frontend (y el backend si aplica) ya están corriendo, sin definir `webServer`. La URL base SHALL configurarse vía variable de entorno con un valor por defecto de desarrollo local.

#### Scenario: Servidor no disponible
- **WHEN** se ejecuta `pnpm test:e2e` sin que el frontend esté corriendo en la `baseURL` configurada
- **THEN** la suite falla con un mensaje que indica que debe levantarse el servidor manualmente, sin intentar arrancarlo

### Requirement: Autenticación de test mediante usuario dedicado
La suite E2E SHALL autenticarse contra Supabase usando un usuario de prueba dedicado, cuyas credenciales se leen de variables de entorno no versionadas. El login SHALL ejercitar el flujo real de `/login` de la aplicación.

#### Scenario: Sesión de test iniciada
- **WHEN** arranca la suite E2E
- **THEN** un fixture realiza login contra `/login` con las credenciales de `E2E_TEST_USER_EMAIL` / `E2E_TEST_USER_PASSWORD`
- **THEN** el estado de sesión se reutiliza en los tests que lo necesiten sin repetir el login en cada test

### Requirement: Golden path de creación de proyecto y workspace interactivo
La suite E2E SHALL cubrir, como primer escenario, el camino completo: usuario autenticado crea un proyecto desde una plantilla publicada, es redirigido al workspace, ve el sketch de esa plantilla renderizado, interactúa con un control generado desde `config.yaml`, y el sketch refleja el cambio en tiempo real. El test SHALL elegir la primera plantilla publicada disponible y el primer control `slider` que exponga, sin fijar un nombre de plantilla ni un `key` de parámetro concreto (un proyecto "en blanco" no genera controles, ver `design.md` del change que introdujo esta spec).

#### Scenario: Crear proyecto desde plantilla y ver el workspace
- **WHEN** el test, ya autenticado, navega a `/app`, crea un proyecto con un nombre válido y origen "desde plantilla", seleccionando la primera plantilla publicada de la lista
- **THEN** la app redirige a `/app/projects/:id`
- **THEN** el iframe del sketch de la plantilla se monta y emite `SKETCH_READY`

#### Scenario: Mover un control refleja el cambio en el sketch
- **WHEN** el test mueve el slider de control renderizado desde `config.yaml`
- **THEN** la app emite un `postMessage` `SKETCH_UPDATE` hacia el iframe con el nuevo valor del parámetro
- **THEN** el iframe no se recarga (no se re-monta el elemento)

#### Scenario: Limpieza tras el test
- **WHEN** el test del golden path finaliza (éxito o fallo)
- **THEN** el proyecto creado se elimina usando el flujo de eliminación existente en la UI, dejando la cuenta de test sin datos residuales

### Requirement: Selectores estables para tests E2E
Los elementos de UI ejercitados por tests E2E SHALL exponer un atributo `data-testid` estable, para no acoplar los tests a copy o clases CSS.

#### Scenario: Selector por data-testid
- **WHEN** un test E2E necesita interactuar con el botón de crear proyecto, el input de nombre, un control del workspace o el iframe del sketch
- **THEN** el test lo localiza por `data-testid`, no por texto visible ni por clase CSS
