import { test as setup, expect } from '@playwright/test'

const authFile = '.auth/user.json'

// Login real contra /login con el usuario de test. El storageState resultante
// se reutiliza en los tests del proyecto "chromium" (ver playwright.config.ts),
// sin repetir el login en cada test.
setup('autenticar usuario de test', async ({ page, baseURL }) => {
  const email = process.env.E2E_TEST_USER_EMAIL
  const password = process.env.E2E_TEST_USER_PASSWORD
  if (!email || !password) {
    throw new Error(
      'Faltan E2E_TEST_USER_EMAIL / E2E_TEST_USER_PASSWORD. Configura front/.env.e2e (ver front/e2e/README.md).'
    )
  }

  try {
    await page.goto('/login', { timeout: 15_000 })
  } catch {
    throw new Error(
      `No se pudo cargar ${baseURL}/login. ¿Está "pnpm dev" corriendo? La suite E2E no arranca servidores por sí sola.`
    )
  }

  await page.getByTestId('login-email-input').fill(email)
  await page.getByTestId('login-password-input').fill(password)
  await page.getByTestId('login-submit-button').click()

  await expect(page).toHaveURL(/\/app/, { timeout: 15_000 })

  await page.context().storageState({ path: authFile })
})
