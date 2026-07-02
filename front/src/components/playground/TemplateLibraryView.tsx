import { Link } from 'react-router-dom'
import type { Template } from '../../lib/types'

interface TemplateLibraryViewProps {
  templates: Template[]
  loading: boolean
  error: string | null
  onOpenTemplate: (slug: string) => void
}

export function TemplateLibraryView({ templates, loading, error, onOpenTemplate }: TemplateLibraryViewProps) {
  return (
    <div style={{
      maxWidth: 1120,
      margin: '0 auto',
      padding: 'var(--space-6)',
      height: 'calc(100vh - var(--topbar-height))',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)',
    }}>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <span style={{ fontSize: 'var(--font-size-section-title)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--t2)' }}>
          Playground publico
        </span>
        <h1 style={{ fontSize: 'var(--font-size-display-sm)', color: 'var(--t1)' }}>
          Prueba plantillas sin crear cuenta
        </h1>
        <p style={{ maxWidth: 720, fontSize: 'var(--font-size-small)', color: 'var(--t2)', lineHeight: 1.6 }}>
          Explora sketches reales, ajusta sus controles en vivo y abre luego tu propia cuenta para guardar variaciones como proyectos.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Link
            to="/signup"
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--t1)',
              color: 'var(--bg0)',
              textDecoration: 'none',
              fontSize: 'var(--font-size-small)',
              fontWeight: 500,
            }}
          >
            Crear cuenta
          </Link>
          <Link
            to="/login"
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              border: 'var(--border-width) solid var(--line)',
              color: 'var(--t1)',
              textDecoration: 'none',
              fontSize: 'var(--font-size-small)',
            }}
          >
            Iniciar sesion
          </Link>
        </div>
      </section>

      {loading && (
        <p style={{ color: 'var(--t3)', fontSize: 'var(--font-size-small)' }}>Cargando plantillas...</p>
      )}

      {error && (
        <div style={{
          border: 'var(--border-width) solid var(--color-error)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-error-bg)',
          color: 'var(--color-error-soft)',
          padding: 'var(--space-3)',
          fontSize: 'var(--font-size-small)',
        }}>
          No pude cargar la biblioteca publica: {error}
        </div>
      )}

      {!loading && !error && templates.length === 0 && (
        <div style={{
          border: 'var(--border-width) dashed var(--line)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          textAlign: 'center',
          color: 'var(--t2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}>
          <strong style={{ color: 'var(--t1)' }}>Aun no hay plantillas publicadas.</strong>
          <p style={{ fontSize: 'var(--font-size-small)' }}>Vuelve mas tarde para probar nuevos sketches.</p>
        </div>
      )}

      {!loading && !error && templates.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
          {templates.map(template => (
            <article
              key={template.id}
              style={{
                border: 'var(--border-width) solid var(--line)',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(180deg, var(--bg1), var(--bg2))',
                padding: 'var(--space-5)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                minHeight: 240,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '18px', color: 'var(--t1)' }}>{template.title}</h2>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {template.renderer}
                  </span>
                </div>
                <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--t2)', lineHeight: 1.6 }}>
                  {template.description ?? 'Plantilla publica lista para explorar.'}
                </p>
              </div>

              {template.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {template.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        border: 'var(--border-width) solid var(--line)',
                        borderRadius: 999,
                        padding: '2px 10px',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--t2)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 'auto' }}>
                <button
                  onClick={() => onOpenTemplate(template.slug)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-4)',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: 'var(--t1)',
                    color: 'var(--bg0)',
                    fontSize: 'var(--font-size-small)',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Abrir playground
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
