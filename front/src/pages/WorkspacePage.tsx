import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

import { SnapshotGrid } from '../components/workspace/SnapshotGrid'
import { ConfirmDialog } from '../components/workspace/ConfirmDialog'
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
import { captureSketchPreview, uploadPreview } from '../lib/sketch-preview'
import { defaultValues, useSketch } from '../hooks/useSketch'
import { useAgent } from '../hooks/useAgent'

import type { Database, Json } from '../lib/database.types'
import type { AgentResponse, ChatMessage, Control, ParamValues, SketchConfig, Snapshot } from '../lib/types'

type CanvasMode = 'sketch' | 'grid'

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
    previewUrl: row.preview_url ?? undefined,
    isFavorite: row.is_favorite ?? false,
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

  // Estado del modo del canvas (sketch o grid de snapshots)
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('sketch')
  const [selectedSnapshotIds, setSelectedSnapshotIds] = useState<Set<string>>(new Set())
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null)

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

  async function handleSnapshotSave(label: string) {
    if (!project) return

    // Capturar el preview del canvas (si falla, el snapshot se guarda sin preview)
    const previewBlob = await captureSketchPreview(iframeRef)

    const { data } = await supabase
      .from('snapshots')
      // El dueño del snapshot es el del proyecto (RLS: user_id = auth.uid()).
      .insert({ project_id: project.id, user_id: project.user_id, label, values: values as unknown as Json, is_favorite: false })
      .select()
      .single()

    if (!data) return

    // Subir el preview si se capturó correctamente
    let previewUrl: string | undefined
    if (previewBlob) {
      const url = await uploadPreview(previewBlob, project.user_id, project.id, data.id)
      if (url) {
        previewUrl = url
        // Actualizar el snapshot con la URL del preview
        await supabase.from('snapshots').update({ preview_url: url }).eq('id', data.id)
      }
    }

    setSnapshots(prev => [...prev, mapSnapshot({ ...data, preview_url: previewUrl ?? null })])
  }

  function handleSnapshotLoad(snapshot: Snapshot) {
    setValues(snapshot.values)
    sendUpdate(snapshot.values)
  }

  function handleSelectFile(file: 'sketch.js' | 'config.yaml') {
    setActiveFile(file)
    setEditorContent(file === 'sketch.js' ? (project?.sketch_js ?? '') : (project?.config_yaml ?? ''))
  }

  // --- Handlers del grid de snapshots ---

  function handleSnapshotSelect(id: string, multi: boolean) {
    setSelectedSnapshotIds(prev => {
      const next = new Set(multi ? prev : [])
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleSnapshotLoadFromGrid(snapshot: Snapshot) {
    setValues(snapshot.values)
    sendUpdate(snapshot.values)
    setCanvasMode('sketch')
  }

  function handleToggleFavorite(id: string) {
    setSnapshots(prev =>
      prev.map(s =>
        s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
      )
    )
    const snapshot = snapshots.find(s => s.id === id)
    if (snapshot) {
      supabase.from('snapshots').update({ is_favorite: !snapshot.isFavorite }).eq('id', id)
    }
  }

  function handleBulkDelete() {
    const ids = Array.from(selectedSnapshotIds)
    if (ids.length === 0) return

    setConfirmDialog({
      title: `Borrar ${ids.length} ${ids.length === 1 ? 'snapshot' : 'snapshots'}`,
      message: 'Esta acción no se puede deshacer. ¿Estás seguro?',
      onConfirm: async () => {
        await supabase.from('snapshots').delete().in('id', ids)
        setSnapshots(prev => prev.filter(s => !ids.includes(s.id)))
        setSelectedSnapshotIds(new Set())
        setConfirmDialog(null)
      },
    })
  }

  function handleBulkFavorite() {
    const ids = Array.from(selectedSnapshotIds)
    if (ids.length === 0) return

    setSnapshots(prev =>
      prev.map(s =>
        ids.includes(s.id) ? { ...s, isFavorite: !s.isFavorite } : s
      )
    )
    ids.forEach(id => {
      const snapshot = snapshots.find(s => s.id === id)
      if (snapshot) {
        supabase.from('snapshots').update({ is_favorite: !snapshot.isFavorite }).eq('id', id)
      }
    })
  }

  function handleDeleteSingle(ids: string[]) {
    if (ids.length === 0) return

    setConfirmDialog({
      title: 'Borrar snapshot',
      message: 'Esta acción no se puede deshacer. ¿Estás seguro?',
      onConfirm: async () => {
        await supabase.from('snapshots').delete().in('id', ids)
        setSnapshots(prev => prev.filter(s => !ids.includes(s.id)))
        setSelectedSnapshotIds(prev => {
          const next = new Set(prev)
          ids.forEach(id => next.delete(id))
          return next
        })
        setConfirmDialog(null)
      },
    })
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
    <>
    <WorkspaceLayout
      viewer={(
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {canvasMode === 'sketch' ? (
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
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setCanvasMode('sketch')}
                  title="Volver al sketch"
                  style={{
                    position: 'absolute',
                    top: 'var(--space-3)',
                    left: 'var(--space-3)',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--line)',
                    background: 'var(--bg1)',
                    color: 'var(--t2)',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 1.5L12.5 4L4.5 12H2V9.5L10 1.5Z" />
                  </svg>
                </button>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <SnapshotGrid
                  snapshots={snapshots}
                  selectedIds={selectedSnapshotIds}
                  favoriteIds={snapshots.filter(s => s.isFavorite).map(s => s.id)}
                  onSelect={handleSnapshotSelect}
                  onLoad={handleSnapshotLoadFromGrid}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDeleteSingle}
                />
              </div>

              {/* Indicador flotante de selección */}
              {selectedSnapshotIds.size > 0 && (
                <div style={{
                  position: 'absolute',
                  bottom: 'var(--space-4)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-2) var(--space-4)',
                  background: 'var(--bg2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-md)',
                }}>
                  <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--t2)' }}>
                    {selectedSnapshotIds.size} {selectedSnapshotIds.size === 1 ? 'seleccionado' : 'seleccionados'}
                  </span>
                  <button
                    onClick={() => setSelectedSnapshotIds(new Set())}
                    style={{
                      fontSize: 'var(--btn-font-size)',
                      padding: 'var(--btn-padding)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--line)',
                      background: 'transparent',
                      color: 'var(--btn-color)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    style={{
                      fontSize: 'var(--btn-font-size)',
                      padding: 'var(--btn-padding)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-error)',
                      background: 'transparent',
                      color: 'var(--color-error)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Borrar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      fileExplorer={canvasMode === 'sketch' ? (
        <FileExplorerPanel
          activeFile={activeFile}
          onSelectFile={handleSelectFile}
          onNavigateLibrary={() => navigate('/app')}
        />
      ) : undefined}
      editor={activeFile && canvasMode === 'sketch' ? (
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
          showControls={canvasMode === 'sketch'}
          snapshots={snapshots}
          onSnapshotSave={handleSnapshotSave}
          onSnapshotLoad={(snap) => { handleSnapshotLoad(snap); setCanvasMode('sketch') }}
          onShowGrid={() => setCanvasMode('grid')}
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

    {confirmDialog && (
      <ConfirmDialog
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(null)}
      />
    )}
    </>
  )
}
