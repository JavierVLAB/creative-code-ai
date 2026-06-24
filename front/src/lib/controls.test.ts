import { describe, it, expect } from 'vitest'
import { generateControls } from './controls'
import type { SketchConfig } from './types'

const BASE_CONFIG: SketchConfig = {
  name: 'test',
  modules: {
    canvas: { width: 600, height: 600 },
  },
}

describe('generateControls', () => {
  it('módulo range genera SliderControl', () => {
    const config: SketchConfig = {
      ...BASE_CONFIG,
      modules: {
        ...BASE_CONFIG.modules,
        radius: { type: 'range', label: 'Radio', min: 0, max: 100, step: 1, default: 50 },
      },
    }
    const controls = generateControls(config)
    expect(controls).toHaveLength(1)
    expect(controls[0].kind).toBe('slider')
    if (controls[0].kind === 'slider') {
      expect(controls[0].key).toBe('radius')
      expect(controls[0].defaultValue).toBe(50)
    }
  })

  it('módulo select con valores hex genera SelectControl con isColor: true', () => {
    const config: SketchConfig = {
      ...BASE_CONFIG,
      modules: {
        ...BASE_CONFIG.modules,
        color: {
          type: 'select',
          label: 'Color',
          options: [
            { label: 'Rojo', value: '#ff0000' },
            { label: 'Azul', value: '#0000ff' },
          ],
          default: '#ff0000',
        },
      },
    }
    const controls = generateControls(config)
    expect(controls).toHaveLength(1)
    expect(controls[0].kind).toBe('select')
    if (controls[0].kind === 'select') {
      expect(controls[0].isColor).toBe(true)
    }
  })

  it('módulo select sin hex genera SelectControl con isColor: false', () => {
    const config: SketchConfig = {
      ...BASE_CONFIG,
      modules: {
        ...BASE_CONFIG.modules,
        modo: {
          type: 'select',
          label: 'Modo',
          options: [
            { label: 'Lento', value: 'slow' },
            { label: 'Rápido', value: 'fast' },
          ],
          default: 'slow',
        },
      },
    }
    const controls = generateControls(config)
    expect(controls).toHaveLength(1)
    if (controls[0].kind === 'select') {
      expect(controls[0].isColor).toBe(false)
    }
  })

  it('módulo canvas no genera control', () => {
    const controls = generateControls(BASE_CONFIG)
    expect(controls).toHaveLength(0)
  })
})
