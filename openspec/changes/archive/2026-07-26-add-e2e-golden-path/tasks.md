## 1. Preparación

- [x] 1.1 Confirmar con Javi la Opción A de autenticación (usuario de test fijo + login real) — confirmado
- [x] 1.2 Javi crea el usuario de test en el Supabase de desarrollo y escribe las credenciales en `front/.env.e2e` (el agente no las maneja)
- [x] 1.3 Agente: crear `front/.env.e2e.example` con las claves `E2E_TEST_USER_EMAIL`, `E2E_TEST_USER_PASSWORD`, `E2E_BASE_URL` sin valores, y añadir `front/.env.e2e` a `.gitignore`

## 2. Setup de Playwright

- [x] 2.1 Instalar `@playwright/test` como devDependency en `front/` (requiere aprobación explícita antes de `pnpm add`)
- [x] 2.2 Crear `front/e2e/playwright.config.ts` sin `webServer`, `baseURL` desde `process.env.E2E_BASE_URL` con default `http://localhost:5173`
- [x] 2.3 Añadir script `"test:e2e": "playwright test"` en `front/package.json`, apuntando a `testDir: front/e2e`
- [x] 2.4 Añadir `front/e2e/README.md` breve: qué debe estar corriendo antes de ejecutar la suite, y cómo configurar `.env.e2e`
- [x] 2.5 Excluir `front/e2e/**` de la configuración de Vitest si hiciera falta (confirmar que no colisiona)

## 3. Fixture de autenticación

- [x] 3.1 Crear fixture de Playwright que hace login real contra `/login` con las credenciales de entorno
- [x] 3.2 Persistir `storageState` de la sesión autenticada para reutilizar entre tests sin repetir login
- [x] 3.3 Manejar el caso de servidor no disponible en `baseURL` con un mensaje de error claro (no arrancar nada automáticamente)

## 4. Selectores estables

- [x] 4.1 Añadir `data-testid` al botón "Crear proyecto", al input de nombre, al origen "plantilla" y a las opciones de plantilla en `project-library`
- [x] 4.2 Añadir `data-testid` al iframe del sketch y a los controles generados desde `config.yaml` en `sketch-workspace` (al menos el slider), y a la tarjeta de proyecto (`project-card`) para la limpieza

## 5. Test del golden path

_(Ajustado: origen "desde plantilla" en vez de "en blanco" — ver design.md §5b, un proyecto en blanco no genera controles)_

- [x] 5.1 Escribir el test: login (vía fixture) → `/app` → crear proyecto con nombre válido y origen "plantilla" (primera plantilla publicada) → assert redirección a `/app/projects/:id`
- [x] 5.2 Assert que el iframe del sketch de la plantilla se monta y `SKETCH_READY` se recibe (esperar el evento, no un timeout fijo)
- [x] 5.3 Interceptar el `postMessage` saliente hacia el iframe, mover el primer slider de control disponible, y assertar que se emite `SKETCH_UPDATE` con el valor esperado
- [x] 5.4 Assertar que el iframe no se vuelve a montar tras el `SKETCH_UPDATE` (mismo elemento, no recarga)
- [x] 5.5 Limpieza: eliminar el proyecto creado (por nombre, vía `project-card` + `delete-project-button` + `delete-project-confirm-button`) al final del test (éxito o fallo)

## 6. Verificación

- [x] 6.1 Ejecutar `pnpm test:e2e` localmente (con `pnpm dev` corriendo) y confirmar que el test pasa de punta a punta — confirmado por Javi
- [x] 6.2 Confirmar que `pnpm test` (Vitest) sigue pasando sin verse afectado por los cambios
- [x] 6.3 Revisar que no queden proyectos residuales en la cuenta de test tras varias corridas — la limpieza en el `finally` del test se validó en las corridas fallidas previas (no dejó residuos) y en la corrida final en verde
