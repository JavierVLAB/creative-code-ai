import { describe, it, expect } from 'vitest'
import { executeUpdateMemory } from './update-memory.js'

const BASE_INPUT = { projectMemory: 'contexto previo del proyecto' }

describe('executeUpdateMemory', () => {
  it('devuelve la propuesta si completedSteps es válido', async () => {
    const completedSteps = 'Añadí partículas usando p5.js.\nUsé noise() para movimiento orgánico.'
    const result = await executeUpdateMemory({ ...BASE_INPUT, completedSteps })
    expect(result.memoryProposal).toBe(completedSteps.trim())
  })

  it('lanza error si completedSteps está vacío', async () => {
    await expect(executeUpdateMemory({ ...BASE_INPUT, completedSteps: '' })).rejects.toThrow(
      'vacío',
    )
  })

  it('lanza error si completedSteps tiene más de 5 líneas', async () => {
    const completedSteps = Array.from({ length: 6 }, (_, i) => `línea ${i + 1}`).join('\n')
    await expect(executeUpdateMemory({ ...BASE_INPUT, completedSteps })).rejects.toThrow(
      'máximo es 5',
    )
  })

  it('acepta completedSteps con exactamente 5 líneas', async () => {
    const completedSteps = Array.from({ length: 5 }, (_, i) => `línea ${i + 1}`).join('\n')
    const result = await executeUpdateMemory({ ...BASE_INPUT, completedSteps })
    expect(result.memoryProposal).toBeTruthy()
  })
})
