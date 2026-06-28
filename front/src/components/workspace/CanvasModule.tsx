// Controla el tamaño del canvas (width/height) con estado local editable.
// Usa "Aplicar" en lugar de cambio en tiempo real porque redimensionar
// requiere reiniciar el sketch — el padre se encarga de eso.
import { useState } from 'react'

interface CanvasModuleProps {
  width: number
  height: number
  onApply: (size: { width: number; height: number }) => void
}

export function CanvasModule({ width, height, onApply }: CanvasModuleProps) {
  const [local, setLocal] = useState({ width, height })

  // Resetea el estado local cuando las props cambien (p.ej. carga inicial)
  const hasChanges = local.width !== width || local.height !== height

  function handleChange(field: 'width' | 'height', raw: string) {
    const parsed = parseInt(raw) || 100
    setLocal(prev => ({ ...prev, [field]: parsed }))
  }

  return (
    <div style={{ borderBottom: '1px solid var(--line)', padding: 'var(--padding-module) var(--padding-section)' }}>
      <div style={{
        fontSize: 'var(--font-size-section-title)',
        color: 'var(--color-section-title)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 'var(--gap-section-title)',
      }}>
        Canvas
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end' }}>
        {(['width', 'height'] as const).map(field => (
          <label
            key={field}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--gap-label-control)' }}
          >
            <span style={{
              fontSize: 'var(--font-size-control-label)',
              color: 'var(--color-control-label)',
              textTransform: 'capitalize',
            }}>
              {field}
            </span>
            <input
              type="number"
              value={local[field]}
              min={100}
              max={4096}
              onChange={e => handleChange(field, e.target.value)}
              style={{
                fontFamily: 'inherit',
                fontSize: 'var(--font-size-input)',
                color: 'var(--t2)',
                background: 'var(--bg0)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--input-padding)',
                width: '100%',
              }}
            />
          </label>
        ))}

        <button
          onClick={() => onApply(local)}
          disabled={!hasChanges}
          style={{
            fontSize: 'var(--btn-font-size)',
            padding: 'var(--btn-padding)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--line)',
            background: hasChanges ? 'var(--t1)' : 'var(--bg2)',
            color: hasChanges ? 'var(--bg0)' : 'var(--btn-color)',
            cursor: hasChanges ? 'pointer' : 'default',
            fontFamily: 'inherit',
            fontWeight: hasChanges ? 500 : 400,
            transition: 'all var(--transition-fast)',
            whiteSpace: 'nowrap',
          }}
        >
          Aplicar
        </button>
      </div>
    </div>
  )
}
