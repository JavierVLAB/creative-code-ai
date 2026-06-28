import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Database, Json } from '../lib/database.types'
import type { Control, Snapshot, ChatMessage, ParamValues, SketchConfig } from '../lib/types'
import { parseSketchConfig, serializeSketchConfig } from '../lib/yaml'
import { useSketch } from '../hooks/useSketch'
import { SketchViewer } from '../components/workspace/SketchViewer'
import { Sidebar } from '../components/workspace/Sidebar'
import { FileExplorerPanel } from '../components/workspace/FileExplorerPanel'
import { EditorPanel } from '../components/workspace/EditorPanel'
import { DevPanel } from '../components/workspace/DevPanel'

type Project = Database['public']['Tables']['projects']['Row']
type SnapshotRow = Database['public']['Tables']['snapshots']['Row']

const DEFAULT_CANVAS = { width: 600, height: 600 }
const EDITOR_DEBOUNCE_MS = 1500

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

  // El chat y la memoria llegan en el change `frontend-agent`; aquí son stubs.
  const [messages] = useState<ChatMessage[]>([])
  const [memorySuggestion, setMemorySuggestion] = useState<string | null>(null)

  const { iframeRef, status, errorMessage, sendInit, sendUpdate } = useSketch()
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
    <div style={{ display: 'flex', position: 'relative', height: 'calc(100vh - var(--topbar-height))', overflow: 'hidden' }}>
      {/* Canvas como fondo, con el explorador flotando en su esquina */}
      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <SketchViewer
          sketchJs={project.sketch_js}
          configYaml={project.config_yaml}
          iframeRef={iframeRef}
          status={status}
          errorMessage={errorMessage}
          sendInit={sendInit}
          onControlsReady={handleControlsReady}
          canvasSize={canvasSize}
        />
        {/* El explorador flota sobre el canvas; el wrapper no captura clics
            (pointerEvents:none) salvo el propio panel, que los reactiva. */}
        <div style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', bottom: 'var(--space-3)', zIndex: 10, pointerEvents: 'none' }}>
          <FileExplorerPanel
            activeFile={activeFile}
            onSelectFile={handleSelectFile}
            onNavigateLibrary={() => navigate('/app')}
          />
        </div>
      </div>

      {/* Editor flotante entre el canvas y la sidebar cuando hay un archivo abierto */}
      {activeFile && (
        <div style={{ padding: 'var(--space-3)', flexShrink: 0, height: '100%' }}>
          <EditorPanel
            fileName={activeFile}
            content={editorContent}
            onChange={handleEditorChange}
            onClose={() => setActiveFile(null)}
          />
        </div>
      )}

      {/* Columna derecha con padding para el efecto flotante de la sidebar */}
      <div style={{ padding: 'var(--space-3)', flexShrink: 0 }}>
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
          memorySuggestion={memorySuggestion}
          onMemoryApprove={() => setMemorySuggestion(null)}
          onMemoryIgnore={() => setMemorySuggestion(null)}
        />
      </div>

      {/* Transparencia del orquestador (solo en desarrollo; el trace llega en frontend-agent) */}
      <DevPanel trace={null} />
    </div>
  )
}
