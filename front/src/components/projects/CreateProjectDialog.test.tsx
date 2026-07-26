import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { CreateProjectDialog } from './CreateProjectDialog'

vi.mock('../../hooks/usePublishedTemplates', () => ({
  usePublishedTemplates: () => ({ templates: [], loading: false, error: null }),
}))

describe('CreateProjectDialog', () => {
  it('muestra el nombre y las 3 opciones de origen en un único modal', () => {
    const html = renderToStaticMarkup(
      <CreateProjectDialog onConfirm={() => undefined} onCancel={() => undefined} />
    )

    expect(html).toContain('Nombre del proyecto')
    expect(html).toContain('Empezar en blanco')
    expect(html).toContain('Que me ayude la IA')
    expect(html).toContain('Desde una plantilla')
  })

  it('el botón Crear arranca deshabilitado sin nombre', () => {
    const html = renderToStaticMarkup(
      <CreateProjectDialog onConfirm={() => undefined} onCancel={() => undefined} />
    )

    expect(html).toMatch(/<button[^>]*disabled[^>]*>Crear<\/button>/)
  })
})
