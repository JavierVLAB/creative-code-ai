// Tipos compartidos entre frontend y backend.
// Solo tipos — sin lógica, sin imports de frameworks.

export interface Project {
  id: string
  userId: string
  name: string
  description?: string
  sketchJs: string
  configYaml: string
  renderer: 'p5js' | 'threejs'
  projectMemory?: string
  createdAt: string
  updatedAt: string
}

export interface Snapshot {
  id: string
  projectId: string
  label?: string
  values: Record<string, string | number>
  previewUrl?: string
  isFavorite?: boolean
  createdAt: string
}

export interface AgentResponse {
  response: string
  appliedConfigYaml?: string
  appliedSketchJs?: string
  memorySuggestion?: string
  pendingQuestion?: string
}
