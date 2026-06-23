// Herramienta de ejemplo para Mastra.
// Define el patrón canónico para crear tools: schema Zod de entrada, schema Zod de salida,
// y función execute tipada.

import { z } from 'zod'
import { createTool } from 'mastra'

const inputSchema = z.object({
  name: z.string().describe('Nombre a saludar'),
})

const outputSchema = z.object({
  greeting: z.string().describe('Saludo generado'),
})

/** Ejemplo de tool Mastra con esquemas Zod de entrada y salida. */
export function createExampleTool() {
  return createTool({
    id: 'example-tool',
    description: 'Tool de ejemplo que saluda a un nombre',
    inputSchema,
    outputSchema,
    execute: async ({ context }) => {
      return { greeting: `Hola, ${context.name}!` }
    },
  })
}
