import { describe, expect, it } from 'vitest'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { appRoutes } from './main'

describe('appRoutes', () => {
  it('expone /playground fuera de ProtectedRoute', () => {
    const playgroundRoute = appRoutes.find(route => route.path === '/playground')
    expect(playgroundRoute).toBeTruthy()
  })

  it('mantiene /app protegido', () => {
    const appRoute = appRoutes.find(route => route.path === '/app')
    expect(appRoute?.element?.type).toBe(ProtectedRoute)
  })
})
