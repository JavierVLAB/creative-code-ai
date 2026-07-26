import { defineConfig } from '@playwright/test'

// Credenciales del usuario de test (ver e2e/README.md). Silencioso si el
// archivo no existe todavía: el fixture de auth da el mensaje de error real.
try {
  process.loadEnvFile(new URL('../.env.e2e', import.meta.url))
} catch {
  // .env.e2e no existe aún — se reporta al intentar hacer login, no aquí
}

// Sin `webServer`: la suite asume que `pnpm dev` (y el backend si aplica)
// ya están corriendo. Ver e2e/README.md.
export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  // Por encima del default (30s): el golden path hace varias idas y vueltas reales a Supabase.
  timeout: 60_000,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { storageState: '.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
})
