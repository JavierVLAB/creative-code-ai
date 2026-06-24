import { describe, it, expect } from 'vitest'
import { executeEditSketch } from './edit-sketch.js'

const BASE_INPUT = {
  configYaml: 'name: test\n',
  instruction: 'añade partículas',
  renderer: 'p5js' as const,
}

const VALID_SKETCH = `
let params = { speed: 1 }
window.addEventListener('message', (e) => {
  if (e.data?.type === 'UPDATE_PARAMS') params = e.data.params
})
function setup() {}
function draw() {}
`

describe('executeEditSketch', () => {
  it('acepta un sketch válido con params y addEventListener', async () => {
    const result = await executeEditSketch({ ...BASE_INPUT, sketchJs: VALID_SKETCH })
    expect(result.sketchJs).toBe(VALID_SKETCH)
  })

  it('lanza error si el sketch no contiene "params"', async () => {
    const sketch = `
let config = { speed: 1 }
window.addEventListener('message', (e) => {
  if (e.data?.type === 'UPDATE_CONFIG') config = e.data.config
})
function setup() {}
`
    await expect(executeEditSketch({ ...BASE_INPUT, sketchJs: sketch })).rejects.toThrow(
      'params',
    )
  })

  it('lanza error si el sketch no contiene "addEventListener"', async () => {
    const sketch = VALID_SKETCH.replace('addEventListener', 'on')
    await expect(executeEditSketch({ ...BASE_INPUT, sketchJs: sketch })).rejects.toThrow(
      'addEventListener',
    )
  })
})
