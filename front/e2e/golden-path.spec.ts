import { test, expect } from '@playwright/test'

// Golden path: crear un proyecto desde plantilla y verificar que el workspace
// es interactivo (config.yaml -> control -> postMessage SKETCH_UPDATE).
// Origen "plantilla" (no "en blanco"): un proyecto en blanco no genera
// controles, ver design.md §5b de openspec/changes/add-e2e-golden-path.
//
// No se fija ni el nombre de la plantilla ni el `key` del parámetro: se toma
// la primera plantilla publicada y su primer control `slider`, para no
// depender de un catálogo de plantillas concreto (ver template-library).

declare global {
  interface Window {
    __e2eTopMessages?: unknown[]
    __e2eFrameMessages?: unknown[]
    __e2eMountId?: number
  }
}

test('usuario autenticado crea un proyecto desde plantilla y el workspace reacciona a un control', async ({ page }) => {
  const projectName = `E2E golden path ${Date.now()}`

  // Registra los postMessage recibidos en la ventana principal (SKETCH_READY,
  // emitido por el iframe hacia window.parent) y, dentro del iframe, los que
  // le llegan desde la app (SKETCH_UPDATE), más un marcador de montaje para
  // detectar un remount espurio del iframe.
  await page.addInitScript(() => {
    const isTop = window.top === window
    if (isTop) {
      window.__e2eTopMessages = []
      window.addEventListener('message', event => {
        window.__e2eTopMessages!.push(event.data)
      })
    } else {
      window.__e2eFrameMessages = []
      window.__e2eMountId = Math.random()
      window.addEventListener('message', event => {
        window.__e2eFrameMessages!.push(event.data)
      })
    }
  })

  await page.goto('/app')

  try {
    await page.getByTestId('create-project-button').click()
    await page.getByTestId('project-name-input').fill(projectName)
    await page.getByTestId('project-origin-template').check()
    await page.getByTestId('template-option').first().waitFor({ state: 'visible' })
    await page.getByTestId('template-option').first().check()
    await page.getByTestId('create-project-confirm-button').click()

    await expect(page).toHaveURL(/\/app\/projects\/[^/]+$/, { timeout: 15_000 })

    const iframe = page.getByTestId('sketch-iframe')
    await expect(iframe).toBeVisible()

    await expect
      .poll(
        () => page.evaluate(() => window.__e2eTopMessages?.some(m => (m as { type?: string })?.type === 'SKETCH_READY') ?? false),
        { timeout: 15_000, message: 'esperando SKETCH_READY del iframe' }
      )
      .toBe(true)

    const iframeHandle = await iframe.elementHandle()
    const frame = await iframeHandle?.contentFrame()
    if (!frame) throw new Error('No se pudo acceder al contentFrame del sketch')

    const mountIdBefore = await frame.evaluate(() => window.__e2eMountId)

    // El panel lateral de controles arranca colapsado (ver Sidebar.tsx).
    const openSidebar = page.getByTestId('open-sidebar-button')
    if (await openSidebar.isVisible()) await openSidebar.click()

    const slider = page.locator('[data-testid^="control-slider-"]').first()
    await slider.waitFor({ state: 'visible' })
    const targetValue = await slider.evaluate((el: HTMLInputElement) => {
      const min = Number(el.min || 0)
      const max = Number(el.max || 100)
      const step = Number(el.step || 1)
      const current = Number(el.value)
      // Un valor distinto al actual, dentro de rango, para que el cambio sea detectable.
      const candidate = current + step <= max ? current + step : Math.max(min, current - step)
      // React rastrea el valor anterior en el propio nodo: una asignación directa
      // (el.value = ...) actualiza ese rastro sin disparar onChange. Hay que pasar
      // por el setter nativo del prototipo para que React detecte el cambio real.
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      nativeSetter.call(el, String(candidate))
      el.dispatchEvent(new Event('input', { bubbles: true }))
      return candidate
    })

    await expect
      .poll(
        () =>
          frame.evaluate(
            (expected: number) =>
              (window.__e2eFrameMessages ?? []).some(m => {
                const msg = m as { type?: string; values?: Record<string, unknown> }
                return msg?.type === 'SKETCH_UPDATE' && Object.values(msg.values ?? {}).includes(expected)
              }),
            targetValue
          ),
        { timeout: 5_000, message: 'esperando SKETCH_UPDATE con el nuevo valor' }
      )
      .toBe(true)

    const mountIdAfter = await frame.evaluate(() => window.__e2eMountId)
    expect(mountIdAfter, 'el iframe no debería remontarse tras SKETCH_UPDATE').toBe(mountIdBefore)
  } finally {
    // Limpieza: borra el proyecto creado, corra bien o mal el test.
    await page.goto('/app')
    const card = page.getByTestId('project-card').filter({ hasText: projectName })
    if (await card.count() > 0) {
      await card.getByTestId('delete-project-button').click()
      await page.getByTestId('delete-project-confirm-button').click()
      await expect(page.getByTestId('project-card').filter({ hasText: projectName })).toHaveCount(0)
    }
  }
})
