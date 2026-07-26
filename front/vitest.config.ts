import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // e2e/ tiene su propia suite de Playwright, corrida con `pnpm test:e2e`
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
  },
})
