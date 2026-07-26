## Why

`testing-patterns` ya declara que los tests E2E deben usar Playwright, pero el proyecto no tiene ninguna implementación: ni la dependencia instalada, ni carpeta `e2e/`, ni un solo test end-to-end. No hay forma automatizada de verificar que el camino más básico de un usuario real (crear un proyecto y ver el sketch reaccionar) sigue funcionando tras un cambio.

## What Changes

- Instalar Playwright como dependencia de desarrollo (`@playwright/test`) en `front/`.
- Crear la carpeta `e2e/` con configuración de Playwright (`playwright.config.ts`), separada de los tests unitarios de Vitest.
- Crear un fixture/helper de autenticación para tests E2E contra un usuario de prueba en Supabase (ver `design.md` para las opciones de aprovisionamiento del usuario).
- Escribir el primer test E2E, cubriendo el golden path: usuario autenticado crea un proyecto en blanco desde la biblioteca → es redirigido al workspace → ve el sketch demo renderizado en el iframe aislado → mueve un slider generado desde `config.yaml` → el sketch reacciona en tiempo real sin recargar el iframe.
- Añadir script `pnpm test:e2e` (o equivalente) para ejecutar la suite E2E de forma independiente de `pnpm test`.

## Capabilities

### New Capabilities
- `e2e-testing`: Infraestructura y convenciones para tests E2E con Playwright — estructura de `e2e/`, fixture de autenticación de test, y el primer escenario cubierto (golden path de creación de proyecto y workspace interactivo).

### Modified Capabilities
_(ninguna — `testing-patterns` ya declara el requisito de usar Playwright para E2E; este change lo implementa, no cambia el requisito)_

## Impact

- **Dependencias**: nueva devDependency `@playwright/test` en `front/package.json` (requiere `pnpm add` con aprobación explícita antes de ejecutarse).
- **Código**: nueva carpeta `e2e/` (fuera de `front/src`, según se decida en `design.md`), nuevo `playwright.config.ts`, nuevo script en `package.json`.
- **Infraestructura de test**: necesita un usuario de prueba en Supabase y datos limpios entre ejecuciones (a definir en `design.md`).
- **CI**: fuera de alcance de este change — solo se propone el test local ejecutable manualmente; integrarlo en CI puede ser un change posterior.
