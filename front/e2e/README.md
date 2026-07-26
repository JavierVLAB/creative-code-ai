# E2E (Playwright)

Suite de tests end-to-end, separada de los tests unitarios de Vitest (`front/src/**/*.test.ts`).

## Antes de ejecutar

1. `pnpm dev` corriendo en `front/` (por defecto `http://localhost:5173`).
2. `front/.env.e2e` con las credenciales del usuario de test (copiar desde `.env.e2e.example`):
   ```
   E2E_TEST_USER_EMAIL=...
   E2E_TEST_USER_PASSWORD=...
   E2E_BASE_URL=http://localhost:5173
   ```
   El usuario debe existir ya en el Supabase de desarrollo (creado manualmente, no lo crea la suite).

La suite **no arranca ningún servidor** — si `pnpm dev` no está corriendo, los tests fallan al no poder cargar la página.

## Ejecutar

```bash
pnpm test:e2e
```

## Limpieza

Los tests limpian los datos que crean (ej. borran el proyecto creado) usando el flujo real de la UI. Si un test falla a mitad de camino, puede quedar un proyecto residual en la cuenta de test — revisar manualmente si `pnpm test:e2e` falla repetidamente.
