import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { DevPanel } from '../components/workspace/DevPanel'
import { EditorPanel } from '../components/workspace/EditorPanel'
import { FileExplorerPanel } from '../components/workspace/FileExplorerPanel'
import { Sidebar } from '../components/workspace/Sidebar'
import { SketchViewer } from '../components/workspace/SketchViewer'
import { WorkspaceLayout } from '../components/workspace/WorkspaceLayout'
import { TemplateLibraryView } from '../components/playground/TemplateLibraryView'
import { parseSketchConfig, serializeSketchConfig } from '../lib/yaml'
import { usePublishedTemplates } from '../hooks/usePublishedTemplates'
import { defaultValues, useSketch } from '../hooks/useSketch'
import type { ChatMessage, Control, SketchConfig, Template } from '../lib/types'

const DEFAULT_CANVAS = { width: 600, height: 600 }
const PLAYGROUND_MESSAGE: ChatMessage = {
  id: 'playground-welcome',
  role: 'assistant',
  content: 'Explora la plantilla con controles locales. Para guardar o usar IA, crea un proyecto propio.',
}

function extractCanvasSize(configYaml: string): { width: number; height: number } {
  try {
    const config = parseSketchConfig(configYaml)
    return { width: config.modules.canvas.width, height: config.modules.canvas.height }
  } catch {
    return DEFAULT_CANVAS
  }
}

export function PlaygroundPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { templates, loading, error } = usePublishedTemplates()
  const selectedSlug = searchParams.get('template')
  const selectedTemplate = useMemo(
    () => templates.find(template => template.slug === selectedSlug) ?? null,
    [templates, selectedSlug]
  )

  if (!selectedSlug) {
    return (
      <>
        <PlaygroundTopbar />
        <TemplateLibraryView
          templates={templates}
          loading={loading}
          error={error}
          onOpenTemplate={slug => setSearchParams({ template: slug })}
        />
      </>
    )
  }

  if (!loading && !selectedTemplate) {
    return (
      <>
        <PlaygroundTopbar />
        <div style={{
          height: 'calc(100vh - var(--topbar-height))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', textAlign: 'center' }}>
            <strong style={{ fontSize: 'var(--font-size-title)', color: 'var(--t1)' }}>
              Plantilla no encontrada.
            </strong>
            <p style={{ color: 'var(--t2)', fontSize: 'var(--font-size-small)' }}>
              La plantilla pública que buscas ya no está disponible.
            </p>
            <button
              onClick={() => navigate('/playground')}
              style={{
                alignSelf: 'center',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                border: 'var(--border-width) solid var(--line)',
                background: 'transparent',
                color: 'var(--t1)',
                cursor: 'pointer',
              }}
            >
              Volver a las plantillas
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PlaygroundTopbar />
      {selectedTemplate && (
        <PlaygroundWorkspace
          key={selectedTemplate.id}
          template={selectedTemplate}
        />
      )}
    </>
  )
}

function PlaygroundWorkspace({ template }: { template: Template }) {
  const navigate = useNavigate()
  const [sketchJs, setSketchJs] = useState<string>(template.sketchJs)
  const [configYaml, setConfigYaml] = useState<string>(template.configYaml)
  const [controls, setControls] = useState<Control[]>([])
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [canvasSize, setCanvasSize] = useState(extractCanvasSize(template.configYaml))
  const [activeFile, setActiveFile] = useState<'sketch.js' | 'config.yaml' | null>(null)
  const [editorContent, setEditorContent] = useState('')

  const { iframeRef, status, errorMessage, sendInit, sendUpdate, sendRestart } = useSketch()

  function handleControlsReady(nextControls: Control[]) {
    setControls(nextControls)
    setValues(defaultValues(nextControls))
  }

  function handleControlChange(key: string, value: unknown) {
    const nextValues = { ...values, [key]: value }
    setValues(nextValues)
    sendUpdate(nextValues)
  }

  function handleCanvasApply(size: { width: number; height: number }) {
    let config: SketchConfig
    try {
      config = parseSketchConfig(configYaml)
    } catch {
      return
    }

    config.modules.canvas = { width: size.width, height: size.height }
    const nextYaml = serializeSketchConfig(config)
    setConfigYaml(nextYaml)
    setCanvasSize(size)

    if (activeFile === 'config.yaml') {
      setEditorContent(nextYaml)
    }
  }

  function handleSelectFile(file: 'sketch.js' | 'config.yaml') {
    setActiveFile(file)
    setEditorContent(file === 'sketch.js' ? sketchJs : configYaml)
  }

  function handleEditorChange(content: string) {
    setEditorContent(content)

    if (activeFile === 'sketch.js') {
      setSketchJs(content)
      return
    }

    setConfigYaml(content)
    setCanvasSize(extractCanvasSize(content))
  }

  return (
    <WorkspaceLayout
      viewer={(
        <SketchViewer
          sketchJs={sketchJs}
          configYaml={configYaml}
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
          onNavigateLibrary={() => navigate('/playground')}
          libraryLabel="Plantillas"
          showAiAction={false}
          showDownloadAction={false}
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
          projectName={template.title}
          controls={controls}
          values={values}
          canvasSize={canvasSize}
          onControlChange={handleControlChange}
          onCanvasApply={handleCanvasApply}
          snapshots={[]}
          onSnapshotSave={() => undefined}
          onSnapshotLoad={() => undefined}
          showSnapshots={false}
          messages={[PLAYGROUND_MESSAGE]}
          chatTitle=""
          chatDisabledPlaceholder="Deshabilitada"
          chatDisabledButtonLabel="Deshabilitada"
        />
      )}
      devPanel={<DevPanel trace={null} />}
    />
  )
}

function PlaygroundTopbar() {
  return (
    <nav style={{
      height: 'var(--topbar-height)',
      backgroundColor: 'var(--bg1)',
      borderBottom: 'var(--border-width) solid var(--line)',
      padding: '0 var(--space-6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-4)',
    }}>
      <Link to="/playground" style={{ color: 'var(--t1)', textDecoration: 'none', fontWeight: 600, fontSize: 'var(--font-size-title)' }}>
        CurateArtAI Playground
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Link to="/login" style={{ color: 'var(--t2)', textDecoration: 'none', fontSize: 'var(--font-size-small)' }}>
          Iniciar sesion
        </Link>
        <Link
          to="/signup"
          style={{
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--t1)',
            color: 'var(--bg0)',
            textDecoration: 'none',
            fontSize: 'var(--font-size-small)',
            fontWeight: 500,
          }}
        >
          Crear cuenta
        </Link>
      </div>
    </nav>
  )
}
