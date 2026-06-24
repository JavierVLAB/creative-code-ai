import { Workflow, createStep } from '@mastra/core/workflows'
import { z } from 'zod'

export const agentInputSchema = z.object({
  message: z.string().describe('Instrucción del usuario'),
  sketchJs: z.string().describe('Código actual del sketch'),
  configYaml: z.string().describe('Config.yaml actual'),
  renderer: z.enum(['p5js', 'threejs']).describe('Motor de renderizado'),
  threadId: z.string().describe('ID del proyecto (= thread de conversación)'),
  resourceId: z.string().describe('ID del usuario'),
  previousResponse: z.string().optional().describe('Respuesta anterior para detectar bucles'),
})

export const agentOutputSchema = z.object({
  response: z.string(),
  appliedConfigYaml: z.string().optional(),
  appliedSketchJs: z.string().optional(),
  memorySuggestion: z.string().optional(),
  pendingQuestion: z.string().optional(),
})

export type AgentInput = z.infer<typeof agentInputSchema>
export type AgentOutput = z.infer<typeof agentOutputSchema>

const runAgentStep = createStep({
  id: 'run-agent',
  inputSchema: agentInputSchema,
  outputSchema: agentOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('sketch-agent')

    const prompt = `Instrucción del usuario: ${inputData.message}

Sketch actual (${inputData.renderer}):
\`\`\`js
${inputData.sketchJs}
\`\`\`

Config actual:
\`\`\`yaml
${inputData.configYaml}
\`\`\``

    // maxSteps: 4 = hasta 3 tool-calls + 1 respuesta final (guardrail de límite de pasos)
    const result = await agent.generate(prompt, {
      maxSteps: 4,
      memory: { thread: inputData.threadId, resource: inputData.resourceId },
      structuredOutput: { schema: agentOutputSchema },
    })

    const output = result.object as AgentOutput

    // Guardrail: detección de bucle — misma respuesta que la anterior
    if (inputData.previousResponse && output.response === inputData.previousResponse) {
      throw new Error('Bucle detectado: el agente está repitiendo la misma respuesta sin cambios.')
    }

    return output
  },
})

export function createAgentGuardrailsWorkflow() {
  const workflow = new Workflow({
    id: 'agent-guardrails',
    inputSchema: agentInputSchema,
    outputSchema: agentOutputSchema,
  })

  workflow.then(runAgentStep).commit()
  return workflow
}
