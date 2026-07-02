import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

import { FileExplorerPanel } from '../components/workspace/FileExplorerPanel'
import { DevPanel } from '../components/workspace/DevPanel'
import { EditorPanel } from '../components/workspace/EditorPanel'
import { Sidebar } from '../components/workspace/Sidebar'
import { SketchViewer } from '../components/workspace/SketchViewer'
import { WorkspaceLayout } from '../components/workspace/WorkspaceLayout'
import { generateControls } from '../lib/controls'
import { buildMemoryPatch, formatAgentApplySummary, getAgentChangeSet, inferRenderer } from '../lib/agent'
import { parseSketchConfig, serializeSketchConfig } from '../lib/yaml'
import { supabase } from '../lib/supabase'
import { defaultValues, useSketch } from '../hooks/useSketch'
import { useAgent } from '../hooks/useAgent'

import type { Database, Json } from '../lib/database.types'
import type { AgentResponse, ChatMessage, Control, ParamValues, SketchConfig, Snapshot } from '../lib/types'

type Project = Database['public']['Tables']['projects']['Row']
type SnapshotRow = Database['public']['Tables']['snapshots']['Row']

const DEFAULT_CANVAS = { width: 600, height: 600 }
const EDITOR_DEBOUNCE_MS = 1500
const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hola, soy tu asistente de arte generativo. Pídeme cambios sobre el sketch o pregúntame por el proyecto.',
}

type ProjectPatch = Database['public']['Tables']['projects']['Update']

function createMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return { id: `${Date.now()}-${crypto.randomUUID()}`, role, content }
}

// Mapea una fila de la tabla snapshots al tipo de dominio Snapshot.
function mapSnapshot(row: SnapshotRow): Snapshot {
  return {
    id: row.id,
    projectId: row.project_id,
    label: row.label ?? '',
    values: (row.values ?? {}) as ParamValues,
    createdAt: row.created_at,
  }
}

// Extrae el tamaño del canvas del config.yaml; usa el default si no es válido.
function extractCanvasSize(configYaml: string | null): { width: number; height: number } {
  if (!configYaml) return DEFAULT_CANVAS
  try {
    const config = parseSketchConfig(configYaml)
    return { width: config.modules.canvas.width, height: config.modules.canvas.height }
  } catch {
    return DEFAULT_CANVAS
  }
}

