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

// Origen de un proyecto nuevo al crearlo. "Pedirle a la IA" no es un origen de
// datos distinto: siempre parte de { type: 'blank' } y la descripción inicial
// se envía como primer mensaje de chat una vez creado el proyecto.
// El origen "template" lleva el contenido ya resuelto (la plantilla ya está
// cargada en memoria por quien la elige, vía usePublishedTemplates) — evita
// un round-trip extra a Supabase dentro de createProject.
export type ProjectOrigin =
  | { type: 'blank' }
  | { type: 'template'; sketchJs: string; configYaml: string }

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
