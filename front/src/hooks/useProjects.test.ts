import { describe, expect, it } from 'vitest'
import { resolveOriginContent } from './useProjects'
import { BLANK_CONFIG_YAML, BLANK_SKETCH_JS } from '../lib/blankSketch'

describe('resolveOriginContent', () => {
  it('origen blanco devuelve el boilerplate en blanco', () => {
    expect(resolveOriginContent({ type: 'blank' })).toEqual({
      sketchJs: BLANK_SKETCH_JS,
      configYaml: BLANK_CONFIG_YAML,
    })
  })

  it('origen plantilla devuelve el contenido de la plantilla elegida', () => {
    const result = resolveOriginContent({
      type: 'template',
      sketchJs: 'function setup() { /* plantilla */ }',
      configYaml: 'name: plantilla',
    })

    expect(result).toEqual({
      sketchJs: 'function setup() { /* plantilla */ }',
      configYaml: 'name: plantilla',
    })
  })
})
