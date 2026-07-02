import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { TemplateLibraryView } from './TemplateLibraryView'

describe('TemplateLibraryView', () => {
  it('muestra estado vacio cuando no hay plantillas', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <TemplateLibraryView
          templates={[]}
          loading={false}
          error={null}
          onOpenTemplate={() => undefined}
        />
      </MemoryRouter>
    )

    expect(html).toContain('Aun no hay plantillas publicadas')
  })

  it('muestra estado de error si la carga falla', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <TemplateLibraryView
          templates={[]}
          loading={false}
          error="boom"
          onOpenTemplate={() => undefined}
        />
      </MemoryRouter>
    )

    expect(html).toContain('No pude cargar la biblioteca publica: boom')
  })
})
