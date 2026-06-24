import { describe, it, expect } from 'vitest'
import { executeEditParams } from './edit-params.js'

describe('executeEditParams', () => {
  const instruction = 'cambia el radio a 100'

  it('devuelve el YAML si es válido', async () => {
    const configYaml = `name: mi-sketch\nmodules:\n  canvas:\n    width: 800\n    height: 800\n`
    const result = await executeEditParams({ configYaml, instruction })
    expect(result.configYaml).toBe(configYaml)
  })

  it('lanza error si el YAML es inválido', async () => {
    const configYaml = 'key: [unclosed bracket\n'
    await expect(executeEditParams({ configYaml, instruction })).rejects.toThrow('YAML inválido')
  })

  it('lanza error si el YAML tiene indentación incorrecta', async () => {
    const configYaml = 'a:\n  b: 1\n c: 2\n' // indentación mezclada
    await expect(executeEditParams({ configYaml, instruction })).rejects.toThrow('YAML inválido')
  })
})
