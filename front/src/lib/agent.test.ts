import { describe, expect, it } from 'vitest'

import {
  appendProjectMemory,
  buildMemoryPatch,
  formatAgentApplySummary,
  getAgentChangeSet,
  inferRenderer,
  parseAgentResponse,
} from './agent'

describe('parseAgentResponse', () => {
  it('devuelve respuesta tipada cuando el contrato es válido', () => {
    const response = parseAgentResponse({
      response: 'He ajustado el sketch.',
      appliedSketchJs: 'function setup() {}',
      memorySuggestion: 'Usar formas suaves.',
    })

    expect(response.response).toBe('He ajustado el sketch.')
    expect(response.appliedSketchJs).toContain('setup')
    expect(response.memorySuggestion).toBe('Usar formas suaves.')
  })

  it('lanza error cuando falta response', () => {
    expect(() => parseAgentResponse({ appliedConfigYaml: 'name: test' })).toThrow(/incompleta/)
  })
})

describe('getAgentChangeSet', () => {
  it('detecta cambios de sketch y config', () => {
    const changeSet = getAgentChangeSet({
      response: 'Listo.',
      appliedSketchJs: 'const x = 1',
      appliedConfigYaml: 'name: test',
    })

    expect(changeSet).toEqual({ hasSketchChange: true, hasConfigChange: true })
  })

  it('no marca cambios para respuestas conversacionales', () => {
    const changeSet = getAgentChangeSet({ response: 'Buena pregunta.' })

    expect(changeSet).toEqual({ hasSketchChange: false, hasConfigChange: false })
  })
})

describe('inferRenderer', () => {
  it('devuelve threejs cuando el código usa THREE', () => {
    expect(inferRenderer('const scene = new THREE.Scene()')).toBe('threejs')
  })

  it('devuelve p5js cuando el código no usa THREE', () => {
    expect(inferRenderer('function setup() { createCanvas(600, 600) }')).toBe('p5js')
  })
})

describe('formatAgentApplySummary', () => {
  it('resume cuando se aplican sketch y config', () => {
    expect(formatAgentApplySummary({
      response: 'Listo.',
      appliedSketchJs: 'const sketch = true',
      appliedConfigYaml: 'name: test',
    })).toBe('Aplicado: sketch.js y config.yaml.')
  })

  it('avisa cuando no hay cambios aplicados', () => {
    expect(formatAgentApplySummary({ response: 'Solo conversación.' })).toBe('Sin cambios aplicados al sketch.')
  })
})

describe('appendProjectMemory', () => {
  it('concatena la sugerencia con una línea en blanco', () => {
    expect(appendProjectMemory('Memoria previa', 'Nueva nota')).toBe('Memoria previa\n\nNueva nota')
  })

  it('usa solo la sugerencia si no hay memoria previa', () => {
    expect(appendProjectMemory(null, 'Nueva nota')).toBe('Nueva nota')
  })
})

describe('buildMemoryPatch', () => {
  it('prepara memoria y updatedAt si el usuario aprueba', () => {
    const patch = buildMemoryPatch('Memoria previa', 'Nueva nota', true)

    expect(patch?.memory).toBe('Memoria previa\n\nNueva nota')
    expect(patch?.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('no prepara patch si el usuario ignora', () => {
    expect(buildMemoryPatch('Memoria previa', 'Nueva nota', false)).toBeNull()
  })
})
