import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

const inputSchema = z.object({
  projectMemory: z.string().describe('La memoria del proyecto hasta ahora'),
  completedSteps: z.string().describe('Resumen de lo que se acaba de hacer (2-5 líneas)'),
})

const outputSchema = z.object({
  memoryProposal: z.string().describe('Fragmento de texto para añadir a la memoria del proyecto'),
})

// Exportada para tests: valida que completedSteps cumpla los requisitos de calidad
export async function executeUpdateMemory(input: { projectMemory: string; completedSteps: string }) {
  const trimmed = input.completedSteps.trim()

  if (!trimmed) {
    throw new Error('completedSteps no puede estar vacío.')
  }

  const lines = trimmed.split('\n').filter((l) => l.trim().length > 0)
  if (lines.length > 5) {
    throw new Error(`completedSteps tiene ${lines.length} líneas; el máximo es 5.`)
  }

  return { memoryProposal: trimmed }
}

export function createUpdateMemoryTool() {
  return createTool({
    id: 'update_memory',
    description:
      'Propone un fragmento de texto para añadir a la memoria del proyecto. ' +
      'Úsala solo tras cambios significativos (nueva técnica, decisión estética importante). ' +
      'El fragmento debe ser de 2-5 líneas, conciso y útil para entender el proyecto meses después.',
    inputSchema,
    outputSchema,
    execute: executeUpdateMemory,
  })
}
