// Valida la transformación a dataset y la lógica de scoring local
// para que el experimento de Studio tenga criterios consistentes y repetibles.
import { describe, expect, it } from 'vitest'
import {
  LOCAL_AGENT_EVAL_RESOURCE_ID,
  createLocalAgentEvalDatasetItems,
  evaluateLocalAgentOutput,
} from './local-agent-experiment.js'

describe('createLocalAgentEvalDatasetItems', () => {
  it('genera 5 items con target input listo para el workflow', () => {
    const items = createLocalAgentEvalDatasetItems()

    expect(items).toHaveLength(5)
    expect(items[0]?.input.resourceId).toBe(LOCAL_AGENT_EVAL_RESOURCE_ID)
    expect(items[0]?.input.threadId).toBe('00000000-0000-4000-8000-000000000001')
  })
})

describe('evaluateLocalAgentOutput', () => {
  it('aprueba un output que cumple las expectativas visibles', () => {
    const item = createLocalAgentEvalDatasetItems()[1]
    const result = evaluateLocalAgentOutput(
      {
        response: 'He subido circleCount a 24 y speed a 0.2 para que el movimiento sea mas calmado.',
        appliedConfigYaml: 'renderer: p5js',
      },
      item?.groundTruth,
    )

    expect(result.passed).toBe(true)
    expect(result.failures).toHaveLength(0)
  })

  it('falla cuando falta una aclaracion esperada', () => {
    const item = createLocalAgentEvalDatasetItems()[4]
    const result = evaluateLocalAgentOutput(
      {
        response: 'Lo he dejado mas limpio.',
      },
      item?.groundTruth,
    )

    expect(result.passed).toBe(false)
    expect(result.failures).toContain('Se esperaba pendingQuestion y no apareció.')
  })
})

