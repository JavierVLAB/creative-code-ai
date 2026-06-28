import type { SketchConfig, Control, SliderControl, SelectControl } from './types'

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/

function isHex(value: string) {
  return HEX_RE.test(value)
}

export function generateControls(config: SketchConfig): Control[] {
  return Object.entries(config.modules)
    .filter(([key]) => key !== 'canvas')
    // Anotamos el retorno como Control[] para que flatMap no infiera una unión
    // de arrays (SliderControl[] | SelectControl[]), que TS rechaza.
    .flatMap(([key, mod]): Control[] => {
      if (typeof mod !== 'object' || mod === null || !('type' in mod)) return []

      const m = mod as { type: string }

      if (m.type === 'range') {
        const r = mod as { type: 'range'; label: string; min: number; max: number; step: number; default: number }
        const control: SliderControl = {
          kind: 'slider',
          key,
          label: r.label,
          min: r.min,
          max: r.max,
          step: r.step,
          defaultValue: r.default,
        }
        return [control]
      }

      if (m.type === 'select') {
        const s = mod as { type: 'select'; label: string; options: { label: string; value: string }[]; default: string }
        const allHex = s.options.length > 0 && s.options.every(o => isHex(o.value))
        const control: SelectControl = {
          kind: 'select',
          key,
          label: s.label,
          options: s.options,
          defaultValue: s.default,
          isColor: allHex,
        }
        return [control]
      }

      return []
    })
}
