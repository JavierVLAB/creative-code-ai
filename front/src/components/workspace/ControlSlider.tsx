import type { SliderControl } from '../../lib/types'

interface ControlSliderProps {
  control: SliderControl
  value: number
  onChange: (key: string, value: number) => void
}

export function ControlSlider({ control, value, onChange }: ControlSliderProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400">
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
        className="w-full accent-white"
      />
    </div>
  )
}
