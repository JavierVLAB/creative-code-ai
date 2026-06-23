## ADDED Requirements

### Requirement: Gestor de paquetes oficial
El proyecto SHALL usar pnpm como único gestor de paquetes. No SHALL existir ningún `package-lock.json` ni `yarn.lock` en el repositorio.

#### Scenario: Clonar el repositorio
- **WHEN** un desarrollador clona el repo e inspecciona `front/` y `backend/`
- **THEN** cada paquete contiene un `pnpm-lock.yaml` y ningún `package-lock.json`

#### Scenario: Instalar dependencias
- **WHEN** un desarrollador instala dependencias en `front/` o `backend/`
- **THEN** lo hace con `pnpm install`, que respeta el `pnpm-lock.yaml` existente

### Requirement: Versión de pnpm fijada
Cada `package.json` con dependencias SHALL declarar el campo `packageManager` con una versión concreta de pnpm, de modo que todos los desarrolladores usen la misma versión vía Corepack.

#### Scenario: Versión consistente
- **WHEN** un desarrollador con Corepack activo ejecuta pnpm en `front/` o `backend/`
- **THEN** Corepack usa la versión declarada en el campo `packageManager` del `package.json`

### Requirement: Versión de Node fijada
El proyecto SHALL fijar Node 24 como versión de ejecución. La raíz SHALL contener un `.nvmrc` con la versión, y cada `package.json` SHALL declarar el rango de Node admitido en el campo `engines`.

#### Scenario: Declaración de versión de Node
- **WHEN** un desarrollador inspecciona la raíz del repositorio
- **THEN** existe un `.nvmrc` que indica Node 24 y cada `package.json` declara `engines.node` cubriendo Node 24

#### Scenario: Seleccionar la versión del proyecto
- **WHEN** un desarrollador con nvm ejecuta `nvm use` en la raíz del repositorio
- **THEN** nvm selecciona la versión de Node indicada en `.nvmrc` sin alterar la versión por defecto del sistema

### Requirement: Comandos canónicos
La documentación, los scripts y los artefactos del proyecto SHALL referirse a los comandos de pnpm (`pnpm install`, `pnpm run build`, `pnpm test`, `pnpm dev`) y no a sus equivalentes de npm.

#### Scenario: Referencia a comandos en artefactos
- **WHEN** un artefacto o documento describe cómo instalar, construir, testear o desarrollar
- **THEN** usa la forma `pnpm ...` y no `npm ...`

### Requirement: Sin workspaces
El proyecto SHALL mantener `front/` y `backend/` como paquetes independientes, sin configurar un workspace de pnpm.

#### Scenario: Estructura sin workspace
- **WHEN** un desarrollador inspecciona la raíz del repositorio
- **THEN** no existe `pnpm-workspace.yaml` y cada paquete se instala de forma independiente
