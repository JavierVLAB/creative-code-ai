import type { Control } from '../../lib/types'
import { ControlSlider } from './ControlSlider'
import { ControlSelect } from './ControlSelect'

interface ControlPanelProps {
  controls: Control[]
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
}

export function ControlPanel({ controls, values, onChange }: ControlPanelProps) {
  if (controls.length === 0) {
    return (
      <div style={{
        padding: 'var(--padding-section)',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--t3)',
        flex: 1,
      }}>
        Sin controles definidos.
      </div>
    )
  }

  return (
    <div style={{
      padding: 'var(--padding-section)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)',
      overflowY: 'auto',
      flex: 1,
    }}>
      {controls.map(control => {
        if (control.kind === 'slider') {
          return (
            <ControlSlider
              key={control.key}
              control={control}
              value={(values[control.key] as number) ?? control.defaultValue}
              onChange={onChange}
            />
          )
        }
        if (control.kind === 'select') {
          return (
            <ControlSelect
              key={control.key}
              control={control}
              value={(values[control.key] as string) ?? control.defaultValue}
              onChange={onChange}
            />
          )
        }
        return null
      })}
    </div>
  )
}
