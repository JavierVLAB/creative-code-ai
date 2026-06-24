import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { load } from 'js-yaml'

const inputSchema = z.object({
  configYaml: z.string().describe('El config.yaml completo y actualizado'),
  instruction: z.string().describe('La instrucción original del usuario'),
})

const outputSchema = z.object({
  configYaml: z.string().describe('El config.yaml validado'),
})

// Exportada para tests: valida que el YAML sea parseable antes de devolverlo
export async function executeEditParams(input: { configYaml: string; instruction: string }) {
  try {
    load(input.configYaml)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    throw new Error(`YAML inválido: ${msg}`)
  }
  return { configYaml: input.configYaml }
}

export function createEditParamsTool() {
  return createTool({
    id: 'edit_params',
    description:
      'Recibe un config.yaml completo y lo valida. Úsala cuando quieras modificar parámetros del sketch. ' +
      'Devuelve el YAML si es válido; lanza error si no lo es para que puedas corregirlo.',
    inputSchema,
    outputSchema,
    execute: executeEditParams,
  })
}
