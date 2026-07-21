// Tipos de dominio compartidos por el workspace, el agente y la UI.

export interface CanvasConfig {
  width: number
  height: number
}

export interface RangeModuleConfig {
  type: 'range'
  label: string
  min: number
  max: number
  step: number
  default: number
}

export interface SelectOption {
  label: string
  value: string
}

export interface SelectModuleConfig {
  type: 'select'
  label: string
  options: SelectOption[]
  default: string
}

export type ModuleConfig = RangeModuleConfig | SelectModuleConfig

export interface SketchConfig {
  name: string
  modules: {
    canvas: CanvasConfig
    [key: string]: CanvasConfig | ModuleConfig
  }
}

export interface SliderControl {
  kind: 'slider'
  key: string
  label: string
  min: number
  max: number
  step: number
  defaultValue: number
}

export interface SelectControl {
  kind: 'select'
  key: string
  label: string
  options: SelectOption[]
  defaultValue: string
  isColor: boolean
}

export type Control = SliderControl | SelectControl

// Valores activos de los parámetros en la UI (clave del control → valor)
export type ParamValues = Record<string, string | number>

// Mensaje del chat con el agente IA.
// El envío real al backend llega en el change `frontend-agent`; aquí la UI es stub.
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'error'
  content: string
}

export type SketchRenderer = 'p5js' | 'threejs'

export interface AgentRequest {
  projectId: string
  message: string
  sketchJs: string
  configYaml: string
  renderer: SketchRenderer
  previousResponse?: string
}

export interface AgentResponse {
  response: string
  appliedConfigYaml?: string
  appliedSketchJs?: string
  memorySuggestion?: string
  pendingQuestion?: string
}

export interface Template {
  id: string
  slug: string
  title: string
  description: string | null
  sketchJs: string
  configYaml: string
  renderer: SketchRenderer
  thumbnailUrl: string | null
  tags: string[]
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

// Snapshot: combinación guardada de valores de parámetros de un proyecto.
// Persistido en la tabla `snapshots` de Supabase (columna `values`).
export interface Snapshot {
  id: string
  projectId: string
  label: string
  values: ParamValues
  previewUrl?: string
  isFavorite?: boolean
  createdAt: string
}
