import type { SliderControl } from '../../lib/types'

interface ControlSliderProps {
  control: SliderControl
  value: number
  onChange: (key: string, value: number) => void
}

export function ControlSlider({ control, value, onChange }: ControlSliderProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-label-slider)' }}>
      {/* Cabecera: nombre + valor actual */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--font-size-control-label)', color: 'var(--color-control-label)' }}>
          {control.label}
        </span>
        <span style={{ fontSize: 'var(--font-size-control-label)', color: 'var(--color-control-value)' }}>
          {value}
        </span>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={control.min}
        max={control.max}
        step={control.step}
        value={value}
        onChange={e => onChange(control.key, Number(e.target.value))}
      />
    </div>
  )
}
