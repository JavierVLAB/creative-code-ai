import type { SliderControl } from '../../lib/types'

interface ControlSliderProps {
  control: SliderControl
  value: number
  onChange: (key: string, value: number) => void
}

export function ControlSlider({ control, value, onChange }: ControlSliderProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--t2)' }}>
        <span>{control.label}</span>
        <span>{value}</span>
      </div>
      <input
        type="range"
        min={control.min}
        max={control.max}
        step={control.step}
        value={value}
        onChange={e => onChange(control.key, Number(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  )
}
