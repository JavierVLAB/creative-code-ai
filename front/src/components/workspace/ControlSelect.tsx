import type { SelectControl } from '../../lib/types'

interface ControlSelectProps {
  control: SelectControl
  value: string
  onChange: (key: string, value: string) => void
}

// Control de tipo select: swatches de color (cuadrados redondeados) si las opciones
// son colores, o chips de texto en grid si no. Réplica del SelectControl del prototipo.
export function ControlSelect({ control, value, onChange }: ControlSelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-label-control)' }}>
      <div>
        <span style={{ fontSize: 'var(--font-size-control-label)', color: 'var(--color-control-label)' }}>
          {control.label}
        </span>
      </div>

      {control.isColor ? (
        // Swatches de color: cuadrados redondeados con borde de selección
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {control.options.map(opt => {
            const selected = value === opt.value
            return (
              <button
                key={opt.value}
                title={opt.label}
                onClick={() => onChange(control.key, opt.value)}
                style={{
                  width: 'var(--space-6)',
                  height: 'var(--space-6)',
                  borderRadius: 'var(--radius-sm)',
                  border: selected ? '2px solid var(--t1)' : '2px solid transparent',
                  background: opt.value,
                  cursor: 'pointer',
                  outline: selected ? 'var(--border-width) solid var(--bg0)' : 'none',
                  outlineOffset: '-3px',
                  transition: 'border-color var(--transition-fast)',
                }}
              />
            )
          })}
        </div>
      ) : (
        // Chips de texto en grid de 3 columnas
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-1)',
          background: 'var(--bg0)',
          padding: 'var(--space-1)',
          borderRadius: 'var(--radius-md)',
        }}>
          {control.options.map(opt => {
            const selected = value === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => onChange(control.key, opt.value)}
                style={{
                  textAlign: 'center',
                  padding: '0 var(--space-2)',
                  height: 'var(--space-6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-body)',
                  color: selected ? 'var(--t1)' : 'var(--t3)',
                  cursor: 'pointer',
                  border: selected ? 'var(--border-width) solid var(--line)' : 'none',
                  background: selected ? 'var(--bg3)' : 'transparent',
                  fontFamily: 'inherit',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  if (!selected) {
                    e.currentTarget.style.color = 'var(--t2)'
                    e.currentTarget.style.background = 'var(--bg2)'
                  }
                }}
                onMouseLeave={e => {
                  if (!selected) {
                    e.currentTarget.style.color = 'var(--t3)'
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