export function WorkspacePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [controls, setControls] = useState<Control[]>([])
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [canvasSize, setCanvasSize] = useState(DEFAULT_CANVAS)
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [activeFile, setActiveFile] = useState<'sketch.js' | 'config.yaml' | null>(null)
  const [editorContent, setEditorContent] = useState('')
  const [loading, setLoading] = useState(true)

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [memorySuggestion, setMemorySuggestion] = useState<string | null>(null)
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null)
  const [previousResponse, setPreviousResponse] = useState<string | undefined>(undefined)

  const { iframeRef, status, errorMessage, sendInit, sendUpdate, sendRestart } = useSketch()
  const { sendMessage, loading: agentLoading } = useAgent()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Carga el proyecto y sus snapshots al montar (o al cambiar de proyecto).
  useEffect(() => {
    if (!id) return
    let active = true

    async function load() {
      const [{ data: proj }, { data: snaps }] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id!).single(),
        supabase.from('snapshots').select('*').eq('project_id', id!).order('created_at', { ascending: true }),
      ])
      if (!active) return
      setProject(proj)
      setCanvasSize(extractCanvasSize(proj?.config_yaml ?? null))
      setSnapshots((snaps ?? []).map(mapSnapshot))
      setLoading(false)
    }

    load()
    return () => { active = false }
  }, [id])

  // Limpia el debounce pendiente del editor al desmontar.
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  function handleControlsReady(newControls: Control[]) {
    setControls(newControls)
    setValues(Object.fromEntries(newControls.map(c => [c.key, c.defaultValue])))
  }

  function handleControlChange(key: string, value: unknown) {
    const newValues = { ...values, [key]: value }
    setValues(newValues)
    sendUpdate(newValues)
  }

  async function applyAgentResponse(result: AgentResponse) {
    if (!project) return

    const { hasSketchChange, hasConfigChange } = getAgentChangeSet(result)
    if (!hasSketchChange && !hasConfigChange) return

    let nextConfig: SketchConfig | null = null
    if (hasConfigChange && result.appliedConfigYaml) {
      nextConfig = parseSketchConfig(result.appliedConfigYaml)
    }

    const patch: ProjectPatch = { updated_at: new Date().toISOString() }
    if (hasSketchChange) patch.sketch_js = result.appliedSketchJs
    if (hasConfigChange) patch.config_yaml = result.appliedConfigYaml

    const { error } = await supabase.from('projects').update(patch).eq('id', project.id)
    if (error) throw new Error('No pude guardar los cambios del agente en Supabase.')

    if (nextConfig && result.appliedConfigYaml) {
      const nextControls = generateControls(nextConfig)
      const nextValues = defaultValues(nextControls)
      setControls(nextControls)
      setValues(nextValues)
      setCanvasSize({ width: nextConfig.modules.canvas.width, height: nextConfig.modules.canvas.height })
    }

    setProject(prev => (prev ? { ...prev, ...patch } : prev))
    if (activeFile === 'sketch.js' && result.appliedSketchJs) setEditorContent(result.appliedSketchJs)
    if (activeFile === 'config.yaml' && result.appliedConfigYaml) setEditorContent(result.appliedConfigYaml)
  }

  async function handleChatSend(text: string) {
    if (!project) return

    setMemorySuggestion(null)
    setPendingQuestion(null)
    setMessages(prev => [...prev, createMessage('user', text)])

    try {
      const result = await sendMessage({
        projectId: project.id,
        message: text,
        sketchJs: project.sketch_js ?? '',
        configYaml: project.config_yaml ?? '',
        renderer: inferRenderer(project.sketch_js ?? ''),
        previousResponse,
      })

      await applyAgentResponse(result)
      setPreviousResponse(result.response)
      setPendingQuestion(result.pendingQuestion ?? null)
      setMemorySuggestion(result.memorySuggestion ?? null)
      const content = result.pendingQuestion ?? `${result.response}\n\n${formatAgentApplySummary(result)}`
      setMessages(prev => [...prev, createMessage('assistant', content)])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No pude conectar con el agente, inténtalo de nuevo.'
      setMessages(prev => [...prev, createMessage('error', message)])
    }
  }

  async function handleMemoryApprove(text: string) {
    if (!project) return
    const memoryPatch = buildMemoryPatch(project.memory, text, true)
    if (!memoryPatch) return

    const patch: ProjectPatch = { memory: memoryPatch.memory, updated_at: memoryPatch.updatedAt }
    const { error } = await supabase.from('projects').update(patch).eq('id', project.id)

    if (error) {
      setMessages(prev => [...prev, createMessage('error', 'No pude guardar la memoria del proyecto.')])
      return
    }

    setProject(prev => (prev ? { ...prev, memory: memoryPatch.memory, updated_at: memoryPatch.updatedAt } : prev))
    setMemorySuggestion(null)
  }

  // Aplica un nuevo tamaño de canvas: reescribe config.yaml, lo persiste y deja
  // que SketchViewer reinicie el sketch al recibir el config actualizado.
  function handleCanvasApply(size: { width: number; height: number }) {
    if (!project?.config_yaml) return
    let config: SketchConfig
    try {
      config = parseSketchConfig(project.config_yaml)
    } catch {
      return
    }
    config.modules.canvas = { width: size.width, height: size.height }
    const newYaml = serializeSketchConfig(config)
    setProject(prev => (prev ? { ...prev, config_yaml: newYaml } : prev))
    setCanvasSize(size)
    supabase.from('projects').update({ config_yaml: newYaml }).eq('id', project.id)
  }

  function handleSnapshotSave(label: string) {
    if (!project) return
    supabase
      .from('snapshots')
      // El dueño del snapshot es el del proyecto (RLS: user_id = auth.uid()).
      .insert({ project_id: project.id, user_id: project.user_id, label, values: values as unknown as Json })
      .select()
      .single()
      .then(({ data }) => { if (data) setSnapshots(prev => [...prev, mapSnapshot(data)]) })
  }

  function handleSnapshotLoad(snapshot: Snapshot) {
    setValues(snapshot.values)
    sendUpdate(snapshot.values)
  }

  function handleSelectFile(file: 'sketch.js' | 'config.yaml') {
    setActiveFile(file)
    setEditorContent(file === 'sketch.js' ? (project?.sketch_js ?? '') : (project?.config_yaml ?? ''))
  }

  // Cambios del editor: refresco inmediato del borrador + persistencia con debounce.
  // Al persistir, actualizamos el estado del proyecto, lo que recarga el iframe
  // (sketch.js) o regenera los controles (config.yaml) vía SketchViewer.
  function handleEditorChange(content: string) {
    setEditorContent(content)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (!project || !activeFile) return
      // Clave concreta (no dinámica) para que el tipo de `update` de Supabase encaje.
      const patch = activeFile === 'sketch.js' ? { sketch_js: content } : { config_yaml: content }
      setProject(prev => (prev ? { ...prev, ...patch } : prev))
      supabase.from('projects').update(patch).eq('id', project.id)
    }, EDITOR_DEBOUNCE_MS)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--t3)', fontSize: 'var(--font-size-small)' }}>
        Cargando proyecto...
      </div>
    )
  }

  if (!project) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 'var(--space-4)' }}>
        <p style={{ color: 'var(--t2)' }}>Proyecto no encontrado.</p>
        <Link to="/app" style={{ fontSize: 'var(--font-size-small)', color: 'var(--t1)', textDecoration: 'underline' }}>
          ← Volver a la biblioteca
        </Link>
      </div>
    )
  }

  return (
    <WorkspaceLayout
      viewer={(
        <SketchViewer
          sketchJs={project.sketch_js}
          configYaml={project.config_yaml}
          iframeRef={iframeRef}
          status={status}
          errorMessage={errorMessage}
          sendInit={sendInit}
          sendRestart={sendRestart}
          onControlsReady={handleControlsReady}
          canvasSize={canvasSize}
        />
      )}
      fileExplorer={(
        <FileExplorerPanel
          activeFile={activeFile}
          onSelectFile={handleSelectFile}
          onNavigateLibrary={() => navigate('/app')}
        />
      )}
      editor={activeFile ? (
        <div style={{ padding: 'var(--space-3)', flexShrink: 0, height: '100%' }}>
          <EditorPanel
            fileName={activeFile}
            content={editorContent}
            onChange={handleEditorChange}
            onClose={() => setActiveFile(null)}
          />
        </div>
      ) : undefined}
      sidebar={(
        <Sidebar
          projectName={project.name}
          controls={controls}
          values={values}
          canvasSize={canvasSize}
          onControlChange={handleControlChange}
          onCanvasApply={handleCanvasApply}
          snapshots={snapshots}
          onSnapshotSave={handleSnapshotSave}
          onSnapshotLoad={handleSnapshotLoad}
          messages={messages}
          onChatSend={handleChatSend}
          chatLoading={agentLoading}
          pendingQuestion={pendingQuestion}
          memorySuggestion={memorySuggestion}
          onMemoryApprove={handleMemoryApprove}
          onMemoryIgnore={() => setMemorySuggestion(null)}
        />
      )}
      devPanel={<DevPanel trace={null} />}
    />
  )
}
