import { describe, it, expect } from 'vitest'
import { parseSketchConfig } from './yaml'

const VALID_YAML = `
name: test-sketch
modules:
  canvas:
    width: 600
    height: 600
  radius:
    type: range
    label: Radio
    min: 0
    max: 100
    step: 1
    default: 50
`

describe('parseSketchConfig', () => {
  it('devuelve config tipado para YAML válido', () => {
    const config = parseSketchConfig(VALID_YAML)
    expect(config.name).toBe('test-sketch')
    expect(config.modules.canvas.width).toBe(600)
  })

  it('lanza error para YAML inválido (no objeto)', () => {
    expect(() => parseSketchConfig('- lista\n- de\n- items')).toThrow()
  })

  it('lanza error si falta el campo canvas', () => {
    const yaml = `
name: sin-canvas
modules:
  radius:
    type: range
    label: Radio
    min: 0
    max: 100
    step: 1
    default: 50
`
    expect(() => parseSketchConfig(yaml)).toThrow(/canvas/)
  })

  it('normaliza config legacy con parametros anidados', () => {
    const yaml = `
name: legacy
modules:
  canvas:
    type: canvas
    width: 640
    height: 480
  parametros:
    type: params
    params:
      seed:
        type: range
        label: Semilla
        min: 0
        max: 10
        step: 1
        default: 5
`
    const config = parseSketchConfig(yaml)
    expect(config.modules.canvas.width).toBe(640)
    expect(config.modules.seed).toMatchObject({
      type: 'range',
      label: 'Semilla',
      default: 5,
    })
  })
})
