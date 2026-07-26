import { describe, expect, it } from 'vitest'
import { BLANK_CONFIG_YAML, BLANK_SKETCH_JS } from './blankSketch'
import { parseSketchConfig } from './yaml'

describe('blankSketch', () => {
  it('BLANK_CONFIG_YAML es parseable y define un canvas válido', () => {
    const config = parseSketchConfig(BLANK_CONFIG_YAML)
    expect(config.modules.canvas.width).toBeGreaterThan(0)
    expect(config.modules.canvas.height).toBeGreaterThan(0)
  })

  it('BLANK_SKETCH_JS cumple el contrato mínimo del sketch', () => {
    expect(BLANK_SKETCH_JS).toContain('params')
    expect(BLANK_SKETCH_JS).toContain('addEventListener')
    expect(BLANK_SKETCH_JS).toContain('SKETCH_READY')
  })
})
