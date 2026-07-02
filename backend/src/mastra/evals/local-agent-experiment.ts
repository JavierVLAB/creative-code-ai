// Prepara el dataset local del agente y sus reglas mínimas de evaluación
// para que la batería se ejecute como dataset + experiment visible en Mastra Studio.
import { createScorer } from '@mastra/core/evals'
import { z } from 'zod/v4'
import {
  LOCAL_AGENT_EVAL_CASES,
  type LocalAgentEvalCase,
  type LocalAgentEvalExpectedTool,
} from './local-agent-eval-cases.js'

export const LOCAL_AGENT_EVAL_DATASET_NAME = 'local-agent-observability-evals'
export const LOCAL_AGENT_EVAL_WORKFLOW_ID = 'agent-guardrails'
export const LOCAL_AGENT_EVAL_SCORER_ID = 'local-agent-output-expectations'
export const LOCAL_AGENT_EVAL_RESOURCE_ID = '00000000-0000-4000-8000-000000000999'

const localAgentEvalInputSchema = z.object({
  message: z.string(),
  sketchJs: z.string(),
  configYaml: z.string(),
  renderer: z.enum(['p5js', 'threejs']),
  threadId: z.string(),
  resourceId: z.string(),
  previousResponse: z.string().optional(),
})

const localAgentEvalGroundTruthSchema = z.object({
  caseId: z.string(),
  title: z.string(),
  category: z.enum([
    'direct-conversation',
    'parameter-change',
    'sketch-change',
    'parameter-and-sketch-change',
    'ambiguous',
  ]),
  shouldApplyConfig: z.boolean(),
  shouldApplySketch: z.boolean(),
  shouldAskClarification: z.boolean(),
  expectedTools: z.array(z.enum(['edit_params', 'edit_sketch'])),
  responseMustMention: z.array(z.string()),
  reviewNotes: z.string(),
})

const localAgentEvalOutputSchema = z.object({
  response: z.string(),
  appliedConfigYaml: z.string().optional(),
  appliedSketchJs: z.string().optional(),
  memorySuggestion: z.string().optional(),
  pendingQuestion: z.string().optional(),
})

export interface LocalAgentEvalDatasetInput {
  message: string
  sketchJs: string
  configYaml: string
  renderer: 'p5js' | 'threejs'
  threadId: string
  resourceId: string
  previousResponse?: string
}

export interface LocalAgentEvalGroundTruth {
  caseId: string
  title: string
  category: LocalAgentEvalCase['category']
  shouldApplyConfig: boolean
  shouldApplySketch: boolean
  shouldAskClarification: boolean
  expectedTools: LocalAgentEvalExpectedTool[]
  responseMustMention: string[]
  reviewNotes: string
}

export interface LocalAgentEvalDatasetItem {
  input: LocalAgentEvalDatasetInput
  groundTruth: LocalAgentEvalGroundTruth
  metadata: {
    caseId: string
    title: string
    category: LocalAgentEvalCase['category']
  }
}

export interface LocalAgentEvalCheckResult {
  passed: boolean
  failures: string[]
}

function buildDeterministicThreadId(index: number) {
  return `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`
}

function normalizeText(value: string) {
  return value.normalize('NFKD').toLowerCase()
}

function hasAppliedValue(value: string | undefined) {
  return typeof value === 'string' && value.trim().length > 0
}

export function createLocalAgentEvalDatasetItems(): LocalAgentEvalDatasetItem[] {
  return LOCAL_AGENT_EVAL_CASES.map((testCase, index) => ({
    input: {
      message: testCase.message,
      sketchJs: testCase.sketchJs,
      configYaml: testCase.configYaml,
      renderer: testCase.renderer,
      threadId: buildDeterministicThreadId(index),
      resourceId: LOCAL_AGENT_EVAL_RESOURCE_ID,
    },
    groundTruth: {
      caseId: testCase.id,
      title: testCase.title,
      category: testCase.category,
      shouldApplyConfig: testCase.expected.shouldApplyConfig,
      shouldApplySketch: testCase.expected.shouldApplySketch,
      shouldAskClarification: testCase.expected.shouldAskClarification,
      expectedTools: testCase.expected.expectedTools,
      responseMustMention: testCase.expected.responseMustMention,
      reviewNotes: testCase.expected.reviewNotes,
    },
    metadata: {
      caseId: testCase.id,
      title: testCase.title,
      category: testCase.category,
    },
  }))
}

export function evaluateLocalAgentOutput(
  output: unknown,
  groundTruth: LocalAgentEvalGroundTruth | undefined,
): LocalAgentEvalCheckResult {
  if (!groundTruth) {
    return {
      passed: false,
      failures: ['No hay groundTruth para evaluar este item.'],
    }
  }

  const parsedOutput = localAgentEvalOutputSchema.safeParse(output)
  if (!parsedOutput.success) {
    return {
      passed: false,
      failures: ['El output del experimento no cumple el schema esperado del agente.'],
    }
  }

  const normalizedResponse = normalizeText(parsedOutput.data.response)
  const failures: string[] = []

  for (const expectedFragment of groundTruth.responseMustMention) {
    if (!normalizedResponse.includes(normalizeText(expectedFragment))) {
      failures.push(`La respuesta no menciona "${expectedFragment}".`)
    }
  }

  const appliedConfig = hasAppliedValue(parsedOutput.data.appliedConfigYaml)
  if (appliedConfig !== groundTruth.shouldApplyConfig) {
    failures.push(
      groundTruth.shouldApplyConfig
        ? 'Se esperaba appliedConfigYaml y no apareció.'
        : 'No se esperaba appliedConfigYaml y apareció.',
    )
  }

  const appliedSketch = hasAppliedValue(parsedOutput.data.appliedSketchJs)
  if (appliedSketch !== groundTruth.shouldApplySketch) {
    failures.push(
      groundTruth.shouldApplySketch
        ? 'Se esperaba appliedSketchJs y no apareció.'
        : 'No se esperaba appliedSketchJs y apareció.',
    )
  }

  const askedClarification = hasAppliedValue(parsedOutput.data.pendingQuestion)
  if (askedClarification !== groundTruth.shouldAskClarification) {
    failures.push(
      groundTruth.shouldAskClarification
        ? 'Se esperaba pendingQuestion y no apareció.'
        : 'No se esperaba pendingQuestion y apareció.',
    )
  }

  return {
    passed: failures.length === 0,
    failures,
  }
}

export const localAgentOutputExpectationsScorer = createScorer({
  id: LOCAL_AGENT_EVAL_SCORER_ID,
  description:
    'Comprueba si el output del workflow coincide con las expectativas visibles del caso local.',
  type: {
    input: localAgentEvalInputSchema,
    output: localAgentEvalOutputSchema,
  },
})
  .generateScore(({ run }) => {
    const result = evaluateLocalAgentOutput(
      run.output,
      localAgentEvalGroundTruthSchema.parse(run.groundTruth),
    )
    return result.passed ? 1 : 0
  })
  .generateReason(({ run }) => {
    const groundTruth = localAgentEvalGroundTruthSchema.parse(run.groundTruth)
    const result = evaluateLocalAgentOutput(run.output, groundTruth)

    if (result.passed) {
      return `Caso ${groundTruth.caseId} correcto segun las expectativas visibles del output.`
    }

    return `Caso ${groundTruth.caseId} incorrecto: ${result.failures.join(' ')}`
  })
