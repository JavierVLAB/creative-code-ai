// Verifica que la batería local cubre los escenarios mínimos acordados
// y que cada caso tiene expectativas observables para revisar el agente con consistencia.
import { describe, expect, it } from 'vitest'
import { LOCAL_AGENT_EVAL_CASES } from './local-agent-eval-cases.js'

describe('LOCAL_AGENT_EVAL_CASES', () => {
  it('incluye exactamente 5 casos representativos', () => {
    expect(LOCAL_AGENT_EVAL_CASES).toHaveLength(5)
  })

  it('cubre conversación directa, parámetros, sketch, cambio mixto y ambigüedad', () => {
    const categories = new Set(LOCAL_AGENT_EVAL_CASES.map((testCase) => testCase.category))

    expect(categories).toEqual(
      new Set([
        'direct-conversation',
        'parameter-change',
        'sketch-change',
        'parameter-and-sketch-change',
        'ambiguous',
      ]),
    )
  })

  it('define criterios observables en todos los casos', () => {
    for (const testCase of LOCAL_AGENT_EVAL_CASES) {
      expect(testCase.expected.responseMustMention.length).toBeGreaterThan(0)
      expect(testCase.expected.reviewNotes.length).toBeGreaterThan(0)
    }
  })
})
