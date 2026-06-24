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
      <div className="p-4 text-xs text-gray-500 flex-1">
        Sin controles definidos.
      </div>
    )
  }

  return (
    <div className="p-4 space-y-5 overflow-y-auto flex-1">
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
