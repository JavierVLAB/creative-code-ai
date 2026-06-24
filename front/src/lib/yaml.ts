import * as jsYaml from 'js-yaml'
import type { SketchConfig } from './types'

export function parseSketchConfig(yamlText: string): SketchConfig {
  const raw = jsYaml.load(yamlText)

  if (typeof raw !== 'object' || raw === null) {
    throw new Error('El YAML del sketch no es un objeto válido')
  }

  const config = raw as Record<string, unknown>

  if (!config.modules || typeof config.modules !== 'object') {
    throw new Error('El campo "modules" es obligatorio en config.yaml')
  }

  const modules = config.modules as Record<string, unknown>

  if (!modules.canvas || typeof modules.canvas !== 'object') {
    throw new Error('El módulo "canvas" es obligatorio en config.yaml')
  }

  return config as unknown as SketchConfig
}
