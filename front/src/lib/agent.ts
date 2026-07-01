// Utilidades puras para validar respuestas del agente y preparar cambios del workspace.

import type { AgentResponse } from './types'

export class AgentResponseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AgentResponseError'
  }
}

export interface MemoryPatch {
  memory: string
  updatedAt: string
}

function readOptionalString(raw: Record<string, unknown>, key: keyof AgentResponse): string | undefined {
  const value = raw[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

/** Valida que una respuesta desconocida cumple el contrato mínimo del agente. */
export function parseAgentResponse(raw: unknown): AgentResponse {
  if (typeof raw !== 'object' || raw === null) {
    throw new AgentResponseError('La respuesta del agente no tiene un formato válido.')
  }

  const record = raw as Record<string, unknown>
  if (typeof record.response !== 'string' || record.response.trim().length === 0) {
    throw new AgentResponseError('La respuesta del agente llegó incompleta.')
  }

  return {
    response: record.response,
    appliedConfigYaml: readOptionalString(record, 'appliedConfigYaml'),
    appliedSketchJs: readOptionalString(record, 'appliedSketchJs'),
    memorySuggestion: readOptionalString(record, 'memorySuggestion'),
    pendingQuestion: readOptionalString(record, 'pendingQuestion'),
  }
}

/** Indica qué partes del sketch cambian con una respuesta del agente. */
export function getAgentChangeSet(response: AgentResponse) {
  return {
    hasSketchChange: typeof response.appliedSketchJs === 'string',
    hasConfigChange: typeof response.appliedConfigYaml === 'string',
  }
}

/** Resume para la UI qué artefactos aplicó realmente el agente. */
export function formatAgentApplySummary(response: AgentResponse): string {
  const { hasSketchChange, hasConfigChange } = getAgentChangeSet(response)
  if (hasSketchChange && hasConfigChange) return 'Aplicado: sketch.js y config.yaml.'
  if (hasSketchChange) return 'Aplicado: sketch.js.'
  if (hasConfigChange) return 'Aplicado: config.yaml.'
  return 'Sin cambios aplicados al sketch.'
}

/** Infere el motor del sketch desde el código actual. */
export function inferRenderer(sketchJs: string) {
  return /\bTHREE\b/.test(sketchJs) ? 'threejs' : 'p5js'
}

/** Concatena una sugerencia aprobada con la memoria existente del proyecto. */
export function appendProjectMemory(current: string | null, suggestion: string): string {
  const cleanSuggestion = suggestion.trim()
  if (!current?.trim()) return cleanSuggestion
  return `${current.trim()}\n\n${cleanSuggestion}`
}

/** Prepara el patch de memoria si el usuario aprueba la sugerencia. */
export function buildMemoryPatch(current: string | null, suggestion: string, approved: boolean): MemoryPatch | null {
  if (!approved) return null

  return {
    memory: appendProjectMemory(current, suggestion),
    updatedAt: new Date().toISOString(),
  }
}
