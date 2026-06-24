import type { SelectControl } from '../../lib/types'

interface ControlSelectProps {
  control: SelectControl
  value: string
  onChange: (key: string, value: string) => void
}

export function ControlSelect({ control, value, onChange }: ControlSelectProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400">{control.label}</p>
      <div className="flex flex-wrap gap-2">
        {control.options.map(opt => {
          const selected = value === opt.value
          if (control.isColor) {
            return (
              <button
                key={opt.value}
                title={opt.label}
                onClick={() => onChange(control.key, opt.value)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  selected ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: opt.value }}
              />
            )
          }
          return (
            <button
              key={opt.value}
              onClick={() => onChange(control.key, opt.value)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                selected
                  ? 'bg-white text-gray-900 border-white'
                  : 'border-gray-600 text-gray-300 hover:border-gray-400'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
