import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

const inputSchema = z.object({
  sketchJs: z.string().describe('El sketch.js completo y actualizado'),
  configYaml: z.string().describe('El config.yaml actual para referencia'),
  instruction: z.string().describe('La instrucción original del usuario'),
  renderer: z.enum(['p5js', 'threejs']).describe('Motor de renderizado del sketch'),
})

const outputSchema = z.object({
  sketchJs: z.string().describe('El sketch.js validado'),
})

// Exportada para tests: valida que el sketch cumpla el contrato mínimo
export async function executeEditSketch(input: {
  sketchJs: string
  configYaml: string
  instruction: string
  renderer: 'p5js' | 'threejs'
}) {
  if (!input.sketchJs.includes('params')) {
    throw new Error(
      'sketch.js inválido: debe contener "params" — todos los valores visuales deben venir de params.',
    )
  }
  if (!input.sketchJs.includes('addEventListener')) {
    throw new Error(
      'sketch.js inválido: debe contener "addEventListener" — el patrón postMessage es obligatorio.',
    )
  }
  return { sketchJs: input.sketchJs }
}

export function createEditSketchTool() {
  return createTool({
    id: 'edit_sketch',
    description:
      'Recibe un sketch.js completo y lo valida. Úsala cuando quieras modificar el código del sketch. ' +
      'El sketch debe incluir "params" y "addEventListener". Devuelve el código si es válido.',
    inputSchema,
    outputSchema,
    execute: executeEditSketch,
  })
}
