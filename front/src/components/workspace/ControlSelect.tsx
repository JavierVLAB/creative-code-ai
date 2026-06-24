import { useState } from 'react'
import type { SelectControl } from '../../lib/types'

interface ControlSelectProps {
  control: SelectControl
  value: string
  onChange: (key: string, value: string) => void
}

export function ControlSelect({ control, value, onChange }: ControlSelectProps) {
  const [hoveredOpt, setHoveredOpt] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--t2)' }}>{control.label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        {control.options.map(opt => {
          const selected = value === opt.value
          if (control.isColor) {
            return (
              <button
                key={opt.value}
                title={opt.label}
                onClick={() => onChange(control.key, opt.value)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: selected ? '2px solid var(--t1)' : '2px solid transparent',
                  backgroundColor: opt.value,
                  cursor: 'pointer',
                  transform: selected ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform var(--transition-fast)',
                  outline: 'none',
                }}
              />
            )
          }
          const isHovered = hoveredOpt === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onChange(control.key, opt.value)}
              onMouseEnter={() => setHoveredOpt(opt.value)}
              onMouseLeave={() => setHoveredOpt(null)}
              style={{
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-xs)',
                border: selected ? '1px solid var(--t1)' : `1px solid ${isHovered ? 'var(--t2)' : 'var(--line)'}`,
                backgroundColor: selected ? 'var(--t1)' : 'var(--bg0)',
                color: selected ? 'var(--bg0)' : isHovered ? 'var(--t1)' : 'var(--t2)',
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast), color var(--transition-fast), background-color var(--transition-fast)',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
