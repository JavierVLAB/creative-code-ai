import * as jsYaml from 'js-yaml'
import type { SketchConfig } from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeModules(modules: Record<string, unknown>): SketchConfig['modules'] {
  const canvasModule = modules.canvas

  if (!isRecord(canvasModule)) {
    throw new Error('El módulo "canvas" es obligatorio en config.yaml')
  }

  const width = canvasModule.width
  const height = canvasModule.height

  if (typeof width !== 'number' || typeof height !== 'number') {
    throw new Error('El módulo "canvas" debe incluir width y height numéricos')
  }

  const normalizedModules: SketchConfig['modules'] = {
    canvas: { width, height },
  }

  for (const [key, rawModule] of Object.entries(modules)) {
    if (key === 'canvas') continue

    if (
      key === 'parametros' &&
      isRecord(rawModule) &&
      rawModule.type === 'params' &&
      isRecord(rawModule.params)
    ) {
      for (const [legacyKey, legacyModule] of Object.entries(rawModule.params)) {
        if (isRecord(legacyModule) && typeof legacyModule.type === 'string') {
          normalizedModules[legacyKey] = legacyModule as unknown as SketchConfig['modules'][string]
        }
      }
      continue
    }

    if (isRecord(rawModule) && typeof rawModule.type === 'string') {
      normalizedModules[key] = rawModule as unknown as SketchConfig['modules'][string]
    }
  }

  return normalizedModules
}

export function parseSketchConfig(yamlText: string): SketchConfig {
  const raw = jsYaml.load(yamlText)

  if (!isRecord(raw)) {
    throw new Error('El YAML del sketch no es un objeto válido')
  }

  if (!isRecord(raw.modules)) {
    throw new Error('El campo "modules" es obligatorio en config.yaml')
  }

  return {
    ...raw,
    modules: normalizeModules(raw.modules),
  } as SketchConfig
}

// Serializa un SketchConfig de vuelta a YAML. Se usa al aplicar cambios de canvas
// desde la UI (no preserva comentarios del YAML original; aceptable para el MVP).
export function serializeSketchConfig(config: SketchConfig): string {
  return jsYaml.dump(config, { indent: 2, lineWidth: -1 })
}
